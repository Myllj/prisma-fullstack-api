# Prisma 全栈 API

**项目版本**：v3.1.0

**最后更新**：2026-07-20

**维护人员**：Myllj

**远程仓库**：`git@github.com:Myllj/prisma-fullstack-api.git`

---

## 一、项目简介

本项目是一套基于 **Express + Prisma 7.x + MySQL + JWT** 的后端 RESTful API 模板仓库，涵盖用户管理、文章管理两大业务模块的完整开发链路，适用于个人学习、团队快速搭建 Node.js 后端项目、企业级接口开发模板。

核心能力：
- 用户注册/登录/JWT 令牌签发与鉴权
- GitHub OAuth / 微信 OAuth 第三方登录
- bcrypt 密码加密存储（盐轮数 10），敏感信息脱敏
- 管理员重置用户密码（ADMIN 角色权限控制）
- 文章增删改查、分页搜索、权限隔离（仅作者可改删）
- Zod 参数校验全覆盖、统一响应格式、全局错误脱敏
- 工程化目录分层，开箱即用

---

## 二、技术栈

### 后端技术栈

- 运行时：Node.js 18+（ESM 模块）
- 框架：Express 5.x
- 语言：TypeScript
- ORM：Prisma 7.x（MariaDB 驱动适配器）
- 鉴权：JWT（jsonwebtoken）
- 密码加密：bcryptjs
- 参数校验：Zod 4.x
- 运行工具：tsx（开发/生产双模式）
- 环境变量：dotenv

### 前端技术栈

- 框架：Vue 3 + TypeScript
- 构建：Vite 6
- UI 组件：Element Plus
- 路由：Vue Router 4
- HTTP：Axios

### 数据库与中间件

- 数据库：MySQL 8.0+
- 跨域：cors
- 部署：PM2 / Docker（可选）

---

## 三、环境依赖

本地开发必须提前安装以下环境：

- Node.js >= 18.0.0
- MySQL 8.0+
- Git

---

## 四、项目目录结构

```
prisma-fullstack-api
├── prisma/                              # Prisma 数据库相关
│   ├── schema.prisma                    # 数据模型定义（User / Post）
│   └── migrations/                      # 数据库迁移历史
├── src/
│   ├── server.ts                        # Express 入口（路由挂载 + 中间件）
│   ├── prisma.ts                        # Prisma Client 单例封装
│   ├── modules/                         # 核心模块（推荐组织方式）
│   │   └── auth/                        # 认证授权模块
│   │       ├── auth.controller.ts       # 登录/注册/OAuth/重置密码
│   │       ├── auth.service.ts          # JWT 令牌签发
│   │       ├── auth.middleware.ts        # JWT 鉴权 + 管理员权限校验
│   │       ├── auth.schema.ts           # login/register/resetPassword 校验
│   │       └── auth.route.ts            # Auth 路由注册
│   ├── controller/                      # 业务控制器
│   │   ├── user.controller.ts           # 用户业务逻辑
│   │   └── post.controller.ts           # 文章业务逻辑（分页/权限校验）
│   ├── route/                           # 路由注册
│   │   ├── user.route.ts                # 用户路由
│   │   └── post.route.ts                # 文章路由（统一鉴权）
│   ├── schema/                          # Zod 参数校验
│   │   ├── user.schema.ts               # 用户校验规则
│   │   └── post.schema.ts               # 文章校验规则
│   ├── middleware/                       # 全局中间件
│   │   ├── validate.ts                  # Zod 通用校验工具
│   │   └── error.ts                     # 404 拦截 + 全局错误捕获
│   └── utils/                           # 通用工具
│       ├── response.ts                  # success() / error() 统一响应
│       ├── password.ts                  # bcrypt 密码加密/校验工具
│       └── http.ts                      # HTTP 代理请求（OAuth 回调用）
├── front-end-test/                      # Vue 3 前端页面（见该目录下 README）
│   ├── src/views/                       # 7 个页面组件
│   ├── src/api/                         # Axios 封装
│   └── src/router/                      # 路由配置 + 守卫
├── docs/                                # 项目文档
│   ├── api-swagger.json                 # Swagger 2.0 接口文档（可导入 Apifox/Postman）
│   ├── day1.md / day2.md / ...          # 学习阶段笔记
│   └── 802-独立开发Git代码管理指南.md      # Git 工作流参考
├── test_data/                           # 测试种子数据
│   ├── seed.ts                          # 生成 11 用户（含管理员）+ 50 篇文章
│   └── README.md                        # 测试数据操作指南
├── .env.example                         # 环境变量模板（可提交 Git）
├── .gitignore                           # Git 忽略规则
├── prisma.config.ts                     # Prisma 7.x 配置文件
├── tsconfig.json                        # TypeScript 配置
├── package.json                         # 项目依赖与脚本
├── 踩坑总结.md                           # [辅助] 踩坑经验记录（非项目文件，可删除）
└── README.md                            # 本文件
```

