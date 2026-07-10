# Day2 后端进阶任务清单（Day1单文件原生迭代 · 最后统一模块化重构）

**核心开发规则（严格强制执行）**

1\. **完全基于你上传的 Day1 单文件 server\.ts 开发**，前期不拆分 route、controller，所有代码写在原生入口文件中

2\. 开发顺序：先补全所有业务CRUD → 统一响应格式 → 全局错误处理 → Zod参数校验 → **全部测通后**，最后一次性做文件拆分、工程目录重构

3\. 100% 兼容你现有代码逻辑，不覆盖原有有效业务，只迭代升级、补全功能、修复坑点

**核心目标**：基于单文件旧项目，补全完整CRUD、修复Day1所有报错坑、标准化接口响应、加入参数校验，最后升级为工程化模板项目。

---

## 前置准备（必做步骤 \+ 验收）

### 操作步骤

1\. 保留你当前完整的单文件 `server.ts`，服务可正常启动、原有用户/文章接口可正常请求。

2\. 安装 Zod 参数校验依赖，用于后续接口参数合法性拦截。

```bash
npm install zod
```

### 验收标准

依赖安装无报错，package\.json 存在 zod 依赖，项目启动无冲突、原有接口正常使用。

---

## 任务一：全局统一响应工具封装（单文件增量新增）

### 任务步骤讲解

Day1 原生 server\.ts 存在核心问题：所有接口成功/失败返回的JSON格式都是手动手写，没有统一规范，会出现部分接口msg文案不一致、返回字段不统一、报错格式混乱的问题，后续新增接口极易出现格式错乱，不利于前端对接和统一错误处理。本任务分步改造如下：
第一步：在单文件顶部全局新增封装**统一成功、失败响应工具函数**；
第二步：废弃接口内手动书写JSON返回对象的方式；
第三步：规定后续所有接口统一调用 success / error 工具返回数据，实现全站响应格式标准化，为后续错误处理、参数校验铺垫基础。

### 操作代码（直接粘贴到 server\.ts 最顶部）

```typescript
// 统一响应封装
const success = (data: any = null, msg = "操作成功") => {
  return { code: 200, msg, data }
}

const error = (msg = "操作失败", code = 500) => {
  return { code, msg, data: null }
}
```

### 迭代说明

后续所有接口成功、失败返回，一律调用 `success()` / `error()`，不再手写 json 对象。

### 验收标准 \& 简单测试例子

- **测试例子**：终端执行`npm install zod`，查看package\.json出现zod版本，重启服务无报错

- **验收结果**：依赖安装成功，项目启动正常，原有用户、文章接口可正常访问

工具函数无报错，可正常调用，格式统一规范。

---

## 任务二：用户模块完整CRUD升级（基于你的原生代码迭代）

### 任务步骤讲解

你的Day1原生代码已实现用户基础CRUD，但存在返回格式混乱、异常提示简陋、外键报错崩溃等问题。本次迭代**不新增文件、不拆分模块**，完全基于原生代码迭代优化，步骤如下：
第一步：全局统一格式化，将所有接口手动JSON返回替换为 success/error 工具函数，全站格式统一；
第二步：优化删除用户逻辑，精准统计用户关联文章数量，给出友好提示，解决数据库外键约束导致服务500崩溃的核心bug；
第三步：规范化异常状态码，资源不存在统一返回404、业务拦截统一返回400，所有报错前端展示友好脱敏文案。

本次迭代优化：**统一响应格式 \+ 优化删除外键提示文案 \+ 修复细节bug**，完全基于你原生代码改造，不新增文件。

### 完整替换【用户所有接口】代码（覆盖server\.ts中原用户接口）

