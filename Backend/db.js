// db.js
import sql from 'mssql/msnodesqlv8.js'
import dotenv from 'dotenv'

dotenv.config()

const server = `${process.env.DB_SERVER || 'localhost'}\\${process.env.DB_INSTANCE || 'SQLEXPRESS01'}`
const database = process.env.DB_DATABASE || 'nucleus_auth'

const connectionString =
  `Driver={ODBC Driver 18 for SQL Server};` +
  `Server=${server};` +
  `Database=${database};` +
  `Trusted_Connection=Yes;` +
  `Encrypt=no;` +
  `TrustServerCertificate=Yes;`

const pool = new sql.ConnectionPool({
  connectionString,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
})

const poolConnect = pool.connect()

pool.on('error', err => {
  console.error('Database pool error:', err)
})

export { sql, pool, poolConnect }