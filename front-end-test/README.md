# Prisma Fullstack 前端项目

基于 Vue 3 + Vite + Element Plus 的后台管理系统，对接 Prisma Fullstack API。

## 项目地址

- **后端 API**：项目根目录 `prisma-fullstack-api`
- **前端页面**：当前文件夹 (`front-end-test`)

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | ^3.5 | 渐进式前端框架 |
| Vite | ^6.2 | 前端构建工具 |
| Element Plus | ^2.9 | 后台管理系统 UI 组件库 |
| Vue Router | ^4.5 | 前端路由 |
| Axios | ^1.7 | HTTP 请求库 |
| TypeScript | ~5.7 | 类型安全 |

---

## 从 0-1 启动运行流程

### 第一步：确保后端服务已启动

```bash
# 在项目根目录执行
npm run dev
```

后端默认运行在 `http://localhost:3000`。

### 第二步：安装前端依赖

```bash
cd front-end-test
npm install
```

### 第三步：启动前端开发服务器

```bash
npm run dev
```

启动后浏览器访问 `http://localhost:5173` 即可。

> **注意**：Vite 已配置 API 代理，前端请求 `/api/*` 会自动转发到后端 `http://localhost:3000`，无需额外配置跨域。

---

## 页面路由说明

共 **9 个路由**，覆盖 **8 个页面组件**（PostEditor 复用于新增和编辑）：

| 路由 | 页面组件 | 需登录 | 说明 |
|------|------|:---:|------|
| `/login` | Login.vue | 否 | 邮箱登录、注册入口、GitHub/微信第三方登录 |
| `/register` | Register.vue | 否 | 邮箱注册（用户名 + 邮箱 + 密码） |
| `/oauth-success` | OAuthSuccess.vue | 否 | OAuth 登录成功回调页（解析 token 自动跳转） |
| `/posts` | PostList.vue | 是 | 文章管理首页（分页列表、搜索、增删改） |
| `/posts/create` | PostEditor.vue | 是 | 新增文章 |
| `/posts/:id` | PostDetail.vue | 是 | 文章详情（完整内容） |
| `/posts/:id/edit` | PostEditor.vue | 是 | 编辑文章（复用 PostEditor，自动回显） |
| `/users` | UserList.vue | 是 | 用户列表 |
| `/users/:id` | UserDetail.vue | 是 | 用户详情（含其文章列表） |
| `/` | — | — | 重定向到 `/posts` |

---

## 组件说明

### 页面组件（src/views/）

| 组件 | 说明 |
|------|------|
| `Login.vue` | 登录页：邮箱+密码登录、跳转注册页、GitHub OAuth 登录、微信登录（需微信环境）、粒子背景动效、浏览器自动填充样式覆盖 |
| `Register.vue` | 注册页：用户名+邮箱+密码注册，与登录页统一风格（粒子动效、渐变按钮） |
| `OAuthSuccess.vue` | OAuth 登录成功回调页：解析 URL 中的 token 参数，存入 localStorage 后自动跳转到文章列表 |
| `PostList.vue` | 文章管理首页：分页表格、标题关键词搜索、新增/编辑/删除/详情操作、每页条数切换 |
| `PostDetail.vue` | 文章详情：展示标题、作者、内容、创建时间，支持返回列表 |
| `PostEditor.vue` | 文章编辑器（新增/编辑复用）：标题输入框 + 内容输入框，编辑模式自动回显已有内容 |
| `UserList.vue` | 用户列表：表格展示所有用户，支持查看详情 |
| `UserDetail.vue` | 用户详情：展示用户完整信息及其发布的文章列表 |

### 通用模块

| 路径 | 说明 |
|------|------|
| `src/api/index.ts` | Axios 实例封装：请求拦截器自动注入 Token、响应拦截器统一错误提示 + 401 自动跳转登录 |
| `src/router/index.ts` | Vue Router 配置 + 导航守卫：未登录自动跳转 `/login`，已登录访问登录页自动跳转 `/posts` |
| `src/composables/useParticles.ts` | 粒子特效 Composable：用于登录/注册页背景动画，粒子跟随鼠标移动 |
| `src/App.vue` | 主布局：顶部 Header + 左侧侧边栏 + 右侧内容区，内容滚动时头部和侧栏固定 |
| `src/main.ts` | Vue 应用入口：注册 Element Plus、Router，挂载应用 |

---

## 页面业务跳转逻辑

