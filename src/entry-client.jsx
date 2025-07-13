// src/entry-client.js
import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import App from './App.jsx'

// 接管 SSR 渲染的 HTML，使其可交互
hydrateRoot(
  document.getElementById('root'),
  <App />
)