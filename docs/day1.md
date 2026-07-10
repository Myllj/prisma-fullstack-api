# Prisma全栈API Day1完整任务（项目初始化、Schema配置与迁移建表）

# Day1 完整全套任务（2\.5 小时，纯落地，视频不强制看，卡住再查）

前置：本地提前装好 MySQL，打开**Navicat** 手动新建空数据库 `prisma_demo`

**数据库新建两种方式（任选其一即可，二选一）：**

### 方式一：Navicat 可视化新建（推荐新手）

1. 打开 Navicat，连接本地 MySQL 数据库

2. 右键左侧连接列表 → 点击【新建数据库】

3. 数据库名严格填写：`prisma_demo`（和后续\.env配置一致，不能错字）

4. 字符集选择：`utf8mb4`（兼容所有文字、表情，避免乱码）

5. 排序规则选择：`utf8mb4_general_ci`

6. 点击确定，空数据库创建完成，无需手动建表（Prisma 自动建表）

### 方式二：CMD/终端命令行新建（无需任何可视化工具）

1. 打开电脑CMD终端，输入命令登录本地MySQL，输入自己的MySQL密码回车登录：`mysql -u root -p`

2. 登录成功后，执行建库命令，严格复制粘贴：`CREATE DATABASE prisma_demo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`

3. 执行完毕后，输入下方命令校验是否创建成功，能查到对应库即完成：`SHOW DATABASES;`

4. 输入 `exit;` 退出MySQL命令行即可。



## 第一阶段：40min 项目初始化 \+ Schema 配置 \+ 迁移建表

### 1\. 创建项目并初始化终端命令

1. 新建文件夹 `prisma-fullstack-api`，终端进入文件夹

```bash
cd 桌面/prisma-fullstack-api
npm init -y
# 安装TS、Prisma开发依赖（使用tsx代替ts-node）
npm install prisma typescript tsx @types/node dotenv --save-dev
# 安装运行时依赖（Prisma Client 和 MySQL 驱动适配器）
npm install @prisma/client @prisma/adapter-mariadb
# 初始化prisma，自动生成prisma文件夹、schema、.env、prisma.config.ts
npx prisma init
```

### 2\. 配置 package.json（添加 ESM 支持）

打开 `package.json`，添加 `"type": "module"`：

```json
{
  "name": "prisma-fullstack-api",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {}
}
```

### 3\. 替换带注释 schema

打开 `prisma/schema.prisma`，清空原有内容，粘贴：

```prisma
// 数据源：连接本地MySQL（Prisma 7.x 不再支持 url 属性，移至 prisma.config.ts）
datasource db {
  provider = "mysql"
}

// 自动生成TS类型客户端（Prisma 7.x 必须指定 output 路径）
generator client {
  provider = "prisma-client"
  output   = "./generated/prisma"
}

// 用户角色枚举，仅允许USER/ADMIN两种值
enum Role {
  USER    // 普通用户
  ADMIN   // 管理员
}

// 用户表
model User {
  id        Int       @id @default(autoincrement()) // 主键自增ID
  name      String                                  // 用户名，非空
  email     String    @unique                       // 邮箱唯一，不可重复注册
  password  String                                  // 加密密码
  role      Role      @default(USER)                // 角色默认普通用户
  posts     Post[]                                  // 一对多：关联多篇文章
  createdAt DateTime  @default(now())               // 创建时间，默认当前时间
}

// 文章表
model Post {
  id        Int       @id @default(autoincrement())
  title     String                                  // 文章标题
  content   String?                                 // 文章内容，?代表允许为空
  userId    Int                                     // 外键，绑定用户ID
  // 关联用户表，删除用户时同步删除其所有文章（Prisma 7.x @relation 必须单行）
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())
}
```

### 4\. 配置 prisma.config.ts（Prisma 7.x 新增）

打开 `prisma.config.ts`，确保配置正确：

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

### 5\. 配置数据库连接 \.env

根目录打开 `.env`，修改连接地址，替换自己账号密码

```env
DATABASE_URL="mysql://root:你的数据库密码@127.0.0.1:3306/prisma_demo"
```

### 6\. 配置 tsconfig.json

新建或修改 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "types": ["node"],
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true
  },
  "include": ["src/**/*", "prisma/generated/**/*"],
  "exclude": ["node_modules"]
}
```

### 7\. 执行迁移、生成客户端

```bash
# 生成迁移文件，自动在MySQL创建User、Post两张表
npx prisma migrate dev --name init_user_post
# 生成PrismaClient TS类型，代码拥有语法提示
npx prisma generate
```

### 8\. 可视化校验表结构

```bash
npx prisma studio
```

自动打开浏览器 5555 端口，能看到两张表、所有字段即完成本阶段验收。

## 第二阶段：70min 封装 Prisma 单例 \+ 全套 CRUD、关联查询

### 1\. 创建通用数据库实例封装 src/prisma\.ts

新建 src 文件夹，新建文件，直接复制：

```typescript
import 'dotenv/config'
import { PrismaClient } from '../prisma/generated/prisma/client.js'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// Prisma 7.x 必须使用驱动适配器连接数据库
const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)

// 全局单例，全局复用一个数据库连接
const prisma = new PrismaClient({ adapter })

export default prisma
```

### 2\. 创建 CRUD 测试文件 src/db\-test\.ts

```typescript
import prisma from './prisma.js'

