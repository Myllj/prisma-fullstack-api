import { z } from 'zod'
import { Response } from 'express'
import { error } from '../utils/response.js'

/** 字段名 -> 中文标签映射 */
const fieldLabels: Record<string, string> = {
  name: '用户名',
  email: '邮箱',
  password: '密码',
  title: '标题',
  content: '内容',
  userId: '用户ID'
}

/** 将 Zod 错误转为友好的中文提示 */
function formatZodIssue(issue: Record<string, any>): string {
  const label = fieldLabels[issue.path[0]] || issue.path.join('.')

  if (issue.code === 'invalid_type') {
    if (issue.message.includes('undefined')) {
      return `${label}不能为空`
    }
    if (issue.expected === 'number' || issue.expected === 'int') {
      return `${label}必须是数字`
    }
    return `${label}不能为空`
  }
  return issue.message
}

/** 通用校验工具：校验通过返回数据，失败直接响应错误并返回 null */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown, res: Response): T | null {
  const result = schema.safeParse(data)
  if (!result.success) {
    const msg = result.error.issues.map(i => formatZodIssue(i)).join('；')
    error(res, msg, 400)
    return null
  }
  return result.data
}