---

## 五、本地开发启动步骤

### 1. 拉取代码

```bash
git clone git@github.com:Myllj/prisma-fullstack-api.git
cd prisma-fullstack-api
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env
```

编辑 `.env`，填入本地数据库连接信息：

```env
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=你的数据库密码
DATABASE_NAME=prisma_demo
DATABASE_CHARSET=utf8mb4
DATABASE_URL="mysql://root:你的数据库密码@127.0.0.1:3306/prisma_demo"
```

### 4. 创建数据库

```bash
mysql -u root -p
CREATE DATABASE prisma_demo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
exit;
```

### 5. 数据库迁移

```bash
npx prisma migrate dev --name init_user_post
npx prisma generate
```

### 6. 启动服务

```bash
# 开发模式（推荐）
npm run dev

# 或生产模式
npm start
```

服务启动后控制台输出：`服务运行在 http://localhost:3000`

---

## 六、环境变量配置说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `PORT` | 服务端口 | `3000` |
| `JWT_SECRET` | JWT 签名密钥（线上务必修改） | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token 过期时间 | `7d`（7天） |
| `DATABASE_HOST` | 数据库地址 | `127.0.0.1` |
| `DATABASE_PORT` | 数据库端口 | `3306` |
| `DATABASE_USER` | 数据库账号 | `root` |
| `DATABASE_PASSWORD` | 数据库密码 | `your_password` |
| `DATABASE_NAME` | 数据库名称 | `prisma_demo` |
| `DATABASE_CHARSET` | 字符集 | `utf8mb4` |
| `DATABASE_URL` | Prisma 连接串（migrate 使用） | `mysql://root:密码@127.0.0.1:3306/prisma_demo` |

### OAuth 第三方登录配置（可选）

| 变量名 | 说明 | 必填 |
|--------|------|:---:|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | 使用 GitHub 登录时必填 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | 使用 GitHub 登录时必填 |
| `WECHAT_APPID` | 微信测试号 AppID | 使用微信登录时必填 |
| `WECHAT_APPSECRET` | 微信测试号 AppSecret | 使用微信登录时必填 |
| `FRONTEND_URL` | 前端地址（OAuth 回调跳转） | 默认 `http://localhost:5173` |
| `OAUTH_REDIRECT_BASE` | OAuth 回调基础地址 | 默认 `http://127.0.0.1:3000` |
| `HTTPS_PROXY` | HTTPS 代理地址（配置了才走代理） | 如 `http://127.0.0.1:7890` |

> 如果不需要 OAuth 功能，可以忽略这些变量，不配置不影响基础功能。

---

## 七、数据库说明

- **数据库名称**：`prisma_demo`
- **字符集**：`utf8mb4`（兼容中文、表情，避免乱码）

### 数据模型

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `User` | 用户表 | id, name, email（唯一）, password（bcrypt 加密）, role（USER/ADMIN）, wechatOpenId, wechatNickname, avatarUrl, createdAt |
| `Post` | 文章表 | id, title, content, userId（外键 → User，级联删除）, createdAt |

### 种子数据

项目提供测试数据生成脚本（`test_data/seed.ts`），生成：

- **1 个管理员**：`admin@test.com` / `admin123`（role: ADMIN，用于重置密码等管理操作）
- **10 个普通用户**：张三、李四… 拼音邮箱 + 随机 8 位密码
- **50 篇文章**：随机分配给 10 个普通用户，涵盖 Node.js、Express、Docker 等热门技术

