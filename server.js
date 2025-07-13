import express from 'express';
import fs from 'node:fs'
import { fileURLToPath } from 'url';
import compression from 'compression';
import sirv from 'sirv';
import path from 'path';
import { dirname } from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templateHtmlPath = path.join(__dirname, 'dist/client/index.html');
const templateHtmlFile = fs.readFileSync(templateHtmlPath, 'utf-8')

// 启用Gzip压缩
app.use(compression());

// 静态资源服务
app.use(
  '/assets',
  sirv(path.join(__dirname, 'dist/client/assets'), {
    dev: !isProduction,
    etag: true,
  })
);

// 服务器端渲染处理
app.use('/', async (req, res) => {
  try {
    // 加载服务器入口
    const { render } = await import('./dist/server/entry-server.js');

    // 执行服务器端渲染
    const { html } = await render(req.url);

    const finalHtml = templateHtmlFile.replace(`<!--ssr-outlet-->`, html)
    res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml)
  } catch (err) {
    console.error('服务器渲染错误:', err);
    res.status(500).send('服务器内部错误');
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});  