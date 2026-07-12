# Day4 后端工程化拆分 \+ 私有模板仓库 \+ 服务器完整部署全流程文档



## 前置说明

1. 前置条件：Day3 所有 JWT 鉴权、登录、权限功能全部调试通过，单文件`server.ts`可完整运行无报错

2. 开发顺序：先完成单文件代码分层拆分 → 配置 Git 规范文件 → 编写标准 README → 服务器部署全套实操

3. 格式统一：任务内部讲解使用「第一步：xxx；第二步：xxx；」，每个模块包含步骤、完整代码、Postman 测试案例、验收标准

4. 最终产出：可复用私有 Git 后端模板仓库，支持一键拉取、本地开发、线上部署

# 任务一：单文件 server\.ts 工程化分层拆分（核心任务 1）

## 任务步骤讲解

前期 Day1\-Day3 全部写在单个入口文件，代码臃肿不利于维护，本任务拆分出路由、控制器、工具、校验、中间件，步骤如下：
第一步：新建完整分层文件夹目录，不一次性移动文件，分模块迁移；
第二步：抽离统一响应函数、JWT 配置、校验工具到`src/utils`；
第三步：抽离 Zod 所有校验规则到`src/schema`；
第四步：抽离全局错误中间件、鉴权中间件到`src/middleware`；
第五步：抽离用户、文章业务逻辑到`src/controller`；
第六步：抽离路由配置到`src/route`；
第七步：精简`server.ts`只做服务初始化、中间件挂载、路由引入。

## 最终标准目录结构

```Plain Text
src
├── server.ts                项目唯一入口
├── prisma.ts                prisma客户端导出
├── utils
│   └── response.ts          统一success/error响应
├── schema
│   ├── user.schema.ts       用户校验规则
│   └── post.schema.ts       文章校验规则
├── middleware
│   ├── errorHandler.ts      全局404+错误捕获
│   ├── validate.ts          Zod通用校验中间件
│   └── auth.ts              JWT登录鉴权中间件
├── controller
│   ├── user.controller.ts  用户所有业务逻辑
│   └── post.controller.ts  文章所有业务逻辑
└── route
    ├── user.route.ts        用户路由
    └── post.route.ts        文章路由
prisma
└── schema.prisma
.env
.env.example
.gitignore
package.json
README.md
```

## 各文件拆分完整代码示例

### 1\. src/utils/response\.ts

```ts
export function success(data: any = null, msg = "操作成功") {
  return { code: 200, msg, data }
}
export function error(msg = "操作失败", code = 500) {
  return { code, msg, data: null }
}
```

### 2\. src/middleware/auth\.ts（JWT 鉴权）

```ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { error } from "../utils/response";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authMiddleware = (req: Request & {user?:any}, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.json(error("未登录，请先登录", 401));
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err)
    return res.json(error("token失效或非法，请重新登录", 401));
  }
}
```

### 3\. 精简后 src/server\.ts

