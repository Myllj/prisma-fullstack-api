# Prisma 全栈 API 学习项目

**项目版本**：v2.0.0

**最后更新**：2026-07-08

**项目类型**：Node.js 后端 API 服务（学习项目）

## 一、项目简介

本项目是一套基于 **Express + Prisma 7.x + MySQL** 的后端 API 服务，用于学习 Prisma ORM 的完整使用流程，包括 Schema 定义、数据库迁移、CRUD 操作、关联查询（include/select）、RESTful API 接口开发，以及工程化升级（全局错误处理、Zod 参数校验、环境配置、模块化目录）。

实现**用户管理**、**文章管理**两大模块的完整增删改查，支持分页、模糊搜索、关联查询等进阶功能。

## 二、技术栈

### 后端技术栈

- 运行时：Node.js（ESM 模块）
- 框架：Express 5.x
- 语言：TypeScript 6.x
- ORM：Prisma 7.x
- 参数校验：Zod 4.x
- 运行工具：tsx（开发/生产双模式）

### 数据库与中间件

- 数据库：MySQL 8.0+
- 数据库适配器：@prisma/adapter-mariadb
- 跨域：cors
- 环境变量：dotenv

## 三、环境依赖

本地开发必须提前安装以下环境：

- Node.js >= 18.0.0
- MySQL 8.0+
- Git

## 四、项目目录结构

```
prisma-fullstack-api
├── doc/                              # 项目文档
│   ├── day1.md                       # Day1 搭建指南
│   ├── day2.md                       # Day2 进阶任务清单
│   └── 项目 README.md 标准模板（企业交付版）.md
├── prisma/                           # Prisma 数据库相关
│   ├── generated/prisma/             # Prisma Client 自动生成代码
│   ├── migrations/                   # 数据库迁移历史
│   │   └── 20260627070528_init_user_post/
│   └── schema.prisma                 # 数据模型定义（你唯一需要关心的文件）
├── src/                              # 业务源码
│   ├── server.ts                     # Express 服务入口（路由 + 业务逻辑）
│   ├── prisma.ts                     # Prisma 单例封装（读取 .env 配置）
│   ├── db-test.ts                    # CRUD 测试脚本
│   ├── utils/
│   │   ├── response.ts              # success() / error() 统一响应工具
│   │   └── validation.ts            # Zod 校验规则 + validate() 工具函数
│   └── middleware/
│       └── error.ts                  # 404拦截 + 全局错误捕获中间件
├── .env                              # 环境变量（含敏感信息，不提交 Git）
├── .env.example                      # 环境变量模板（可安全提交 Git）
├── .gitignore                        # Git 忽略配置
├── prisma.config.ts                  # Prisma 7.x 配置文件
├── tsconfig.json                     # TypeScript 配置
├── package.json                      # 项目依赖与脚本
├── 踩坑总结.md                        # 踩坑经验记录
└── README.md                         # 项目说明文档
```

## 五、核心文件说明

### prisma/ 文件夹

| 文件 | 谁写的 | 作用 |
|------|--------|------|
| `schema.prisma` | **你** | 定义表结构、字段、关系 |
| `migration.sql` | Prisma 自动 | 具体的 SQL 建表语句 |
| `client.ts` | Prisma 自动 | 导出 `PrismaClient` 类 |
| `models.ts` | Prisma 自动 | 导出 `prisma.user`、`prisma.post` 操作方法 |
| `enums.ts` | Prisma 自动 | 导出 Role 枚举 |

> **日常你只需要管 `schema.prisma` 一个文件，其他全是自动生成的。**

### src/ 核心文件

| 文件 | 作用 |
|------|------|
| `server.ts` | 主入口文件，包含所有路由和业务逻辑 |
| `prisma.ts` | Prisma 客户端单例，连接 MySQL 数据库 |
| `utils/response.ts` | 统一响应格式 `success()` / `error()` |
| `utils/validation.ts` | Zod 校验规则 + 通用校验函数 |
| `middleware/error.ts` | 404 拦截 + 全局错误捕获中间件 |

## 六、本地开发启动步骤

### 1. 拉取代码

```bash
git clone 项目仓库地址
cd prisma-fullstack-api
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

编辑根目录 `.env` 文件，修改数据库连接信息：

```env
# ===== 服务配置 =====
PORT=3000

