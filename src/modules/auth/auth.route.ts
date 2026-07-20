import { Router } from 'express'
import * as authCtrl from './auth.controller.js'
import { auth, requireAdmin } from './auth.middleware.js'

const router = Router()

// 登录（无需鉴权）
router.post('/login', authCtrl.login)

// 注册（无需鉴权）
router.post('/register', authCtrl.register)

// 管理员重置用户密码（需 ADMIN 角色）
router.post('/admin/reset-password', auth, requireAdmin, authCtrl.adminResetPassword)

// GitHub OAuth 登录
router.get('/oauth/github', authCtrl.githubOAuth)
router.get('/oauth/github/callback', authCtrl.githubOAuthCallback)

// 微信 OAuth 登录
router.get('/oauth/wechat', authCtrl.wechatOAuth)
router.get('/oauth/wechat/callback', authCtrl.wechatOAuthCallback)

// TODO: 手机验证登录
// router.post('/phone/send-code', authCtrl.sendPhoneCode)
// router.post('/phone/verify', authCtrl.phoneVerify)

export default router
