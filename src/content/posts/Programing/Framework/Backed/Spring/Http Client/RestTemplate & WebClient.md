---
tags:
  - SpringBoot
  - RestTemplate
  - WebClient
---

# RestTemplate & WebClient

## 1 RestTemplate

RestTemplate 是 Spring Framework 提供的同步 HTTP 客户端，用于执行 HTTP 请求。

### 1.1 基本用法

```java
RestTemplate restTemplate = new RestTemplate();
String url = "https://api.example.com/users";
User user = restTemplate.getForObject(url, User.class);
```

### 1.2 主要方法

- `getForObject()`: GET 请求并将响应转换为对象
- `postForObject()`: POST 请求并将响应转换为对象
- `put()`: 发送 PUT 请求
- `delete()`: 发送 DELETE 请求

### 1.3 优点

- 简单易用
- 同步操作，易于理解
- 适合简单的 HTTP 请求

### 1.4 缺点

- 阻塞式 API，可能影响性能
- 不支持响应式编程

## 2 WebClient

WebClient 是 Spring WebFlux 提供的非阻塞、响应式 HTTP 客户端。

### 2.1 基本用法

```java
WebClient webClient = WebClient.create();
Mono<User> userMono = webClient.get()
                               .uri("https://api.example.com/users")
                               .retrieve()
                               .bodyToMono(User.class);
```

### 2.2 主要方法

- `get()`, `post()`, `put()`, `delete()`: 指定 HTTP 方法
- `uri()`: 设置请求 URL
- `retrieve()`: 执行请求并获取响应
- `bodyToMono()`, `bodyToFlux()`: 将响应体转换为 Mono 或 Flux

### 2.3 优点

- 非阻塞式 API，提高性能
- 支持响应式编程
- 灵活的请求/响应操作

### 2.4 缺点

- 学习曲线较陡
- 需要对响应式编程有一定了解

## 3 RestTemplate 和 WebClient 的主要区别

1. **编程模型**:
   - RestTemplate: 同步、阻塞式
   - WebClient: 异步、非阻塞式

2. **性能**:
   - RestTemplate: 适用于低并发场景
   - WebClient: 适用于高并发场景，性能更好

3. **灵活性**:
   - RestTemplate: API 相对简单，但功能较固定
   - WebClient: API 更灵活，支持更复杂的请求/响应处理

4. **响应式支持**:
   - RestTemplate: 不支持响应式编程
   - WebClient: 完全支持响应式编程，与 Project Reactor 集成

5. **Spring 版本**:
   - RestTemplate: Spring 3.0 引入，在 Spring 5.0 后被标记为过时（但仍然可用）
   - WebClient: Spring 5.0 引入，是未来发展方向

## 4 选择建议

- 对于简单的、低并发的应用，RestTemplate 仍然是一个好选择。
- 对于新项目，特别是需要处理高并发或使用响应式编程的项目，推荐使用 WebClient。
- 如果你的项目使用 Spring WebFlux，WebClient 是自然的选择。

总的来说，WebClient 代表了 Spring 中 HTTP 客户端的未来发展方向，具有更好的性能和更大的灵活性。但是，对于简单的应用程序，RestTemplate 仍然是一个有效的选择。
