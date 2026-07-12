/**
 * 测试种子数据脚本
 * 功能：生成 10 个用户 + 50 篇文章，文章随机分配给不同用户
 *
 * 执行方式：npx tsx test/seed.ts
 */

import prisma from '../src/prisma.js'

// ===== 随机密码生成 =====
function randomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ===== 10 个用户数据（密码随机生成）=====
const userNames = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十', '冯十一', '陈十二']
const users = userNames.map((name, i) => ({
  name,
  email: `${name}@test.com`,
  password: randomPassword(),
}))

// ===== 50 篇文章标题 + 内容 =====
const postTemplates = [
  { title: 'Node.js 入门教程',                  content: 'Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时，适合构建高性能的网络应用。' },
  { title: 'Express 框架详解',                  content: 'Express 是 Node.js 最流行的 Web 框架，提供了简洁的路由、中间件机制，让后端开发更加高效。' },
  { title: 'Prisma ORM 使用指南',               content: 'Prisma 是新一代 Node.js ORM，支持类型安全的数据库操作，自动生成 TypeScript 类型，开发体验极佳。' },
  { title: 'MySQL 索引优化实战',                 content: '合理使用索引可以显著提升查询性能。本文介绍 B+ 树索引原理、联合索引最左前缀、EXPLAIN 分析等核心优化技巧。' },
  { title: 'JWT 鉴权原理与实现',                 content: 'JSON Web Token 是目前最流行的无状态鉴权方案，由 Header、Payload、Signature 三部分组成，适合分布式系统。' },
  { title: 'TypeScript 高级类型技巧',            content: '从泛型、条件类型到模板字面量类型，TypeScript 的类型系统非常强大，能帮助我们在编译期发现大量潜在 bug。' },
  { title: 'RESTful API 设计规范',              content: '好的 API 设计遵循资源导向、统一接口、无状态等原则。URL 使用名词复数，HTTP 方法表示操作类型，状态码表达结果。' },
  { title: 'Zod 数据校验入门',                   content: 'Zod 是 TypeScript 优先的 schema 声明与校验库，支持静态类型推断，可以替代手写 if-else 参数校验，代码更优雅。' },
  { title: 'Git 版本控制最佳实践',               content: '分支管理策略、有意义的 commit message、代码审查流程、冲突解决技巧，这些是团队协作的必备技能。' },
  { title: 'Docker 容器化部署',                  content: '使用 Docker 可以将应用及其依赖打包成镜像，实现环境一致性，消除"在我机器上能跑"的问题。' },
  { title: 'PM2 进程管理实战',                   content: 'PM2 是 Node.js 应用的生产级进程管理器，支持集群模式、日志管理、自动重启、负载均衡等功能。' },
  { title: 'Nginx 反向代理配置',                 content: 'Nginx 可作为反向代理服务器，将客户端请求转发给后端服务，同时提供负载均衡、SSL 终止、静态资源服务等能力。' },
  { title: 'Redis 缓存入门',                     content: 'Redis 是一种内存数据库，常用于缓存热点数据、分布式锁、消息队列等场景，读写性能极高。' },
  { title: '前后端分离架构设计',                  content: '前后端分离是现代 Web 开发的主流模式，前端专注 UI 交互，后端提供 RESTful API，通过 HTTP 协议通信。' },
  { title: '数据库事务与隔离级别',                content: '事务的 ACID 特性保证了数据一致性。MySQL InnoDB 支持 READ COMMITTED、REPEATABLE READ 等四种隔离级别。' },
  { title: '中间件模式深入理解',                  content: 'Express 中间件是一个函数，可以访问请求对象、响应对象和 next 函数。洋葱模型是理解中间件执行顺序的关键。' },
  { title: '跨域问题与 CORS 配置',              content: '浏览器的同源策略限制了跨域请求。CORS 通过设置响应头 Access-Control-Allow-Origin 来允许特定域的请求访问资源。' },
  { title: '环境变量管理 .env 最佳实践',          content: '将敏感配置抽离到 .env 文件，通过 dotenv 加载。.env.example 提交到 Git，.env 加入 .gitignore，防止密码泄露。' },
  { title: '单元测试与集成测试',                  content: 'Jest 是 JavaScript 最流行的测试框架，支持断言、mock、快照测试。好的测试覆盖率能显著提升代码质量和重构信心。' },
  { title: 'SQL 查询优化之 EXPLAIN',            content: 'MySQL EXPLAIN 命令可以分析查询执行计划，帮助我们发现全表扫描、未使用索引等性能问题，是 SQL 调优的核心工具。' },
  { title: 'ES6+ 常用语法速查',                  content: '解构赋值、箭头函数、模板字符串、Promise、async/await、展开运算符、可选链，这些是日常开发中最常用的 ES6+ 语法。' },
  { title: 'GraphQL vs REST 对比分析',           content: 'GraphQL 允许客户端精确指定需要的数据字段，避免过度获取和获取不足的问题，但也引入了查询复杂度和缓存难度等新挑战。' },
  { title: 'WebSocket 实时通信原理',             content: 'WebSocket 是 HTML5 提供的全双工通信协议，单个 TCP 连接上实现持久化双向通信，适合聊天、实时通知、协作编辑等场景。' },
  { title: 'MVC 设计模式在 Express 中的应用',     content: 'MVC 将应用分为 Model（数据层）、View（视图层）、Controller（控制层），实现关注点分离，代码可维护性更高。' },
  { title: 'Linux 常用命令速查',                  content: 'ls、cd、mkdir、rm、cp、mv、grep、chmod、ps、top、netstat，掌握这些常用命令可以大幅提升服务器操作效率。' },
  { title: 'GitHub Actions CI/CD 自动部署',     content: 'GitHub Actions 是 GitHub 内置的 CI/CD 工具，可以在代码推送时自动运行测试、构建、部署，实现持续集成与交付。' },
  { title: 'CSS Flexbox 布局完全指南',           content: 'Flexbox 是一维布局模型，通过 display:flex 激活，使用 justify-content 控制主轴对齐、align-items 控制交叉轴对齐。' },
  { title: 'Vue3 Composition API 实战',          content: 'Composition API 是 Vue3 的核心特性，通过 setup 函数组织逻辑，相比 Options API 更灵活，代码复用更方便。' },
  { title: 'React Hooks 深入浅出',               content: 'useState、useEffect、useContext、useReducer、useMemo、useCallback 是最常用的 Hooks，理解它们的原理和适用场景至关重要。' },
  { title: '网络安全常见漏洞与防御',               content: 'XSS 跨站脚本、CSRF 跨站请求伪造、SQL 注入、DDoS 攻击，是 Web 应用最常见的四类安全威胁，需要从开发阶段就做好防护。' },
  { title: 'HTTP 状态码速查表',                   content: '200 成功、201 创建成功、301 永久重定向、400 参数错误、401 未认证、403 禁止访问、404 未找到、500 服务器错误。' },
  { title: 'JavaScript 异步编程演变史',           content: '从回调函数到 Promise 到 async/await，JavaScript 的异步编程范式不断进化，让我们可以用同步风格写异步代码。' },
  { title: 'API 版本管理策略',                    content: '常见的 API 版本管理方式：URL 路径版本 /v1/、请求头版本 Accept-Version、查询参数版本 ?version=1，各有优劣需按场景选择。' },
  { title: '数据库连接池原理与配置',               content: '连接池预先创建一批数据库连接，请求时从池中获取、用完后归还，避免频繁创建销毁连接的开销。合理配置 pool size 至关重要。' },
  { title: '日志系统搭建与实践',                   content: '使用 winston 或 morgan 记录请求日志、错误日志，分级管理。好的日志系统是线上问题排查的第一道防线。' },
  { title: '微服务与服务治理入门',                 content: '微服务架构将单体应用拆分为多个独立服务，每个服务独立开发部署。服务发现、负载均衡、熔断降级是微服务治理的核心。' },
  { title: 'NPM 包发布与版本管理',                content: '使用 npm publish 发布自己的 npm 包，遵循语义化版本（semver），major.minor.patch 分别对应不兼容变更、新增功能、bug 修复。' },
  { title: '设计模式之单例与工厂模式',              content: '单例模式确保一个类只有一个实例（如数据库连接），工厂模式将对象创建逻辑封装起来，客户端无需关心具体实现类。' },
  { title: '正则表达式入门与实战',                 content: '正则表达式是强大的文本匹配工具。^ 开头、$ 结尾、\d 数字、\w 字母数字、* 零或多个、+ 一或多个、? 零或一个、() 分组。' },
  { title: '前端性能优化方案汇总',                 content: '图片懒加载、代码分割、CDN 加速、资源压缩、缓存策略、减少重绘回流、虚拟列表，从网络到渲染全链路优化。' },
  { title: '消息队列 RabbitMQ 入门',              content: '消息队列实现生产者与消费者的异步解耦，适合削峰填谷、异步处理、应用解耦等场景。RabbitMQ 支持多种交换机模式。' },
  { title: 'OAuth 2.0 授权流程详解',              content: 'OAuth 2.0 是目前最流行的第三方授权协议，Authorization Code 模式是最安全的授权方式，微信、GitHub 登录都基于此。' },
  { title: 'Node.js Stream 流处理',               content: 'Stream 是 Node.js 的核心模块之一，支持分块处理大量数据，避免一次性加载全部内容导致内存溢出，适合文件上传、日志处理等场景。' },
  { title: 'Monorepo 项目管理方案',               content: '使用 pnpm workspace 或 Turborepo 管理多个包的 monorepo 项目，共享公共配置、复用代码、统一版本管理。' },
  { title: 'CSS Grid 网格布局实战',               content: 'CSS Grid 是二维布局模型，比 Flexbox 更适合复杂的页面布局。grid-template-columns 定义列，grid-template-rows 定义行。' },
  { title: 'Web 安全之 HTTPS 原理',              content: 'HTTPS = HTTP + SSL/TLS，通过非对称加密交换密钥、对称加密传输数据，确保通信内容的机密性和完整性。' },
  { title: 'Serverless 无服务架构入门',           content: 'Serverless 让开发者无需关心服务器运维，按实际调用次数计费。AWS Lambda、阿里云函数计算是主流 Serverless 平台。' },
  { title: 'Kubernetes 容器编排基础',             content: 'K8s 是容器编排的事实标准，Pod 是最小部署单元，Service 提供负载均衡，Deployment 管理滚动更新与回滚。' },
  { title: '程序员自我提升方法论',                 content: '刻意练习、费曼学习法、番茄工作法、定期复盘、建立知识体系、参与开源项目，这些方法是高效成长的捷径。' },
  { title: '年终总结：2026 我的技术成长之路',      content: '回顾这一年的技术旅程，从 Express 到 Prisma，从单体到工程化，每一步都是成长。技术没有捷径，唯有持续学习与实践。' },
]

