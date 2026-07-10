import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { notFound, globalError } from './middleware/error.js'
import userRoute from './route/user.route.js'
import postRoute from './route/post.route.js'

const app = express()
const PORT = Number(process.env.PORT) || 3000

// 全局中间件
app.use(cors())
app.use(express.json())

// 路由挂载
app.use('/api/user', userRoute)
app.use('/api/post', postRoute)

// 全局错误处理（放在所有路由之后）
app.use(notFound)
app.use(globalError)

// 启动服务
app.listen(PORT, () => {
  console.log(`服务运行在 http://localhost:${PORT}`)
})
