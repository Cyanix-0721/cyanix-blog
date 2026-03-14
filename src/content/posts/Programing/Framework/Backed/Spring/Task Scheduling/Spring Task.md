---
tags:
  - SpringBoot
  - Cron
  - Framework
---

# Spring Task 使用指南

## 1 简介

Spring Task 是 Spring 提供的任务调度模块，用于在指定时间或间隔执行方法。它支持使用简单的时间间隔、固定延迟以及Cron表达式进行任务调度。

## 2 依赖配置

> [!ttip] Spring Task 依赖  
> `spring-context` 包含于 `spring-boot-starter`

在使用Spring Task之前，需要在项目中添加相关依赖。对于Maven项目，编辑 `pom.xml` 并添加以下依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

对于Gradle项目，编辑 `build.gradle` 并添加以下依赖：

```groovy
implementation 'org.springframework.boot:spring-boot-starter'
implementation 'org.springframework.boot:spring-boot-starter-web'
```

## 3 启用任务调度

在Spring Boot应用中，可以在主应用类或配置类上使用 `@EnableScheduling` 注解来启用任务调度功能。

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

## 4 使用@Scheduled注解

`@Scheduled` 注解用于定义任务调度的方法。它可以使用固定速率、固定延迟或Cron表达式来调度任务。

```java
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasks {

    // 每隔5秒执行一次
    @Scheduled(fixedRate = 5000)
    public void fixedRateTask() {
        System.out.println("Fixed rate task - " + System.currentTimeMillis() / 1000);
    }

    // 上次任务完成后5秒再执行
    @Scheduled(fixedDelay = 5000)
    public void fixedDelayTask() {
        System.out.println("Fixed delay task - " + System.currentTimeMillis() / 1000);
    }

    // 第一次延迟1秒后执行，之后每5秒执行一次
    @Scheduled(initialDelay = 1000, fixedRate = 5000)
    public void initialDelayTask() {
        System.out.println("Initial delay task - " + System.currentTimeMillis() / 1000);
    }

    // 使用Cron表达式调度
    @Scheduled(cron = "0 * * * * ?")
    public void cronTask() {
        System.out.println("Cron task - " + System.currentTimeMillis() / 1000);
    }
}
```

## 5 [[Cron|Cron 表达式]]

Cron表达式用于定义复杂的调度规则，格式如下：

```
second minute hour day-of-month month day-of-week
```

### 5.1 示例

- `0 0 * * * ?` 每小时整点执行
- `0 0 12 * * ?` 每天中午12点执行
- `0 0 12 * * MON-FRI` 每周一到周五的中午12点执行

## 6 配置任务调度线程池

默认情况下，Spring使用单线程执行所有任务。可以通过配置线程池来提高并发处理能力。

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
public class SchedulerConfig {

    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler taskScheduler = new ThreadPoolTaskScheduler();
        taskScheduler.setPoolSize(10);
        taskScheduler.setThreadNamePrefix("Scheduled-Task-");
        return taskScheduler;
    }
}
```

## 7 示例

### 7.1 定时执行数据库备份

```java
@Component
public class DatabaseBackupTask {

    @Scheduled(cron = "0 0 2 * * ?")
    public void backupDatabase() {
        System.out.println("Database backup started at - " + new Date());
        // 执行备份逻辑
    }
}
```

### 7.2 定期清理临时文件

```java
@Component
public class CleanupTask {

    @Scheduled(fixedRate = 86400000) // 每天执行一次
    public void cleanup() {
        System.out.println("Cleanup task started at - " + new Date());
        // 执行清理逻辑
    }
}
```

## 8 调试和日志

可以通过日志记录来调试和监控任务的执行情况。建议使用SLF4J和Logback记录日志。

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class LoggingTask {

    private static final Logger logger = LoggerFactory.getLogger(LoggingTask.class);

    @Scheduled(cron = "0 * * * * ?")
    public void logTask() {
        logger.info("Log task executed at - {}", new Date());
    }
}
```

## 9 常见问题

### 9.1 为什么我的@Scheduled方法没有执行？

1. **确保使用了 `@EnableScheduling` 注解**: 确保在配置类或主应用类上使用了 `@EnableScheduling` 注解。
2. **方法签名**: 确保 `@Scheduled` 注解的方法是 `public` 且没有参数。
3. **Cron表达式错误**: 检查Cron表达式是否正确。

### 9.2 如何避免任务重叠执行？

可以使用分布式锁或数据库锁来避免任务重叠执行。也可以配置任务调度线程池，确保足够的线程资源。
