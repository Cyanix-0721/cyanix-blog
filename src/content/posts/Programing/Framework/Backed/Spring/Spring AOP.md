---
tags:
  - SpringBoot
  - AOP
---

# Spring AOP

## 1 AOP 概念

面向切面编程（Aspect-Oriented Programming, AOP）是一种编程范式，旨在通过分离关注点（如日志记录、安全性、事务管理等）来增强代码的可重用性和可维护性。AOP 允许开发者在不修改原始代码的情况下，为现有代码添加新的行为。

## 2 Spring AOP 组件

- **切面（Aspect）**：切面是 AOP 的核心概念，它是一个模块，包含切点和通知的定义，用于定义横切关注点。

- **切点（Pointcut）**：切点是一个表达式，定义了在哪些连接点（如方法调用）上应用通知。可以使用表达式语言（如 AspectJ 表达式）来精确控制切点的范围和执行时机。例如，可以指定某个包下的所有方法，或者特定名称的方法。使用 `@Pointcut` 注解可以定义一个可复用的切点，以便在多个通知中引用，避免重复代码。

- **通知（Advice）**：通知是切面中定义的在切点处执行的代码，主要有以下几种类型：
  - **前置通知（Before）**：在目标方法执行之前执行。
  - **后置通知（After）**：在目标方法执行之后执行（无论方法是否成功）。
  - **返回通知（After Returning）**：在目标方法成功执行后执行。
  - **异常通知（After Throwing）**：在目标方法抛出异常后执行。
  - **环绕通知（Around）**：在目标方法执行前后都可以执行，能够控制目标方法的执行。

- **连接点（Joinpoint）**：连接点是程序执行的特定点，通常是方法调用。AOP 框架会在连接点上执行通知。连接点可以是方法调用、异常抛出等，具体取决于定义的切点。

- **目标对象（Target Object）**：目标对象是被切面增强的对象。通常是一个 Spring 管理的 bean，AOP 会在目标对象的方法执行前后插入通知逻辑。目标对象可以是任何被 Spring 管理的 bean，切面将对其进行增强。

## 3 引入依赖

在你的 `pom.xml` 中添加 Spring AOP 依赖：

> [!info]
>
> AOP 已包含于 `spring-boot-starter`

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

## 4 创建切面

创建一个切面类，定义切点和通知：

```java
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceMethods() {
        // 切点定义
    }

    // 前置通知
    @Before("serviceMethods()")
    public void logBeforeMethod() {
        System.out.println("方法执行前的日志记录…");
    }

    // 后置通知
    @After("serviceMethods()")
    public void logAfterMethod() {
        System.out.println("方法执行后的日志记录…");
    }

    // 返回通知
    @AfterReturning(pointcut = "serviceMethods()", returning = "result")
    public void logAfterReturning(Object result) {
        System.out.println("方法返回值: " + result);
    }

    // 异常通知
    @AfterThrowing(pointcut = "serviceMethods()", throwing = "ex")
    public void logAfterThrowing(Exception ex) {
        System.out.println("方法抛出异常: " + ex.getMessage());
    }

    // 环绕通知
    @Around("serviceMethods()")
    public Object logAroundMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        System.out.println("方法执行前…");
        Object result = joinPoint.proceed(); // 执行目标方法
        System.out.println("方法执行后…");
        return result;
    }
}
```

## 5 使用切面

在你的服务类中，定义一些方法以供切面增强：

```java
import org.springframework.stereotype.Service;

@Service
public class MyService {

    public String performTask() {
        System.out.println("执行任务…");
        return "任务完成";
    }

    public void throwException() {
        throw new RuntimeException("这是一个异常");
    }
}
```

## 6 测试切面

在主应用类或测试类中调用服务方法：

```java
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AppRunner implements CommandLineRunner {

    private final MyService myService;

    public AppRunner(MyService myService) {
        this.myService = myService;
    }

    @Override
    public void run(String… args) {
        myService.performTask();
        try {
            myService.throwException();
        } catch (Exception e) {
            // 捕获异常以避免程序终止
        }
    }
}
```