```typescript
// 用户接口
// 获取全部用户
app.get('/api/user/list', async (req, res) => {
  const list = await prisma.user.findMany({ include: { posts: true } })
  res.json(success(list, "查询成功"))
})

// 新增用户
app.post('/api/user/create', async (req, res) => {
  const { name, email, password } = req.body
  const user = await prisma.user.create({ data: { name, email, password } })
  res.json(success(user, "用户创建成功"))
})

// 用户详情
app.get('/api/user/:id', async (req, res) => {
  const id = Number(req.params.id)
  const user = await prisma.user.findUnique({ where: { id }, include: { posts: true } })
  if (!user) return res.json(error("用户不存在", 404))
  res.json(success(user, "查询成功"))
})

// 更新用户
app.put('/api/user/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { name, email, password } = req.body
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return res.json(error("用户不存在", 404))
  const updated = await prisma.user.update({
    where: { id },
    data: { ...(name !== undefined && { name }), ...(email !== undefined && { email }), ...(password !== undefined && { password }) }
  })
  res.json(success(updated, "用户更新成功"))
})

// 删除用户（解决外键崩溃坑）
app.delete('/api/user/:id', async (req, res) => {
  const id = Number(req.params.id)
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return res.json(error("用户不存在", 404))
  const postCount = await prisma.post.count({ where: { userId: id } })
  if (postCount > 0) return res.json(error(`请先删除该用户的所有文章（共 ${postCount} 篇）`, 400))
  await prisma.user.delete({ where: { id } })
  res.json(success(null, "用户删除成功"))
})

```

### 本任务测试 \& 验收标准 \+ 简单测试例子

- **测试例子1（正常新增用户）**：POST /api/user/create，传参 `{name:"测试",email:"test@123.com",password:"123456"}`，返回200、创建成功

- **测试例子2（查不存在用户）**：GET /api/user/9999，返回404、提示用户不存在，无500报错

- **测试例子3（防外键崩溃）**：给用户创建一篇文章后，删除该用户，提示「请先删除该用户的所有文章」，服务不崩溃

- **测试例子4（更新用户仅修改昵称）**：PUT /api/user/1，传参 `{"name":"后端学习"}`，仅更新用户名，返回200、用户更新成功

- **测试例子5（更新用户邮箱\+密码）**：PUT /api/user/1，传参 `{"email":"update@123.com","password":"654321"}`，仅更新邮箱和密码，字段局部更新生效

- **测试例子6（更新不存在用户）**：PUT /api/user/9999，任意合法body参数，返回404、提示用户不存在，服务无报错

- **验收结果**：用户增删改查全部正常，报错提示友好，无原生崩溃报错，响应格式统一

- 所有用户接口返回格式统一，无手写自定义json

- 删除存在文章的用户，友好提示不崩溃，彻底解决Day1外键500报错

- 查询/操作不存在ID，返回404友好提示

- 新增、更新、查询、删除功能全部正常可用

---

## 任务三：文章模块补全完整CRUD \+ 分页 \+ 模糊搜索（单文件升级）

### 任务步骤讲解

你的Day1原生文章接口仅支持查询全部、新增文章，功能残缺、无分页搜索、异常处理简陋。本次单文件增量迭代，补齐全套进阶能力，步骤分层清晰：
第一步：补全文章闭环接口，新增文章详情、文章更新、文章删除接口，实现完整CRUD能力；
第二步：升级原有文章列表接口，增加分页逻辑，支持自定义页码、每页条数，适配前端分页场景；
第三步：新增标题模糊搜索功能，根据关键词动态匹配文章数据；
第四步：优化关联查询，查询文章自动带出作者完整信息，补齐Day1数据展示短板；
全程不拆分文件、不改动目录，所有功能直接写入原生server\.ts。

本次一次性补全：**文章详情、文章更新、文章删除、分页查询、标题模糊搜索**，全部写在原生server\.ts中，不拆分文件。

### 完整替换【文章所有接口】代码

