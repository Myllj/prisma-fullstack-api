import { z } from 'zod'

/** 文章新增校验（userId 从 token 获取，不由前端传入） */
export const createPostSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多200个字符'),
  content: z.string().min(1, '内容不能为空')
})

/** 文章更新校验 */
export const updatePostSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多200个字符').optional(),
  content: z.string().min(1, '内容不能为空').optional()
})
