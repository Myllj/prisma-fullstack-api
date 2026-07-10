import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import * as postCtrl from '../controller/post.controller.js'

const router = Router()

// 文章全部接口需要登录鉴权
router.use(auth)

router.get('/list', postCtrl.list)
router.get('/:id', postCtrl.detail)
router.post('/create', postCtrl.create)
router.put('/:id', postCtrl.update)
router.delete('/:id', postCtrl.remove)

export default router
