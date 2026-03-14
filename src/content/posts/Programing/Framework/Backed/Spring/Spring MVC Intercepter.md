---
tags:
  - SpringBoot
  - Interceptor
---

# Spring MVC Intercepter

## 1 拦截器概述

拦截器（Interceptor）是 Spring 中用于处理请求的机制之一。它可以在请求到达控制器（Controller）之前或在响应返回给客户端之前执行一些预处理或后处理操作。拦截器在 Web 应用中常用于日志记录、身份验证、权限检查、性能监控等场景。

## 2 [[Spring MVC Intecepter & Servlet Filter|拦截器与过滤器的区别]]

- **拦截器** 是 Spring MVC 特有的，主要用于对控制器方法的请求进行处理。它可以访问 Spring 的上下文，并能够与 Spring MVC 的生命周期紧密结合。
  
- **过滤器** 是 Servlet 规范的一部分，工作在 Servlet 容器层面。过滤器对请求和响应进行处理，但不涉及 Spring 的特性，无法访问 Spring 的上下文。

## 3 拦截器的工作原理

拦截器通过实现 `HandlerInterceptor` 接口来定义拦截逻辑，Spring MVC 会在请求处理流程中调用这些拦截器。每个拦截器可以处理以下几个阶段：

- **preHandle**：在控制器方法调用之前执行，用于处理请求前的逻辑。
- **postHandle**：在控制器方法调用之后执行，用于处理请求后的逻辑。
- **afterCompletion**：在请求处理完成后（视图渲染之后）执行，用于清理资源等操作。

## 4 创建拦截器

### 4.1 实现 HandlerInterceptor 接口

首先，创建一个实现 `HandlerInterceptor` 接口的类：

```java
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class MyInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("请求到达前的处理逻辑…");
        return true; // 返回 true 继续请求处理，返回 false 阻止请求
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        System.out.println("请求处理后的逻辑…");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        System.out.println("请求完成后的逻辑…");
    }
}
```

### 4.2 注册拦截器

拦截器需要在 Spring MVC 配置中注册，可以通过实现 `WebMvcConfigurer` 接口来添加拦截器：

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
        registry.addInterceptor(myInterceptor)
                .addPathPatterns("/api/**") // 指定拦截的路径
                .excludePathPatterns("/api/public/**"); // 排除不拦截的路径
    }
}
```

## 5 拦截器的执行顺序

如果注册了多个拦截器，它们的执行顺序如下：

1. **preHandle** 方法按注册顺序执行。
2. 控制器方法执行。
3. **postHandle** 方法按注册顺序执行（从后向前）。
4. **afterCompletion** 方法按注册顺序执行（从后向前）。

## 6 使用场景

- **日志记录**：在请求到达前后记录请求信息。
- **身份验证**：检查用户身份信息，决定是否允许访问特定资源。
- **权限控制**：根据用户角色检查权限。
- **性能监控**：记录请求处理时间，分析性能瓶颈。
