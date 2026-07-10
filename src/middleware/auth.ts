import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'prisma-fullstack-api-secret-key'

// 扩展 Express Request 类型，挂载用户信息
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: string }
    }
  }
}

/** JWT 鉴权中间件：校验 token，通过后将用户信息挂载到 req.user */
export function auth(req: Request, res: Response, next: NextFunction) {
  // 1. 获取 Authorization 请求头
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ code: 401, msg: '未登录，请先登录' })
  }

  // 2. 截取 Bearer 后的 token 字符串
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ code: 401, msg: '未登录，请先登录' })
  }

  // 3. 验证 token
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string }
    req.user = decoded
    next()
  } catch (e: any) {
    // 区分不同错误类型
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, msg: '登录已过期，请重新登录' })
    }
    return res.status(401).json({ code: 401, msg: 'token 无效，请重新登录' })
  }
}
