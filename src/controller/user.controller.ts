import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../prisma.js'
import { success, error } from '../utils/response.js'
import { validate } from '../middleware/validate.js'
import { createUserSchema, updateUserSchema } from '../schema/user.schema.js'

const JWT_SECRET = process.env.JWT_SECRET || 'prisma-fullstack-api-secret-key'
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d'

/** 登录 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body
    if (!email) return error(res, '邮箱不能为空', 400)
    if (!password) return error(res, '密码不能为空', 400)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return error(res, '账号不存在', 400)
    if (user.password !== password) return error(res, '密码错误', 400)

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    )

    const { password: _, ...userInfo } = user
    success(res, { user: userInfo, token }, '登录成功')
  } catch (e) {
    console.error('登录错误:', e)
    error(res, '登录失败', 500)
  }
}

/** 获取当前登录用户信息 */
export async function profile(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { posts: true }
    })
    if (!user) return error(res, '用户不存在', 404)
    const { password: _, ...userInfo } = user
    success(res, userInfo, '查询成功')
  } catch (e) {
    error(res, '查询用户失败', 500)
  }
}

/** 获取全部用户 */
export async function list(req: Request, res: Response) {
  try {
    const list = await prisma.user.findMany({ include: { posts: true } })
    success(res, list, '查询成功')
  } catch (e) {
    error(res, '查询用户列表失败', 500)
  }
}

/** 新增用户 */
export async function create(req: Request, res: Response) {
  try {
    const data = validate(createUserSchema, req.body, res)
    if (!data) return
    const user = await prisma.user.create({ data })
    success(res, user, '用户创建成功')
  } catch (e: any) {
    if (e.code === 'P2002') return error(res, '该邮箱已注册', 409)
    error(res, '用户创建失败', 500)
  }
}

/** 用户详情 */
export async function detail(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const user = await prisma.user.findUnique({ where: { id }, include: { posts: true } })
    if (!user) return error(res, '用户不存在', 404)
    success(res, user, '查询成功')
  } catch (e) {
    error(res, '查询用户失败', 500)
  }
}

/** 更新用户 */
export async function update(req: Request, res: Response) {
  try {
    const data = validate(updateUserSchema, req.body, res)
    if (!data) return
    const id = Number(req.params.id)
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return error(res, '用户不存在', 404)
    const updated = await prisma.user.update({ where: { id }, data })
    success(res, updated, '用户更新成功')
  } catch (e) {
    error(res, '用户更新失败', 500)
  }
}

/** 删除用户（防外键报错） */
export async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return error(res, '用户不存在', 404)
    const postCount = await prisma.post.count({ where: { userId: id } })
    if (postCount > 0) return error(res, `请先删除该用户的所有文章（共 ${postCount} 篇）`)
    await prisma.user.delete({ where: { id } })
    success(res, null, '用户删除成功')
  } catch (e) {
    error(res, '用户删除失败', 500)
  }
}
