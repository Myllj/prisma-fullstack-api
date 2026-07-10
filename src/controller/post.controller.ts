import { Request, Response } from 'express'
import prisma from '../prisma.js'
import { success, error } from '../utils/response.js'
import { validate } from '../middleware/validate.js'
import { createPostSchema, updatePostSchema } from '../schema/post.schema.js'

/** 文章列表（分页 + 模糊搜索 + 带出作者信息） */
export async function list(req: any, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10))
    const keyword = (req.query.keyword as string) || ''
    const where = keyword ? { title: { contains: keyword } } : {}
    const [list, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.post.count({ where })
    ])
    success(res, { list, total, page, pageSize }, '查询成功')
  } catch (e: any) {
    console.error('文章列表查询错误:', e)
    error(res, '查询文章列表失败', 500)
  }
}

/** 新增文章（userId 自动从 token 读取） */
export async function create(req: any, res: Response) {
  try {
    const data = validate(createPostSchema, req.body, res)
    if (!data) return
    const post = await prisma.post.create({ data: { ...data, userId: req.user!.id } })
    success(res, post, '文章创建成功')
  } catch (e) {
    error(res, '文章创建失败', 500)
  }
}

/** 文章详情（带出作者完整信息） */
export async function detail(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const post = await prisma.post.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } }
    })
    if (!post) return error(res, '文章不存在', 404)
    success(res, post, '查询成功')
  } catch (e) {
    error(res, '查询文章失败', 500)
  }
}

/** 更新文章（仅作者可修改） */
export async function update(req: any, res: Response) {
  try {
    const data = validate(updatePostSchema, req.body, res)
    if (!data) return
    const id = Number(req.params.id)
    const post = await prisma.post.findUnique({ where: { id } })
    if (!post) return error(res, '文章不存在', 404)
    if (post.userId !== req.user!.id) return error(res, '无权修改他人文章', 403)
    const updated = await prisma.post.update({ where: { id }, data })
    success(res, updated, '文章更新成功')
  } catch (e) {
    error(res, '文章更新失败', 500)
  }
}

/** 删除文章（仅作者可删除） */
export async function remove(req: any, res: Response) {
  try {
    const id = Number(req.params.id)
    const post = await prisma.post.findUnique({ where: { id } })
    if (!post) return error(res, '文章不存在', 404)
    if (post.userId !== req.user!.id) return error(res, '无权删除他人文章', 403)
    await prisma.post.delete({ where: { id } })
    success(res, null, '文章删除成功')
  } catch (e) {
    error(res, '文章删除失败', 500)
  }
}
