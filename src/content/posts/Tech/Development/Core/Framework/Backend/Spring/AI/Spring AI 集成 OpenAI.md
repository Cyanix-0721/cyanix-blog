---
tags: []
title: Spring AI
aliases: Spring AI
date created: 2024-10-16 01:16:20
date modified: 2026-03-27 07:11:18
---

# [Spring AI](https://docs.spring.io/spring-ai/reference/getting-started.html)

## 1 添加依赖

在 `pom.xml` 中添加 Spring AI 及相关依赖：

```xml
<!-- Spring AI OpenAI Spring Boot 起步依赖 -->  
<dependency>  
    <groupId>org.springframework.ai</groupId>  
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>  
</dependency>
```

## 2 配置属性

在 `application.properties` 或 `application.yml` 中配置大模型 API 的基本信息，例如：

```properties
spring.ai.model.base-url=https://api.example.com/v1/chat/completions
spring.ai.model.apikey=YOUR_API_KEY
```

## 3 创建服务类

创建一个服务类，负责与大模型 API 进行交互：

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

@Service
public class ModelService {
    
    @Value("${spring.ai.model.base-url}")
    private String baseUrl;

    @Value("${spring.ai.model.apikey}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public ModelService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String callModel(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Content-Type", "application/json");

        String requestBody = String.format("{\"prompt\":\"%s\",\"max_tokens\":100}", prompt);

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(baseUrl, HttpMethod.POST, entity, String.class);
        return response.getBody();
    }
}
```

## 4 定义请求体

在服务类中构建请求体，确保符合 API 文档的要求。

## 5 处理响应

解析 API 返回的响应，提取需要的信息：

```java
public String parseResponse(String responseBody) {
    // 使用 JSON 解析库提取内容
}
```

## 6 创建控制器

创建一个控制器，暴露 RESTful 接口：

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/model")
public class ModelController {
    
    private final ModelService modelService;

    public ModelController(ModelService modelService) {
        this.modelService = modelService;
    }

    @PostMapping("/generate")
    public String generateResponse(@RequestBody String prompt) {
        return modelService.callModel(prompt);
    }
}
```
