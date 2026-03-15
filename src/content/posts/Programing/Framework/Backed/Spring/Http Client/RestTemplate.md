---
tags: 
title: RestTemplate
date created: 2024-10-09 06:44:08
date modified: 2026-03-14 09:35:38
date: 2026-03-15 02:52:39
---

# RestTemplate

`RestTemplate` 是 Spring 提供的用于同步 HTTP 请求的客户端，主要用于与 RESTful 服务进行通信。虽然 Spring 官方建议新项目使用响应式的 `WebClient`，但 `RestTemplate` 在许多场景下依然很常用，尤其是在需要简单同步 HTTP 请求的场景中。

以下是 `RestTemplate` 的详细使用文档，涵盖创建、配置、常见 HTTP 方法的调用和错误处理。

## 1 引入依赖

如果项目使用 Spring Boot，并且没有明确引入 `RestTemplate`，可以通过以下依赖来启用：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

## 2 创建 RestTemplate 实例

### 2.1 直接创建实例

```java
RestTemplate restTemplate = new RestTemplate();
```

### 2.2 在 Spring Boot 项目中，通过配置类创建 `RestTemplate` Bean

在配置类中使用 `@Bean` 注解创建 `RestTemplate` 实例，以便在整个应用中注入和复用。

```java
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

## 3 发送 HTTP 请求

`RestTemplate` 支持多种 HTTP 方法（如 GET、POST、PUT、DELETE 等）。下面是常见的 HTTP 请求方法的使用示例。

### 3.1 GET 请求

通过 `RestTemplate` 发送 GET 请求，可以接收响应体并转换为指定的类型。

```java
String url = "https://api.example.com/resource/{id}";
Map<String, String> uriVariables = new HashMap<>();
uriVariables.put("id", "1");

String response = restTemplate.getForObject(url, String.class, uriVariables);
```

### 3.2 POST 请求

发送 POST 请求时，通常需要包含请求体。

```java
String url = "https://api.example.com/resource";
ResourceObject requestObject = new ResourceObject();

ResourceObject response = restTemplate.postForObject(url, requestObject, ResourceObject.class);
```

### 3.3 PUT 请求

PUT 请求通常用于更新资源。

```java
String url = "https://api.example.com/resource/{id}";
ResourceObject updateObject = new ResourceObject();
Map<String, String> uriVariables = new HashMap<>();
uriVariables.put("id", "1");

restTemplate.put(url, updateObject, uriVariables);
```

### 3.4 DELETE 请求

可以通过 `RestTemplate` 发送 DELETE 请求删除资源。

```java
String url = "https://api.example.com/resource/{id}";
Map<String, String> uriVariables = new HashMap<>();
uriVariables.put("id", "1");

restTemplate.delete(url, uriVariables);
```

## 4 发送带有参数的请求

通过 URI 变量或请求参数传递参数：

### 4.1 使用 URI 变量

```java
String url = "https://api.example.com/resource/{id}";
String response = restTemplate.getForObject(url, String.class, 1);
```

### 4.2 使用查询参数

```java
String url = "https://api.example.com/resource?id={id}";
String response = restTemplate.getForObject(url, String.class, 1);
```

## 5 自定义请求头

可以通过 `HttpHeaders` 自定义请求头并发送请求。

```java
String url = "https://api.example.com/resource";
HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_JSON);

HttpEntity<ResourceObject> requestEntity = new HttpEntity<>(new ResourceObject(), headers);
ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

String response = responseEntity.getBody();
```

## 6 异常处理

当 `RestTemplate` 遇到 HTTP 错误时，会抛出 `RestClientException`，包括 `HttpClientErrorException` 和 `HttpServerErrorException`。可以通过捕获这些异常来处理错误。

```java
try {
    String url = "https://api.example.com/resource/{id}";
    String response = restTemplate.getForObject(url, String.class, 1);
} catch (HttpClientErrorException e) {
    System.out.println("Client error: " + e.getStatusCode());
} catch (HttpServerErrorException e) {
    System.out.println("Server error: " + e.getStatusCode());
} catch (RestClientException e) {
    System.out.println("Other error: " + e.getMessage());
}
```

## 7 使用 RestTemplate 发送文件和接收文件

### 7.1 上传文件

通过 `RestTemplate` 可以发送 `Multipart` 请求上传文件：

```java
String url = "https://api.example.com/upload";
MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
body.add("file", new FileSystemResource(new File("/path/to/file.txt")));

HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.MULTIPART_FORM_DATA);

HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
```

### 7.2 下载文件

通过 `RestTemplate` 可以下载文件，并保存到本地。

```java
String url = "https://api.example.com/download/file.txt";
ResponseEntity<byte[]> response = restTemplate.getForEntity(url, byte[].class);

if (response.getStatusCode() == HttpStatus.OK) {
    Files.write(Paths.get("/path/to/save/file.txt"), response.getBody());
}
```

## 8 超时设置

可以通过自定义 `RequestFactory` 为 `RestTemplate` 设置超时：

```java
RestTemplate restTemplate = new RestTemplate();
SimpleClientHttpRequestFactory factory = (SimpleClientHttpRequestFactory) restTemplate.getRequestFactory();
factory.setConnectTimeout(5000);  // 连接超时 5 秒
factory.setReadTimeout(5000);  // 读取超时 5 秒
```

## 9 添加拦截器

可以为 `RestTemplate` 添加请求拦截器，用于请求之前或响应之后执行特定操作：

```java
RestTemplate restTemplate = new RestTemplate();
restTemplate.getInterceptors().add((request, body, execution) -> {
    System.out.println("Request: " + request.getURI());
    return execution.execute(request, body);
});
```

## 10 REST API 安全性

### 10.1 Basic 认证

可以通过 `HttpHeaders` 来设置 `Basic` 认证的请求头：

```java
HttpHeaders headers = new HttpHeaders();
headers.setBasicAuth("user", "password");
HttpEntity<String> entity = new HttpEntity<>(headers);

ResponseEntity<String> response = restTemplate.exchange(
    "https://api.example.com/resource", 
    HttpMethod.GET, 
    entity, 
    String.class
);
```

### 10.2 Bearer Token 认证

使用 `Bearer` Token 进行认证时，可以通过设置 `Authorization` 请求头：

```java
HttpHeaders headers = new HttpHeaders();
headers.setBearerAuth("your_token");
HttpEntity<String> entity = new HttpEntity<>(headers);

ResponseEntity<String> response = restTemplate.exchange(
    "https://api.example.com/resource", 
    HttpMethod.GET, 
    entity, 
    String.class
);
```

## 11 RestTemplate 与 WebClient 的比较

| Feature              | RestTemplate         | WebClient             |
|----------------------|----------------------|-----------------------|
| 异步请求支持          | 不支持                | 支持                  |
| 响应式编程            | 不支持                | 支持                  |
| 阻塞式调用            | 支持                  | 支持（可选择异步）    |
| 轻量级使用            | 较为轻量，简单同步调用 | 更复杂，支持响应式    |
| 官方推荐              | 逐渐被淘汰            | 推荐用于新项目        |

## 12 小结

`RestTemplate` 是 Spring 经典的 HTTP 同步请求工具，适用于简单的同步通信场景。它提供了对多种 HTTP 方法的良好支持，同时可以通过自定义请求头、拦截器、超时和错误处理等方式进行灵活配置。尽管 `RestTemplate` 在新项目中逐渐被 `WebClient` 取代，但它依然是许多遗留系统和简单场景中的一个非常有效的工具。
