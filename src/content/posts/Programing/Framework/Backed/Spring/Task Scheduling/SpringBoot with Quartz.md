# Quartz

## 1 引入依赖

在你的 `pom.xml` 文件中添加 Quartz 依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-quartz</artifactId>
</dependency>
```

## 2 创建任务类

创建一个实现 `Job` 接口的任务类：

```java
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

public class MyJob implements Job {
    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        System.out.println("执行任务：" + System.currentTimeMillis());
    }
}
```

## 3 配置调度器

在配置类中配置 Quartz 的调度器：

```java
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.ScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.quartz.CronScheduleBuilder;

@Configuration
public class QuartzConfig {

    @Bean
    public JobDetail myJobDetail() {
        return JobBuilder.newJob(MyJob.class)
                .withIdentity("myJob")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger myJobTrigger() {
        ScheduleBuilder<?> scheduleBuilder = CronScheduleBuilder.cronSchedule("0/5 * * * * ?"); // 每5秒执行一次
        return TriggerBuilder.newTrigger()
                .forJob(myJobDetail())
                .withIdentity("myJobTrigger")
                .withSchedule(scheduleBuilder)
                .build();
    }
}
```

## 4 启动应用

确保 Spring Boot 应用正常启动，Quartz 将自动调度任务。

## 5 测试任务

在控制台中，你应该能看到每5秒打印一次当前时间的输出，表示任务正在执行。

## 6 配置属性（可选）

可以在 `application.properties` 中配置 Quartz 的相关属性：

```properties
spring.quartz.job-store-type=memory
spring.quartz.properties.org.quartz.scheduler.instanceName=MyScheduler
spring.quartz.properties.org.quartz.scheduler.instanceId=AUTO
```
