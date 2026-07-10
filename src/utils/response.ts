import { Response } from 'express'

export function success<T>(res: Response, data: T, msg = '操作成功') {
  res.json({ code: 200, msg, data })
}

export function error(res: Response, msg = '操作失败', code = 400) {
  res.json({ code, msg })
}
