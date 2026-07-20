import HttpsProxyAgent from 'https-proxy-agent'
import https from 'https'
import http from 'http'

interface FetchResult {
  json: () => any
  text: () => string
  status: number
  ok: boolean
}

/** 发起 HTTP 请求（支持代理），返回类 fetch 的结果 */
export function proxyFetch(url: string, options: { method?: string; headers?: Record<string, string>; body?: string } = {}): Promise<FetchResult> {
  return new Promise((resolve, reject) => {
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
    const urlObj = new URL(url)
    const transport = urlObj.protocol === 'https:' ? https : http

    let agent: any = undefined
    if (proxyUrl) {
      // HttpsProxyAgent 基于 http.Agent，对 CONNECT 隧道做了封装
      try {
        agent = new HttpsProxyAgent(proxyUrl)
      } catch (e) {
        reject(e)
        return
      }
    }

    const req = transport.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      agent,
      rejectUnauthorized: false
    }, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8')
        resolve({
          json: () => {
            try { return JSON.parse(raw) } catch {
              console.error('[proxyFetch] JSON 解析失败，原始响应:', raw.slice(0, 500))
              throw new Error(`响应不是有效的 JSON，HTTP ${res.statusCode}`)
            }
          },
          text: () => raw,
          status: res.statusCode || 0,
          ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 400
        })
      })
    })

    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('请求超时')) })

    if (options.body) req.write(options.body)
    req.end()
  })
}
