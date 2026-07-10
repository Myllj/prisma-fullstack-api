import { z } from 'zod'

/** 用户新增校验 */
export const createUserSchema = z.object({
  name: z.string().min(1, '用户名不能为空').max(50, '用户名最多50个字符'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6个字符').max(50, '密码最多50个字符')
})

/** 用户更新校验 */
export const updateUserSchema = z.object({
  name: z.string().min(1, '用户名不能为空').max(50, '用户名最多50个字符').optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  password: z.string().min(6, '密码至少6个字符').max(50, '密码最多50个字符').optional()
})