> 所有密码使用 bcrypt 加密存储，终端输出的明文密码仅用于开发调试，数据库不存明文。

### 修改模型与增量迁移（重要）

后续需求变动需要改表结构（如给 User 表新增 `avatar`、Post 表新增 `status`），操作流程如下：

#### 开发环境（本地）

**1. 修改 schema.prisma**

例如给 User 表新增头像字段：

```prisma
model User {
  id        Int       @id @default(autoincrement())
  name      String
  email     String    @unique
  avatar    String?                             // ← 新增字段，? 表示允许为空
  password  String
  role      Role      @default(USER)
  posts     Post[]
  createdAt DateTime  @default(now())
}
```

> `String?` 表示可选字段，允许为空，避免已有数据报错。如果必须非空，需要加 `@default("")` 给默认值。

**2. 生成迁移文件并同步到数据库**

```bash
npx prisma migrate dev --name add_user_avatar
```

这里 Prisma 会：
- 自动对比 `schema.prisma` 与当前数据库结构差异
- 生成 `prisma/migrations/2026xxxxxxxx_add_user_avatar/migration.sql`
- 立即执行 SQL，更新本地数据库表结构
- 重新生成 Prisma Client 类型

**3. 修改业务代码**

在 controller 中处理新增字段（如 Zod 校验、返回值）。

#### 生产环境（线上）

**方案一：Prisma 自动迁移（推荐，适合中小项目）**

```bash
# 服务器上拉取最新代码
git pull

# 执行待执行的迁移（不重置数据）
npx prisma migrate deploy

# 重新生成类型
npx prisma generate

# 重启服务
pm2 restart prisma-api
```

> `migrate deploy` 只执行未应用的迁移文件，不删除数据。

**方案二：手动 SQL（适合严格管控的团队）**

```bash
# 先在测试库验证 SQL
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma

# 手动在线上数据库执行 ALTER TABLE
ALTER TABLE User ADD COLUMN avatar VARCHAR(255);

# 标记迁移已完成
npx prisma migrate resolve --applied <migration_name>
```

#### 常用迁移命令速查

| 命令 | 场景 | 说明 |
|------|------|------|
| `npx prisma migrate dev --name xxx` | 本地开发 | 自动生成迁移 → 应用到本地库 |
| `npx prisma migrate deploy` | 生产上线 | 只执行未应用的迁移，不删数据 |
| `npx prisma migrate status` | 任意环境 | 查看迁移状态 |
| `npx prisma migrate reset` | 本地开发 | 重置数据库（删除所有数据后重建） |
| `npx prisma generate` | 任意环境 | 重新生成 Prisma Client TS 类型 |
| `npx prisma db push` | 快速原型 | 跳过迁移文件直接同步 Schema 到库（开发推荐） |

> **核心区别**：`migrate dev` 生成迁移文件 + 应用；`migrate deploy` 只应用已存在的迁移文件；`db push` 不生成迁移文件直接推送。

### 重置数据库

```bash
npx prisma migrate reset
```

---

## 八、接口文档

### 统一响应格式

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {}
}
```

### 鉴权说明

文章全部接口需要登录，请求头携带：

```
Authorization: Bearer <token>
```

token 通过 `/api/auth/login` 接口获取。

### Apifox 在线接口文档

项目已配置 Apifox 在线接口管理，支持在线调试、文档预览、Mock 服务：

- **接口地址**：[https://app.apifox.com/project/8582531](https://app.apifox.com/project/8582531)
- **接口总数**：12 个（Auth / User / Post 三个模块）

### Apifox 从 0-1 使用指南

#### 步骤 1：登录并进入项目

1. 访问 [https://app.apifox.com/project/8582531](https://app.apifox.com/project/8582531)
2. 使用账号登录（支持微信/邮箱登录）

#### 步骤 2：配置环境

1. 点击右上角 **环境管理**
2. 选择 **开发环境**
3. 配置前置 URL：`http://localhost:3000/api`
4. 添加环境变量 `token`，初始值留空

#### 步骤 3：获取 Token

