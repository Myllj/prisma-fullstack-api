import { z } from 'zod'

// 标准邮箱格式：仅支持 ASCII 字符（符合 RFC 5322），不支持中文
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/** 登录校验 */
export const loginSchema = z.object({
  email: z.string().regex(emailRegex, '邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空')
})

/** 管理员重置用户密码校验 */
export const adminResetPasswordSchema = z.object({
  email: z.string().regex(emailRegex, '邮箱格式不正确'),
  newPassword: z.string().min(6, '新密码至少6个字符').max(50, '新密码最多50个字符')
})

/** 注册校验 */
export const registerSchema = z.object({
  name: z.string().min(1, '用户名不能为空').max(50, '用户名最多50个字符'),
  email: z.string().regex(emailRegex, '邮箱格式不正确'),
  password: z.string().min(6, '密码至少6个字符').max(50, '密码最多50个字符')
})
