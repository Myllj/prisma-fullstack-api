import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import * as userCtrl from '../controller/user.controller.js'

const router = Router()

// 登录（无需鉴权）
router.post('/login', userCtrl.login)

// 个人信息（需鉴权，必须放在 /:id 之前）
router.get('/profile', auth, userCtrl.profile)

// 用户增删改查（无需鉴权）
router.get('/list', userCtrl.list)
router.get('/:id', userCtrl.detail)
router.post('/create', userCtrl.create)
router.put('/:id', userCtrl.update)
router.delete('/:id', userCtrl.remove)

export default router