1. 打开 **POST /api/auth/login** 接口
2. 在 Body 中填入测试账号：
   ```json
   { "email": "test@example.com", "password": "123456" }
   ```
3. 点击 **发送**，响应中获取 `token`

#### 步骤 4：自动携带 Token（推荐配置）

1. 在登录接口的 **后置操作** 标签页，添加"提取变量"：
   - 变量名：`token`
   - 提取方式：JSONPath
   - 表达式：`$.data.token`
2. 在环境管理的 **全局参数** 中添加请求头：
   - 参数名：`Authorization`
   - 值：`Bearer {{token}}`
3. 配置完成后，调用登录接口会自动保存 Token，所有接口自动带上鉴权

#### 步骤 5：调试接口

1. 选择需要测试的接口（如 GET /api/post/list）
2. 点击 **发送**，自动带上 Token
3. 查看响应结果

### Apifox vs Swagger 对比

| 维度 | Apifox | Swagger |
|------|--------|---------|
| **代码侵入性** | 零侵入，外部平台管理 | 需在代码中添加 JSDoc 注解 |
| **功能完整度** | 文档 + 调试 + Mock + 测试 + 代码生成 | 仅文档展示 |
| **团队协作** | 多人实时协同，支持角色权限 | 无协作功能 |
| **自动同步** | 支持定时导入 Swagger/OpenAPI | 代码变更需重启服务 |
| **免费额度** | 个人免费，不限接口数/项目数 | 完全免费 |
| **学习成本** | 低，可视化操作 | 中等，需学习注解语法 |
| **适用场景** | 个人开发、团队协作、前后端对接 | 快速生成文档，无需额外工具 |

### 使用注意事项

1. **Token 自动更新**：登录接口配置"提取变量"后，每次调用登录接口会自动更新环境变量中的 token，无需手动复制
2. **环境变量作用域**：提取变量更新的是"本地值"，这是正确的（每个人的 Token 不同），远程值用于团队共用配置
3. **全局参数与接口级别冲突**：全局参数会自动应用到所有接口，如果某个接口不需要鉴权（如登录接口），全局参数会带上 token，但后端不会验证，不影响使用
4. **接口文档更新**：当代码中新增/修改接口时，需要重新导入 Swagger JSON 或手动更新 Apifox 中的接口定义
5. **Mock 服务**：Apifox 提供云端 Mock 和本地 Mock，前端可在后端未完成时提前开发
6. **代码生成**：支持生成前端请求代码（axios/fetch）和后端接口代码，可直接复制使用

### Swagger JSON 文件

项目已生成 Swagger 2.0 格式的接口文档：

- **文件位置**：`docs/api-swagger.json`
- **用途**：可导入 Apifox、Postman 等工具，或用于自动化测试

导入到 Apifox 的步骤：
1. 打开 Apifox → 新建项目
2. 点击 **导入** → 选择 **Swagger 2.0**
3. 选择 `docs/api-swagger.json` 文件
4. 点击 **确定**，12 个接口自动录入

---

### 用户接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|:---:|------|
| GET | `/api/user/list` | ❌ | 查询全部用户（含文章） |
| GET | `/api/user/profile` | ✅ | 查询当前登录用户信息 |
| GET | `/api/user/:id` | ❌ | 查询单个用户详情 |
| POST | `/api/user/create` | ❌ | 新增用户（注册） |
| PUT | `/api/user/:id` | ❌ | 更新用户 |
| DELETE | `/api/user/:id` | ❌ | 删除用户（存在文章时拦截） |

### Auth 认证接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|:---:|------|
| POST | `/api/auth/login` | ❌ | 邮箱 + 密码登录，返回 token + 用户信息 |
| POST | `/api/auth/register` | ❌ | 邮箱 + 密码注册（密码 bcrypt 加密入库） |
| POST | `/api/auth/admin/reset-password` | ✅ + ADMIN | 管理员重置任意用户密码 |
| GET | `/api/auth/oauth/github` | ❌ | 跳转 GitHub 授权页 |
| GET | `/api/auth/oauth/github/callback` | ❌ | GitHub OAuth 回调（自动登录/注册） |
| GET | `/api/auth/oauth/wechat` | ❌ | 跳转微信授权页 |
| GET | `/api/auth/oauth/wechat/callback` | ❌ | 微信 OAuth 回调（自动登录/注册） |

