# 测试数据生成指南

本目录包含数据库测试种子数据脚本，用于快速生成开发调试所需的测试数据。

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `seed.ts` | 种子数据脚本，生成 10 个用户 + 50 篇文章 |
| `README.md` | 本指南 |

---

## 种子数据内容

- **10 个用户**：张三、李四、王五…（**密码随机 8 位**，执行时终端会显示）
- **50 篇文章**：涵盖 Node.js、Express、Prisma、TypeScript、MySQL、Docker、前端等热门技术领域
- **文章分配**：每个用户随机关联 1~10 篇文章，保证每篇文章有唯一作者

---

## 操作步骤

### 第一步：重置数据库（清空所有数据 + 重建空表）

```bash
# 在项目根目录执行
npx prisma migrate reset --force
```

> `--force` 跳过确认提示，直接执行。不加 `--force` 会要求输入 y 确认。

### 第二步：生成 Prisma Client 类型

```bash
npx prisma generate
```

### 第三步：运行种子数据脚本

```bash
# 在项目根目录执行
npx tsx test_data/seed.ts
```

执行后终端会输出（密码随机，和示例不同）：

```
🌱 开始生成测试数据...

📦 创建 10 个用户...
  ✅ [1] 张三 — 张三@test.com  (密码: aB3xK9mQ)
  ✅ [2] 李四 — 李四@test.com  (密码: pQ7wR2vY)
  ...

📝 创建 50 篇文章（随机分配给 10 个用户）...
  👤 张三: 6 篇文章
  👤 李四: 4 篇文章
  ...

📊 用户文章分布:
   张三: 6 篇
   李四: 4 篇
   ...
```

### 第四步：启动服务验证

```bash
npm run dev
```

打开 Postman，用输出的邮箱 + 密码登录：`POST /api/user/login`

```json
{ "email": "张三@test.com", "password": "aB3xK9mQ" }
```

登录后拿到 token，即可测试文章接口。

---

## 快速一键（按顺序执行三行命令）

```bash
npx prisma migrate reset --force
npx prisma generate
npx tsx test_data/seed.ts
```

---

## 常见问题

**Q：执行 seed.ts 报错 "Cannot find module"？**

A：确保命令路径正确：`npx tsx test_data/seed.ts`（不是 `test/seed.ts`）。

**Q：种子数据可以重复执行吗？**

A：不可以。因为邮箱字段设置了 `@unique`，重复执行会报邮箱重复错误。如需重新生成，请先执行 `npx prisma migrate reset --force` 重置数据库。

**Q：想生成不同数量的数据？**

A：编辑 `test_data/seed.ts`：
- 修改 `userNames` 数组增删用户
- 修改 `postTemplates` 数组增删文章
- 修改归一化目标值（第 120 行的 `50`）来调整文章总数

**Q：想固定文章分配数量（不用随机）？**

A：将 `seed.ts` 中 `const rawCounts = ...` 这一行替换为固定值：

```typescript
// 固定分配：每个用户正好 5 篇文章
const counts = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
```

**Q：不知道密码怎么办？**

A：重新执行一次 `npx tsx test_data/seed.ts`，终端会打印每个用户的随机密码。或者登录 `POST /api/user/login` 时，在 Postman Body 中先发任意邮箱，返回 400 说明密码错误是正常行为，执行种子脚本时记一下输出即可。