```typescript
// 文章接口
// 分页+模糊搜索文章列表（升级进阶功能）
app.get('/api/post/list', async (req, res) => {
  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 10
  const keyword = (req.query.keyword as string) || ""

  // 模糊搜索条件
  const whereOption = keyword ? {
    title: {
      contains: keyword
    }
  } : {}

  // 查询列表+总数
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

// 文章详情
app.get('/api/post/:id', async (req, res) => {
  const id = Number(req.params.id)
  const post = await prisma.post.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } }
  })
  if (!post) return res.json(error("文章不存在", 404))
  res.json(success(post, "查询成功"))
})

// 新增文章
app.post('/api/post/create', async (req, res) => {
  const { title, content, userId } = req.body
  const post = await prisma.post.create({ data: { title, content, userId } })
  res.json(success(post, "文章创建成功"))
})

// 更新文章
app.put('/api/post/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { title, content } = req.body
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return res.json(error("文章不存在", 404))

  const updateData: any = {}
  if (title) updateData.title = title
  if (content) updateData.content = content

  const updatedPost = await prisma.post.update({
    where: { id },
    data: updateData
  })
  res.json(success(updatedPost, "文章更新成功"))
})

// 删除文章
app.delete('/api/post/:id', async (req, res) => {
  const id = Number(req.params.id)
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return res.json(error("文章不存在", 404))

  await prisma.post.delete({ where: { id } })
  res.json(success(null, "文章删除成功"))
})

```

### 本任务测试 \& 验收标准 \+ 简单测试例子

- **测试例子1（分页查询）**：GET /api/post/list?page=1\&pageSize=5，返回5条数据，携带total、page、pageSize字段

- **测试例子2（模糊搜索）**：创建标题含「学习」的文章，请求 /api/post/list?keyword=学习，可精准匹配到对应文章

- **测试例子3（文章详情）**：GET /api/post/有效文章ID，正常带出作者姓名、邮箱信息

- **测试例子4（删不存在文章）**：DELETE /api/post/9999，返回404文章不存在，无报错

- **测试例子5（仅更新文章标题）**：PUT /api/post/有效文章ID，传参 `{"title":"Node进阶学习"}`，仅更新标题，内容保留不变，返回更新成功

- **测试例子6（仅更新文章内容）**：PUT /api/post/有效文章ID，传参 `{"content":"单文件开发进阶教程"}`，仅更新内容，标题保留不变

- **测试例子7（同时更新标题\+内容）**：PUT /api/post/有效文章ID，传参 `{"title":"后端开发","content":"Express+Prisma完整实战"}`，两个字段同步更新成功

- **测试例子8（更新不存在文章）**：PUT /api/post/9999，任意合法body，返回404 文章不存在，服务不崩溃

- **验收结果**：文章完整CRUD可用，分页、搜索功能正常，关联数据展示正常

- 文章实现完整 CRUD 闭环，新增/查询/详情/更新/删除全部可用

- 列表支持分页：默认10条，可自定义 page、pageSize

- 支持标题关键词模糊搜索，匹配对应文章

- 文章自动带出作者完整信息，无数据报错

- 操作不存在文章ID，返回友好404提示，无500裸奔报错

---

## 任务四：全局错误处理 \+ 404拦截（单文件原生接入）

### 任务步骤讲解

Day1原生项目存在严重线上隐患：非法路由返回HTML报错、数据库错误暴露原生错误栈，敏感信息裸奔。本任务分步彻底解决裸奔报错问题：
第一步：固定中间件挂载位置，在**所有业务路由之后、服务监听之前**统一挂载拦截中间件；
第二步：新增404拦截中间件，所有不存在的接口统一返回标准JSON提示，替代原生HTML报错页面；
第三步：新增全局错误捕获中间件，统一捕获代码异常、数据库异常、参数异常；
第四步：针对性脱敏Prisma数据库报错，隐藏底层错误栈，向前端返回友好业务提示，彻底杜绝500裸奔报错。

在server\.ts**所有路由写完之后、服务监听之前**添加全局中间件。

### 接入代码（放在所有接口最末尾、app\.listen之前）

