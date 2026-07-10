import { Request, Response, NextFunction } from 'express'

/** 404 拦截中间件：未匹配的路由统一返回 JSON */
export function notFound(_req: Request, res: Response) {
  res.status(404).json({ code: 404, msg: '接口不存在，请检查请求地址' })
}

/** 全局错误捕获中间件 */
export function globalError(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('全局错误:', err)

  // Prisma 数据库错误脱敏
  if (err?.code?.startsWith?.('P')) {
    return res.status(500).json({ code: 500, msg: '数据库操作异常，请稍后重试' })
  }

  // 参数解析错误（JSON 格式错误等）
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ code: 400, msg: '请求体格式错误，请检查 JSON 格式' })
  }

  // 兜底
  res.status(500).json({ code: 500, msg: '服务器内部错误' })
}