# ===== 数据库配置 =====
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=你的数据库密码
DATABASE_NAME=prisma_demo
DATABASE_CHARSET=utf8mb4
```

### 4. 创建数据库

在 MySQL 中手动创建空数据库（字符集 utf8mb4）：

```bash
mysql -u root -p
CREATE DATABASE prisma_demo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
exit;
```

### 5. 数据库迁移

```bash
# 执行迁移，自动创建数据表
npx prisma migrate dev --name init_user_post

# 生成 Prisma Client 类型（提供 TS 语法提示）
npx prisma generate
```

### 6. 启动开发服务

```bash
# 开发模式
npm run dev

# 或生产模式
npm start
```

服务启动后访问：http://localhost:3000

### 7. 运行 CRUD 测试（可选）

```bash
npm run db:test
```

## 七、环境变量配置说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `PORT` | 服务端口 | 3000 |
| `DATABASE_HOST` | 数据库地址 | 127.0.0.1 |
| `DATABASE_PORT` | 数据库端口 | 3306 |
| `DATABASE_USER` | 数据库账号 | root |
| `DATABASE_PASSWORD` | 数据库密码 | 123456 |
| `DATABASE_NAME` | 数据库名称 | prisma_demo |
| `DATABASE_CHARSET` | 数据库字符集 | utf8mb4 |

## 八、数据库说明

- **数据库名称**：`prisma_demo`
- **字符集**：`utf8mb4`（兼容中文、表情符号，避免乱码）
- **初始化方式**：执行 `npx prisma migrate dev` 自动建表
- **数据模型**：

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `User` | 用户表 | id, name, email（唯一）, password, role（USER/ADMIN）, createdAt |
| `Post` | 文章表 | id, title, content, userId（外键关联 User）, createdAt |

数据库重置命令：

```bash
npx prisma migrate reset
```

## 九、接口文档

所有接口统一响应格式：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {}
}
```

### 用户接口

| 方法 | 路径 | 说明 | 请求参数 |
|------|------|------|----------|
| GET | `/api/user/list` | 获取全部用户（含文章） | 无 |
| GET | `/api/user/:id` | 获取用户详情（含文章） | 路径参数：id |
| POST | `/api/user/create` | 新增用户 | `{ name, email, password }` |
| PUT | `/api/user/:id` | 更新用户（传什么改什么） | 路径参数：id；`{ name?, email?, password? }` |
| DELETE | `/api/user/:id` | 删除用户（防外键崩溃） | 路径参数：id |

### 文章接口

| 方法 | 路径 | 说明 | 请求参数 |
|------|------|------|----------|
| GET | `/api/post/list` | 分页+模糊搜索文章列表 | Query：`page`, `pageSize`, `keyword` |
| GET | `/api/post/:id` | 获取文章详情（含作者信息） | 路径参数：id |
| POST | `/api/post/create` | 新增文章 | `{ title, content, userId }` |
| PUT | `/api/post/:id` | 更新文章 | 路径参数：id；`{ title?, content? }` |
| DELETE | `/api/post/:id` | 删除文章 | 路径参数：id |

### 文章分页搜索说明

```
GET /api/post/list?page=1&pageSize=10&keyword=学习
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `keyword` | string | 否 | 空 | 标题模糊关键词 |
| `page` | number | 否 | 1 | 页码 |
| `pageSize` | number | 否 | 10 | 每页条数（1~100） |

### Zod 参数校验说明

以下写入接口自带参数前置校验：

| 接口 | 校验内容 |
|------|---------|
| `POST /api/user/create` | name 必填(1-50字符)、email 必填(邮箱格式)、password 必填(6-50字符) |
| `PUT /api/user/:id` | name/email/password 选填，传了则按相同规则校验 |
| `POST /api/post/create` | title 必填(1-200字符)、content 必填、userId 必须是正整数 |
| `PUT /api/post/:id` | title/content 选填，传了则校验 |

校验失败统一返回 `400` + 中文提示，不进入数据库逻辑。

### Postman 测试示例

**创建用户：**

```bash
POST http://localhost:3000/api/user/create
Content-Type: application/json

