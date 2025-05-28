import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,  // 自定义端口
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // WebSocket 代理配置
      '/ws': {
        target: 'ws://localhost:8080', // 注意这里使用 ws:// 协议
        changeOrigin: true,
        ws: true, // 启用 websocket 代理
        secure: false, // 禁用 SSL 验证（适用于开发环境）
        rewrite: (path) => path.replace(/^\/ws/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
