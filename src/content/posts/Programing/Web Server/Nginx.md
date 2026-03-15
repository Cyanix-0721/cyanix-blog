---
tags: 
title: Nginx
date created: 2024-08-15 04:19:28
date modified: 2026-03-14 09:35:26
date: 2026-03-15 02:52:39
---

# Nginx

## 1 概述

Nginx 是一个高性能的反向代理服务器和负载均衡器。它可以用于处理 HTTP 请求、提供反向代理、负载均衡以及静态内容服务。

## 2 反向代理

反向代理是指将客户端的请求转发到后台服务器，并将服务器的响应返回给客户端的过程。Nginx 可以轻松地配置为反向代理服务器，以保护后台服务器的隐私和安全，或负载分担。

### 2.1 基本反向代理配置

```nginx
server {
    listen       80; # 监听80端口
    server_name  example.com; # 服务器名称

    location / {
        proxy_pass http://backend/; # 转发请求到后台服务器
        proxy_set_header Host $host; # 保留客户端请求中的主机名
        proxy_set_header X-Real-IP $remote_addr; # 传递客户端的真实IP
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; # 保留客户端IP的转发信息
        proxy_set_header X-Forwarded-Proto $scheme; # 保留客户端使用的协议（HTTP/HTTPS）
    }
}
```

在上述配置中，`proxy_pass` 指令指定了请求的目标服务器，`proxy_set_header` 用于设置转发请求时的头信息。

## 3 负载均衡

负载均衡用于分配客户端请求到多个后台服务器，以提高应用的可用性和性能。Nginx 支持多种负载均衡策略，如轮询、权重、IP哈希等。  

| **名称**     | **说明**                         |
| ---------- | ------------------------------ |
| 轮询         | 默认方式                           |
| weight     | 权重方式，默认为1，权重越高，被分配的客户端请求就越多    |
| ip_hash    | 依据ip分配方式，这样每个访客可以固定访问一个后端服务    |
| least_conn | 依据最少连接方式，把请求优先分配给连接数少的后端服务     |
| url_hash   | 依据url分配方式，这样相同的url会被分配到同一个后端服务 |
| fair       | 依据响应时间方式，响应时间短的服务将会被优先分配       |

### 3.1 基本负载均衡配置

```nginx
# 定义上游服务器组
upstream backend {
    server 192.168.1.1:8080; # 后台服务器1
    server 192.168.1.2:8080; # 后台服务器2
    server 192.168.1.3:8080; # 后台服务器3
}

server {
    listen       80;
    server_name  example.com;

    location / {
        proxy_pass http://backend/; # 使用上游服务器组
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

在这个配置中，我们定义了一个名为 `backend` 的上游服务器组，包含了多个服务器。客户端的请求将根据 Nginx 的默认策略（轮询）被分配到这些服务器。

### 3.2 权重轮询

可以使用 `weight` 参数为不同的服务器分配不同的权重，使请求按照特定比例分配：

```nginx
upstream backend {
    server 192.168.1.1:8080 weight=3;
    server 192.168.1.2:8080 weight=1;
    server 192.168.1.3:8080 weight=1;
}
```

在上述配置中，`192.168.1.1` 服务器将接收约 60% 的请求，而另外两个服务器各接收约 20% 的请求。

### 3.3 IP 哈希

IP 哈希策略确保来自同一客户端 IP 的请求总是发送到同一个服务器：

```nginx
upstream backend {
    ip_hash;
    server 192.168.1.1:8080;
    server 192.168.1.2:8080;
    server 192.168.1.3:8080;
}
```

## 4 高可用性配置

为了提高服务的高可用性，可以在 `upstream` 块中添加备用服务器：

```nginx
upstream backend {
    server 192.168.1.1:8080;
    server 192.168.1.2:8080;
    server 192.168.1.3:8080;
    server 192.168.1.4:8080 backup; # 备用服务器，仅在其他服务器不可用时使用
}
```

## 5 WebSocket 支持

为了支持 WebSocket，必须设置 `Upgrade` 和 `Connection` 头信息：

```nginx
location /ws/ {
    proxy_pass http://backend/ws/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 3600s;
}
```

## 6 `nginx.conf` 示例

```conf
# 设置 NGINX 运行的用户和用户组
user nginx;

# 工作进程数量，建议设置为 CPU 核心数
worker_processes 1;

# 错误日志文件及日志级别
error_log  /var/log/nginx/error.log warn;

# 主进程 ID 存储文件
pid        /var/run/nginx.pid;

events {
    # 每个工作进程的最大连接数
    worker_connections  1024;
}

http {
    # 加载 MIME 类型映射文件
    include       /etc/nginx/mime.types;

    # 默认文件类型
    default_type  application/octet-stream;

    # 自定义访问日志格式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    # 访问日志文件及格式
    access_log  /var/log/nginx/access.log  main;

    # 启用高效文件传输模式
    sendfile        on;

    # 保持连接超时时间
    keepalive_timeout  65;

    server {
        # 监听端口
        listen       80;

        # 服务器名称
        server_name  localhost;

        # 根路径请求处理
        location / {
            # 网站根目录
            root   /usr/share/nginx/html;

            # 默认首页文件
            index  index.html index.htm;

            # 尝试文件
            try_files $uri $uri/ /index.html;
        }
        
        location /api/ {
            proxy_pass http://springboot:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/ws {
            proxy_pass http://springboot:8080/ws;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /test {
            return 200 "Nginx is working";
        }

        # 错误页面配置
        # error_page   500 502 503 504  /50x.html;
        # location = /50x.html {
        #     root   /usr/share/nginx/html;
        # }
    }
}
```