async function runAllCrud() {
  // 清理之前的测试数据（避免重复运行时报错）
  await prisma.post.deleteMany({})
  await prisma.user.deleteMany({})

  // 1. 创建用户
  const user = await prisma.user.create({
    data: {
      name: "测试用户",
      email: "test@123.com",
      password: "123456encrypt"
    }
  })
  console.log("新建用户", user)

  // 2. 创建关联文章
  const post = await prisma.post.create({
    data: {
      title: "第一篇全栈笔记",
      content: "Prisma基础使用",
      userId: user.id
    }
  })
  console.log("新建文章", post)

  // 3. include：查询用户，带出全部关联文章完整字段
  const userWithPosts = await prisma.user.findUnique({
    where: { id: user.id },
    include: { posts: true }
  })
  console.log("include联查用户+文章", userWithPosts)

  // 4. select：只查询指定字段，精简返回数据
  const postSimpleList = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      user: { select: { name: true, email: true } }
    }
  })
  console.log("select精简查询", postSimpleList)

  // 5. 条件模糊筛选
  const filterPosts = await prisma.post.findMany({
    where: { title: { contains: "全栈" } }
  })
  console.log("条件筛选结果", filterPosts)

  // 6. 更新文章标题
  const updatedPost = await prisma.post.update({
    where: { id: post.id },
    data: { title: "修改后的文章标题" }
  })
  console.log("更新文章", updatedPost)

  // 7. 删除文章
  await prisma.post.delete({ where: { id: post.id } })
  console.log("文章删除完成")
}

// 执行函数，结束断开数据库连接
runAllCrud()
  .catch(err => console.error("数据库操作报错", err))
  .finally(async () => await prisma.$disconnect())
```

### 3\. 配置运行脚本 package\.json

scripts 内添加：

```json
"scripts": {
  "db:test": "tsx src/db-test.ts"
}
```

### 4\. 运行测试代码

```bash
npm run db:test
```

验收：控制台完整打印全部增删改查日志，无报错。

## 第三阶段：40min Express 接口开发 \+ Postman 调试

### 1\. 安装后端依赖

```bash
npm install express cors
npm install @types/express @types/cors --save-dev
```

### 2\. 新建服务入口 src/server\.ts

```typescript
import express from 'express'
import cors from 'cors'
import prisma from './prisma.js'

const app = express()
const PORT = 3000

// 全局中间件
app.use(cors())
app.use(express.json())

// 用户接口
// 获取全部用户
app.get('/api/user/list', async (req, res) => {
  const list = await prisma.user.findMany({ include: { posts: true } })
  res.json({ code: 200, msg: "查询成功", data: list })
})
// 新增用户
app.post('/api/user/create', async (req, res) => {
  const { name, email, password } = req.body
  const user = await prisma.user.create({ data: { name, email, password } })
  res.json({ code: 200, msg: "用户创建成功", data: user })
})

// 文章接口
// 获取全部文章（带出作者名称）
app.get('/api/post/list', async (req, res) => {
  const list = await prisma.post.findMany({
    include: { user: { select: { name: true } } }
  })
  res.json({ code: 200, msg: "查询成功", data: list })
})
// 新增文章（注意：必须先创建用户，使用用户的 id 作为 userId）
app.post('/api/post/create', async (req, res) => {
  const { title, content, userId } = req.body
  const post = await prisma.post.create({ data: { title, content, userId } })
  res.json({ code: 200, msg: "文章创建成功", data: post })
})

// 启动服务
app.listen(PORT, () => {
  console.log("服务运行在 http://localhost:3000")
})
```

### 3\. 补充启动脚本 package\.json

```json
"scripts": {
  "db:test": "tsx src/db-test.ts",
  "dev": "tsx src/server.ts"
}
```

### 4\. 启动后端服务

```bash
npm run dev
```

### 5\. Postman 全套测试流程

1. 新建集合，添加变量 `baseUrl = http://localhost:3000`

2. GET `{{baseUrl}}/api/user/list` 查看用户列表

3. POST `{{baseUrl}}/api/user/create`，body 选 raw\-json 传参

```json
{
  "name":"张三",
  "email":"zhangsan@123.com",
  "password":"666666"
}
```

4. GET `{{baseUrl}}/api/post/list` 查看文章列表

5. POST `{{baseUrl}}/api/post/create`（注意：userId 必须是已存在用户的 id）

```json
{
  "title":"全栈学习记录",
  "content":"Prisma+Express实操",
  "userId":1
}
```

## 常见问题与注意事项

### 1\. 为什么导入要用 .js 扩展名？

项目使用 ESM 模式（`"type": "module"`），Node.js 要求所有导入必须使用 `.js` 扩展名。tsx 在运行时会自动查找同名的 `.ts` 文件并编译。

### 2\. 为什么数据库 ID 不从 1 开始？

MySQL 的自增主键默认从 1 开始，但删除数据后自增计数器不会重置。这是正常行为，不影响功能。

### 3\. 为什么创建文章时报外键约束错误？

创建文章时传入的 `userId` 必须是数据库中已存在用户的 id。需要先创建用户，再创建文章。

### Day1 整体验收标准

1. MySQL 成功生成两张数据表，prisma studio 可正常查看数据

2. CRUD 测试脚本完整执行无报错，掌握 include/select 联查写法

3. 后端服务 3000 端口正常启动

4. Postman 全部接口请求返回标准 \{code,msg,data\}，新增数据同步存入数据库

5. 10 分钟费曼输出：一句话说明 Prisma Client、migrate、schema 各自作用

> （注：部分内容可能由 AI 生成）
