---
tags: [Vue, 反代]
title: Vue 反向代理
date created: 2024-10-17 01:07:32
date modified: 2026-03-27 07:11:17
---

# Vue 反向代理

## 1 什么是反向代理

反向代理是一种服务器端代理技术, 它接收客户端的请求, 然后将请求转发到内部网络上的服务器, 并将从服务器上得到的结果返回给客户端。在前端开发中, 反向代理常用于解决跨域问题和简化 API 调用。

## 2 为什么在 Vue 项目中使用反向代理

1. **解决跨域问题**: 在开发环境中, 前端和后端通常运行在不同的端口或域名下, 导致跨域问题。通过反向代理, 可以绕过浏览器的同源策略限制。
2. **简化 API 调用**: 可以将复杂的 API 路径映射为简单的路径, 方便前端调用。
3. **增加安全性**: 隐藏了真实的后端服务器地址, 增加了安全性。

## 3 Vue + Vite 中实现反向代理

在 Vite 中配置反向代理非常简单, 只需要在 `vite.config.js` 文件中添加 `server.proxy` 配置即可。

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://backend-server.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

在这个配置中:

- `/api` 是你想要代理的路径前缀
- `target` 是你要代理到的目标服务器地址
- `changeOrigin: true` 表示修改请求头中的 host 值
- `rewrite` 用于重写请求路径, 这里我们移除了 `/api` 前缀

## 4 Vue + Webpack 中实现反向代理

在使用 Vue CLI 创建的项目中 (基于 Webpack), 可以通过修改 `vue.config.js` 文件来配置反向代理:

```javascript
// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://backend-server.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}
```

这个配置与 Vite 的配置非常相似:

- `/api` 是要代理的路径前缀
- `target` 是目标服务器地址
- `changeOrigin: true` 修改请求头的 host 值
- `pathRewrite` 用于重写请求路径, 移除 `/api` 前缀

注意: 这些配置只在开发环境中生效。在生产环境中, 你需要在实际的 Web 服务器 (如 Nginx) 中配置反向代理。
