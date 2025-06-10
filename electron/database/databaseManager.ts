import { BrowserWindow, ipcMain } from 'electron'
import { AIChat, AIMessage, Bit, BitData, BitTypeDefinition, BitTypePropertyDefinition, Note } from '../../src/types/Bit'
import { db } from './database'

class BitDatabaseManager {
  private windows: BrowserWindow[] = []
  private cachedBitTypes: BitTypeDefinition[] = []

  constructor() {
    this.setupIpcHandlers()
  }

  registerWindow(window: BrowserWindow): void {
    if (!this.windows.includes(window)) {
      this.windows.push(window)

      window.on('closed', () => {
        this.windows = this.windows.filter((w) => w !== window)
      })
    }
  }

  //#region BITS
  // -- STRUCTURE --
  async structurizeBits(rows: any) {
    try {
      if (this.cachedBitTypes.length === 0) {
        await this.getStructuredBitTypes()
      }

      // 1. Get all bits (one query)
      const bits: any[] = rows as any[]
      const bitIds = bits.map((bit) => bit.id)

      if (bitIds.length === 0) {
        return []
      }

      // 2. Get all bit data in one query
      const allBitData: any[] = (await this.getBitDataByIds(bitIds)) as any[]

      // 3. Get all bit notes in one query
      const allBitNotes: any[] = (await this.getBitNotesByIds(bitIds)) as any[]

      // 4. Group bit data by bit_id
      const bitDataMap = new Map<string, BitData[]>()
      allBitData.forEach((data) => {
        if (!bitDataMap.has(data.bit_id)) {
          bitDataMap.set(data.bit_id, [])
        }
        bitDataMap.get(data.bit_id)!.push({
          bitId: data.bit_id,
          propertyId: data.property_id,
          value: data.value
        })
      })

      // 5. Group bit notes by bit_id
      const bitNotesMap = new Map<string, Note[]>()
      allBitNotes.forEach((note) => {
        if (!bitNotesMap.has(note.bit_id)) {
          bitNotesMap.set(note.bit_id, [])
        }
        bitNotesMap.get(note.bit_id)!.push({
          id: note.id,
          bitId: note.bit_id,
          createdAt: note.created_at,
          updatedAt: note.updated_at,
          content: note.content
        })
      })

      // 6. Assemble structured bits
      const structuredBits: Bit[] = bits.map((bit) => ({
        id: bit.id,
        type: this.cachedBitTypes.find((t) => t.id === bit.type_id) as BitTypeDefinition,
        createdAt: bit.created_at,
        updatedAt: bit.updated_at,
        pinned: bit.pinned,
        data: bitDataMap.get(bit.id) || [],
        notes: bitNotesMap.get(bit.id) || []
      }))

      // 7. Filter out bits with unknown type just in case
      return structuredBits.filter((bit) => bit.type != null)
    } catch (error) {
      console.error('Error getting structured bits:', error)
      throw error
    }
  }

  // -- READ --
  async getBitDataById(bit_id: string) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM bit_data WHERE bit_id = ? ', [bit_id], (err: string, rows: any) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  async getBitDataByIds(bitIds: string[]): Promise<any[]> {
    if (bitIds.length === 0) return []

