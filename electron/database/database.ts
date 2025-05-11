import { ipcMain } from 'electron'
import { BitData, BitTypePropertyDefinition, BitTypePropertyDefinitionType } from '../../src/types/Bit'
import builtinTypes from '../../builtintypes.json'

import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const sqlite3 = require('sqlite3')

export const db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err: any) => {
  if (err) {
    console.error('Database connection error:', err.message)
  } else {
    console.log('Connected to SQLite database')
  }
})

export async function getBitTypeNum() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) AS num from bit_types', [], function (err: any, row: any) {
      if (err) return reject(err)
      resolve(row.num)
    })
  })
}
export async function addBitType(id: string, name: string, iconName: string, properties: BitTypePropertyDefinition[]) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO bit_types (id, name, icon_name) VALUES (?, ?, ?)', [id, name, iconName], function (err: any) {
      if (err) return reject(err)

      // After inserting into bits, insert into bits_data
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
        .then(() => resolve({ id: db.lastID, name }))
        .catch(reject)
    })
  })
}
export async function seedTheDatabase() {
  const bitTypeNum = (await getBitTypeNum()) as number
  if (bitTypeNum > 0) return

  for (const bitType of builtinTypes) {
    const properties = bitType.properties.map((prop: any): BitTypePropertyDefinition => {
      return {
        id: prop.id,
        sortId: prop.sortId,
        name: prop.name,
        type: prop.type as BitTypePropertyDefinitionType,
        required: prop.required,
        defaultValue: prop.defaultValue
      }
    })
    await addBitType(bitType.id, bitType.name, bitType.iconName, properties)
  }
}

export function registerDatabaseHandlers() {
  seedTheDatabase()

  ipcMain.handle('getBits', async (_event) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM bits', [], (err: string, rows: []) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  })

  ipcMain.handle('getBitDataById', async (_event, bit_id) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM bit_data WHERE bit_id = ? ', [bit_id], (err: string, rows: any) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  })

  ipcMain.handle(
    'addBit',
    async (_, id: string, typeId: string, createdAt: string, updatedAt: string, pinned: number, bitData: BitData[]) => {
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
              .then(() => resolve({ id: db.lastID }))
              .catch(reject)
          }
        )
      })
    }
  )

  ipcMain.handle(
    'updateBit',
    async (_, id: string, createdAt: string, updatedAt: string, pinned: number, bitData: BitData[]) => {
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
              .then(() => resolve({ id: db.lastID }))
              .catch(reject)
          }
        )
      })
    }
  )

  ipcMain.handle('deleteBit', async (_, id: string) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM bits WHERE id = ?', [id], function (err: any) {
        if (err) return reject(err)

        db.run('DELETE FROM bit_data WHERE bit_id = ?', [id], function (err: any) {
          if (err) return reject(err)
          resolve({ id: db.lastID })
        })
      })
    })
  })

  // --- TYPES ---

  ipcMain.handle('getBitTypes', async (_event) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM bit_types', [], (err: string, rows: []) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  })

  ipcMain.handle('getBitTypePropertiesById', async (_event, bit_type_id) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM bit_type_properties WHERE type_id = ? ', [bit_type_id], (err: string, rows: any) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  })

  ipcMain.handle(
    'addBitType',
    async (_, id: string, name: string, iconName: string, properties: BitTypePropertyDefinition[]) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO bit_types (id, name, icon_name) VALUES (?, ?, ?)',
          [id, name, iconName],
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
              .then(() => resolve({ id: db.lastID, name }))
              .catch(reject)
          }
        )
      })
    }
  )

  ipcMain.handle(
    'updateBitType',
    async (_, id: string, name: string, iconName: string, properties: BitTypePropertyDefinition[]) => {
      return new Promise((resolve, reject) => {
        db.run('UPDATE bit_types SET name = ?, icon_name = ? WHERE id = ?', [name, iconName, id], function (err: any) {
          if (err) return reject(err)
          const insertPromises = properties.map((prop) => {
            return new Promise<void>((res, rej) => {
              db.run(
                'UPDATE bit_type_properties SET type_id = ?, sort_id = ?, name = ?, type = ?, required = ?, default_value = ? WHERE id = ?',
                [id, prop.sortId, prop.name, prop.type, prop.required, prop.defaultValue, prop.id],
                function (err: any) {
                  if (err) rej(err)
                  else res()
                }
              )
            })
          })

          Promise.all(insertPromises)
            .then(() => resolve({ id: db.lastID, name }))
            .catch(reject)
        })
      })
    }
  )

  ipcMain.handle('deleteBitType', async (_, id: string) => {
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

              db.run('DELETE FROM bit_type_properties WHERE type_id = ?', [id], function (err: any) {
                if (err) return reject(err)
                resolve({ id })
              })
            })
          })
          .catch(reject)
      })
    })
  })
}