```typescript
// 404 接口拦截
app.use((req, res) => {
  res.json(error("接口不存在", 404))
})

// 全局错误捕获中间件
app.use((err: any, req: any, res: any, next: any) => {
  console.error("全局错误：", err)
  // 脱敏Prisma数据库原生错误
  if (err.name === "PrismaClientKnownRequestError") {
    return res.json(error("数据操作异常，请检查参数或关联数据", 500))
  }
  res.json(error("服务器内部错误", 500))
})

```

### 本任务测试 \& 验收标准 \+ 简单测试例子

- **测试例子1（404拦截）**：访问任意不存在接口，如 GET /api/abc，返回标准JSON、提示接口不存在，无网页报错

- **测试例子2（数据库错误脱敏）**：手动传非法ID操作数据库，服务不抛出原生错误栈，只提示友好文案

- **验收结果**：所有报错统一JSON格式，无裸奔报错、无前端暴露敏感错误信息

- 访问不存在的接口地址，返回标准404 JSON，无HTML报错页面

- 数据库异常、代码报错不会暴露原生错误信息，前端只收到友好提示

- 所有错误返回格式统一，和成功接口格式对齐

---

## 任务五：Zod参数校验（单文件完整接入，杜绝非法参数报错）

### 任务步骤讲解

Day1核心漏洞：无任何参数校验，非法参数、空参数、格式错误参数可直接入库，导致服务崩溃。本任务基于Zod实现前置参数拦截，全程单文件增量开发，步骤如下：
第一步：导入zod依赖，根据业务需求，自定义用户、文章新增/更新专属校验规则，限制字段非空、数据格式、长度、数据类型；
第二步：封装通用validate校验工具函数，统一校验逻辑，减少代码冗余；
第三步：改造三大写接口（新增用户、新增文章、更新文章），在接口最前置执行参数校验；
第四步：实现非法参数直接拦截，不进入数据库业务逻辑，从根源杜绝参数导致的500报错，查询接口无需校验，保留原生逻辑。

所有校验规则、校验逻辑全部写在单文件内，不新建文件夹，纯增量迭代。

### 1\. 在文件顶部引入zod、定义校验规则

```typescript
import { z } from "zod"

// 用户校验规则
const createUserSchema = z.object({
  name: z.string().min(1, "用户名不能为空"),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码长度至少6位")
})

// 文章校验规则
const createPostSchema = z.object({
  title: z.string().min(1, "文章标题不能为空"),
  content: z.string().min(1, "文章内容不能为空"),
  userId: z.number().int("用户ID必须为整数")
})

const updatePostSchema = z.object({
  title: z.string().min(1, "标题不能为空").optional(),
  content: z.string().min(1, "内容不能为空").optional()
})

// 通用校验方法
const validate = (schema: any, body: any) => {
  const result = schema.safeParse(body)
  if (!result.success) {
    return result.error.issues[0].message
  }
  return null
}

```

### 2\. 给对应接口接入参数校验（直接替换对应接口代码）

新增用户接口改造：

```typescript
app.post('/api/user/create', async (req, res) => {
  const errMsg = validate(createUserSchema, req.body)
  if (errMsg) return res.json(error(errMsg, 400))
  const { name, email, password } = req.body
  const user = await prisma.user.create({ data: { name, email, password } })
  res.json(success(user, "用户创建成功"))
})

```

新增文章接口改造：

```typescript
app.post('/api/post/create', async (req, res) => {
  const errMsg = validate(createPostSchema, req.body)
  if (errMsg) return res.json(error(errMsg, 400))
  const { title, content, userId } = req.body
  const post = await prisma.post.create({ data: { title, content, userId } })
  res.json(success(post, "文章创建成功"))
})
```

更新文章接口改造：

```typescript
app.put('/api/post/:id', async (req, res) => {
  const errMsg = validate(updatePostSchema, req.body)
  if (errMsg) return res.json(error(errMsg, 400))
  const id = Number(req.params.id)
  const { title, content } = req.body
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return res.json(error("文章不存在", 404))

  const updateData: any = {}
  if (title) updateData.title = title
  if (content) updateData.content = content

  const updatedPost = await prisma.post.update({
    where: { id },
    data: updateData
  })
  res.json(success(updatedPost, "文章更新成功"))
})

```

