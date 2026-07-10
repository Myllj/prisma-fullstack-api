import 'dotenv/config'
import { PrismaClient } from '../prisma/generated/prisma/client.js'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || '127.0.0.1',
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '123456',
  database: process.env.DATABASE_NAME || 'prisma_demo',
  charset: process.env.DATABASE_CHARSET || 'utf8mb4',
  connectionLimit: 10,
  initSql: [
    "SET NAMES utf8mb4",
    "SET CHARACTER SET utf8mb4",
    "SET character_set_connection=utf8mb4",
    "SET collation_connection=utf8mb4_unicode_ci"
  ]
})

const prisma = new PrismaClient({ adapter })

export default prisma
