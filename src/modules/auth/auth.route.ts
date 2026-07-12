import { Router } from 'express'
import * as authCtrl from './auth.controller.js'

const router = Router()

// 登录（无需鉴权）
router.post('/login', authCtrl.login)

// TODO: 注册
// router.post('/register', authCtrl.register)

// TODO: OAuth 2.0 第三方登录
// router.get('/oauth/:provider', authCtrl.oauthRedirect)
// router.get('/oauth/:provider/callback', authCtrl.oauthCallback)

// TODO: 手机验证登录
// router.post('/phone/send-code', authCtrl.sendPhoneCode)
// router.post('/phone/verify', authCtrl.phoneVerify)

export default router
