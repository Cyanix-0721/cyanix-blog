---
tags: 
title: WebClient
date created: 2024-10-09 06:42:23
date modified: 2026-03-14 09:35:38
date: 2026-03-15 02:52:39
---

# WebClient

WebClient 是 Spring WebFlux 提供的强大且灵活的 HTTP 客户端，支持同步、异步和响应式编程模型。通过自定义构建、请求过滤器、错误处理和安全认证等功能，可以满足大多数应用场景的需求。在编写高并发、低延迟的应用时，WebClient 的非阻塞特性将大大提高性能和可扩展性。

## 1 引入依赖

在使用 WebClient 前，需要确保项目中引入了相关依赖。如果是 Spring Boot 项目，可以在 `pom.xml` 中添加以下依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

## 2 创建 WebClient 实例

WebClient 的实例可以通过以下几种方式创建：

### 2.1 直接创建默认实例

```java
WebClient client = WebClient.create();
```

### 2.2 使用指定的 Base URL 创建实例

```java
WebClient client = WebClient.create("https://api.example.com");
```

### 2.3 使用 `WebClient.Builder` 进行自定义配置

```java
WebClient client = WebClient.builder()
    .baseUrl("https://api.example.com")
    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
    .build();
```

## 3 发送 HTTP 请求

WebClient 支持多种 HTTP 方法（如 GET、POST、PUT、DELETE 等），下面是一些常用的请求方法：

### 3.1 GET 请求

```java
String response = client.get()
    .uri("/resource/{id}", 1)
    .retrieve()  // 发起请求并接收响应
    .bodyToMono(String.class)  // 将响应体转换为指定类型
    .block();  // 同步等待结果
```

### 3.2 POST 请求

```java
String response = client.post()
    .uri("/resource")
    .bodyValue(new ResourceObject())  // 设置请求体
    .retrieve()
    .bodyToMono(String.class)
    .block();
```

### 3.3 PUT 请求

```java
client.put()
    .uri("/resource/{id}", 1)
    .bodyValue(new ResourceObject())
    .retrieve()
    .bodyToMono(Void.class)
    .block();
```

### 3.4 DELETE 请求

```java
client.delete()
    .uri("/resource/{id}", 1)
    .retrieve()
    .bodyToMono(Void.class)
    .block();
```

## 4 异步调用与响应式编程

WebClient 支持响应式编程模型，可以避免同步阻塞操作。常用的方法有 `Mono` 和 `Flux`，用于处理单一值或流式数据。

### 4.1 异步调用示例

```java
client.get()
    .uri("/resource/{id}", 1)
    .retrieve()
    .bodyToMono(String.class)
    .subscribe(response -> {
        // 处理响应数据
        System.out.println(response);
    });
```

### 4.2 使用 `Flux` 处理流式数据

```java
client.get()
    .uri("/stream")
    .retrieve()
    .bodyToFlux(String.class)
    .subscribe(System.out::println);
```

## 5 错误处理

WebClient 提供了多种错误处理机制，以下是几种常用的方法：

### 5.1 使用 `onStatus` 处理 HTTP 错误状态码

```java
client.get()
    .uri("/resource/{id}", 1)
    .retrieve()
    .onStatus(HttpStatus::is4xxClientError, response -> 
        Mono.error(new RuntimeException("Client Error"))
    )
    .onStatus(HttpStatus::is5xxServerError, response -> 
        Mono.error(new RuntimeException("Server Error"))
    )
    .bodyToMono(String.class)
    .block();
```

### 5.2 全局异常处理

可以使用 `doOnError` 来处理请求过程中出现的异常：

```java
client.get()
    .uri("/resource/{id}", 1)
    .retrieve()
    .bodyToMono(String.class)
    .doOnError(error -> {
        System.out.println("Error occurred: " + error.getMessage());
    })
    .block();
```

## 6 超时设置

通过 `exchange` 方法可以更灵活地控制请求，比如设置超时：

```java
WebClient client = WebClient.builder()
    .baseUrl("https://api.example.com")
    .clientConnector(new ReactorClientHttpConnector(
        HttpClient.create().responseTimeout(Duration.ofSeconds(5))
    ))
    .build();
```

## 7 使用 Exchange 处理请求与响应

`retrieve()` 是最常用的方法，但如果需要更灵活地访问请求和响应，可以使用 `exchange()`：

```java
client.get()
    .uri("/resource/{id}", 1)
    .exchange()
    .flatMap(response -> {
        if (response.statusCode().is2xxSuccessful()) {
            return response.bodyToMono(String.class);
        } else {
            return Mono.error(new RuntimeException("Error occurred"));
        }
    })
    .block();
```

## 8 添加过滤器

通过 `WebClient.Builder` 可以为 WebClient 添加过滤器，用于在每次请求前后执行特定操作，例如添加日志或修改请求头：

```java
WebClient client = WebClient.builder()
    .filter((request, next) -> {
        System.out.println("Request: " + request.url());
        return next.exchange(request);
    })
    .build();
```

## 9 认证与安全

### 9.1 Basic 认证

```java
WebClient client = WebClient.builder()
    .baseUrl("https://api.example.com")
    .defaultHeaders(headers -> headers.setBasicAuth("user", "password"))
    .build();
```

### 9.2 Bearer Token 认证

```java
WebClient client = WebClient.builder()
    .baseUrl("https://api.example.com")
    .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token)
    .build();
```