### 本任务测试 \& 验收标准 \+ 简单测试例子

- **测试例子1（用户参数校验）**：新增用户不传name、或密码填123、或邮箱填123，直接拦截，返回对应中文提示

- **测试例子2（新增文章校验）**：新增文章不传title、或userId传字符串，拦截报错，不进入数据库

- **测试例子3（更新文章校验）**：更新文章传空标题，触发参数校验拦截

- **验收结果**：所有非法参数全部前置拦截，杜绝参数错误导致的服务500崩溃

- 新增用户缺字段、密码过短、邮箱格式错误，提前拦截，返回中文提示，不进数据库

- 新增文章缺标题/内容、userId传字符串，直接400拦截

- 更新文章传空标题/内容，触发校验拦截

- 彻底解决非法参数导致的数据库500报错

---

## 任务六：【最终收尾·最后执行】环境配置 \+ 工程化目录重构

**重要：必须确保以上所有功能全部开发、测试通过后，再执行本任务**

### 任务步骤讲解

本任务为**最终收尾任务，必须所有业务功能测通后再执行**，用于将单文件臃肿项目升级为标准工程化项目，步骤如下：
第一步：新增\.env环境变量文件，抽离端口、数据库地址等核心配置，消除代码硬编码；
第二步：新增\.env\.example模板文件，规范git提交，避免敏感数据库信息泄露；
第三步：补充package\.json生产启动脚本，适配开发、生产双环境启动；
第四步：规整项目目录结构，为后续路由、控制器、中间件模块化拆分做铺垫，完成项目工程化标准化升级。

### 1\. 新增 \.env 环境变量文件

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="你的数据库连接串"
```

### 2\. 新增 \.env\.example 模板文件（提交Git）

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=""
```

### 3\. package\.json 补充启动脚本

```json
"start": "tsx src/server.ts"
```

### 4\. 最终模块化目录拆分（统一收尾）

将单文件代码拆分：路由分离、控制器分离、工具/中间件/校验规则分离

```plain
src/
  ├── server.ts（精简入口）
  ├── prisma.ts
  ├── controller/
  ├── route/
  ├── middleware/
  ├── utils/
  └── schema/
prisma/
.env
.env.example

```

---

## Day2 全部可测试接口清单

- GET  /api/user/list                  获取用户列表

- GET  /api/user/:id                   获取用户详情

### 本任务验收标准 \& 简单测试例子

- **测试例子1（环境配置）**：查看项目根目录\.env文件，端口、数据库地址配置正常，无硬编码

- **测试例子2（启动脚本）**：执行 `npm start`，服务可正常启动运行

- **验收结果**：目录结构分层清晰、环境配置规范、启动命令有效，项目完全工程化

- PUT  /api/user/:id                   更新用户

- DELETE /api/user/:id                 删除用户（防外键报错）

- GET  /api/post/list?page=1\&pageSize=10\&keyword=  分页模糊查文章

- GET  /api/post/:id                   文章详情

- POST /api/post/create                新增文章（带参数校验）

- PUT  /api/post/:id                   更新文章（带参数校验）

- DELETE /api/post/:id                 删除文章

---

## Day2 整体验收标准（单文件版本）

1. 全程基于Day1单文件迭代，无提前拆分目录，开发流程贴合你的项目现状

2. 用户、文章模块完整CRUD闭环，功能全覆盖无缺失

3. 彻底修复Day1所有坑：外键崩溃、500裸奔报错、非法参数入库报错

4. 全站接口响应格式统一，错误提示友好脱敏

5. Zod参数校验全覆盖核心写接口，参数错误前置拦截

6. 文章分页、模糊搜索、关联作者信息等进阶功能正常可用

7. 所有功能测通后，可无缝模块化重构为标准工程化项目

> （注：部分内容可能由 AI 生成）