```ts
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import userRoute from "./route/user.route";
import postRoute from "./route/post.route";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// 业务路由
app.use("/api/user", userRoute);
app.use("/api/post", postRoute);

// 全局兜底中间件（必须放路由后）
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`服务启动成功：http://localhost:${PORT}`);
})
```

## 测试 \& 验收标准 \+ 测试例子

测试例子：拆分完成后执行`npm run dev`，所有 Day1\-Day3 接口功能与拆分前完全一致，登录、增删改查、鉴权无异常。
验收结果：目录分层清晰，单一文件职责单一，新增业务模块可快速新建 controller\+route，无冗余代码。

# 任务二：配置 Git 仓库规范文件（核心任务 2）

## 任务步骤讲解

项目作为私有模板仓库，必须屏蔽敏感、冗余文件，步骤如下：
第一步：新建`.gitignore`，屏蔽 node\_modules、环境变量、日志、构建缓存；
第二步：完善`.env.example`，只保留变量名，不填写真实数据库、JWT 密钥；
第三步：确认`prisma/migrations`、源码全部纳入版本控制；
第四步：初始化 Git 本地仓库，初次提交全部分层代码。

## 完整 \.gitignore 内容

```Plain Text
# 依赖包
node_modules
# 环境变量（真实密码密钥不上传）
.env
# 日志
logs
*.log
# 系统文件
.DS_Store
# 运行缓存
dist
build
# IDE配置
.idea
.vscode
```

## \.env\.example 完整内容

```env
NODE_ENV=development
PORT=300
DATABASE_URL="postgresql://账号:密码@127.0.0.1:5432/数据库名"
JWT_SECRET=自定义安全密钥
JWT_EXPIRES=24h
```

## Git 提交操作命令

```bash
# 初始化仓库
git init
# 全部加入暂存
git add .
# 首次提交
git commit -m "feat: Day4 工程化分层完整后端模板"
# 关联私有远程仓库
git remote add origin 你的私有git仓库地址
git push -u origin main
```

## 测试 \& 验收标准 \+ 测试例子

测试例子：执行`git status`，不会出现 node\_modules、\.env 文件，仅展示业务源码、配置模板文件。
验收结果：敏感信息不会上传远程仓库，仓库干净整洁，他人拉取后仅需复制\.env\.example 配置即可运行。

# 任务三：编写项目标准完整版 \[README\.md\]\(README\.md\)（模板仓库必备）

## 任务步骤讲解

README 是模板仓库使用手册，包含环境、启动、接口、部署、仓库说明，步骤如下：
第一步：书写项目简介、技术栈；
第二步：本地开发前置依赖与启动步骤；
第三步：完整目录结构说明；
第四步：所有接口清单与请求示例；
第五步：生产服务器完整部署流程；
第六步：仓库复用规则（新项目直接 clone 修改业务）。

## 交付产出

直接使用之前给你的完整标准化 README 文档，覆盖本地开发、服务器部署、接口说明、边界报错处理。

## 测试 \& 验收标准 \+ 测试例子

测试例子：他人拉取仓库，仅根据 README 步骤即可完整启动项目，无需额外询问。
验收结果：文档完整清晰，涵盖开发、部署、复用全流程，符合私有模板仓库标准。

# 任务四：服务器完整线上部署实操（核心任务 3）

## 任务步骤讲解

Node 后端无需打包，直接源码部署，全程使用 Git 拉取、PM2 托管、Nginx 反向代理，步骤如下：

### 4\.1 服务器环境准备

第一步：服务器安装 Node LTS、Git、PM2、Nginx；
第二步：创建项目存放目录；
第三步：服务器克隆私有 Git 模板仓库。

### 4\.2 项目服务部署

第一步：服务器复制\.env\.example 生成\.env，填写线上数据库、JWT 密钥；
第二步：执行`npm install`安装服务端依赖；
第三步：执行 prisma 生产数据库迁移；
第四步：PM2 创建进程、后台常驻启动服务；
第五步：配置 Nginx 反向代理，绑定域名、开放 80/443 端口。

## 完整执行命令

### 1\. 服务器安装依赖

```bash
# 安装pm2全局
npm install pm2 -g
# 克隆私有仓库
git clone 私有仓库地址 /data/backend-template
cd /data/backend-template
# 复制环境模板
cp .env.example .env
# 安装依赖
npm install
# 生产数据库迁移
npx prisma migrate deploy
# pm2启动
pm2 start npm --name backend-api -- run start
# 设置开机自启
pm2 startup
pm2 save
# 常用pm2命令
pm2 logs backend-api   # 查看日志
pm2 restart backend-api # 重启服务
pm2 stop backend-api    # 停止服务
```

### 2\. Nginx 最简反向代理配置

```nginx
server {
    listen 80;
    server_name 你的域名;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 测试 \& 验收标准 \+ 测试例子

测试例子 1：服务器启动 pm2，关闭终端接口依然可以正常访问；
测试例子 2：访问域名可正常调用所有接口，无需携带 3000 端口；
测试例子 3：删除用户、鉴权、分页、登录线上环境功能和本地完全一致。
验收结果：项目稳定线上运行，进程自动保活，域名正常访问，部署流程可复用给所有新项目。

# 任务五：整套模板复用流程演示（收尾任务）

## 任务步骤讲解

本仓库作为私有模板，新项目无需从零搭建，复用步骤如下：
第一步：新项目本地直接 git clone 私有模板仓库；
第二步：删除原有业务数据（用户、文章无关逻辑按需清理）；
第三步：修改数据库名称、业务接口；
第四步：本地开发调试完成后，单独新建新项目私有仓库提交；
第五步：新项目使用 Day4 同款流程部署上线。

## 测试 \& 验收标准 \+ 测试例子

测试例子：克隆模板仓库，修改业务接口后正常运行，部署流程无差异。
验收结果：模板复用效率极高，省去 Day1\-Day3 基础搭建工作，符合最初需求「私有模板仓库」定位。

# Day4 整体最终验收标准

1. 项目完成完整工程分层，单文件拆分为路由、控制器、中间件、工具、校验多层架构；

2. Git 配置规范，屏蔽敏感文件，安全无信息泄露；

3. 配套完整 README 使用文档，新手可独立开发、部署；

4. 掌握服务器全套部署流程：Git 拉取、环境配置、PM2 进程托管、Nginx 反向代理；

5. 掌握私有模板复用流程，新项目一键克隆快速开发；

6. 本地开发、线上部署两套环境均可稳定运行，Day1\-Day3 所有功能完整保留；

7. 整套项目交付完成，满足前期需求：前 3 天写业务后端、第 4 天工程化 \+ 仓库 \+ 部署。

> （注：部分内容可能由 AI 生成）