### 登录/注册流程
1. 访问任意需登录页面 → 未登录 → 自动跳转 `/login`
2. 输入邮箱密码 → 点击"登录" → 调用 `POST /api/auth/login` → 获取 token 存入 localStorage → 跳转 `/posts`
3. 点击"注册账号" → 跳转 `/register` → 填写信息 → 调用 `POST /api/auth/register` → 成功后跳转 `/login`
4. 点击"GitHub 登录" → 跳转 GitHub 授权页 → 授权后回调 `/oauth-success` → 自动解析 token 并跳转 `/posts`

### 文章管理流程
- **列表**：默认加载所有文章（分页），支持每页 10/20/50/100 条切换
- **搜索**：输入关键字 → 回车或点击"搜索" → 重新请求第 1 页
- **新增**：点击"新增文章" → 跳转 `/posts/create` → 填写标题+内容 → 发布 → 返回列表
- **编辑**：点击"编辑" → 跳转 `/posts/:id/edit` → 自动回显 → 保存 → 返回列表
- **删除**：点击"删除" → 确认弹窗 → 调用删除接口 → 刷新列表
- **详情**：点击"详情" → 跳转 `/posts/:id` → 可返回列表

### 用户管理流程
- **列表**：加载所有用户表格展示
- **详情**：点击"查看详情" → `/users/:id` → 展示用户完整信息及文章列表

### 退出登录
- 点击右上角"退出登录" → 清除 localStorage token → 跳转 `/login`

---

## Token 鉴权机制

1. 登录成功后，token 存入 `localStorage`
2. Axios 请求拦截器自动在每个请求头加上 `Authorization: Bearer <token>`
3. 响应拦截器检测 401 → 自动清除 token + user 信息 → 跳转 `/login` 并提示"登录已过期"
4. Vue Router 路由守卫：需登录的页面未登录时直接跳转 `/login`（无闪烁）

---

## 接口对接情况

| 接口 | 使用页面 |
|------|------|
| `POST /api/auth/login` | Login.vue |
| `POST /api/auth/register` | Register.vue |
| `GET /api/user/list` | UserList.vue |
| `GET /api/user/:id` | UserDetail.vue |
| `GET /api/post/list` | PostList.vue |
| `GET /api/post/:id` | PostDetail.vue、PostEditor.vue（编辑回显） |
| `POST /api/post/create` | PostEditor.vue |
| `PUT /api/post/:id` | PostEditor.vue |
| `DELETE /api/post/:id` | PostList.vue |

---

## 调试技巧

### 查看网络请求
按 `F12` 打开开发者工具 → Network 标签 → 筛选 `XHR` 或 `Fetch`，可查看每个 API 请求的请求参数和响应结果。

### 查看 localStorage Token
按 `F12` → Application 标签 → Local Storage → `http://localhost:5173` → 查看 `token` 键是否存在。手动删除可模拟"未登录"状态。

### 清空登录状态
```js
// 在浏览器控制台执行以下代码，立即退出登录：
localStorage.removeItem('token')
localStorage.removeItem('user')
location.href = '/login'
```

### 常见问题

**Q：页面空白或接口 401？**

A：检查后端是否启动（`npm run dev`），确认 token 未过期。可以清除 localStorage 后重新登录。

**Q：Vite 热更新不生效？**

A：按 `Ctrl+C` 停止前端服务，重新执行 `npm run dev`。

**Q：Element Plus 图标不显示？**

A：确保已安装 `@element-plus/icons-vue`：`npm install @element-plus/icons-vue`

---

## 目录结构

```
front-end-test/
├── index.html              # HTML 入口
├── package.json            # 依赖与脚本
├── vite.config.ts          # Vite 配置（含 /api → localhost:3000 代理）
├── tsconfig.json           # TypeScript 配置
└── src/
    ├── main.ts             # Vue 应用入口（注册 Element Plus + Router）
    ├── App.vue             # 主布局（Header + 侧边栏 + 内容区）
    ├── env.d.ts            # TypeScript 类型声明
    ├── api/
    │   └── index.ts        # Axios 实例封装（拦截器）
    ├── router/
    │   └── index.ts        # 路由配置 + 导航守卫
    ├── composables/
    │   └── useParticles.ts # 粒子背景动效
    └── views/
        ├── Login.vue        # 登录页
        ├── Register.vue     # 注册页
        ├── OAuthSuccess.vue # OAuth 回调处理页
        ├── PostList.vue     # 文章列表（分页 + 搜索 + 增删改查）
        ├── PostDetail.vue   # 文章详情
        ├── PostEditor.vue   # 文章新增/编辑（复用）
        ├── UserList.vue     # 用户列表
        └── UserDetail.vue   # 用户详情
```