{
  "name": "张三",
  "email": "zhangsan@123.com",
  "password": "666666"
}
```

**创建文章**（注意：userId 必须使用已存在用户的 id）：

```bash
POST http://localhost:3000/api/post/create
Content-Type: application/json

{
  "title": "全栈学习记录",
  "content": "Prisma+Express 实操",
  "userId": 1
}
```

## 十、可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（tsx 热加载） |
| `npm start` | 生产模式启动（node + tsx 加载器） |
| `npm run db:test` | 运行 CRUD 测试脚本 |
| `npx prisma studio` | 打开 Prisma Studio 可视化查看数据 |
| `npx prisma migrate dev` | 执行数据库迁移（开发环境） |
| `npx prisma generate` | 重新生成 Prisma Client |

## 十一、开发规范

### Git 分支规范

- **main**：主分支
- **dev**：开发分支
- **feature/xxx**：新功能分支

### Commit 提交规范

- `feat`：新增功能
- `fix`：修复 bug
- `refactor`：代码重构
- `docs`：文档修改

## 十二、常见问题 FAQ

**Q：执行 `npx prisma migrate dev` 报错？**

A：Prisma 7.x 与 6.x 语法不兼容，请确保 schema.prisma 使用 `provider = "prisma-client"`（非 `prisma-client-js`），且 `@relation` 为单行格式。详见 `踩坑总结.md`。

**Q：导入报错 Cannot find module？**

A：项目使用 ESM 模式（`"type": "module"`），所有本地导入必须使用 `.js` 扩展名（如 `import prisma from './prisma.js'`），tsx 运行时会自动查找同名的 `.ts` 文件。

**Q：创建文章时提示外键约束错误？**

A：创建文章前必须先创建用户，确保 `userId` 是数据库中已存在用户的 id。

**Q：数据库 ID 不是从 1 开始？**

A：MySQL 自增主键默认从 1 开始，但删除数据后自增计数器不会重置（例如删除 ID=1 的用户，下一个用户 ID=2）。这是正常行为，不影响功能。

**Q：端口被占用？**

A：关闭占用 3000 端口的程序，或修改 `.env` 文件中的 `PORT` 变量。

**Q：数据库连接失败？**

A：检查 `.env` 中数据库配置（DATABASE_HOST/PORT/USER/PASSWORD/NAME）是否正确，数据库 `prisma_demo` 是否已创建。

**Q：依赖安装报错？**

A：尝试清理 node_modules 和 package-lock.json 后重新安装：

```bash
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

**Q：Navicat 中看到中文显示为 `?` 号乱码？**

A：连接属性中设置编码为 `utf8mb4`；sql_mode 中移除 `STRICT_TRANS_TABLES`；执行 `SET NAMES utf8mb4`。

## 十三、版本更新日志

**v2.0.0（2026-07-08）**

- 新增用户完整 CRUD（详情、更新、删除）
- 新增文章完整 CRUD（详情、更新、删除）
- 文章列表支持分页 + 标题模糊搜索
- 查询文章自动带出作者完整信息
- 封装全局统一响应工具函数（success/error）
- 新增 404 拦截 + 全局错误捕获中间件（Prisma 错误脱敏）
- 接入 Zod 参数校验，4 个写入接口全覆盖
- 抽离环境变量 `.env`，新增 `.env.example`
- 目录模块化拆分（utils/、middleware/）
- 补充 `npm start` 生产启动脚本

**v1.0.0（2026-06-29）**

- 项目初版完成，基于 Prisma 7.x + Express 5.x + TypeScript 6.x
- 实现 User、Post 模型定义与数据库迁移
- 完成 Prisma Client 单例封装（含 MariaDB 驱动适配器）
- 实现完整 CRUD 操作，支持 include/select 联查查询
- 实现 Express RESTful API 接口（用户/文章增删改查）
- 配置 ESM 模块支持，使用 tsx 作为开发运行工具

## 十四、备注说明

- 本项目为 Prisma + Express 学习项目，仅供学习参考
- 完整搭建流程详见 `doc/day1.md`
- Day2 进阶任务清单详见 `doc/day2.md`
- 踩坑经验汇总详见 `踩坑总结.md`

> （注：部分内容可能由 AI 生成）
