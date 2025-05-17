import { BrowserWindow, ipcMain } from 'electron'
import {
  BitData,
  BitTypePropertyDefinition,
  BitTypePropertyDefinitionType
} from '../../src/types/Bit'
import { db } from './database'

class BitDatabaseManager {
  private windows: BrowserWindow[] = []

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
  async addBit(
    id: string,
    typeId: string,
    createdAt: string,
    updatedAt: string,
    pinned: number,
    bitData: BitData[]
  ) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO bits (id, type_id, created_at, updated_at, pinned) VALUES (?, ?, ?, ?, ?)',
        [id, typeId, createdAt, updatedAt, pinned],
        function (err: any) {
          if (err) return reject(err)

          const insertPromises = bitData.map((data) => {
            return new Promise<void>((res, rej) => {
              db.run(
                'INSERT INTO bit_data (bit_id, property_id, value) VALUES (?, ?, ?)',
                [id, data.propertyId, data.value],
                function (err: any) {
                  if (err) rej(err)
                  else res()
                }
              )
            })
          })

          Promise.all(insertPromises)
            .then(() => resolve({ id }))
            .catch(reject)
        }
      )
    })
  }
  async updateBit(
    id: string,
    createdAt: string,
    updatedAt: string,
    pinned: number,
    bitData: BitData[]
  ) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE bits SET created_at = ?, updated_at = ?, pinned = ? WHERE id = ?',
        [createdAt, updatedAt, pinned, id],
        function (err: any) {
          if (err) return reject(err)
          const insertPromises = bitData.map((data) => {
            return new Promise<void>((res, rej) => {
              db.run(
                'UPDATE bit_data SET property_id = ?, value = ? WHERE bit_id = ?',
                [data.propertyId, data.value, id],
                function (err: any) {
                  if (err) rej(err)
                  else res()
                }
              )
            })
          })

          Promise.all(insertPromises)
            .then(() => resolve({ id }))
            .catch(reject)
        }
      )
    })
  }
  async deleteBit(id: string) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM bits WHERE id = ?', [id], function (err: any) {
        if (err) return reject(err)

        db.run('DELETE FROM bit_data WHERE bit_id = ?', [id], function (err: any) {
          if (err) return reject(err)
          resolve({ id })
        })
      })
    })
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
      db.all(
        'SELECT * FROM bit_type_properties WHERE type_id = ? ',
        [bit_type_id],
        (err: string, rows: any) => {
          if (err) reject(err)
          else resolve(rows)
        }
      )
    })
  }
  async addBitType(
    id: string,
    origin: string,
    name: string,
    iconName: string,
    properties: BitTypePropertyDefinition[]
  ) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO bit_types (id, origin, name, icon_name) VALUES (?, ?, ?, ?)',
        [id, origin, name, iconName],
        function (err: any) {
          if (err) return reject(err)

          // After inserting into bits, insert into bit_type_properties
          const insertPromises = properties.map((prop) => {
            return new Promise<void>((res, rej) => {
              db.run(
                'INSERT INTO bit_type_properties (id, type_id, sort_id, name, type, required, default_value) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [prop.id, id, prop.sortId, prop.name, prop.type, prop.required, prop.defaultValue],
                function (err: any) {
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
  async updateBitType(
    id: string,
    name: string,
    iconName: string,
    properties: BitTypePropertyDefinition[]
  ) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE bit_types SET name = ?, icon_name = ? WHERE id = ?',
        [name, iconName, id],
        function (err: any) {
          if (err) return reject(err)

          db.run(
            'DELETE FROM bit_type_properties WHERE type_id = ?',
            [id],
            function (deleteErr: any) {
              if (deleteErr) return reject(deleteErr)

              const insertPromises = properties.map((prop) => {
                return new Promise<void>((res, rej) => {
                  db.run(
                    'INSERT INTO bit_type_properties (id, type_id, sort_id, name, type, required, default_value) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [
                      prop.id,
                      id,
                      prop.sortId,
                      prop.name,
                      prop.type,
                      prop.required,
                      prop.defaultValue
                    ],
                    function (insertErr: any) {
                      if (insertErr) rej(insertErr)
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
        }
      )
    })
  }

  async deleteBitType(id: string) {
    return new Promise((resolve, reject) => {
      // First, delete bit_data for all bits with the given type_id
      db.all('SELECT id FROM bits WHERE type_id = ?', [id], (err: any, rows: { id: string }[]) => {
        if (err) return reject(err)

        const bitIds = rows.map((row) => row.id)

        const deleteBitDataPromises = bitIds.map((bitId) => {
          return new Promise<void>((res, rej) => {
            db.run('DELETE FROM bit_data WHERE bit_id = ?', [bitId], function (err: any) {
              if (err) rej(err)
              else res()
            })
          })
        })

        const deleteBitsPromise = new Promise<void>((res, rej) => {
          db.run('DELETE FROM bits WHERE type_id = ?', [id], function (err: any) {
            if (err) rej(err)
            else res()
          })
        })

        Promise.all([...deleteBitDataPromises, deleteBitsPromise])
          .then(() => {
            // Then delete the bit type and its properties
            db.run('DELETE FROM bit_types WHERE id = ?', [id], function (err: any) {
              if (err) return reject(err)

              db.run(
                'DELETE FROM bit_type_properties WHERE type_id = ?',
                [id],
                function (err: any) {
                  if (err) return reject(err)
                  resolve({ id })
                }
              )
            })
          })
          .catch(reject)
      })
    })
  }

  private async broadcastBitUpdate(): Promise<void> {
    const bits = await this.getBits()
    for (const window of this.windows) {
      if (!window.isDestroyed()) {
        window.webContents.send('bits-updated', bits)
      }
    }
  }
  private async broadcastBitTypeUpdate(): Promise<void> {
    const bitTypes = await this.getBitTypes()
    for (const window of this.windows) {
      if (!window.isDestroyed()) {
        window.webContents.send('bittypes-updated', bitTypes)
      }
    }
  }
  setupIpcHandlers() {
    ipcMain.handle('getBits', async (_event) => {
      return await this.getBits()
    })

    ipcMain.handle('getBitDataById', async (_event, bit_id) => {
      return await this.getBitDataById(bit_id)
    })

    ipcMain.handle(
      'addBit',
      async (
        _,
        id: string,
        typeId: string,
        createdAt: string,
        updatedAt: string,
        pinned: number,
        bitData: BitData[]
      ) => {
        const result = await this.addBit(id, typeId, createdAt, updatedAt, pinned, bitData)
        await this.broadcastBitUpdate()
        return result
      }
    )

    ipcMain.handle(
      'updateBit',
      async (
        _,
        id: string,
        createdAt: string,
        updatedAt: string,
        pinned: number,
        bitData: BitData[]
      ) => {
        const result = await this.updateBit(id, createdAt, updatedAt, pinned, bitData)
        await this.broadcastBitUpdate()
        return result
      }
    )

    ipcMain.handle('deleteBit', async (_, id: string) => {
      const result = await this.deleteBit(id)
      await this.broadcastBitUpdate()
      return result
    })

    // --- TYPES ---

    ipcMain.handle('getBitTypes', async (_event) => {
      return await this.getBitTypes()
    })

    ipcMain.handle('getBitTypePropertiesById', async (_event, bit_type_id) => {
      return await this.getBitTypePropertyId(bit_type_id)
    })

    ipcMain.handle(
      'addBitType',
      async (
        _,
        id: string,
        name: string,
        iconName: string,
        properties: BitTypePropertyDefinition[]
      ) => {
        const result = await this.addBitType(id, 'user', name, iconName, properties)
        await this.broadcastBitTypeUpdate()
        return result
      }
    )

    ipcMain.handle(
      'updateBitType',
      async (
        _,
        id: string,
        name: string,
        iconName: string,
        properties: BitTypePropertyDefinition[]
      ) => {
        const result = await this.updateBitType(id, name, iconName, properties)
        await this.broadcastBitTypeUpdate()
        return result
      }
    )

    ipcMain.handle('deleteBitType', async (_, id: string) => {
      const result = await this.deleteBitType(id)
      await this.broadcastBitTypeUpdate()
      return result
    })
  }
}

export const bitDatabaseManager = new BitDatabaseManager()
