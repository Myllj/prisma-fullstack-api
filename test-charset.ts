import 'dotenv/config'
import { PrismaClient } from './prisma/generated/prisma/client.js'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import mysql from 'mysql2/promise'

// 验证写入的是 GBK 还是 UTF-8
const chinese = '从零到一学Prisma'
console.log('Node.js 字符串编码:', Buffer.from(chinese).toString('hex'))
console.log('Buffer 长度:', Buffer.from(chinese).length, '(中文: ' + (chinese.length - 7) + '字, 英文: 7字)')

// 直接 Prisma Adatper 测试
const adapter = new PrismaMariaDb({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'prisma_demo',
  charset: 'utf8mb4',
  connectionLimit: 10,
  initSql: [
    "SET NAMES utf8mb4",
    "SET CHARACTER SET utf8mb4"
  ]
})

const prisma = new PrismaClient({ adapter })

async function test() {
  console.log('\n=== Prisma MariaDB Adapter 直接测试 ===')
  
  try {
    const post = await prisma.post.create({
      data: {
        title: chinese,
        content: '中文内容测试正文',
        userId: 8
      }
    })
    console.log('Prisma 插入结果 title:', post.title)
    console.log('title 含中文:', /[\u4e00-\u9fff]/.test(post.title))
    
    // 用 mysql2 读回
    const conn = await mysql.createConnection({
      host: '127.0.0.1', port: 3306,
      user: 'root', password: '123456',
      database: 'prisma_demo', charset: 'utf8mb4'
    })
    await conn.execute('SET NAMES utf8mb4')
    const [rows] = await conn.execute('SELECT id, title, HEX(title) as hex_title FROM post WHERE id = ?', [post.id]) as [any[], any]
    console.log('mysql2 读回:', JSON.stringify(rows[0]))
    await conn.end()
    
  } catch(e) {
    console.error('错误:', e)
  } finally {
    await prisma.$disconnect()
  }
}

test()