### 文章接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|:---:|------|
| GET | `/api/post/list` | ✅ | 分页查询，支持关键词模糊搜索 |
| GET | `/api/post/:id` | ✅ | 文章详情（含作者信息） |
| POST | `/api/post/create` | ✅ | 新增文章（userId 自动绑定当前用户） |
| PUT | `/api/post/:id` | ✅ | 更新文章（仅作者本人） |
| DELETE | `/api/post/:id` | ✅ | 删除文章（仅作者本人） |

### 接口请求示例

**登录：**

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{ "email": "admin@test.com", "password": "admin123" }
# 返回: { code: 200, msg: "登录成功", data: { user: {...}, token: "eyJ..." } }
```

**管理员重置用户密码：**

```bash
POST http://localhost:3000/api/auth/admin/reset-password
Content-Type: application/json
Authorization: Bearer <管理员token>

{ "email": "user@test.com", "newPassword": "newpassword123" }
# 返回: { code: 200, msg: "密码重置成功", data: { email: "...", name: "..." } }
```

**新增文章（带 token）：**

```bash
POST http://localhost:3000/api/post/create
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{ "title": "学习笔记", "content": "Prisma 入门" }
# 无需传 userId，自动从 token 读取当前登录用户
```

**分页搜索文章：**

```bash
GET http://localhost:3000/api/post/list?page=1&pageSize=10&keyword=学习
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `keyword` | string | 否 | 空 | 标题模糊关键词 |
| `page` | number | 否 | 1 | 页码 |
| `pageSize` | number | 否 | 10 | 每页条数（1~100） |

---

## 九、参数校验说明

以下写入接口自带 Zod 前置校验：

| 接口 | 校验内容 |
|------|---------|
| `POST /api/auth/login` | email（邮箱格式）、password（不能为空） |
| `POST /api/auth/register` | name（1-50字符）、email（标准 ASCII 邮箱格式）、password（6-50字符） |
| `POST /api/auth/admin/reset-password` | email（邮箱格式）、newPassword（6-50字符） |
| `POST /api/user/create` | name(1-50字符)、email(邮箱格式)、password(6-50字符) |
| `PUT /api/user/:id` | name/email/password 选填，传了按同样规则校验 |
| `POST /api/post/create` | title(1-200字符)、content 必填 |
| `PUT /api/post/:id` | title/content 选填 |

校验失败统一返回 `400` + 中文提示，不进入数据库。

> 邮箱正则仅支持标准 ASCII 字符（符合 RFC 5322），不支持中文邮箱。

### 错误码速查

| code | 场景 |
|:---:|------|
| 200 | 操作成功 |
| 400 | 参数校验失败 / 业务拦截（如密码错误、账号不存在） |
| 401 | 未登录 / token 无效或过期 |
| 403 | 无权限（非管理员 / 非文章作者） |
| 404 | 资源不存在 / 接口不存在 |
| 409 | 邮箱已注册（唯一约束冲突） |
| 500 | 服务器内部错误（已脱敏） |

---

## 十、可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（tsx） |
| `npm start` | 生产模式启动 |
| `npm run stop` | 停止 3000 端口服务 |
| `npx prisma studio` | 可视化查看数据库 |
| `npx prisma migrate dev` | 执行数据库迁移 |
| `npx prisma generate` | 重新生成 Prisma Client |
| `npx prisma migrate reset` | 重置数据库 |

---

## 十一、打包与线上部署

### PM2 部署（推荐）

```bash
npm install -g pm2
npm start -- --port=80
pm2 start src/server.ts --name=prisma-api
pm2 save
pm2 startup
```

### Docker 部署（可选）

自行编写 `Dockerfile`，核心步骤：

1. 构建 Node.js 环境镜像
2. 复制源码 + 安装依赖
3. 执行 `prisma generate`
4. `CMD ["npm", "start"]`

---

## 十二、仓库复用规则

本仓库可作为**私有模板仓库**，新项目克隆后只需以下步骤即可快速启动：

