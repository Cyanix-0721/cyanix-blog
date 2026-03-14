# Spring MVC Intecepter & Servlet Filter

## 1 概述

**Spring MVC 拦截器**和**Servlet Filter**都是用于处理请求的机制，但它们在工作原理、功能和适用场景上有显著的不同。以下是对两者的详细比较与说明。

## 2 Servlet Filter

### 2.1 定义

Servlet Filter 是 Java EE 规范的一部分，用于在请求到达 Servlet 之前或响应返回客户端之前对请求和响应进行处理。它通常用于实现一些通用功能，如日志记录、身份验证、请求修改、响应压缩等。

### 2.2 工作原理

- **请求处理流程**：
  1. 客户端发送请求到服务器。
  2. 过滤器根据配置进行处理。
  3. 请求被转发到目标 Servlet。
  4. Servlet 处理请求并生成响应。
  5. 过滤器在响应返回客户端之前进行处理。

### 2.3 实现

实现 Filter 接口，并重写 `doFilter` 方法：

```java
import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

public class MyFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // 初始化逻辑
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        System.out.println("过滤请求: " + httpRequest.getRequestURI());
        
        // 继续请求处理
        chain.doFilter(request, response);
        
        System.out.println("过滤响应: " + httpRequest.getRequestURI());
    }

    @Override
    public void destroy() {
        // 清理资源
    }
}
```

### 2.4 配置

在 `web.xml` 中配置过滤器：

```xml
<filter>
    <filter-name>myFilter</filter-name>
    <filter-class>com.example.MyFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>myFilter</filter-name>
    <url-pattern>/api/*</url-pattern>
</filter-mapping>
```

## 3 Spring MVC 拦截器

### 3.1 定义

Spring MVC 拦截器是 Spring Framework 提供的一种功能，用于在控制器方法调用之前和之后执行一些处理逻辑。它更紧密地集成在 Spring MVC 的生命周期中，能够访问 Spring 的上下文。

### 3.2 工作原理

- **请求处理流程**：
  1. 客户端发送请求。
  2. 拦截器的 `preHandle` 方法被调用。
  3. 请求被处理到控制器方法。
  4. 拦截器的 `postHandle` 方法被调用。
  5. 响应返回客户端，拦截器的 `afterCompletion` 方法被调用。

### 3.3 实现

实现 `HandlerInterceptor` 接口，并重写相应的方法：

```java
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class MyInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("请求到达前的处理逻辑...");
        return true; // 返回 true 继续处理，false 阻止请求
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        System.out.println("请求处理后的逻辑...");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        System.out.println("请求完成后的逻辑...");
    }
}
```

### 3.4 配置

在 Spring 的配置类中注册拦截器：

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private MyInterceptor myInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(myInterceptor).addPathPatterns("/api/**");
    }
}
```

## 4 主要区别

| 特性               | Servlet Filter                           | Spring MVC 拦截器                     |
|------------------|--------------------------------------|-------------------------------------|
| 定义               | Servlet 规范的一部分                     | Spring MVC 特有                        |
| 工作范围           | 可用于所有 Servlet                      | 主要用于处理 Spring MVC 控制器请求         |
| 生命周期           | 由 Servlet 容器管理                      | 由 Spring 管理                         |
| 访问上下文         | 不能直接访问 Spring 的上下文             | 可以访问 Spring 的上下文               |
| 方法               | `doFilter()`                           | `preHandle()`, `postHandle()`, `afterCompletion()` |
| 配置方式           | 在 `web.xml` 中配置                     | 在 Java 配置类中通过 `WebMvcConfigurer` 配置 |

## 5 使用场景

- **Servlet Filter** 适合于跨多个 Servlet 处理的通用逻辑，如安全性检查、请求日志等。
- **Spring MVC 拦截器** 更适用于处理与控制器相关的逻辑，如权限验证、请求计时等。
