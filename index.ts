// src/main.ts
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { rateLimit } from 'elysia-rate-limit'

const app = new Elysia()
  // Swagger 文件配置
  .use(
    swagger({
      documentation: {
        info: { title: '限速演示API', version: '1.0' },
        tags: [{ name: 'DEMO' }]
      }
    })
  )
  // 速率限制中介層
  .use(
    rateLimit({
      duration: 60_000,        // 限速時段 (毫秒)
      max: 1,                  // 允許請求次數上限
      generator: (request) =>  // 自定義請求識別器
        request.headers.get('CF-Connecting-IP') || 
        request.headers.get('X-Forwarded-For') || 
        request.headers.get('X-Real-IP') || 
        'unknown-ip',
      errorResponse: new Response('請求過於頻繁', { 
        status: 429,
        headers: { 'Content-Type': 'text/plain' }
      })
    })
  )
  // 示範端點
  .get('/data', () => ({ result: '測試資料' }), {
    detail: {
      tags: ['DEMO'],
      description: '受速率限制保護的示範端點'
    }
  })
  .listen(3000)

console.log(`🦊 Elysia server is running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`📚 Swagger UI available at http://${app.server?.hostname}:${app.server?.port}/swagger`);
