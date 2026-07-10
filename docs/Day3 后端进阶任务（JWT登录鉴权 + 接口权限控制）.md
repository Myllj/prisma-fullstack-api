# Day3 后端进阶任务（JWT登录鉴权 \+ 接口权限控制）

# Day3 后端进阶任务（JWT 登录鉴权 \+ 接口权限控制）

## 前置说明

1. 基于 Day2 完成后的单文件 server\.ts 开发，不提前拆分目录，全部功能写完测试通过后再统一整理工程结构

2. 步骤统一格式：第一步：xxx；第二步：xxx；

3. 每个任务包含：任务步骤讲解、完整可复制代码、测试验收 \+ Postman 简易测试案例

4. 承接 Day1、Day2 遗留项目，复用 User、Post 模型，新增登录、token 校验、接口权限拦截能力

## 前置准备（必做步骤 \+ 验收）

### 操作步骤讲解

第一步：确认 Day2 全部接口可正常运行，无报错；
第二步：安装 JWT 依赖包，用于生成、解析登录令牌；

```bash
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

### 验收标准 \+ 测试例子

测试例子：执行安装命令无报错，package\.json 出现 jsonwebtoken 依赖，重启服务原有 CRUD 接口全部正常访问。

---

## 任务一：新增登录接口，签发 JWT 令牌

### 任务步骤讲解

Day1、Day2 只有用户增删改查，无登录身份体系，本任务实现账号登录逻辑，步骤如下：
第一步：在文件顶部引入 jsonwebtoken，定义全局密钥、token 过期时间；
第二步：新增登录 POST 接口，接收账号邮箱 \+ 密码；
第三步：校验数据库是否存在对应用户，账号密码匹配则生成 token；
第四步：登录成功返回用户信息 \+ token 令牌；账号不存在 / 密码错误返回统一错误提示。

### 完整代码（粘贴到用户接口区域）

```ts
import jwt from "jsonwebtoken"
// 全局JWT配置（放在文件最顶部统一响应函数下方）
const JWT_SECRET = "backend-template-secret-2026"
const JWT_EXPIRES = "24h"

// 登录接口
app.post("/api/user/login", async (req, res) => {
  const { email, password } = req.body
  // 查询用户
  const user = await prisma.user.findUnique({
    where: { email }
  })
  if (!user) return res.json(error("账号不存在", 400))
  if (user.password !== password) return res.json(error("密码错误", 400))
  // 生成token
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  )
  res.json(success({ user, token }, "登录成功"))
})
```

### 测试 \& 验收标准 \+ 测试例子

测试例子 1（正常登录）
POST /api/user/login
Body JSON：

```json
{"email":"test@123.com","password":"123456"}
```

预期：code200，返回用户信息 \+ 有效 token 字符串。

测试例子 2（账号不存在）
POST /api/user/login，传不存在的邮箱，返回 400 账号不存在。

测试例子 3（密码错误）
邮箱正确、密码填错，返回 400 密码错误。
验收结果：登录逻辑正常，token 可正常生成，错误提示统一规范。

---

## 任务二：封装全局 JWT 鉴权中间件

### 任务步骤讲解

实现接口登录校验，未携带 token、token 过期、非法 token 禁止访问接口，步骤如下：
第一步：封装通用 auth 校验中间件，从请求头获取 Authorization 令牌；
第二步：截取 Bearer 后的 token 字符串，为空直接拦截；
第三步：使用 jwt\.verify 解析 token，捕获过期、篡改异常；
第四步：校验通过后将用户信息挂载到 req 对象，供后续接口使用；校验失败统一返回 401 未授权。

### 完整代码（放在统一响应函数下方）

```ts
// JWT鉴权中间件
const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.json(error("未登录，请先登录", 401))
  }
  const token = authHeader.split(" ")[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (err)
    return res.json(error("token失效或非法，请重新登录", 401))
  }
}
```

### 测试 \& 验收标准 \+ 测试例子

测试例子 1（无 token 访问受限接口）
不带请求头访问需要鉴权的接口，直接返回 401 未登录。
测试例子 2（错误 token）
请求头 Bearer 后填随机字符串，返回 token 失效提示。
验收结果：中间件拦截逻辑生效，未授权请求全部拦截，格式统一。

---

## 任务三：给文章模块全部接口添加登录鉴权

### 任务步骤讲解

业务规则：文章新增、修改、删除、分页查询，必须登录后才能访问，步骤如下：
第一步：所有 post 相关接口路由前挂载 authMiddleware 中间件；
第二步：改造新增文章接口，自动从 token 读取当前登录用户 id，前端不用传 userId；
第三步：改造更新、删除文章接口，增加权限判断：仅文章作者可操作自己的文章；
第四步：未登录、他人修改文章直接返回 401/403 权限不足提示。

### 改造后完整文章接口代码

```ts
// 分页+模糊搜索文章列表（需登录）
app.get('/api/post/list', authMiddleware, async (req, res) => {
  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 10
  const keyword = (req.query.keyword as string) || ""

  const whereOption = keyword ? {
    title: { contains: keyword }
  } : {}

  const [list, total] = await Promise.all([
    prisma.post.findMany({
      where: whereOption,
      include: { user: { select: { id: true, name: true, email: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.post.count({ where: whereOption })
  ])

  res.json(success({ list, total, page, pageSize }, "查询成功"))
})

// 文章详情（需登录）
app.get('/api/post/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id)
  const post = await prisma.post.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } }
  })
  if (!post) return res.json(error("文章不存在", 404))
  res.json(success(post, "查询成功"))
})

