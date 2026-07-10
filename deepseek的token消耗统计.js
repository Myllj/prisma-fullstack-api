import http from 'http'
import https from 'https'

// DeepSeek 官方定价（元/百万tokens）
const PRICING = {
  'deepseek-v4-flash': {
    cacheHitInput: 0.02,
    cacheMissInput: 1,
    output: 2
  },
  'deepseek-v4-pro': {
    cacheHitInput: 0.025,
    cacheMissInput: 3,
    output: 6
  }
}

// 检查消息是否包含图片
function hasImageContent(msg) {
  if (Array.isArray(msg.content)) {
    return msg.content.some(item => item.type === 'image_url')
  }
  return false
}

// 移除图片，只保留文本内容
function removeImages(messages) {
  return messages.map(msg => {
    if (hasImageContent(msg)) {
      return { ...msg, content: '（图片消息，已被代理过滤）' }
    }
    return msg
  })
}

// 本地代理服务器
const server = http.createServer((req, res) => {
  // 处理 CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  if (req.method !== 'POST' || !req.url.includes('chat/completions')) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  const startTime = Date.now()

  // 收集请求体
  let body = ''
  req.on('data', chunk => { body += chunk.toString() })
  req.on('end', () => {
    try {
      const requestData = JSON.parse(body)
      const isStream = requestData.stream === true

      // 检查是否包含图片
      const hasImage = requestData.messages?.some(hasImageContent)
      if (hasImage) {
        console.log('\n⚠️ 检测到图片消息，将被过滤为文本')
        requestData.messages = removeImages(requestData.messages)
      }

      console.log(`收到请求，模型: ${requestData.model || '未指定'}${hasImage ? ' [含图片已过滤]' : ''}${isStream ? ' [流式]' : ''}`)

      // 转发到 DeepSeek
      const options = {
        hostname: 'api.deepseek.com',
        port: 443,
        path: '/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || 'sk-your-api-key'}`,
        }
      }

      const proxyReq = https.request(options, (proxyRes) => {
        const contentType = proxyRes.headers['content-type'] || ''
        const isSse = contentType.includes('text/event-stream') || isStream

        if (isSse) {
          // 处理流式响应（SSE）
          res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          })

          let fullResponse = ''
          let usageData = null

          proxyRes.on('data', chunk => {
            const text = chunk.toString()
            fullResponse += text
            res.write(chunk)

            // 解析 SSE 中的 usage 数据
            const lines = text.split('\n')
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6)
                if (dataStr === '[DONE]') continue
                try {
                  const parsed = JSON.parse(dataStr)
                  if (parsed.usage) {
                    usageData = parsed.usage
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            }
          })

          proxyRes.on('end', () => {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

            // 如果流中没有 usage，尝试从最后一条 data 中获取
            if (!usageData) {
              const lines = fullResponse.split('\n')
              for (let i = lines.length - 1; i >= 0; i--) {
                if (lines[i].startsWith('data: ') && lines[i] !== 'data: [DONE]') {
                  try {
                    const parsed = JSON.parse(lines[i].slice(6))
                    if (parsed.usage) {
                      usageData = parsed.usage
                      break
                    }
                  } catch (e) { /* ignore */ }
                }
              }
            }

            printStats(requestData, usageData, elapsed)
            res.end()
          })

        } else {
          // 处理非流式响应（JSON）
          let responseData = ''
          proxyRes.on('data', chunk => { responseData += chunk.toString() })
          proxyRes.on('end', () => {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

            try {
              const data = JSON.parse(responseData)
              printStats(requestData, data.usage, elapsed)
            } catch (e) {
              console.error('解析响应失败:', e.message)
            }

            res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' })
            res.end(responseData)
          })
        }
      })

      proxyReq.on('error', (e) => {
        console.error('代理请求失败:', e.message)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: e.message }))
      })

      proxyReq.write(JSON.stringify(requestData))
      proxyReq.end()

    } catch (e) {
      console.error('解析请求失败:', e.message)
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid JSON body: ' + e.message }))
    }
  })
})

// 打印统计信息
function printStats(requestData, usage, elapsed) {
  const model = requestData?.model || 'unknown'
  const pricing = PRICING[model]
  const empty = usage === null || usage === undefined
  const isStream = requestData?.stream === true

  console.log('\n=== Token 消耗统计 ===')
  console.log(`调用时间：${new Date().toLocaleString()}`)
  console.log(`模型：${model}${isStream ? ' (流式)' : ''}`)
  console.log(`消耗时间：${elapsed}s`)

  if (empty) {
    console.log('tokens输入：未获取到 usage 数据')
    console.log('tokens输出：未获取到 usage 数据')
    console.log('⚠️ 流式响应可能在最后一条消息中包含 usage，但已丢失')
    console.log('本次总消耗价格：未知')
  } else {
    const hitTokens = usage.prompt_cache_hit_tokens || 0
    const missTokens = usage.prompt_cache_miss_tokens || usage.prompt_tokens || 0
    const outTokens = usage.completion_tokens || 0

    console.log(`tokens输入（缓存命中）：${hitTokens}`)
    console.log(`tokens输入（缓存未命中）：${missTokens}`)
    console.log(`tokens输出：${outTokens}`)

    if (pricing) {
      const inputPrice = (missTokens / 1_000_000) * pricing.cacheMissInput +
                         (hitTokens / 1_000_000) * pricing.cacheHitInput
      const outputPrice = (outTokens / 1_000_000) * pricing.output
      const totalPrice = inputPrice + outputPrice

      console.log(`输入价格：${inputPrice.toFixed(6)}元`)
      console.log(`输出价格：${outputPrice.toFixed(6)}元`)
      console.log(`本次总消耗价格：${totalPrice.toFixed(6)}元`)
    } else {
      console.log(`输入价格：未匹配到定价`)
      console.log(`输出价格：未匹配到定价`)
      console.log(`本次总消耗价格：未匹配到定价`)
    }
  }
  console.log('======================\n')
}

const PORT = 9567
server.listen(PORT, () => {
  console.log(`代理已启动 → http://127.0.0.1:${PORT}`)
  console.log(`请在 IDE 设置中配置 API 地址为: http://127.0.0.1:${PORT}`)
  console.log(`请设置环境变量 DEEPSEEK_API_KEY 为你的 API Key`)
  console.log(`支持流式和非流式响应`)
})
console.log('process.env.DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY);
