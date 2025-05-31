import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const sqlite3 = require('sqlite3')

export const db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err: any) => {
  if (err) {
    console.error('Database connection error:', err.message)
  } else {
    console.log('Connected to SQLite database')

    db.run('PRAGMA foreign_keys = ON', (fkErr: any) => {
      if (fkErr) {
        console.error('Failed to enable foreign keys:', fkErr.message)
      } else {
        console.log('Foreign key support enabled')
      }
    })
  }
})
