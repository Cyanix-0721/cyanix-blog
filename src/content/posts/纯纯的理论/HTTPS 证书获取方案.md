---
tags: 
title: HTTPS 证书获取方案
date created: 2024-11-18 02:35:46
date modified: 2026-03-14 09:35:20
date: 2026-03-15 02:52:39
---

# HTTPS 证书获取方案

在为网站启用 HTTPS 以提供加密通信时，需要获取合适的 SSL/TLS 证书。以下介绍几种常见的 HTTPS 证书获取方案，供参考选择适合自己项目需求的方案。

## 1 自签名证书

自签名证书是由服务器自行生成的证书，不依赖任何第三方证书颁发机构 (CA)。由于没有权威机构认证，浏览器会认为它不受信任，只适合测试或内网环境使用。以下介绍两种生成自签名证书的方法：

### 1.1 使用 Mkcert 生成本地信任的证书

mkcert 是一个简单的零配置工具，专门用于生成本地开发环境可信的证书。相比 OpenSSL，它的使用更加简单，且生成的证书会被系统和浏览器自动信任。

#### 1.1.1 安装 Mkcert

1. Windows 系统可以使用 Chocolatey 安装：

   ```bash
   choco install mkcert
   ```

2. 或使用 Scoop 安装：

   ```bash
   scoop install mkcert
   ```

#### 1.1.2 使用步骤

1. 安装本地 CA：

   ```bash
   mkcert -install
   ```

   这一步会在系统和浏览器中安装本地 CA 根证书。

2. 生成证书：

   场景一：仅本地开发（推荐新手使用）

   ```bash
   # 生成本地开发证书（默认生成 localhost.pem 和 localhost-key.pem）
   mkcert localhost 127.0.0.1 ::1

   # 或指定证书文件名
   mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1
   ```

   - 无需配置 hosts 文件
   - 可通过以下方式访问：
     - IPv4: https://127.0.0.1
     - IPv6: https://[::1]
     - 域名: https://localhost
   - 适合单服务的简单开发场景

   场景二：模拟域名（适合复杂项目）

   ```bash
   # 生成带域名的证书（默认生成 example.com.pem 和 example.com-key.pem）
   mkcert example.com "*.example.com" localhost 127.0.0.1 ::1

   # 或指定证书文件名
   mkcert -key-file domain-key.pem -cert-file domain.pem example.com "*.example.com" localhost 127.0.0.1 ::1
   ```

   - 需要配置 hosts 文件（Windows 位置：C:\Windows\System32\drivers\etc\hosts）：

     ```
     127.0.0.1  example.com
     127.0.0.1  api.example.com  # 如果需要子域名
     127.0.0.1  admin.example.com
     ```

   - 适用场景：
     - 需要测试跨域（CORS）场景
     - 多服务之间的通信
     - 需要模拟生产环境的域名配置

3. 使用生成的证书：
   - 证书文件会生成在当前目录下
   - 每次生成会产生两个文件：
     - 证书文件（.pem）：用于配置服务器的证书
     - 私钥文件（-key.pem）：用于配置服务器的私钥
   - 在开发服务器配置中使用这两个文件

#### 1.1.3 Mkcert 的优势

- 操作简单，无需记忆复杂的 OpenSSL 命令
- 生成的证书被系统和浏览器自动信任，无需手动添加例外
- 支持多域名证书生成
- 跨平台支持（Windows、macOS、Linux）
- 适合本地开发和测试环境

### 1.2 使用 OpenSSL 生成自签名证书

对于需要更多控制或在不方便安装 mkcert 的环境中，可以直接使用 OpenSSL 生成自签名证书。

#### 1.2.1 安装 OpenSSL

- Linux/macOS 通常自带 OpenSSL
- Windows 用户可以到 [OpenSSL 官网](https://www.openssl.org) 下载

#### 1.2.2 生成步骤

1. 生成私钥和证书签发请求 (CSR)：

   ```bash
   openssl req -new -newkey rsa:2048 -nodes -keyout server.key -out server.csr
   ```

   在生成过程中会提示填写一些信息，例如国家、组织名称等。此步骤生成的 `server.key` 是服务器私钥，`server.csr` 是证书签发请求。

2. 使用私钥签署自签名证书：

   ```bash
   openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
   ```

   上述命令生成有效期为 365 天的自签名证书 `server.crt`。

3. 配置服务器使用证书和私钥。例如，若使用 Nginx，可在配置文件中指定：

   ```nginx
   server {
       listen 443 ssl;
       ssl_certificate /path/to/server.crt;
       ssl_certificate_key /path/to/server.key;
       # 其他配置...
   }
   ```

### 1.3 自签名证书的优缺点与适用场景

**优点**：

- 生成简单、快捷，适合本地开发和测试
- 不需要依赖第三方证书颁发机构 (CA)
- 使用 mkcert 时可获得更好的本地开发体验

**缺点**：

- 无法在生产环境使用，因为浏览器默认不信任
- 使用 OpenSSL 生成的证书需要手动信任，影响用户体验
- 不适合公开的互联网应用，因其无法提供可信的身份认证

**适用场景**：

- 本地开发环境（推荐使用 mkcert）
- 内部测试环境
- 临时测试 HTTPS 功能

## 2 Let's Encrypt 免费证书

[Let's Encrypt](https://letsencrypt.org/) 是一个免费、开放的证书颁发机构。它提供的 SSL 证书受大多数浏览器信任，非常适合小型网站和个人项目。

### 2.1 特点

- **免费**：无需支付费用，自动续期。
- **自动化**：支持使用 Certbot 等工具自动生成和更新证书。
- **可信**：被大部分主流浏览器信任。

### 2.2 适用场景

- 小型个人项目
- 免费部署 HTTPS 的网站
- 资源有限的开发者和小型企业

## 3 商用证书颁发机构 (CA) 证书

商用证书颁发机构 (CA) 提供的 SSL 证书适用于生产环境，适合希望提升用户信任的中大型网站。

### 3.1 常见的 CA 机构

- **DigiCert**
- **GlobalSign**
- **Comodo**
- **Entrust**

### 3.2 特点

- **受信任**：商用 CA 提供的证书被所有主流浏览器信任。
- **证书类型丰富**：提供不同的验证级别和功能（例如，DV、OV、EV 证书）。
- **客户支持**：提供技术支持服务，适合对服务有保障需求的企业。

### 3.3 适用场景

- 商业化网站
- 需要品牌和信任背书的中大型网站
- 涉及敏感数据传输的场景

## 4 证书类型概览

| 证书类型      | 适用范围           | 信任级别 |
| ------------- | ------------------ | -------- |
| 自签名证书    | 开发测试、内网环境 | 不可信   |
| Let's Encrypt | 个人项目、小型网站 | 可信     |
| 商用 CA 证书  | 中大型商业网站     | 可信     |

## 5 总结

选择合适的 HTTPS 证书方案取决于具体需求。对于个人开发、测试可选自签名证书；对于一般网站可以选用 Let's Encrypt 免费证书；而企业和需要强信任背书的项目应选择商用 CA 证书。

HTTP 和 HTTPS 的差异也提醒我们在选择证书时要考虑安全需求。对于需要保护用户数据的网站，建议使用可信的证书方案，确保通信安全。
