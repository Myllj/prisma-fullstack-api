import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue'),
      meta: { title: '注册' }
    },
    {
      path: '/oauth-success',
      name: 'OAuthSuccess',
      component: () => import('../views/OAuthSuccess.vue'),
      meta: { title: '登录成功' }
    },
    {
      path: '/users',
      name: 'UserList',
      component: () => import('../views/UserList.vue'),
      meta: { title: '用户列表', requireAuth: true }
    },
    {
      path: '/users/:id',
      name: 'UserDetail',
      component: () => import('../views/UserDetail.vue'),
      meta: { title: '用户详情', requireAuth: true }
    },
    {
      path: '/posts',
      name: 'PostList',
      component: () => import('../views/PostList.vue'),
      meta: { title: '文章管理', requireAuth: true }
    },
    {
      path: '/posts/:id',
      name: 'PostDetail',
      component: () => import('../views/PostDetail.vue'),
      meta: { title: '文章详情', requireAuth: true }
    },
    {
      path: '/posts/create',
      name: 'PostCreate',
      component: () => import('../views/PostEditor.vue'),
      meta: { title: '新增文章', requireAuth: true }
    },
    {
      path: '/posts/:id/edit',
      name: 'PostEdit',
      component: () => import('../views/PostEditor.vue'),
      meta: { title: '编辑文章', requireAuth: true }
    },
    {
      path: '/',
      redirect: '/posts'
    }
  ]
})

// 路由守卫：未登录跳转登录页
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token && token !== 'undefined' && token !== 'null'

  if (to.meta.requireAuth && !isAuthenticated) {
    next({ path: '/login', replace: true })
  } else if (to.path === '/login' && isAuthenticated) {
    next({ path: '/posts', replace: true })
  } else {
    next()
  }
})

export default router
