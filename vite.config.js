import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 为 Node.js 模块提供浏览器替代
      crypto: 'crypto-es',
    },
  },
  optimizeDeps: {
    exclude: ['fsevents'], // 排除 fsevents 模块
  },
})