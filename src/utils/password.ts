import bcrypt from 'bcryptjs'

// 加盐轮数：10 是业界常用值，兼顾安全与性能（每次哈希约 100ms）
const SALT_ROUNDS = 10

/** 对明文密码进行 bcrypt 哈希，返回哈希字符串 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS)
  return bcrypt.hash(plain, salt)
}

/** 校验明文密码与哈希是否匹配 */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