1. `git clone git@github.com:Myllj/prisma-fullstack-api.git new-project`
2. 修改 `prisma/schema.prisma` → 定义自己的数据模型
3. 修改 `.env` → 配置自己的数据库连接和 JWT 密钥
4. `npx prisma migrate dev --name init` → 建表
5. 在 `src/controller/` 下新增业务模块
6. 在 `src/route/` 下注册路由
7. 在 `src/server.ts` 挂载新路由
8. `npm run dev` → 启动开发

---

## 十三、开发规范

### Git 分支规范

- **main**：线上稳定分支，禁止直接提交
- **dev**：开发测试分支
- **feature/xxx**：新功能分支
- **hotfix/xxx**：线上紧急修复分支

### Commit 提交规范

- `feat`：新增功能
- `fix`：修复 bug
- `refactor`：代码重构
- `docs`：文档修改

---

## 十四、常见问题 FAQ

**Q：端口被占用？**

A：关闭占用端口的程序，或修改 `.env` 中 `PORT` 变量。

**Q：数据库连接失败？**

A：检查 `.env` 数据库地址、账号密码是否正确，数据库 `prisma_demo` 是否已创建。

**Q：创建文章时报外键约束错误？**

A：创建文章前必须先创建用户。Day3 起新增文章不需要传 `userId`，会自动从 token 读取当前登录用户。

**Q：Prisma migrate 报语法错误？**

A：Prisma 7.x 与 6.x 语法不兼容，确保 `schema.prisma` 使用 `provider = "prisma-client"`，`@relation` 为单行格式。详见 `踩坑总结.md`。

**Q：导入报错 Cannot find module？**

A：项目使用 ESM 模式，所有本地导入必须使用 `.js` 扩展名（tsx 运行时自动查找同名 `.ts` 文件）。

**Q：Navicat 中中文显示乱码？**

A：连接属性中设置编码为 `utf8mb4`，执行 `SET NAMES utf8mb4`。

**Q：依赖安装报错？**

A：清理 node_modules 和 lock 文件后重新安装：

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 十五、版本更新日志

**v3.1.0（2026-07-20）**

- 密码安全升级：bcryptjs 加盐哈希存储（盐轮数 10），不可逆加密
- 邮箱规范化：仅支持标准 ASCII 邮箱（RFC 5322），去除中文支持
- 新增 Auth 认证模块（`POST /api/auth/login`、`POST /api/auth/register`）
- 新增管理员重置密码接口（`POST /api/auth/admin/reset-password`，需 ADMIN 角色）
- 新增角色权限中间件 `requireAdmin`，区分 USER / ADMIN 权限
- 集成 GitHub OAuth 第三方登录，支持代理访问
- 集成微信 OAuth 登录（需微信测试号）
- 新增 Vue 3 + Element Plus 前端页面（`front-end-test/`），含 7 个页面
- 新增 Swagger 2.0 API 文档（`docs/api-swagger.json`），可导入 Apifox
- 种子数据新增管理员账号 `admin@test.com / admin123`
- 更新环境变量模板，新增 OAuth 配置项

**v3.0.0（2026-07-10）**

- 实现 JWT 登录鉴权，token 签发与过期校验
- 封装通用鉴权中间件，文章全接口强制登录
- 文章权限隔离：仅作者可修改/删除自己的文章
- 新增文章自动绑定当前登录用户（userId 从 token 读取）
- 工程化目录重构（controller / route / schema / middleware 分层）
- 密钥抽离 `.env`，消除硬编码安全漏洞
- 配置 `.gitignore` + `.env.example`，规范 Git 提交

**v2.0.0（2026-07-08）**

- 用户/文章完整 CRUD 闭环
- 文章分页 + 标题模糊搜索，查询自动带出作者信息
- 全局统一响应格式 + 404 拦截 + 全局错误脱敏
- Zod 参数校验全覆盖 4 个写入接口
- 环境变量抽离，目录模块化拆分

**v1.0.0（2026-06-27）**

- 项目初始化，Prisma 7.x + Express + TypeScript
- User/Post 模型定义与数据库迁移
- 基础 CRUD API 接口

---

> （注：部分内容可能由 AI 生成）
