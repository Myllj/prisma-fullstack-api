import jwt from 'jsonwebtoken'

export const JWT_SECRET = process.env.JWT_SECRET || 'prisma-fullstack-api-secret-key'
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d'

/** 签发 JWT token */
export function generateToken(user: { id: number; email: string; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as any }
  )
}
