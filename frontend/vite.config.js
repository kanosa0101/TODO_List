import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/agent': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => {
          const newPath = path.replace(/^\/api\/agent/, '/api');
          console.log(`[代理] ${path} -> ${newPath} -> http://localhost:5000${newPath}`);
          return newPath;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.error('[代理错误] Agent 服务连接失败:', err.message);
            console.error('[代理错误] 请求路径:', req.url);
            console.error('[代理错误] 请确保 Agent 服务正在运行 (端口 5000)');
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[代理请求]', req.method, req.url, '-> http://localhost:5000' + req.url.replace('/api/agent', '/api'));
          });
        },
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})

