---
tags:
  - CloudFlare
  - Pages
  - Nginx
  - Workers
  - 反代
---

# 反代&负载均衡 - Cf Pages 部署

在构建一个微服务系统时，将前端项目部署在 Cloudflare Pages，同时实现负载均衡，可以通过以下步骤和工具来实现：

## 1 使用 Cloudflare Load Balancer

**Cloudflare Load Balancer** 提供了一种在 Cloudflare 边缘网络上进行负载均衡的方法。可以将不同的后端微服务配置为负载均衡的目标。

**步骤**：
1. **设置 DNS 记录**：
   - 在 Cloudflare 控制面板的 DNS 选项卡中，为你的后端服务设置 DNS 记录。

2. **配置 Load Balancer**：
   - 导航到 "Traffic" > "Load Balancing"。
   - 创建一个新的负载均衡器。
   - 添加后端服务器（Origins），并配置健康检查。
   - 设置负载均衡策略，例如基于地理位置或按流量分配。

3. **更新 DNS 配置**：
   - 确保你的域名指向 Cloudflare Load Balancer，以便所有流量都通过负载均衡器进行分配。

## 2 使用 Cloudflare Workers 进行负载均衡

**Cloudflare Workers** 允许在 Cloudflare 边缘执行自定义代码，可以编写 Worker 脚本来实现负载均衡逻辑。

**示例 Workers 脚本**：

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // 负载均衡逻辑
  const backendServers = [
    'https://backend1.example.com',
    'https://backend2.example.com'
  ]
  const backend = backendServers[Math.floor(Math.random() * backendServers.length)]
  const apiUrl = backend + url.pathname + url.search

  // 将 API 请求转发到后端服务器
  if (url.pathname.startsWith('/api')) {
    return fetch(apiUrl, {
      headers: request.headers
    })
  }

  // 静态内容请求直接转发到 Cloudflare Pages
  return fetch(request)
}
```

**步骤**：
1. **创建 Cloudflare Worker**：
   - 登录到 Cloudflare 控制面板，导航到 "Workers"。
   - 创建一个新的 Worker，粘贴并保存上述脚本。

2. **绑定 Worker 到路由**：
   - 在 "Workers" 中设置路由规则，将特定路径（如 `/api/*`）的请求绑定到刚创建的 Worker。

## 3 使用 Nginx 反向代理和负载均衡

在你的服务器上使用 **Nginx** 配置反向代理和负载均衡。

**示例 Nginx 配置**：

```nginx
upstream backend {
    server backend1.example.com;
    server backend2.example.com;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass https://your-cloudflare-pages-url/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**步骤**：
1. **安装和配置 Nginx**：
   - 在你的服务器上安装 Nginx，并按照上述配置进行设置。

2. **测试和部署**：
   - 确保 Nginx 配置文件正确无误，然后重启 Nginx 服务。

通过这些步骤，你可以在使用 Cloudflare Pages 部署前端项目的同时，通过 Cloudflare Load Balancer、Cloudflare Workers 或 Nginx 实现后端微服务的负载均衡。
