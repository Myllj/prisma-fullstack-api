import { Request, Response } from 'express'
import prisma from '../../prisma.js'
import { success, error } from '../../utils/response.js'
import { generateToken } from './auth.service.js'
import { loginSchema, registerSchema, adminResetPasswordSchema } from './auth.schema.js'
import { validate } from '../../middleware/validate.js'
import { proxyFetch } from '../../utils/http.js'
import { hashPassword, comparePassword } from '../../utils/password.js'

/** 邮箱 + 密码登录 */
export async function login(req: Request, res: Response) {
  try {
    const data = validate(loginSchema, req.body, res)
    if (!data) return

    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user) return error(res, '账号不存在', 400)
    // 密码用 bcrypt 校验（数据库存的是哈希值，不可逆向）
    const isMatch = await comparePassword(data.password, user.password)
    if (!isMatch) return error(res, '密码错误', 400)

    const token = generateToken(user)

    const { password: _, ...userInfo } = user
    success(res, { user: userInfo, token }, '登录成功')
  } catch (e) {
    console.error('登录错误:', e)
    error(res, '登录失败', 500)
  }
}

/** 邮箱 + 密码注册 */
export async function register(req: Request, res: Response) {
  try {
    const data = validate(registerSchema, req.body, res)
    if (!data) return

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) return error(res, '该邮箱已注册', 400)

    // 密码 bcrypt 加密后入库（永不存明文）
    const hashedPassword = await hashPassword(data.password)
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, password: hashedPassword, role: 'USER' }
    })

    const { password: _, ...userInfo } = user
    success(res, userInfo, '注册成功')
  } catch (e) {
    console.error('注册错误:', e)
    error(res, '注册失败', 500)
  }
}

// ---------- 管理员重置用户密码 ----------

/** 管理员重置用户密码（需要 ADMIN 角色） */
export async function adminResetPassword(req: Request, res: Response) {
  try {
    const data = validate(adminResetPasswordSchema, req.body, res)
    if (!data) return

    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user) return error(res, '用户不存在', 400)

    const hashedPassword = await hashPassword(data.newPassword)
    await prisma.user.update({
      where: { email: data.email },
      data: { password: hashedPassword }
    })

    success(res, { email: data.email, name: user.name }, '密码重置成功')
  } catch (e) {
    console.error('管理员重置密码错误:', e)
    error(res, '密码重置失败', 500)
  }
}

// ---------- GitHub OAuth ----------

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || ''
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || ''
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const OAUTH_BASE = process.env.OAUTH_REDIRECT_BASE || 'http://127.0.0.1:3000'

const GITHUB_CALLBACK = `${OAUTH_BASE}/api/auth/oauth/github/callback`
const WECHAT_CALLBACK = `${OAUTH_BASE}/api/auth/oauth/wechat/callback`