// ===== 随机工具函数 =====
/** 从数组中随机取一个元素 */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** 生成 min~max 范围的随机整数 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** 打乱数组（Fisher-Yates 洗牌） */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// ===== 主逻辑 =====
async function seed() {
  console.log('🌱 开始生成测试数据...\n')

  // 1. 创建 10 个用户
  console.log('📦 创建 10 个用户...')
  const createdUsers: { id: number; name: string; password: string }[] = []

  for (const u of users) {
    const user = await prisma.user.create({ data: u })
    createdUsers.push({ id: user.id, name: user.name, password: u.password })
    console.log(`  ✅ [${user.id}] ${user.name} — ${user.email}  (密码: ${u.password})`)
  }

  console.log(`\n📝 创建 50 篇文章（随机分配给 ${createdUsers.length} 个用户）...`)

  // 2. 给每个用户随机分配文章数量（保证总和 = 50）
  //    生成 10 个随机数 → 归一化为总和 50
  const rawCounts = createdUsers.map(() => randInt(1, 10))
  const rawSum = rawCounts.reduce((a, b) => a + b, 0)
  // 按比例分配，最终调整为总和 = 50
  let counts = rawCounts.map(c => Math.round((c / rawSum) * 50))
  // 修正四舍五入导致的误差
  let diff = 50 - counts.reduce((a, b) => a + b, 0)
  for (let i = 0; diff !== 0; i++) {
    if (diff > 0) { counts[i % counts.length]++;  diff-- }
    else           { counts[i % counts.length]--;  diff++ }
  }

  // 显示分配情况
  for (let i = 0; i < createdUsers.length; i++) {
    console.log(`  👤 ${createdUsers[i].name}: ${counts[i]} 篇文章`)
  }

  // 3. 随机打乱文章模板并分配给用户
  const shuffled = shuffle(postTemplates)
  let cursor = 0

  for (let i = 0; i < createdUsers.length; i++) {
    const userId = createdUsers[i].id
    const count = counts[i]

    for (let j = 0; j < count; j++) {
      const template = shuffled[cursor++]
      const post = await prisma.post.create({
        data: {
          title: template.title,
          content: template.content,
          userId,
        },
      })
      console.log(`  ✅ 文章[${post.id}] "${template.title.slice(0, 16)}..." → ${createdUsers[i].name}`)
    }
  }

  // 4. 统计汇总
  const [userTotal, postTotal] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
  ])

  console.log('\n🎉 测试数据生成完成！')
  console.log(`   用户总数: ${userTotal}`)
  console.log(`   文章总数: ${postTotal}`)

  // 5. 打印每个用户实际文章数
  console.log('\n📊 用户文章分布:')
  for (const u of createdUsers) {
    const c = await prisma.post.count({ where: { userId: u.id } })
    console.log(`   ${u.name}: ${c} 篇`)
  }
}

seed()
  .catch((e) => {
    console.error('❌ 种子数据生成失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