// 新增文章（需登录，自动获取当前登录用户id）
app.post('/api/post/create', authMiddleware, async (req, res) => {
  const errMsg = validate(createPostSchema, req.body)
  if (errMsg) return res.json(error(errMsg, 400))
  const { title, content } = req.body
  const userId = req.user.id
  const post = await prisma.post.create({ data: { title, content, userId } })
  res.json(success(post, "文章创建成功"))
})

// 更新文章（需登录，仅作者可修改）
app.put('/api/post/:id', authMiddleware, async (req, res) => {
  const errMsg = validate(updatePostSchema, req.body)
  if (errMsg) return res.json(error(errMsg, 400))
  const id = Number(req.params.id)
  const { title, content } = req.body
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return res.json(error("文章不存在", 404))
  // 权限校验：只能修改自己的文章
  if (post.userId !== req.user.id) {
    return res.json(error("无权限修改他人文章", 403))
  }

  const updateData: any = {}
  if (title) updateData.title = title
  if (content) updateData.content = content

  const updatedPost = await prisma.post.update({
    where: { id },
    data: updateData
  })
  res.json(success(updatedPost, "文章更新成功"))
})

// 删除文章（需登录，仅作者可删除）
app.delete('/api/post/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id)
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return res.json(error("文章不存在", 404))
  if (post.userId !== req.user.id) {
    return res.json(error("无权限删除他人文章", 403))
  }
  await prisma.post.delete({ where: { id } })
  res.json(success(null, "文章删除成功"))
})
```

### 测试 \& 验收标准 \+ 测试例子

测试例子 1：未登录访问文章列表，返回 401 未登录。
测试例子 2：登录后新增文章，Body 不用传 userId，自动绑定当前登录用户。
测试例子 3：登录 A 账号，尝试修改 B 用户创建的文章，返回 403 无权限。
测试例子 4：携带有效 token，正常分页、新增、修改、删除自己的文章。
验收结果：文章全部接口强制登录，权限隔离生效，无法操作他人数据。

---

## 任务四：开放用户基础查询接口，无需登录

### 任务步骤讲解

需求：用户列表、用户详情公开可访问，不需要登录；登录、新增、修改、删除用户保留原有逻辑，步骤如下：
第一步：用户查询类接口（list、:id）不挂载 authMiddleware；
第二步：用户写操作（新增、更新、删除、登录）保持原有逻辑，登录接口无需鉴权；
第三步：区分公开接口、私有接口权限边界。

### 测试 \& 验收标准 \+ 测试例子

测试例子：不携带 token 直接访问 /api/user/list，正常返回数据，无 401 拦截。
验收结果：用户查询接口公开，文章接口全部需要登录，权限区分清晰。

---

## 任务五：【最后执行】环境变量抽离密钥，优化安全配置

### 任务步骤讲解

全部鉴权功能测试通过后再执行，步骤如下：
第一步：把 JWT\_SECRET、JWT\_EXPIRES 抽入\.env 环境变量，不硬编码在代码；
第二步：安装 dotenv 读取环境变量；
第三步：修改 token 生成逻辑，从\.env 读取配置；
第四步：更新\.env\.example，记录 JWT 配置字段，防止密钥上传 Git 泄露。

### 1\. 安装 dotenv

```bash
npm install dotenv
```

### 2\. server\.ts 顶部引入

```ts
import dotenv from "dotenv"
dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET || "default-secret"
const JWT_EXPIRES = process.env.JWT_EXPIRES || "24h"
```

### 3\. \.env 新增

```env
JWT_SECRET=your-safe-secret-key-2026
JWT_EXPIRES=24h
```

### 4\. \.env\.example 新增

```env
JWT_SECRET=
JWT_EXPIRES=24h
```

### 测试 \& 验收标准 \+ 测试例子

测试例子：修改\.env 内密钥，重启服务，旧 token 全部失效，需要重新登录。
验收结果：敏感密钥抽离环境变量，代码无明文密钥，项目安全性提升。

---

# Day3 全部可测试接口清单

1. POST /api/user/login 登录（无需鉴权）

2. GET /api/user/list 查询全部用户（无需鉴权）

3. GET /api/user/:id 查询单个用户（无需鉴权）

4. POST /api/user/create 新增用户（无需鉴权）

5. PUT /api/user/:id 更新用户（无需鉴权）

6. DELETE /api/user/:id 删除用户（无需鉴权）

7. GET /api/post/list 分页查文章（需 Bearer token）

8. GET /api/post/:id 文章详情（需 Bearer token）

9. POST /api/post/create 新增文章（需 Bearer token）

10. PUT /api/post/:id 更新文章（需 Bearer token，仅作者）

11. DELETE /api/post/:id 删除文章（需 Bearer token，仅作者）

# Day3 整体验收标准

1. 实现完整 JWT 登录、令牌签发、token 过期校验能力；

2. 封装通用鉴权中间件，统一拦截未登录请求，返回 401；

3. 文章全接口强制登录，严格权限隔离，只能操作自己创建的文章；

4. 用户查询接口开放访问，权限分层清晰；

5. 密钥抽离环境变量，解决硬编码密钥安全漏洞；

6. 所有报错统一响应格式，无原生 500 裸奔报错；

7. 全程基于 Day2 单文件开发，全部功能测通后再优化环境配置。



> （注：部分内容可能由 AI 生成）
