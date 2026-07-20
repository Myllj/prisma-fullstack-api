# 测试数据生成指南

本目录包含数据库测试种子数据脚本，用于快速生成开发调试所需的测试数据。

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `seed.ts` | 种子数据脚本，生成 10 个用户 + 50 篇文章（密码 bcrypt 加密） |
| `README.md` | 本指南 |

---

## 种子数据内容

- **10 个用户**：张三、李四、王五…（中文姓名，标准 ASCII 拼音邮箱，随机 8 位密码）
- **50 篇文章**：涵盖 Node.js、Express、Prisma、TypeScript、MySQL、Docker、前端等热门技术领域
- **文章分配**：每个用户随机关联 1~10 篇文章，保证每篇文章有唯一作者
- **安全规范**：
  - 密码使用 **bcrypt** 加盐哈希存储（盐轮数 10），数据库不会出现明文密码
  - 邮箱使用 **标准 ASCII 格式**（如 `zhangsan@test.com`），符合 RFC 5322，不支持中文邮箱

---

## 操作步骤

### 第一步：重置数据库（清空所有数据 + 重建表结构）

```bash
# 在项目根目录执行
npx prisma migrate reset --force
```

> 这会**清空数据库所有数据**并执行所有迁移文件重建表结构。`--force` 跳过确认提示。

### 第二步：重建测试数据

```bash
# 在项目根目录执行
npx tsx test_data/seed.ts
```

执行后终端会输出：

```
🌱 开始生成测试数据...

📦 创建 10 个用户（密码 bcrypt 加密存储）...
  ✅ [1] 张三 — zhangsan@test.com  (密码: aB3xK9mQ)
  ✅ [2] 李四 — lisi@test.com  (密码: pQ7wR2vY)
  ...

📝 创建 50 篇文章（随机分配给 10 个用户）...
  👤 张三: 6 篇文章
  👤 李四: 4 篇文章
  ...

🎉 测试数据生成完成！

📊 用户文章分布:
   张三: 6 篇
   李四: 4 篇
   ...

🔑 用户密码清单（数据库存储的是 bcrypt 哈希，不会泄露明文）:
   张三  |  zhangsan@test.com  |  密码: aB3xK9mQ
   李四  |  lisi@test.com  |  密码: pQ7wR2vY
   ...
```

### 第三步：启动服务验证

```bash
npm run dev
```

打开前端 `http://localhost:5173`，使用终端输出的邮箱 + 密码登录，或用 Apifox/Postman 测试 `POST /api/auth/login`：

```json
{ "email": "zhangsan@test.com", "password": "aB3xK9mQ" }
```

登录后拿到 token，即可测试文章接口。

---

## 快速一键（按顺序执行两行命令）

```bash
npx prisma migrate reset --force
npx tsx test_data/seed.ts
```

---

## 常见问题

**Q：执行 seed.ts 报错 "Cannot find module"？**

A：确保命令路径正确：`npx tsx test_data/seed.ts`（不是 `test/seed.ts`）。

**Q：种子数据可以重复执行吗？**

A：不可以。因为邮箱字段设置了 `@unique`，重复执行会报邮箱重复错误。如需重新生成，请先执行 `npx prisma migrate reset --force` 重置数据库。

**Q：不想看随机密码，想用固定密码？**

A：编辑 `test_data/seed.ts`，在 `users` 数组构建处，将 `plainPassword: randomPassword()` 改为 `plainPassword: '123456'`，所有用户密码固定。

**Q：数据库里看到的密码是什么？**

A：bcrypt 哈希值，以 `$2a$10$` 开头，例如：
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```
这是**不可逆**的，即使数据库泄露也无法还原原始密码。登录时通过 bcrypt 算法校验输入密码与哈希是否匹配。

**Q：为什么邮箱不支持中文了？**

A：根据 RFC 5322 标准，标准邮箱地址本地部分只允许 ASCII 字符。国际化邮箱（SMTPUTF8）在实际应用中极少。修改后更符合行业规范。

**Q：想生成不同数量的数据？**

A：编辑 `test_data/seed.ts`：
- 修改 `userNames` 数组增删用户（同时补充 `emailMap`）
- 修改 `postTemplates` 数组增删文章
- 修改归一化目标值（第 141 行的 `50`）来调整文章总数

**Q：想固定文章分配数量（不用随机）？**

A：将 `seed.ts` 中 `const rawCounts = ...` 这一行替换为固定值：

```typescript
// 固定分配：每个用户正好 5 篇文章
const counts = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
```
