import { Request, Response } from 'express'
import prisma from '../../prisma.js'
import { success, error } from '../../utils/response.js'
import { generateToken } from './auth.service.js'

/** 邮箱 + 密码登录 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return error(res, '账号不存在', 400)
    if (user.password !== password) return error(res, '密码错误', 400)

    const token = generateToken(user)

    const { password: _, ...userInfo } = user
    success(res, { user: userInfo, token }, '登录成功')
  } catch (e) {
    console.error('登录错误:', e)
    error(res, '登录失败', 500)
  }
}
