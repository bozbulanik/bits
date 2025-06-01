import { BrowserWindow, ipcMain } from 'electron'
import { Bit, BitData, BitTypeDefinition, BitTypePropertyDefinition, Collection, CollectionItem, Note } from '../../src/types/Bit'
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
  // -- READ --
  async getStructuredBits(): Promise<Bit[]> {
    try {
      // Ensure we have the latest bit types
      if (this.cachedBitTypes.length === 0) {
        await this.getStructuredBitTypes()
      }

      const bitRows: any[] = (await this.getBits()) as any[]
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
                value: data.value
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
      console.error('Error getting structured bits:', error)
      throw error
    }
  }
  async getBits() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM bits', [], (err: string, rows: []) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  async getBitDataById(bit_id: string) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM bit_data WHERE bit_id = ? ', [bit_id], (err: string, rows: any) => {
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
  async getStructuredPinnedBits() {
    try {
      if (this.cachedBitTypes.length === 0) {
        await this.getStructuredBitTypes()
      }

      const bitRows: any[] = (await this.getPinnedBits()) as any[]
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
                value: data.value
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
                  order: prop.order_index || 0
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
                'INSERT INTO bit_type_properties (id, type_id, name, type, required, default_value, options, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [prop.id, id, prop.name, prop.type, prop.required, prop.defaultValue, JSON.stringify(prop.options), prop.order],
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
              INSERT INTO bit_type_properties (id, type_id, name, type, required, default_value, options, order_index)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                type_id=excluded.type_id,
                required=excluded.required,
                default_value=excluded.default_value,
                options=excluded.options,
                order_index=excluded.order_index
              `,
              [prop.id, id, prop.name, prop.type, prop.required, prop.defaultValue, JSON.stringify(prop.options), prop.order],
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

  //#region COLLECTIONS
  async getCollections() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM collections', [], (err: string, rows: []) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  async getCollectionItemsById(collectionId: string) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM collection_items WHERE collection_id = ? ORDER BY order_index ASC', [collectionId], (err: string, rows: any) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
  async getStructuredCollections(): Promise<Collection[]> {
    try {
      const collectionRows: any[] = (await this.getCollections()) as any[]
      const structuredCollections = await Promise.all(
        collectionRows.map(async (collection) => {
          const collectionItems = (await this.getCollectionItemsById(collection.id)) as any[]
          return {
            id: collection.id,
            name: collection.name,
            iconName: collection.icon_name,
            createdAt: collection.created_at,
            updatedAt: collection.updated_at,
            items: collectionItems.map(
              (item) =>
                ({
                  id: item.id,
                  bitId: item.bit_id,
                  orderIndex: item.order_index
                } as CollectionItem)
            )
          } as Collection
        })
      )
      return structuredCollections
    } catch (error) {
      console.error('Error getting structured collections:', error)
      throw error
    }
  }
  async addCollection(id: string, name: string, iconName: string, createdAt: string, updatedAt: string, items: CollectionItem[]) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO collections (id, name, icon_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [id, name, iconName, createdAt, updatedAt],
        function (err: string) {
          if (err) return reject(err)

          const itemsWithOrder = items.map((item, index) => ({
            ...item,
            orderIndex: item.orderIndex !== undefined ? item.orderIndex : index
          }))

          const insertPromises = itemsWithOrder.map((item) => {
            return new Promise<void>((res, rej) => {
              db.run(
                'INSERT INTO collection_items (id, collection_id, bit_id, order_index) VALUES (?, ?, ?, ?)',
                [item.id, id, item.bitId, item.orderIndex],
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
  async updateCollection(id: string, name: string, iconName: string, createdAt: string, updatedAt: string, items: CollectionItem[]) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE collections SET name = ?, icon_name = ?, created_at = ?, updated_at = ? WHERE id = ?',
        [name, iconName, createdAt, updatedAt, id],
        function (err: string) {
          if (err) return reject(err)

          const itemIds = items.map((i) => i.id)
          const placeholders = itemIds.map(() => '?').join(',')

          const itemsWithOrder = items.map((item, index) => ({
            ...item,
            orderIndex: item.orderIndex !== undefined ? item.orderIndex : index
          }))

          const upsertPromises = itemsWithOrder.map((item) => {
            return new Promise<void>((res, rej) => {
              db.run(
                `
              INSERT INTO collection_items (id, collection_id, bit_id, order_index)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                collection_id=excluded.collection_id,
                bit_id=excluded.bit_id,
                order_index=excluded.order_index
              `,
                [item.id, id, item.bitId, item.orderIndex],
                function (insertErr: string) {
                  if (insertErr) rej(insertErr)
                  else res()
                }
              )
            })
          })
          Promise.all(upsertPromises)
            .then(() => {
              if (itemIds.length === 0) {
                db.run('DELETE FROM collection_items WHERE collection_id = ?', [id], function (deleteErr: string) {
                  if (deleteErr) return reject(deleteErr)
                  else resolve({ id, name })
                })
              } else {
                db.run(
                  `DELETE FROM collection_items WHERE collection_id = ? AND id NOT IN (${placeholders})`,
                  [id, ...itemIds],
                  function (deleteErr: string) {
                    if (deleteErr) return reject(deleteErr)
                    else resolve({ id, name })
                  }
                )
              }
            })
            .catch(reject)
        }
      )
    })
  }
  async deleteCollection(id: string) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM collections WHERE id = ?', [id], function (err: string) {
        if (err) return reject(err)

        db.run('DELETE FROM collection_items WHERE collection_id = ?', [id], function (err: string) {
          if (err) return reject(err)
          resolve({ id })
        })
      })
    })
  }
  //#endregion

  //#region BROADCASTING
  private async broadcastBitUpdate(): Promise<void> {
    try {
      const structuredBits = await this.getStructuredBits()
      for (const window of this.windows) {
        if (!window.isDestroyed()) {
          window.webContents.send('bits-updated', structuredBits)
        }
      }
    } catch (error) {
      console.error('Error broadcasting bit update:', error)
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
  private async broadcastCollectionsUpdate(): Promise<void> {
    try {
      const structuredCollections = await this.getStructuredCollections()
      for (const window of this.windows) {
        if (!window.isDestroyed()) {
          window.webContents.send('collections-updated', structuredCollections)
        }
      }
    } catch (error) {
      console.error('Error broadcasting collections update:', error)
    }
  }
  //#endregion

  //#region IPC HANDLERS
  setupIpcHandlers() {
    //#region BITS
    ipcMain.handle('getStructuredBits', async () => {
      return await this.getStructuredBits()
    })

    ipcMain.handle('getBits', async () => {
      return await this.getBits()
    })

    ipcMain.handle('getBitDataById', async (_event, bit_id) => {
      return await this.getBitDataById(bit_id)
    })

    ipcMain.handle('addBit', async (_, id: string, typeId: string, createdAt: string, updatedAt: string, pinned: number, bitData: BitData[]) => {
      const result = await this.addBit(id, typeId, createdAt, updatedAt, pinned, bitData)
      await this.broadcastBitUpdate()
      await this.broadcastCollectionsUpdate()
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
      await this.broadcastCollectionsUpdate()
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
      await this.broadcastCollectionsUpdate()
      return result
    })

    ipcMain.handle('deleteBitNote', async (_, id: string) => {
      const result = await this.deleteBitNote(id)
      await this.broadcastBitUpdate()
      return result
    })

    ipcMain.handle('getStructuredPinnedBits', async () => {
      return await this.getStructuredPinnedBits()
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
      await this.broadcastCollectionsUpdate()
      return result
    })
    //#endregion

    //#region COLLECTIONS

    ipcMain.handle('getStructuredCollections', async () => {
      return await this.getStructuredCollections()
    })
    ipcMain.handle(
      'addCollection',
      async (_, id: string, name: string, iconName: string, createdAt: string, updatedAt: string, items: CollectionItem[]) => {
        const result = await this.addCollection(id, name, iconName, createdAt, updatedAt, items)
        await this.broadcastCollectionsUpdate()
        return result
      }
    )
    ipcMain.handle(
      'updateCollection',
      async (_, id: string, name: string, iconName: string, createdAt: string, updatedAt: string, items: CollectionItem[]) => {
        const result = await this.updateCollection(id, name, iconName, createdAt, updatedAt, items)
        await this.broadcastCollectionsUpdate()
        return result
      }
    )
    ipcMain.handle('deleteCollection', async (_, id: string) => {
      const result = await this.deleteCollection(id)
      await this.broadcastCollectionsUpdate()
      return result
    })
    //#endregion
  }
  //#endregion
}

export const bitDatabaseManager = new BitDatabaseManager()