/** 跳转到 GitHub 授权页 */
export function githubOAuth(_req: Request, res: Response) {
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_CALLBACK)}&scope=user:email`
  res.redirect(url)
}

/** GitHub 回调：换取 token → 获取用户信息 → 自动登录/注册 */
export async function githubOAuthCallback(req: Request, res: Response) {
  const code = req.query.code as string
  if (!code) return res.redirect(`${FRONTEND_URL}/login?error=授权失败`)

  try {
    // 1. 用 code 换 access_token
    const tokenRes = await proxyFetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'prisma-fullstack-api' },
      body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code })
    })
    const tokenData = await tokenRes.json() as any
    const accessToken = tokenData.access_token
    if (!accessToken) return res.redirect(`${FRONTEND_URL}/login?error=GitHub授权失败`)

    // 2. 用 access_token 获取 GitHub 用户信息（GitHub API 必须带 User-Agent）
    const userRes = await proxyFetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json', 'User-Agent': 'prisma-fullstack-api' }
    })
    const githubUser = await userRes.json() as any

    // 3. 获取邮箱（可能为 null，需要额外请求）
    let email = githubUser.email
    if (!email) {
      const emailRes = await proxyFetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json', 'User-Agent': 'prisma-fullstack-api' }
      })
      const emails = await emailRes.json() as any[]
      const primary = emails?.find((e: any) => e.primary && e.verified)
      email = primary?.email || emails?.[0]?.email || `${githubUser.login}@github.user`
    }

    const githubId = String(githubUser.id)
    const name = githubUser.name || githubUser.login
    const avatar = githubUser.avatar_url

    // 4. 查找或创建用户
    let user = await prisma.user.findFirst({
      where: { OR: [{ email }, { name: githubUser.login }] }
    })

    if (!user) {
      // 新用户：用 GitHub 信息注册
      const randomPwd = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
      const hashedPassword = await hashPassword(randomPwd)
      user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role: 'USER' }
      })
    }

    // 5. 签发 JWT，重定向到前端
    const token = generateToken(user)
    res.redirect(`${FRONTEND_URL}/oauth-success?token=${token}&name=${encodeURIComponent(user.name)}`)
  } catch (e) {
    console.error('GitHub OAuth 错误:', e)
    res.redirect(`${FRONTEND_URL}/login?error=GitHub登录失败`)
  }
}

// ---------- 微信 OAuth ----------

const WECHAT_APPID = process.env.WECHAT_APPID || ''
const WECHAT_APPSECRET = process.env.WECHAT_APPSECRET || ''

/** 跳转到微信授权页（扫码登录） */
export function wechatOAuth(_req: Request, res: Response) {
  const url = `https://open.weixin.qq.com/connect/oauth2/authorize`
    + `?appid=${WECHAT_APPID}`
    + `&redirect_uri=${encodeURIComponent(WECHAT_CALLBACK)}`
    + `&response_type=code`
    + `&scope=snsapi_userinfo`
    + `&state=${Date.now()}`
    + `#wechat_redirect`
  res.redirect(url)
}

/** 微信回调：code → access_token → 用户信息 → 自动登录/注册 */
export async function wechatOAuthCallback(req: Request, res: Response) {
  const code = req.query.code as string
  if (!code) return res.redirect(`${FRONTEND_URL}/login?error=微信授权失败`)

  try {
    // 1. code 换取 access_token + openid
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token`
      + `?appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}&code=${code}&grant_type=authorization_code`

    const tokenRes = await proxyFetch(tokenUrl)
    const tokenData = await tokenRes.json() as any

    const accessToken = tokenData.access_token
    const openid = tokenData.openid
    if (!accessToken || !openid) {
      console.error('微信 token 交换失败:', tokenData)
      return res.redirect(`${FRONTEND_URL}/login?error=微信授权失败`)
    }

    // 2. access_token + openid 换取用户信息
    const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo`
      + `?access_token=${accessToken}&openid=${openid}&lang=zh_CN`

    const userRes = await proxyFetch(userInfoUrl)
    const wxUser = await userRes.json() as any

    const name = wxUser.nickname || `微信用户${openid.slice(-6)}`
    const avatar = wxUser.headimgurl || ''
    const email = `${openid}@wechat.user`

    // 3. 查找已有微信用户
    let user = await prisma.user.findUnique({ where: { wechatOpenId: openid } })
    if (!user) {
      // 查找同邮箱（升级后兼容旧数据）或使用占位邮箱
      user = await prisma.user.findUnique({ where: { email } })
    }

    // 4. 没有则创建新用户
    if (!user) {
      const randomPwd = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
      const hashedPassword = await hashPassword(randomPwd)
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'USER',
          wechatOpenId: openid,
          wechatNickname: wxUser.nickname || name,
          avatarUrl: avatar
        }
      })
    } else {
      // 已有用户，补充微信字段
      await prisma.user.update({
        where: { id: user.id },
        data: {
          wechatOpenId: openid,
          wechatNickname: wxUser.nickname || user.wechatNickname || name,
          avatarUrl: avatar || user.avatarUrl || ''
        }
      })
    }

    // 5. 签发 JWT，重定向到前端
    const token = generateToken(user)
    res.redirect(`${FRONTEND_URL}/oauth-success?token=${token}&name=${encodeURIComponent(user.name)}`)
  } catch (e) {
    console.error('微信 OAuth 错误:', e)
    res.redirect(`${FRONTEND_URL}/login?error=微信登录失败`)
  }
}
