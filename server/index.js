import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const distTemplateHtml = isProduction
  ? fs.readFileSync('./dist/client/index.html', 'utf-8')
  : ''
let vite;

async function createServer() {
  const app = express()

  if (!isProduction) {
    // 以中间件模式创建 Vite 应用，并将 appType 配置为 'custom'
    // 这将禁用 Vite 自身的 HTML 服务逻辑
    // 并让上级服务器接管控制
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })

    // 使用 vite 的 Connect 实例作为中间件
    // 如果你使用了自己的 express 路由（express.Router()），你应该使用 router.use
    // 当服务器重启（例如用户修改了 vite.config.js 后），
    // `vite.middlewares` 仍将保持相同的引用
    // （带有 Vite 和插件注入的新的内部中间件堆栈）。
    // 即使在重新启动后，以下内容仍然有效。
    app.use(vite.middlewares)
  } else {
    /**
     * compression 是一个 Express 中间件，用于压缩 HTTP 响应（如 Gzip 或 Brotli）
     * sirv 是一个高性能的静态文件服务器，比 Express 内置的 express.static 更高效
     */
    const compression = (await import('compression')).default;
    const sirv = (await import('sirv')).default;

    // 使用 compression 中间件压缩 HTTP 响应
    app.use(compression());

    // 使用 sirv 中间件提供静态文件服务
    // 所有请求路径以 `base` 开头的请求都会被代理到静态文件目录
    app.use(base, sirv('./dist/client', { extensions: [] }));
  }

  app.use('*all', async (req, res, next) => {
    const url = req.originalUrl;
    let template;
    let render;

    if (!isProduction) {
      try {
        // 1. 读取 index.html
        template = fs.readFileSync(
          path.resolve(__dirname, '../index.html'),
          'utf-8',
        )

        // 2. 应用 Vite HTML 转换。这将会注入 Vite HMR 客户端，
        //    同时也会从 Vite 插件应用 HTML 转换。
        //    例如：@vitejs/plugin-react 中的 global preambles
        template = await vite.transformIndexHtml(url, template)

        // 3. 加载服务器入口。vite.ssrLoadModule 将自动转换
        //    你的 ESM 源码使之可以在 Node.js 中运行！无需打包
        //    并提供了一种高效的模块失效机制，类似于模块热替换（HMR）。
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
      } catch (e) {
        console.log('appHtml error:', e);
        vite.ssrFixStacktrace(e)
        next(e)
      }
    } else {
      template = distTemplateHtml
      render = (await import('./dist/server/entry-server.js')).render
    }

    const appHtml = await render(url).html
    // 5. 注入渲染后的应用程序 HTML 到模板中。
    const html = template.replace(`<!--ssr-outlet-->`, appHtml)
    // 6. 返回渲染后的 HTML。
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  })

  // Start http server
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
  })
}

createServer()