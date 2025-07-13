// src/entry-server.js
import React from 'react'
import { renderToString } from 'react-dom/server'
import App from './app'

export function render(url: string) {
  // 这里可以执行 SSR 数据预取（如调用 API）
  const html = renderToString(<App />)
  return { html }
}