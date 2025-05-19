import { BrowserWindow, ipcMain } from 'electron'
import { Bit, BitData, BitTypeDefinition, BitTypePropertyDefinition } from '../../src/types/Bit'
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
            iconName: bitType.icon_name,
            properties: properties.map((prop) => ({
              id: prop.id,
              name: prop.name,
              type: prop.type,
              required: Boolean(prop.required),
              defaultValue: prop.default_value || undefined,
              order: prop.order_index || 0
            }))
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

  async getCurrentMonthEntries(currentYear: number, currentMonth: number) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM bits WHERE strftime('%Y', created_at) = ? AND strftime('%m', created_at) = ?`,
        [currentYear.toString(), currentMonth.toString().padStart(2, '0')],
        (err: string, rows: []) => {
          if (err) reject(err)
          else resolve(rows)
        }
      )
    })
  }
  // async getLastMonthEntries(lastMonthYear: number, lastMonth: number) {
  //   return new Promise((resolve, reject) => {
  //     db.all(
  //       `SELECT * FROM bits WHERE strftime('%Y', created_at) = ? AND strftime('%m', created_at) = ?`,
  //       [lastMonthYear.toString(), lastMonth.toString().padStart(2, '0')],
  //       (err: string, rows: []) => {
  //         if (err) reject(err)
  //         else resolve(rows)
  //       }
  //     )
  //   })
  // }
  // async getMonthlyData() {
  //   return new Promise((resolve, reject) => {
  //     db.all(
  //       `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as entries FROM bits WHERE created_at >= date('now', '-12 months') GROUP BY strftime('%Y-%m', created_at) ORDER BY month ASC`,
  //       [],
  //       (err: string, rows: []) => {
  //         if (err) reject(err)
  //         else resolve(rows)
  //       }
  //     )
  //   })
  // }
  // async getBitAnalytics() {
  //   try {
  //     const now = new Date()
  //     const currentYear = now.getFullYear()
  //     const currentMonth = now.getMonth() + 1
  //     const bitRows: any[] = (await this.getBits()) as any[]
  //     const totalEntries = bitRows.length
  //     const currentMonthEntries: any[] = (await this.getCurrentMonthEntries(
  //       currentYear,
  //       currentMonth
  //     )) as any[]
  //     const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
  //     const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear
  //     const lastMonthEntries: any[] = (await this.getLastMonthEntries(
  //       lastMonthYear,
  //       lastMonth
  //     )) as any[]
  //     const currentMonthCount = currentMonthEntries.length
  //     const lastMonthCount = lastMonthEntries.length
  //     const percentChange =
  //       lastMonthCount === 0 ? 100 : ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100
  //     const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate()
  //     const daysInLastMonth = new Date(lastMonthYear, lastMonth, 0).getDate()
  //     const avgDailyCurrentMonth = currentMonthCount / daysInCurrentMonth
  //     const avgDailyLastMonth = lastMonthCount / daysInLastMonth
  //     const avgDailyChange =
  //       avgDailyLastMonth === 0
  //         ? 100
  //         : ((avgDailyCurrentMonth - avgDailyLastMonth) / avgDailyLastMonth) * 100
  //     const monthlyData: any[] = (await this.getMonthlyData()) as any[]
  //     const formattedMonthlyData = monthlyData.map((item) => {
  //       const [year, month] = item.month.split('-')
  //       const date = new Date(parseInt(year), parseInt(month) - 1)
  //       return {
  //         month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
  //         entries: item.entries
  //       }
  //     })
  //     return {
  //       total: {
  //         current: totalEntries,
  //         percentChange: percentChange
  //       },
  //       avgDaily: {
  //         current: avgDailyCurrentMonth,
  //         percentChange: avgDailyChange
  //       },
  //       monthlyData: formattedMonthlyData
  //     }
  //   } catch (error) {
  //     console.error('Error getting bit analytics:', error)
  //     throw error
  //   }
  // }

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
          const type = this.cachedBitTypes.find((t) => t.id === bit.type_id)

          if (!type) {
            console.warn(`Unknown type_id "${bit.type_id}" for bit id ${bit.id}`)
            return null
          }

          const formattedData = bitDataRows.map(
            (data) =>
              ({
                id: data.bit_id, // Add id if available in your database
                propertyId: data.property_id,
                value: data.value
              } as BitData)
          )

          return {
            id: bit.id,
            type,
            createdAt: bit.created_at,
            updatedAt: bit.updated_at,
            pinned: bit.pinned,
            data: formattedData
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

          // First delete existing bit data
          db.run('DELETE FROM bit_data WHERE bit_id = ?', [id], function (deleteErr: any) {
            if (deleteErr) return reject(deleteErr)

            // Then insert new bit data
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
          })
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
        'SELECT * FROM bit_type_properties WHERE type_id = ? ORDER BY order_index ASC',
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

          // Ensure properties have order values
          const propertiesWithOrder = properties.map((prop, index) => ({
            ...prop,
            order: prop.order !== undefined ? prop.order : index
          }))

          // After inserting into bits, insert into bit_type_properties
          const insertPromises = propertiesWithOrder.map((prop) => {
            return new Promise<void>((res, rej) => {
              db.run(
                'INSERT INTO bit_type_properties (id, type_id, name, type, required, default_value, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [prop.id, id, prop.name, prop.type, prop.required, prop.defaultValue, prop.order],
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
              INSERT INTO bit_type_properties (id, type_id, name, type, required, default_value, order_index)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                type=excluded.type,
                required=excluded.required,
                default_value=excluded.default_value,
                order_index=excluded.order_index
              `,
                [prop.id, id, prop.name, prop.type, prop.required, prop.defaultValue, prop.order],
                function (insertErr: any) {
                  if (insertErr) rej(insertErr)
                  else res()
                }
              )
            })
          })

          Promise.all(upsertPromises)
            .then(() => {
              if (propIds.length === 0) {
                db.run(
                  'DELETE FROM bit_type_properties WHERE type_id = ?',
                  [id],
                  function (deleteErr: any) {
                    if (deleteErr) return reject(deleteErr)
                    else resolve({ id, name })
                  }
                )
              } else {
                db.run(
                  `DELETE FROM bit_type_properties WHERE type_id = ? AND id NOT IN (${placeholders})`,
                  [id, ...propIds],
                  function (deleteErr: any) {
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

  setupIpcHandlers() {
    // Get structured bits and bit types
    ipcMain.handle('getStructuredBits', async () => {
      return await this.getStructuredBits()
    })

    ipcMain.handle('getStructuredBitTypes', async () => {
      return await this.getStructuredBitTypes()
    })

    // Basic DB operations
    ipcMain.handle('getBits', async () => {
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
    ipcMain.handle('getBitTypes', async () => {
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

    // ipcMain.handle('getBitAnalytics', async () => {
    //   return await this.getBitAnalytics()
    // })
  }
}

export const bitDatabaseManager = new BitDatabaseManager()