    return new Promise((resolve, reject) => {
      const placeholders = bitIds.map(() => '?').join(',')
      const sql = `SELECT * FROM bit_data WHERE bit_id IN (${placeholders})`

      db.all(sql, bitIds, (err: Error | null, rows: any[]) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  async getBitNotesById(bit_id: string) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM bit_notes WHERE bit_id = ? ', [bit_id], (err: string, rows: any) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  async getBitNotesByIds(bitIds: string[]): Promise<any[]> {
    if (bitIds.length === 0) return []

    return new Promise((resolve, reject) => {
      const placeholders = bitIds.map(() => '?').join(',')
      const sql = `SELECT * FROM bit_notes WHERE bit_id IN (${placeholders})`

      db.all(sql, bitIds, (err: Error | null, rows: any[]) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  async getAllBits() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM bits', [], (err: string, rows: []) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  async getBitsById(ids: string[]): Promise<Bit[]> {
    return new Promise((resolve, reject) => {
      if (ids.length === 0) return resolve([])

      const placeholders = ids.map(() => '?').join(', ')
      const query = `SELECT * FROM bits WHERE id IN (${placeholders})`

      db.all(query, ids, (err: string, rows: any[]) => {
        if (err) {
          reject(err)
        } else {
          const bits: Bit[] = rows.map((row) => ({
            id: row.id,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            pinned: Number(row.pinned),
            type: row.type as BitTypeDefinition,
            notes: [],
            data: []
          }))
          resolve(bits)
        }
      })
    })
  }
  async getBitById(id: string) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM bits WHERE id = ? ', [id], (err: string, rows: any) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  // -- CREATE --
  async addBit(id: string, typeId: string, createdAt: string, updatedAt: string, pinned: number, bitData: BitData[]) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO bits (id, type_id, created_at, updated_at, pinned) VALUES (?, ?, ?, ?, ?)',
        [id, typeId, createdAt, updatedAt, pinned],
        function (err: string) {
          if (err) return reject(err)

          const insertPromises = bitData.map((data) => {
            return new Promise<void>((res, rej) => {
              db.run('INSERT INTO bit_data (bit_id, property_id, value) VALUES (?, ?, ?)', [id, data.propertyId, data.value], function (err: string) {
                if (err) rej(err)
                else res()
              })
            })
          })

          Promise.all(insertPromises)
            .then(() => resolve({ id }))
            .catch(reject)
        }
      )
    })
  }
  async addBitNote(note: Note) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO bit_notes (id, bit_id, created_at, updated_at, content) VALUES (?, ?, ?, ?, ?)',
        [note.id, note.bitId, note.createdAt, note.updatedAt, note.content],
        function (err: string) {
          if (err) return reject(err)
          else resolve(note.id)
        }
      )
    })
  }
  // -- UPDATE --
  async updateBit(id: string, bitData: BitData[], timeStamp: string) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE bits SET updated_at = ? WHERE id = ?', [timeStamp, id], function (err: string) {
        if (err) return reject(err)

        // First delete existing bit data
        db.run('DELETE FROM bit_data WHERE bit_id = ?', [id], function (deleteErr: string) {
          if (deleteErr) return reject(deleteErr)

          // Then insert new bit data
          const insertPromises = bitData.map((data) => {
            return new Promise<void>((res, rej) => {
              db.run('INSERT INTO bit_data (bit_id, property_id, value) VALUES (?, ?, ?)', [id, data.propertyId, data.value], function (err: string) {
                if (err) rej(err)
                else res()
              })
            })
          })

          Promise.all(insertPromises)
            .then(() => resolve({ id }))
            .catch(reject)
        })
      })
    })
  }
  async updateBitNote(id: string, content: string, timeStamp: string) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE bit_notes SET updated_at = ?, content = ? WHERE id = ?', [timeStamp, content, id], function (err: string) {
        if (err) return reject(err)
        resolve(id)
      })
    })
  }
  async togglePin(id: string, newPinnedValue: number, timeStamp: string) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE bits SET updated_at = ?, pinned = ? WHERE id = ?', [timeStamp, newPinnedValue, id], function (err: string) {
        if (err) return reject(err)
        resolve(id)
      })
    })
  }
  // -- DELETE --
  async deleteBit(id: string) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM bits WHERE id = ?', [id], function (err: string) {
        if (err) return reject(err)
        resolve({ id })
        // db.run('DELETE FROM bit_data WHERE bit_id = ?', [id], function (err: string) {
        //   if (err) return reject(err)
        //   resolve({ id })
        // })
      })
    })
  }
  async deleteBitNote(id: string) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM bit_notes WHERE id = ?', [id], function (err: string) {
        if (err) return reject(err)
        resolve({ id })
      })
    })
  }

  async getPinnedBits() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM bits WHERE pinned = 1', [], (err: string, rows: []) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  async getStructuredPinnedBits(rows: any) {
    try {
      if (this.cachedBitTypes.length === 0) {
        await this.getStructuredBitTypes()
      }

      const bitRows: any[] = rows as any[]
      const structuredBits = await Promise.all(
        bitRows.map(async (bit) => {
          const bitDataRows = (await this.getBitDataById(bit.id)) as any[]
          const bitNoteRows = (await this.getBitNotesById(bit.id)) as any[]
          const type = this.cachedBitTypes.find((t) => t.id === bit.type_id)

          const formattedData = bitDataRows.map(
            (data) =>
              ({
                bitId: data.bit_id,
                propertyId: data.property_id,
                value: data.value,
                isTitle: data.is_title === 1
              } as BitData)
          )

          const formattedNotes = bitNoteRows.map(
            (note) =>
              ({
                id: note.id,
                bitId: note.bit_id,
                createdAt: note.created_at,
                updatedAt: note.updated_at,
                content: note.content
              } as Note)
          )

          return {
            id: bit.id,
            type,
            createdAt: bit.created_at,
            updatedAt: bit.updated_at,
            pinned: bit.pinned,
            data: formattedData,
            notes: formattedNotes
          } as Bit
        })
      )

      // Filter out null entries (from unknown type IDs)
      return structuredBits.filter(Boolean) as Bit[]
    } catch (error) {
      console.error('Error getting pinned bits:', error)
      throw error
    }
  }

  // -- QUERY --
  async getBitsByQuery(query: string) {
    const sqlQuery = `
        SELECT DISTINCT bits.* 
        FROM bits 
        JOIN bit_data ON bit_data.bit_id = bits.id 
        WHERE LOWER(bit_data.value) LIKE LOWER(?)
    `

    return new Promise((resolve, reject) => {
      db.all(sqlQuery, [`%${query}%`], (err: string, rows: []) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  async getBitsBetweenDate(from: Date, to: Date) {
    const sqlQuery = `
      SELECT * FROM bits WHERE created_at BETWEEN ? AND ?
    `
    return new Promise((resolve, reject) => {
      db.all(sqlQuery, [from.toISOString(), to.toISOString()], (err: string, rows: []) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  async getBitsWithDateDataBetweenDate(from: Date, to: Date) {
    const sqlQuery = `
    SELECT DISTINCT bits.*
    FROM bits
    JOIN bit_data ON bit_data.bit_id = bits.id
    JOIN bit_type_properties ON bit_data.property_id = bit_type_properties.id
    WHERE bit_data.value BETWEEN ? AND ?
      AND bit_type_properties.type IN (?, ?, ?)
  `
    return new Promise((resolve, reject) => {
      db.all(sqlQuery, [from.toISOString(), to.toISOString(), 'date', 'time', 'datetime'], (err: string, rows: []) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  //#endregion

  //#region TYPES
  async getStructuredBitTypes(): Promise<BitTypeDefinition[]> {
    try {
      const bitTypeRows: any[] = (await this.getBitTypes()) as any[]
      const structuredBitTypes = await Promise.all(
        bitTypeRows.map(async (bitType) => {
          const properties = (await this.getBitTypePropertyId(bitType.id)) as any[]

          return {
            id: bitType.id,
            origin: bitType.origin,
            name: bitType.name,
            description: bitType.description,
            iconName: bitType.icon_name,
            properties: properties.map(
              (prop) =>
                ({
                  id: prop.id,
                  name: prop.name,
                  type: prop.type,
                  required: Boolean(prop.required),
                  defaultValue: prop.default_value,
                  options: JSON.parse(prop.options),
                  order: prop.order_index || 0,
                  isTitle: prop.is_title === 1
                } as BitTypePropertyDefinition)
            )
          } as BitTypeDefinition
        })
      )
      this.cachedBitTypes = structuredBitTypes
      return structuredBitTypes
    } catch (error) {
      console.error('Error getting structured bit types:', error)
      throw error
    }
  }
  async getBitTypes() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM bit_types', [], (err: string, rows: []) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  async getBitTypePropertyId(bit_type_id: string) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM bit_type_properties WHERE type_id = ? ORDER BY order_index ASC', [bit_type_id], (err: string, rows: any) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  async addBitType(id: string, origin: string, name: string, description: string, iconName: string, properties: BitTypePropertyDefinition[]) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO bit_types (id, origin, name, description, icon_name) VALUES (?, ?, ?, ?, ?)',
        [id, origin, name, description, iconName],
        function (err: string) {
          if (err) return reject(err)

          // Ensure properties have order values
          const propertiesWithOrder = properties.map((prop, index) => ({
            ...prop,
            order: prop.order !== undefined ? prop.order : index
          }))

          // After inserting into bits, insert into bit_type_properties
          const insertPromises = propertiesWithOrder.map((prop) => {
            return new Promise<void>((res, rej) => {
              db.run(
                'INSERT INTO bit_type_properties (id, type_id, name, type, options, order_index, is_title) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [prop.id, id, prop.name, prop.type, JSON.stringify(prop.options), prop.order, prop.isTitle ? 1 : 0],
                function (err: string) {
                  if (err) rej(err)
                  else res()
                }
              )
            })
          })

          Promise.all(insertPromises)
            .then(() => resolve({ id, name }))
            .catch(reject)
        }
      )
    })
  }
  async updateBitType(id: string, name: string, description: string, iconName: string, properties: BitTypePropertyDefinition[]) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE bit_types SET name = ?, description = ?, icon_name = ? WHERE id = ?', [name, description, iconName, id], function (err: string) {
        if (err) return reject(err)

        const propIds = properties.map((p) => p.id)
        const placeholders = propIds.map(() => '?').join(',')

        // Ensure properties have order values
        const propertiesWithOrder = properties.map((prop, index) => ({
          ...prop,
          order: prop.order !== undefined ? prop.order : index
        }))

        const upsertPromises = propertiesWithOrder.map((prop) => {
          return new Promise<void>((res, rej) => {
            db.run(
              `
              INSERT INTO bit_type_properties (id, type_id, name, type,  options, order_index, is_title)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                type_id=excluded.type_id,
                options=excluded.options,
                order_index=excluded.order_index,
                is_title=excluded.is_title
              `,
              [prop.id, id, prop.name, prop.type, JSON.stringify(prop.options), prop.order, prop.isTitle ? 1 : 0],
              function (insertErr: string) {
                if (insertErr) rej(insertErr)
                else res()
              }
            )
          })
        })

        Promise.all(upsertPromises)
          .then(() => {
            if (propIds.length === 0) {
              db.run('DELETE FROM bit_type_properties WHERE type_id = ?', [id], function (deleteErr: string) {
                if (deleteErr) return reject(deleteErr)
                else resolve({ id, name })
              })
            } else {
              db.run(
                `DELETE FROM bit_type_properties WHERE type_id = ? AND id NOT IN (${placeholders})`,
                [id, ...propIds],
                function (deleteErr: string) {
                  if (deleteErr) return reject(deleteErr)
                  else resolve({ id, name })
                }
              )
            }
          })
          .catch(reject)
      })
    })
  }
  async deleteBitType(id: string) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM bit_types WHERE id = ?', [id], function (err: string) {
        if (err) return reject(err)
        else resolve({ id })
      })
      // db.all('SELECT id FROM bits WHERE type_id = ?', [id], (err: string, rows: { id: string }[]) => {
      //   if (err) return reject(err)

      //   const bitIds = rows.map((row) => row.id)

      //   const deleteBitDataPromises = bitIds.map((bitId) => {
      //     return new Promise<void>((res, rej) => {
      //       db.run('DELETE FROM bit_data WHERE bit_id = ?', [bitId], function (err: string) {
      //         if (err) rej(err)
      //         else res()
      //       })
      //     })
      //   })

      //   const deleteBitsPromise = new Promise<void>((res, rej) => {
      //     db.run('DELETE FROM bits WHERE type_id = ?', [id], function (err: string) {
      //       if (err) rej(err)
      //       else res()
      //     })
      //   })

      //   Promise.all([...deleteBitDataPromises, deleteBitsPromise])
      //     .then(() => {
      //       // Then delete the bit type and its properties
      //       db.run('DELETE FROM bit_types WHERE id = ?', [id], function (err: string) {
      //         if (err) return reject(err)

      //         db.run('DELETE FROM bit_type_properties WHERE type_id = ?', [id], function (err: string) {
      //           if (err) return reject(err)
      //           resolve({ id })
      //         })
      //       })
      //     })
      //     .catch(reject)
      // })
    })
  }
  //#endregion

  //#region AI
  async getAIChatsByOffset(limit: number, offset: number) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM ai_chats ORDER BY updated_at DESC LIMIT ? OFFSET ? ', [limit, offset], (err: string, rows: []) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  async getAIChats(limit: number, offset: number) {
    try {
      const chatRows: any[] = (await this.getAIChatsByOffset(limit, offset)) as any[]
      const structuredChats = await Promise.all(
        chatRows.map(async (chat) => {
          const msgs = JSON.parse(chat.messages)
          return {
            id: chat.id,
            title: chat.title,
            createdAt: chat.created_at,
            updatedAt: chat.updated_at,
            messages: msgs.map(
              (msg: any) =>
                ({
                  id: msg.id,
                  role: msg.role,
                  content: msg.content,
                  timestamp: msg.timestamp
                } as AIMessage)
            )
          } as AIChat
        })
      )
      return structuredChats
    } catch (error) {
      console.error('Error getting structured chats:', error)
      throw error
    }
  }
  async updateChat(chat: AIChat) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO ai_chats (id, title, messages, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET title = excluded.title, messages = excluded.messages, updated_at = excluded.updated_at',
        [chat.id, chat.title, JSON.stringify(chat.messages), chat.createdAt, chat.updatedAt],
        function (err: Error | null) {
          if (err) reject(err)
          else resolve(chat.id)
        }
      )
    })
  }
  async getChatById(id: string) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM ai_chats WHERE id = ? ', [id], (err: string, rows: []) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  async getStructuredChatById(id: string) {
    try {
      const chatRows: any[] = (await this.getChatById(id)) as any[]
      const structuredChats = await Promise.all(
        chatRows.map(async (chat) => {
          const msgs = JSON.parse(chat.messages)
          return {
            id: chat.id,
            title: chat.title,
            createdAt: chat.created_at,
            updatedAt: chat.updated_at,
            messages: msgs.map(
              (msg: any) =>
                ({
                  id: msg.id,
                  role: msg.role,
                  content: msg.content,
                  timestamp: msg.timestamp
                } as AIMessage)
            )
          } as AIChat
        })
      )
      return structuredChats
    } catch (error) {
      console.error('Error getting structured chats:', error)
      throw error
    }
  }
  //#endregion

  //#region BROADCASTING
  private async broadcastBitUpdate(): Promise<void> {
    for (const window of this.windows) {
      if (!window.isDestroyed()) {
        window.webContents.send('bits-updated')
      }
    }
  }
  private async broadcastBitTypeUpdate(): Promise<void> {
    try {
      const structuredBitTypes = await this.getStructuredBitTypes()
      for (const window of this.windows) {
        if (!window.isDestroyed()) {
          window.webContents.send('bittypes-updated', structuredBitTypes)
        }
      }
    } catch (error) {
      console.error('Error broadcasting bit type update:', error)
    }
  }
  //#endregion

  //#region IPC HANDLERS
  setupIpcHandlers() {
    //#region BITS
    ipcMain.handle('getBitDataById', async (_event, bit_id) => {
      return await this.getBitDataById(bit_id)
    })

    ipcMain.handle('addBit', async (_, id: string, typeId: string, createdAt: string, updatedAt: string, pinned: number, bitData: BitData[]) => {
      const result = await this.addBit(id, typeId, createdAt, updatedAt, pinned, bitData)
      await this.broadcastBitUpdate()
      return result
    })

    ipcMain.handle('addBitNote', async (_, note: Note) => {
      const result = await this.addBitNote(note)
      await this.broadcastBitUpdate()
      return result
    })

    ipcMain.handle('updateBit', async (_, id: string, bitData: BitData[], timeStamp: string) => {
      const result = await this.updateBit(id, bitData, timeStamp)
      await this.broadcastBitUpdate()
      return result
    })

    ipcMain.handle('togglePin', async (_, id: string, newPinnedValue: number, timeStamp: string) => {
      const result = await this.togglePin(id, newPinnedValue, timeStamp)
      await this.broadcastBitUpdate()
      return result
    })

    ipcMain.handle('updateBitNote', async (_, id: string, content: string, timeStamp: string) => {
      const result = await this.updateBitNote(id, content, timeStamp)
      await this.broadcastBitUpdate()
      return result
    })
    ipcMain.handle('deleteBit', async (_, id: string) => {
      const result = await this.deleteBit(id)
      await this.broadcastBitUpdate()
      return result
    })

    ipcMain.handle('deleteBitNote', async (_, id: string) => {
      const result = await this.deleteBitNote(id)
      await this.broadcastBitUpdate()
      return result
    })

    ipcMain.handle('getStructuredPinnedBits', async () => {
      const fetched = await this.getPinnedBits()
      return await this.getStructuredPinnedBits(fetched)
    })

    ipcMain.handle('searchBits', async (_, query: string) => {
      const queriedBits = await this.getBitsByQuery(query)
      return await this.structurizeBits(queriedBits)
    })

    ipcMain.handle('getBitsBetweenDate', async (_, from: Date, to: Date) => {
      const queriedBits = await this.getBitsBetweenDate(from, to)
      return await this.structurizeBits(queriedBits)
    })
    ipcMain.handle('getBitsWithDateDataBetweenDate', async (_, from: Date, to: Date) => {
      const queriedBits = await this.getBitsWithDateDataBetweenDate(from, to)
      return await this.structurizeBits(queriedBits)
    })

    ipcMain.handle('getBitById', async (_, id: string) => {
      const queriedBits = await this.getBitById(id)
      return await this.structurizeBits(queriedBits)
    })

    //#endregion

    //#region TYPES

    ipcMain.handle('getStructuredBitTypes', async () => {
      return await this.getStructuredBitTypes()
    })

    ipcMain.handle('getBitTypes', async () => {
      return await this.getBitTypes()
    })

    ipcMain.handle('getBitTypePropertiesById', async (_event, bit_type_id) => {
      return await this.getBitTypePropertyId(bit_type_id)
    })

    ipcMain.handle(
      'addBitType',
      async (_, id: string, name: string, description: string, iconName: string, properties: BitTypePropertyDefinition[]) => {
        const result = await this.addBitType(id, 'user', name, description, iconName, properties)
        await this.broadcastBitTypeUpdate()
        return result
      }
    )

    ipcMain.handle(
      'updateBitType',
      async (_, id: string, name: string, description: string, iconName: string, properties: BitTypePropertyDefinition[]) => {
        const result = await this.updateBitType(id, name, description, iconName, properties)
        await this.broadcastBitTypeUpdate()
        await this.broadcastBitUpdate() // Update bits too as they reference bit types
        return result
      }
    )

    ipcMain.handle('deleteBitType', async (_, id: string) => {
      const result = await this.deleteBitType(id)
      await this.broadcastBitTypeUpdate()
      await this.broadcastBitUpdate()
      return result
    })
    //#endregion

    //#region AI
    ipcMain.handle('getAIChats', async (_event, limit: number, offset: number) => {
      return await this.getAIChats(limit, offset)
    })
    ipcMain.handle('updateChat', async (_event, chat: AIChat) => {
      return await this.updateChat(chat)
    })
    ipcMain.handle('getChatById', async (_event, id: string) => {
      return await this.getStructuredChatById(id)
    })
    //#endregion
  }
  //#endregion
}

export const bitDatabaseManager = new BitDatabaseManager()
