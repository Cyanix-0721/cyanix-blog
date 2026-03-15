---
tags: [Project, Thread, TimeFormat, Jackson, JSON, AOP, Mybatis-Plus, MyBatis, OSS, Wechat, Login, Map, SpringTask, Cron, WebSocket, Apache, ApacheECharts, ApachePOI]
title: Sky-take-out
aliases: Sky-take-out
date created: 2024-08-15 04:19:28
date modified: 2026-03-14 09:35:23
date: 2026-03-15 02:52:39
---

# Sky-take-out

SSM+SpringBoot+Mybatis-Plus+Redis+WebSocket+OSS

记录开发过程中在以往没有使用过的情况

## 1 `ThreadLocal`

`ThreadLocal` 是 Java 中的一个特殊类，用于创建线程局部变量。每个线程都可以独立地改变其副本而不影响其他线程的副本，这对于线程安全性和资源管理非常有用。

### 1.1 使用场景

1. **独立的线程上下文**：当你有多个线程运行相同的代码，但每个线程需要独立的变量状态时，`ThreadLocal` 是理想的选择。例如，用户会话管理、数据库连接和事务管理等场景。
   
2. **避免同步**：`ThreadLocal` 可以避免多个线程访问相同变量时的同步开销，因为每个线程都有自己独立的变量副本。

### 1.2 示例代码

```java
public class ThreadLocalExample {

    private static ThreadLocal<Integer> threadLocal = ThreadLocal.withInitial(() -> 1);

    public static void main(String[] args) {
        Runnable task = () -> {
            int value = threadLocal.get();
            System.out.println(Thread.currentThread().getName() + " initial value: " + value);
            threadLocal.set(value + 1);
            System.out.println(Thread.currentThread().getName() + " new value: " + threadLocal.get());
        };

        Thread thread1 = new Thread(task, "Thread-1");
        Thread thread2 = new Thread(task, "Thread-2");
        thread1.start();
        thread2.start();
    }
}
```

### 1.3 注意事项

1. **内存泄漏**：`ThreadLocal` 可能会导致内存泄漏，特别是在使用线程池的情况下，因为线程池中的线程会被重用。如果 `ThreadLocal` 对象在任务完成后没有被清理，那么这个线程持有的对象引用可能不会被垃圾回收，导致内存泄漏。

2. **正确清理**：使用完 `ThreadLocal` 后，建议调用 `remove()` 方法清理，避免内存泄漏。

	```java
	threadLocal.remove();
	```

3. **不要滥用**：`ThreadLocal` 不应被滥用，不应将其用作全局变量或跨越多个线程间的通信。它仅应被用作在单个线程中共享数据的工具。  

### 1.4 应用示例

`ThreadLocal` 封装成 `BaseContext`

```java
/**  
 * BaseContext 类用于管理当前线程的上下文信息。  
 * 它提供了一种在同一个线程内共享数据的方法，尤其适用于那些需要跨方法调用的场景，  
 * 保证了数据在线程内的封闭性和安全性。  
 */  
package com.sky.context;  
  
public class BaseContext {  
  
    /**  
     * 使用 ThreadLocal 存储当前线程的上下文ID。  
     * ThreadLocal 为每个线程提供了一个独立的变量副本，确保了变量在不同线程之间的隔离性。  
     */  
    public static ThreadLocal<Long> threadLocal = new ThreadLocal<>();  
  
    /**  
     * 获取当前线程的上下文ID。  
     *  
     * @return 当前线程的上下文ID，如果未设置则返回null。  
     */  
    public static Long getCurrentId() {  
       return threadLocal.get();  
    }  
  
    /**  
     * 设置当前线程的上下文ID。  
     *  
     * @param id 要设置的上下文ID。  
     */  
    public static void setCurrentId(Long id) {  
       threadLocal.set(id);  
    }  
  
    /**  
     * 移除当前线程的上下文ID。  
     * 这个方法通常在不再需要上下文信息或者线程即将结束时调用，以避免内存泄漏。  
     */  
    public static void removeCurrentId() {  
       threadLocal.remove();  
    }  
  
}
```

拦截器读取 jwt 获取用户 id 存储到 `ThreadLocal`

```java
package com.sky.interceptor;  
  
import com.sky.constant.JwtClaimsConstant;  
import com.sky.context.BaseContext;  
import com.sky.properties.JwtProperties;  
import com.sky.utils.JwtUtil;  
import io.jsonwebtoken.Claims;  
import lombok.extern.slf4j.Slf4j;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.stereotype.Component;  
import org.springframework.web.method.HandlerMethod;  
import org.springframework.web.servlet.HandlerInterceptor;  
  
import javax.servlet.http.HttpServletRequest;  
import javax.servlet.http.HttpServletResponse;  
  
/**  
 * jwt令牌校验的拦截器  
 */  
@Component  
@Slf4j  
public class JwtTokenAdminInterceptor implements HandlerInterceptor {  
  
    @Autowired  
    private JwtProperties jwtProperties;  
  
    /**  
     * 校验jwt  
     *     * @param request  HTTP请求对象  
     * @param response HTTP响应对象  
     * @param handler  处理器对象  
     * @return 如果令牌校验通过，返回true；否则返回false  
     * @throws Exception 如果发生异常  
     */  
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {  
       // 判断当前拦截到的是Controller的方法还是其他资源  
       if (!(handler instanceof HandlerMethod)) {  
          // 当前拦截到的不是动态方法，直接放行  
          return true;  
       }  
  
       // 1、从请求头中获取令牌  
       String token = request.getHeader(jwtProperties.getAdminTokenName());  
  
       // 2、校验令牌  
       try {  
          log.info("jwt校验: {}", token);  
          Claims claims = JwtUtil.parseJWT(jwtProperties.getAdminSecretKey(), token);  
          Long empId = Long.valueOf(claims.get(JwtClaimsConstant.EMP_ID).toString());  
          log.info("当前员工id: {}", empId);  
          // 3、用户id存储到ThreadLocal  
          BaseContext.setCurrentId(empId);  
          // 4、通过，放行  
          return true;  
       } catch (Exception ex) {  
          // 5、不通过，响应 401 状态码  
          response.setStatus(401);  
          return false;  
       }  
    }  
}
```

Service 读取 `ThreadLocal` 设置执行操作的用户 id

```java
/**  
 * 编辑员工信息  
 *  
 * @param employeeDTO 包含员工信息的数据传输对象  
 */  
public void update(EmployeeDTO employeeDTO) {  
    Employee employee = new Employee();  
    BeanUtils.copyProperties(employeeDTO, employee);  
  
    employee.setUpdateTime(LocalDateTime.now());  
    employee.setUpdateUser(BaseContext.getCurrentId());  
  
    employeeMapper.updateById(employee);  
}
```

## 2 时间格式化

> [!info] 本项目时间字段
> - 实体类使用 `LocalDateTime`
> - 数据库使用 `datetime`

### 2.1 属性字段 `@JsonFormat`

`@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")`

### 2.2 消息转换器

`WebMvcConfiguration` 或启动类

```java
/**  
 * 扩展Spring MVC框架的消息转化器  
 * <p>  
 * 该方法用于扩展Spring MVC框架的消息转换器列表，添加自定义的消息转换器。  
 *  
 * @param converters 消息转换器列表  
 */  
public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {  
    log.info("扩展消息转换器…");  
    // 创建一个消息转换器对象  
    MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();  
    // 需要为消息转换器设置一个对象转换器，对象转换器可以将Java对象序列化为json数据  
    converter.setObjectMapper(new JacksonObjectMapper());  
    // 将自己的消息转化器加入容器中  
    converters.add(0, converter);  
}
```

## 3 使用 Jackson 进行序列化/反序列化

`JacksonObjectMapper`

```java
package com.sky.json;  
  
import com.fasterxml.jackson.databind.DeserializationFeature;  
import com.fasterxml.jackson.databind.ObjectMapper;  
import com.fasterxml.jackson.databind.module.SimpleModule;  
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;  
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;  
import com.fasterxml.jackson.datatype.jsr310.deser.LocalTimeDeserializer;  
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;  
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;  
import com.fasterxml.jackson.datatype.jsr310.ser.LocalTimeSerializer;  
  
import java.time.LocalDate;  
import java.time.LocalDateTime;  
import java.time.LocalTime;  
import java.time.format.DateTimeFormatter;  
  
import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;  
  
/**  
 * 对象映射器:基于jackson将Java对象转为json，或者将json转为Java对象  
 * 将JSON解析为Java对象的过程称为 [从JSON反序列化Java对象]  
 * 从Java对象生成JSON的过程称为 [序列化Java对象到JSON]  
 */public class JacksonObjectMapper extends ObjectMapper {  
  
    public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";  
    //public static final String DEFAULT_DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";  
    public static final String DEFAULT_DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm";  
    public static final String DEFAULT_TIME_FORMAT = "HH:mm:ss";  
  
    public JacksonObjectMapper() {  
       super();  
       //收到未知属性时不报异常  
       this.configure(FAIL_ON_UNKNOWN_PROPERTIES, false);  
  
       //反序列化时，属性不存在的兼容处理  
       this.getDeserializationConfig().withoutFeatures(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);  
  
       SimpleModule simpleModule = new SimpleModule()  
             .addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_FORMAT)))  
             .addDeserializer(LocalDate.class, new LocalDateDeserializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_FORMAT)))  
             .addDeserializer(LocalTime.class, new LocalTimeDeserializer(DateTimeFormatter.ofPattern(DEFAULT_TIME_FORMAT)))  
             .addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_FORMAT)))  
             .addSerializer(LocalDate.class, new LocalDateSerializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_FORMAT)))  
             .addSerializer(LocalTime.class, new LocalTimeSerializer(DateTimeFormatter.ofPattern(DEFAULT_TIME_FORMAT)));  
  
       //注册功能模块 例如，可以添加自定义序列化器和反序列化器  
       this.registerModule(simpleModule);  
    }  
}
```

- 实体类 `implements Serializable` 后 ` private static final long serialVersionUID = 1L; `  
	- `serialVersionUID`: 用于 Java 序列化机制，确保在反序列化时类的版本一致。如果类的 `serialVersionUID` 与序列化数据中的 `serialVersionUID` 不匹配，会抛出 `InvalidClassException`

## 4 Api Docs

> [!tnote] [[Swagger & OpenAPI]] 语法差别

更改 [knife4j](https://github.com/xiaoymin/knife4j) 依赖为 [knife4j-openapi2-spring-boot-starter](https://doc.xiaominfo.com/))  

`application. yaml`

```yaml
knife4j:  
  enable: true  
  openapi:  
    title: 苍穹外卖项目接口文档  
    description: "苍穹外卖项目接口文档"  
    concat: 我  
    version: v2.0  
    group:  
      sky:  
        group-name: sky  
        api-rule: package  
        api-rule-resources:  
          - com.sky.controller
```

## 5 公共字段注入

| **字段名**     | **含义** | **数据类型** | **操作类型**        |
| ----------- | ------ | -------- | --------------- |
| create_time | 创建时间   | datetime | insert          |
| create_user | 创建人id  | bigint   | insert          |
| update_time | 修改时间   | datetime | insert / update |
| update_user | 修改人id  | bigint   | insert / update |

因为使用了 `Mybatis-Plus` 所以 mapper 中没有方法，无法通过注解切入，如果在实体类中使用 AOP 注解，模块依赖变复杂，且因为使用 DTO 传递数据，AOP 无法直接读取目标对象实体字段  

### 5.1 AOP 切面

**server module**

```java
package com.sky.annotation;

import com.sky.enumeration.OperationType;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 自定义注解，用于标识某个方法需要进行功能字段自动填充处理
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AutoFill {
    //数据库操作类型：UPDATE INSERT
    OperationType value();
}
```

```java
package com.sky.aspect;

import com.sky.annotation.AutoFill;
import com.sky.constant.AutoFillConstant;
import com.sky.context.BaseContext;
import com.sky.enumeration.OperationType;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import java.lang.reflect.Method;
import java.time.LocalDateTime;

/**
 * 自定义切面，实现公共字段自动填充处理逻辑
 */
@Aspect
@Component
@Slf4j
public class AutoFillAspect {

    /**
     * 切入点
     */
    @Pointcut("execution(* com.sky.mapper.*.*(..)) && @annotation(com.sky.annotation.AutoFill)")
    public void autoFillPointCut(){}

    /**
     * 前置通知，在通知中进行公共字段的赋值
     */
    @Before("autoFillPointCut()")
    public void autoFill(JoinPoint joinPoint){
        log.info("开始进行公共字段自动填充…");

        //获取到当前被拦截的方法上的数据库操作类型
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();//方法签名对象
        AutoFill autoFill = signature.getMethod().getAnnotation(AutoFill.class);//获得方法上的注解对象
        OperationType operationType = autoFill.value();//获得数据库操作类型

        //获取到当前被拦截的方法的参数--实体对象
        Object[] args = joinPoint.getArgs();
        if(args == null || args.length == 0){
            return;
        }

        Object entity = args[0];

        //准备赋值的数据
        LocalDateTime now = LocalDateTime.now();
        Long currentId = BaseContext.getCurrentId();

        //根据当前不同的操作类型，为对应的属性通过反射来赋值
        if(operationType == OperationType.INSERT){
            //为4个公共字段赋值
            try {
                Method setCreateTime = entity.getClass().getDeclaredMethod(AutoFillConstant.SET_CREATE_TIME, LocalDateTime.class);
                Method setCreateUser = entity.getClass().getDeclaredMethod(AutoFillConstant.SET_CREATE_USER, Long.class);
                Method setUpdateTime = entity.getClass().getDeclaredMethod(AutoFillConstant.SET_UPDATE_TIME, LocalDateTime.class);
                Method setUpdateUser = entity.getClass().getDeclaredMethod(AutoFillConstant.SET_UPDATE_USER, Long.class);

                //通过反射为对象属性赋值
                setCreateTime.invoke(entity,now);
                setCreateUser.invoke(entity,currentId);
                setUpdateTime.invoke(entity,now);
                setUpdateUser.invoke(entity,currentId);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }else if(operationType == OperationType.UPDATE){
            //为2个公共字段赋值
            try {
                Method setUpdateTime = entity.getClass().getDeclaredMethod(AutoFillConstant.SET_UPDATE_TIME, LocalDateTime.class);
                Method setUpdateUser = entity.getClass().getDeclaredMethod(AutoFillConstant.SET_UPDATE_USER, Long.class);

                //通过反射为对象属性赋值
                setUpdateTime.invoke(entity,now);
                setUpdateUser.invoke(entity,currentId);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

**common module**

```java
package com.sky.enumeration;

/**
 * 数据库操作类型
 */
public enum OperationType {

    /**
     * 更新操作
     */
    UPDATE,

    /**
     * 插入操作
     */
    INSERT
}
```

```java
package com.sky.constant;  
  
/**  
 * 公共字段自动填充相关常量  
 */  
public class AutoFillConstant {  
    /**  
     * 实体类中的方法名称  
     */  
    public static final String SET_CREATE_TIME = "setCreateTime";  
    public static final String SET_UPDATE_TIME = "setUpdateTime";  
    public static final String SET_CREATE_USER = "setCreateUser";  
    public static final String SET_UPDATE_USER = "setUpdateUser";  
  
    /**  
     * 实体类中的属性名称  
     */  
    public static final String CREATE_TIME = "createTime";  
    public static final String UPDATE_TIME = "updateTime";  
    public static final String CREATE_USER = "createUser";  
    public static final String UPDATE_USER = "updateUser";  
}
```

### 5.2 Mybatis-Plus 字段填充

![[MyBatis-Plus#12 字段填充]]

## 6 [[Redis|Redis 做缓存服务器]]

## 7 使用 OSS 实现文件上传

1. 配置文件 `application.yaml`

	```yaml
	sky:
	  alioss:  
	    endpoint: ${sky.alioss.endpoint}  
	    access-key-id: ${sky.alioss.access-key-id}  
	    access-key-secret: ${sky.alioss.access-key-secret}  
	    bucket-name: ${sky.alioss.bucket-name}
	```

2. `AliOssProperties` 属性类读取配置文件 ` application.yaml `

	```java
	package com.sky.properties;
	
	import lombok.Data;
	import org.springframework.boot.context.properties.ConfigurationProperties;
	import org.springframework.stereotype.Component;
	
	@Component
	@ConfigurationProperties(prefix = "sky.alioss")
	@Data
	public class AliOssProperties {
	
	    private String endpoint;
	    private String accessKeyId;
	    private String accessKeySecret;
	    private String bucketName;
	
	}
	```

3. `OssConfiguration` 配置类通过属性类读取环境变量并创建文件上传工具类 `AliOssUtil`

	```java
	package com.sky.config;
	
	import com.sky.properties.AliOssProperties;
	import com.sky.utils.AliOssUtil;
	import lombok.extern.slf4j.Slf4j;
	import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
	import org.springframework.context.annotation.Bean;
	import org.springframework.context.annotation.Configuration;
	
	/**
	 * 配置类，用于创建AliOssUtil对象
	 */
	@Configuration
	@Slf4j
	public class OssConfiguration {
	
	    @Bean
	    @ConditionalOnMissingBean
	    public AliOssUtil aliOssUtil(AliOssProperties aliOssProperties){
	        log.info("开始创建阿里云文件上传工具类对象：{}",aliOssProperties);
	        return new AliOssUtil(aliOssProperties.getEndpoint(),
	                aliOssProperties.getAccessKeyId(),
	                aliOssProperties.getAccessKeySecret(),
	                aliOssProperties.getBucketName());
	    }
	}
	```

4. 文件上传工具类 `AliOssUtil`

	```java
	package com.sky.utils;  
	  
	import com.aliyun.oss.ClientException;  
	import com.aliyun.oss.OSS;  
	import com.aliyun.oss.OSSClientBuilder;  
	import com.aliyun.oss.OSSException;  
	import lombok.AllArgsConstructor;  
	import lombok.Data;  
	import lombok.extern.slf4j.Slf4j;  
	  
	import java.io.ByteArrayInputStream;  
	  
	/**  
	 * 阿里云OSS文件上传工具类  
	 */  
	@Data  
	@AllArgsConstructor  
	@Slf4j  
	public class AliOssUtil {  
	  
	    private String endpoint;  
	    private String accessKeyId;  
	    private String accessKeySecret;  
	    private String bucketName;  
	  
	    /**  
	     * 文件上传  
	     *  
	     * @param bytes      文件内容的字节数组  
	     * @param objectName OSS中对象的名称  
	     * @return 上传文件的URL  
	     */    public String upload(byte[] bytes, String objectName) {  
	  
	       // 创建OSSClient实例。  
	       OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);  
	  
	       try {  
	          // 创建PutObject请求。  
	          ossClient.putObject(bucketName, objectName, new ByteArrayInputStream(bytes));  
	       } catch (OSSException oe) {  
	          System.out.println("Caught an OSSException, which means your request made it to OSS, "  
	                + "but was rejected with an error response for some reason.");  
	          System.out.println("Error Message:" + oe.getErrorMessage());  
	          System.out.println("Error Code:" + oe.getErrorCode());  
	          System.out.println("Request ID:" + oe.getRequestId());  
	          System.out.println("Host ID:" + oe.getHostId());  
	       } catch (ClientException ce) {  
	          System.out.println("Caught an ClientException, which means the client encountered "  
	                + "a serious internal problem while trying to communicate with OSS, "  
	                + "such as not being able to access the network.");  
	          System.out.println("Error Message:" + ce.getMessage());  
	       } finally {  
	          if (ossClient != null) {  
	             ossClient.shutdown();  
	          }  
	       }  
	  
	       // 文件访问路径规则 https://BucketName.Endpoint/ObjectName       StringBuilder stringBuilder = new StringBuilder("https://");  
	       stringBuilder  
	             .append(bucketName)  
	             .append(".")  
	             .append(endpoint)  
	             .append("/")  
	             .append(objectName);  
	  
	       log.info("文件上传到:{}", stringBuilder.toString());  
	  
	       return stringBuilder.toString();  
	    }  
	}
	```

5. 通用接口 `CommonController` 添加上传接口

	```java
	package com.sky.controller.admin;  
	  
	import com.sky.constant.MessageConstant;  
	import com.sky.result.Result;  
	import com.sky.utils.AliOssUtil;  
	import io.swagger.annotations.Api;  
	import io.swagger.annotations.ApiOperation;  
	import lombok.extern.slf4j.Slf4j;  
	import org.springframework.beans.factory.annotation.Autowired;  
	import org.springframework.web.bind.annotation.PostMapping;  
	import org.springframework.web.bind.annotation.RequestMapping;  
	import org.springframework.web.bind.annotation.RestController;  
	import org.springframework.web.multipart.MultipartFile;  
	  
	import java.io.IOException;  
	import java.util.UUID;  
	  
	/**  
	 * 通用接口控制器  
	 */  
	@RestController  
	@RequestMapping("/admin/common")  
	@Api(tags = "通用接口")  
	@Slf4j  
	public class CommonController {  
	  
	    @Autowired  
	    private AliOssUtil aliOssUtil;  
	  
	    /**  
	     * 文件上传接口  
	     *  
	     * @param file 要上传的文件  
	     * @return 上传结果，包含文件的访问路径  
	     */  
	    @PostMapping("/upload")  
	    @ApiOperation("文件上传")  
	    public Result<String> upload(MultipartFile file) {  
	       log.info("文件上传：{}", file);  
	  
	       try {  
	          // 获取原始文件名  
	          String originalFilename = file.getOriginalFilename();  
	          // 截取原始文件名的后缀  
	          assert originalFilename != null;  
	          String extension = originalFilename.substring(originalFilename.lastIndexOf("."));  
	          // 构造新文件名称  
	          String objectName = UUID.randomUUID().toString() + extension;  
	  
	          // 上传文件并获取文件的请求路径  
	          String filePath = aliOssUtil.upload(file.getBytes(), objectName);  
	          return Result.success(filePath);  
	       } catch (IOException e) {  
	          log.error("文件上传失败: {}", e);  
	       }  
	  
	       return Result.error(MessageConstant.UPLOAD_FAILED);  
	    }  
	}
	```

## 8 Mybatis-Plus 替代原生 Mapper

示例：

```java
/**  
 * 菜品分页查询  
 * <p>  
 * 该方法用于分页查询菜品信息。  
 *  
 * @param dishPageQueryDTO 包含分页查询条件的数据传输对象  
 * @return 返回包含分页结果的操作结果  
 */  
public PageResult pageQuery(DishPageQueryDTO dishPageQueryDTO) {  
    // 创建分页对象  
    Page<Dish> page = new Page<>(dishPageQueryDTO.getPage(), dishPageQueryDTO.getPageSize());  
  
    // 构建查询条件  
    LambdaQueryWrapper<Dish> queryWrapper = new LambdaQueryWrapper<>();  
    queryWrapper.like(dishPageQueryDTO.getName() != null && !dishPageQueryDTO.getName().isEmpty(), Dish::getName, dishPageQueryDTO.getName())  
          .eq(dishPageQueryDTO.getCategoryId() != null, Dish::getCategoryId, dishPageQueryDTO.getCategoryId())  
          .eq(dishPageQueryDTO.getStatus() != null, Dish::getStatus, dishPageQueryDTO.getStatus())  
          .orderByDesc(Dish::getCreateTime);  
  
    // 执行查询  
    Page<Dish> resultPage = dishMapper.selectPage(page, queryWrapper);  
  
    // 将结果转换为DishVO列表  
    List<DishVO> dishVOList = resultPage.getRecords().stream().map(dish -> {  
       DishVO dishVO = new DishVO();  
       BeanUtils.copyProperties(dish, dishVO);  
       return dishVO;  
    }).collect(Collectors.toList());  
  
    // 返回分页结果  
    return new PageResult(resultPage.getTotal(), dishVOList);  
}
```

```java
package com.sky.service.impl;  
  
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;  
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;  
import com.sky.constant.MessageConstant;  
import com.sky.constant.StatusConstant;  
import com.sky.dto.DishDTO;  
import com.sky.dto.DishPageQueryDTO;  
import com.sky.entity.Dish;  
import com.sky.entity.DishFlavor;  
import com.sky.entity.SetmealDish;  
import com.sky.exception.DeletionNotAllowedException;  
import com.sky.mapper.DishFlavorMapper;  
import com.sky.mapper.DishMapper;  
import com.sky.mapper.SetmealDishMapper;  
import com.sky.result.PageResult;  
import com.sky.service.DishService;  
import com.sky.vo.DishVO;  
import lombok.extern.slf4j.Slf4j;  
import org.springframework.beans.BeanUtils;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.stereotype.Service;  
import org.springframework.transaction.annotation.Transactional;  
  
import java.util.List;  
import java.util.Optional;  
import java.util.stream.Collectors;  
  
@Service  
@Slf4j  
public class DishServiceImpl implements DishService {  
  
    @Autowired  
    private DishMapper dishMapper;  
    @Autowired  
    private DishFlavorMapper dishFlavorMapper;  
    @Autowired  
    private SetmealDishMapper setmealDishMapper;  
  
    /**  
     * 新增菜品和对应的口味  
     * <p>  
     * 该方法用于将菜品及其对应的口味信息保存到数据库中。  
     * 它首先将菜品信息保存到菜品表中，然后获取生成的主键值，  
     * 并将该主键值设置到每个口味对象中，最后将这些口味对象保存到口味表中。  
     *  
     * @param dishDTO 包含菜品和口味信息的数据传输对象  
     */  
    @Override  
    @Transactional    public void saveWithFlavor(DishDTO dishDTO) {  
  
       Dish dish = new Dish();  
       BeanUtils.copyProperties(dishDTO, dish);  
  
       // 向菜品表插入1条数据  
       dishMapper.insert(dish);  
  
       // 获取insert语句生成的主键值  
       Long dishId = dish.getId();  
  
       List<DishFlavor> flavors = dishDTO.getFlavors();  
       if (flavors != null && !flavors.isEmpty()) {  
          flavors.forEach(dishFlavor -> dishFlavor.setDishId(dishId));  
          // 向口味表插入n条数据  
          dishFlavorMapper.insert(flavors);  
       }  
    }  
  
    /**  
     * 菜品批量删除  
     *  
     * @param ids 包含要删除的菜品ID列表  
     */  
    @Override  
    @Transactional    public void deleteBatch(List<Long> ids) {  
       // 判断当前菜品是否能够删除---是否存在起售中的菜品  
       List<Dish> dishes = dishMapper.selectBatchIds(ids);  
       dishes.stream()  
             .filter(dish -> StatusConstant.ENABLE.equals(dish.getStatus()))  
             .findAny()  
             .ifPresent(dish -> {  
                // 当前菜品处于起售中，不能删除  
                throw new DeletionNotAllowedException(MessageConstant.DISH_ON_SALE);  
             });  
  
       // 判断当前菜品是否能够删除---是否被套餐关联了  
       List<Long> setmealIds = setmealDishMapper.selectList(  
                   new LambdaQueryWrapper<SetmealDish>()  
                         .in(SetmealDish::getDishId, ids)  
             ).stream()  
             .map(SetmealDish::getSetmealId) // 获取套餐ID  
             .distinct()  
             .collect(Collectors.toList()); //如果为空，返回空列表  
       if (!setmealIds.isEmpty()) {  
          // 当前菜品被套餐关联了，不能删除  
          throw new DeletionNotAllowedException(MessageConstant.DISH_BE_RELATED_BY_SETMEAL);  
       }  
  
       // 删除菜品表中的菜品数据  
       dishMapper.deleteByIds(ids);  
  
       // 删除菜品关联的口味数据  
       dishFlavorMapper.delete(new LambdaQueryWrapper<DishFlavor>().in(DishFlavor::getDishId, ids));  
    }  
  
    /**  
     * 根据id修改菜品基本信息和对应的口味信息  
     *  
     * @param dishDTO 包含菜品和口味信息的数据传输对象  
     */  
    @Override  
    public void updateWithFlavor(DishDTO dishDTO) {  
       Dish dish = new Dish();  
       BeanUtils.copyProperties(dishDTO, dish);  
  
       // 修改菜品表基本信息  
       dishMapper.updateById(dish);  
  
       // 删除原有的口味数据  
       dishFlavorMapper.delete(  
             new LambdaQueryWrapper<DishFlavor>().eq(DishFlavor::getDishId, dishDTO.getId())  
       );  
  
       // 重新插入口味数据  
       Optional.ofNullable(dishDTO.getFlavors())  
             .filter(flavors -> !flavors.isEmpty())  
             .ifPresent(flavors -> {  
                flavors.forEach(dishFlavor -> dishFlavor.setDishId(dishDTO.getId()));  
                dishFlavorMapper.insert(flavors);  
             });  
    }  
  
    /**  
     * 菜品分页查询  
     * <p>  
     * 该方法用于分页查询菜品信息。  
     *  
     * @param dishPageQueryDTO 包含分页查询条件的数据传输对象  
     * @return 返回包含分页结果的操作结果  
     */  
    @Override  
    public PageResult pageQuery(DishPageQueryDTO dishPageQueryDTO) {  
       // 创建分页对象  
       Page<Dish> page = new Page<>(dishPageQueryDTO.getPage(), dishPageQueryDTO.getPageSize());  
  
       // 构建查询条件  
       LambdaQueryWrapper<Dish> queryWrapper = new LambdaQueryWrapper<>();  
       queryWrapper.like(dishPageQueryDTO.getName() != null && !dishPageQueryDTO.getName().isEmpty(), Dish::getName, dishPageQueryDTO.getName())  
             .eq(dishPageQueryDTO.getCategoryId() != null, Dish::getCategoryId, dishPageQueryDTO.getCategoryId())  
             .eq(dishPageQueryDTO.getStatus() != null, Dish::getStatus, dishPageQueryDTO.getStatus())  
             .orderByDesc(Dish::getCreateTime);  
  
       // 执行查询  
       Page<Dish> resultPage = dishMapper.selectPage(page, queryWrapper);  
  
       // 将结果转换为DishVO列表  
       List<DishVO> dishVOList = resultPage.getRecords().stream().map(dish -> {  
          DishVO dishVO = new DishVO();  
          BeanUtils.copyProperties(dish, dishVO);  
          return dishVO;  
       }).collect(Collectors.toList());  
  
       // 返回分页结果  
       return new PageResult(resultPage.getTotal(), dishVOList);  
    }  
  
    /**  
     * 根据id查询菜品对应的口味数据  
     * <p>  
     * 该方法用于根据给定的菜品ID查询菜品及其对应的口味信息。  
     *  
     * @param id 菜品ID  
     * @return 返回包含菜品及其口味信息的操作结果  
     */  
    @Override  
    public DishVO getByIdWithFlavor(Long id) {  
       Dish dish = dishMapper.selectById(id);  
       List<DishFlavor> dishFlavors = dishFlavorMapper.selectList(  
             new LambdaQueryWrapper<DishFlavor>().eq(DishFlavor::getDishId, id)  
       );  
  
       return new DishVO() {{  
          BeanUtils.copyProperties(dish, this);  
          setFlavors(dishFlavors);  
       }};  
    }  
}
```

## 9 事务管理

1. 启动类  
	- `@EnableTransactionManagement`
		- 开启注解方式的事务管理  
2. 方法  
	- `@Transactional`
		- 用于管理事务。它确保在方法执行过程中，所有数据库操作要么全部成功，要么全部回滚，以保证数据的一致性和完整性

## 10 [微信登陆](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)

> [!info] 摘抄自官方介绍

![[wx_login.jpg]]

### 10.1 说明

1. 调用 [wx.login()](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html) 获取 **临时登录凭证code** ，并回传到开发者服务器。
2. 调用 [auth.code2Session](https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html) 接口，换取 **用户唯一标识 OpenID** 、 用户在微信开放平台账号下的**唯一标识UnionID**（若当前小程序已绑定到微信开放平台账号） 和 **会话密钥 session_key**。

之后开发者服务器可以根据用户标识来生成自定义登录态，用于后续业务逻辑中前后端交互时识别用户身份。

### 10.2 注意事项

1. 会话密钥 `session_key` 是对用户数据进行 [加密签名](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html) 的密钥。为了应用自身的数据安全，开发者服务器**不应该把会话密钥下发到小程序，也不应该对外提供这个密钥**。
2. 临时登录凭证 code 只能使用一次

### 10.3 后端示例

- `UserLoginDTO`

	```java
	package com.sky.dto;  
	  
	import io.swagger.annotations.ApiModel;  
	import io.swagger.annotations.ApiModelProperty;  
	import lombok.Data;  
	  
	import java.io.Serializable;  
	  
	/**  
	 * \C端用户登录  
	 */  
	@Data  
	@ApiModel(description = "Data Transfer Object (DTO) for user login information.")  
	public class UserLoginDTO implements Serializable {  
	  
	    /**  
	     * \微信生成的临时登录凭证code  
	     */    @ApiModelProperty(value = "微信生成的临时登录凭证code", required = true)  
	    private String code;  
	  
	}
	```

- `UserLoginVO`

	```java
	package com.sky.vo;  
	  
	import io.swagger.annotations.ApiModel;  
	import io.swagger.annotations.ApiModelProperty;  
	import lombok.AllArgsConstructor;  
	import lombok.Builder;  
	import lombok.Data;  
	import lombok.NoArgsConstructor;  
	  
	import java.io.Serializable;  
	  
	/**  
	 * \C端用户登录视图对象  
	 */  
	@Data  
	@Builder  
	@NoArgsConstructor  
	@AllArgsConstructor  
	@ApiModel(description = "View Object (VO) for user login information.")  
	public class UserLoginVO implements Serializable {  
	  
	    /**  
	     * \用户ID  
	     */    @ApiModelProperty(value = "用户ID", required = true)  
	    private Long id;  
	  
	    /**  
	     * \微信的用户唯一标识  
	     */  
	    @ApiModelProperty(value = "微信的用户唯一标识", required = true)  
	    private String openid;  
	  
	    /**  
	     * \用户登录令牌  
	     */  
	    @ApiModelProperty(value = "用户登录令牌", required = true)  
	    private String token;  
	  
	}
	```

- `UserController`

	```java
	package com.sky.controller.user;  
	  
	import com.sky.constant.JwtClaimsConstant;  
	import com.sky.dto.UserLoginDTO;  
	import com.sky.entity.User;  
	import com.sky.properties.JwtProperties;  
	import com.sky.result.Result;  
	import com.sky.service.UserService;  
	import com.sky.utils.JwtUtil;  
	import com.sky.vo.UserLoginVO;  
	import io.swagger.annotations.Api;  
	import io.swagger.annotations.ApiOperation;  
	import lombok.extern.slf4j.Slf4j;  
	import org.springframework.beans.factory.annotation.Autowired;  
	import org.springframework.web.bind.annotation.PostMapping;  
	import org.springframework.web.bind.annotation.RequestBody;  
	import org.springframework.web.bind.annotation.RequestMapping;  
	import org.springframework.web.bind.annotation.RestController;  
	  
	import java.util.HashMap;  
	import java.util.Map;  
	  
	@RestController  
	@RequestMapping("/user/user")  
	@Api(tags = "C端用户相关接口")  
	@Slf4j  
	public class UserController {  
	  
	    @Autowired  
	    private UserService userService;  
	    @Autowired  
	    private JwtProperties jwtProperties;  
	  
	    /**  
	     * 微信登录  
	     * <p>  
	     * 该方法映射到 "/login" 端点的 POST 请求。  
	     * 它接受一个 `UserLoginDTO` 对象作为请求体，其中包含微信用户的必要登录信息。  
	     * <p>  
	     * 该方法执行以下步骤：  
	     * 1. 使用提供的微信代码记录登录尝试。  
	     * 2. 调用 `UserService` 的 `wxLogin` 方法来验证用户。  
	     * 3. 为验证的用户生成 JWT 令牌。  
	     * 4. 构建一个包含用户 ID、OpenID 和生成的令牌的 `UserLoginVO` 对象。  
	     * 5. 返回包含 `UserLoginVO` 对象的成功结果。  
	     *  
	     * @param userLoginDTO 包含微信登录信息的数据传输对象  
	     * @return 包含用户详细信息和 JWT 令牌的 `Result` 对象  
	     */  
	    @PostMapping("/login")  
	    @ApiOperation("微信登录")  
	    public Result<UserLoginVO> login(@RequestBody UserLoginDTO userLoginDTO) {  
	       log.info("微信用户登录：{}", userLoginDTO.getCode());  
	  
	       // 微信登录  
	       User user = userService.wxLogin(userLoginDTO);  
	  
	       // 为微信用户生成 jwt 令牌  
	       Map<String, Object> claims = new HashMap<>();  
	       claims.put(JwtClaimsConstant.USER_ID, user.getId());  
	       String token = JwtUtil.createJWT(jwtProperties.getUserSecretKey(), jwtProperties.getUserTtl(), claims);  
	  
	       // 构建 UserLoginVO 对象  
	       UserLoginVO userLoginVO = UserLoginVO.builder()  
	             .id(user.getId())  
	             .openid(user.getOpenid())  
	             .token(token)  
	             .build();  
	  
	       // 返回包含 UserLoginVO 对象的成功结果  
	       return Result.success(userLoginVO);  
	    }  
	}
	```

	- `JwtClaimsConstant`

		```java
		package com.sky.constant;  
		  
		public class JwtClaimsConstant {  
		  
			public static final String EMP_ID = "empId";  
			public static final String USER_ID = "userId";  
			public static final String PHONE = "phone";  
			public static final String USERNAME = "username";  
			public static final String NAME = "name";  
		  
		}
		```

	- `JwtUtil`

		```java
		package com.sky.utils;  
		  
		import io.jsonwebtoken.Claims;  
		import io.jsonwebtoken.JwtBuilder;  
		import io.jsonwebtoken.Jwts;  
		import io.jsonwebtoken.SignatureAlgorithm;  
		  
		import java.nio.charset.StandardCharsets;  
		import java.util.Date;  
		import java.util.Map;  
		  
		public class JwtUtil {  
		  
		    /**  
		     * 生成jwt  
		     * 使用Hs256算法, 私匙使用固定秘钥  
		     *  
		     * @param secretKey jwt秘钥  
		     * @param ttlMillis jwt过期时间(毫秒)  
		     * @param claims    设置的信息  
		     * @return 生成的JWT字符串  
		     */  
		    public static String createJWT(String secretKey, long ttlMillis, Map<String, Object> claims) {  
		       // 指定签名的时候使用的签名算法，也就是header那部分  
		       SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;  
		  
		       // 生成JWT的时间  
		       long expMillis = System.currentTimeMillis() + ttlMillis;  
		       Date exp = new Date(expMillis);  
		  
		       // 设置jwt的body  
		       JwtBuilder builder = Jwts.builder()  
		             // 如果有私有声明，一定要先设置这个自己创建的私有的声明，这个是给builder的claim赋值，一旦写在标准的声明赋值之后，就是覆盖了那些标准的声明的  
		             .setClaims(claims)  
		             // 设置签名使用的签名算法和签名使用的秘钥  
		             .signWith(signatureAlgorithm, secretKey.getBytes(StandardCharsets.UTF_8))  
		             // 设置过期时间  
		             .setExpiration(exp);  
		  
		       return builder.compact();  
		    }  
		  
		    /**  
		     * Token解密  
		     *  
		     * @param secretKey jwt秘钥 此秘钥一定要保留好在服务端, 不能暴露出去, 否则sign就可以被伪造, 如果对接多个客户端建议改造成多个  
		     * @param token     加密后的token  
		     * @return 解密后的Claims对象  
		     */  
		    public static Claims parseJWT(String secretKey, String token) {  
		  
		       // 检查是否有"Bearer "前缀，有则移除  
		       if (token != null && token.startsWith("Bearer ")) {  
		          token = token.substring(7);  
		       }  
		       // 得到DefaultJwtParser  
		       return Jwts.parser()  
		             // 设置签名的秘钥  
		             .setSigningKey(secretKey.getBytes(StandardCharsets.UTF_8))  
		             // 设置需要解析的jwt  
		             .parseClaimsJws(token).getBody();  
		    }  
		  
		}
		```

- `UserService`

	```java
	package com.sky.service;  
	  
	import com.sky.dto.UserLoginDTO;  
	import com.sky.entity.User;  
	  
	public interface UserService {  
	  
	    /**  
	     * 微信登录  
	     * <p>  
	     * 该方法处理微信用户的登录过程。  
	     *  
	     * @param userLoginDTO 包含用户登录信息的数据传输对象。  
	     * @return User 对应于已登录用户的用户实体。  
	     */  
	    User wxLogin(UserLoginDTO userLoginDTO);  
	}
	```

- `UserServiceImpl`

	```java
	package com.sky.service.impl;  
	  
	import com.alibaba.fastjson.JSON;  
	import com.alibaba.fastjson.JSONObject;  
	import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;  
	import com.sky.constant.MessageConstant;  
	import com.sky.dto.UserLoginDTO;  
	import com.sky.entity.User;  
	import com.sky.exception.LoginFailedException;  
	import com.sky.mapper.UserMapper;  
	import com.sky.properties.WeChatProperties;  
	import com.sky.service.UserService;  
	import com.sky.utils.HttpClientUtil;  
	import lombok.extern.slf4j.Slf4j;  
	import org.springframework.beans.factory.annotation.Autowired;  
	import org.springframework.stereotype.Service;  
	  
	import java.time.LocalDateTime;  
	import java.util.HashMap;  
	import java.util.Map;  
	  
	@Service  
	@Slf4j  
	public class UserServiceImpl implements UserService {  
	  
	    //微信服务接口地址  
	    public static final String WX_LOGIN = "https://api.weixin.qq.com/sns/jscode2session";  
	  
	    @Autowired  
	    private WeChatProperties weChatProperties;  
	    @Autowired  
	    private UserMapper userMapper;  
	  
	    /**  
	     * 微信登录  
	     * <p>  
	     * 该方法处理微信用户的登录过程。  
	     *  
	     * @param userLoginDTO 包含用户登录信息的数据传输对象。  
	     * @return User 对应于已登录用户的用户实体。  
	     */  
	    public User wxLogin(UserLoginDTO userLoginDTO) {  
	       String openid = getOpenid(userLoginDTO.getCode());  
	  
	       // 判断openid是否为空，如果为空表示登录失败，抛出业务异常  
	       if (openid == null) {  
	          throw new LoginFailedException(MessageConstant.LOGIN_FAILED);  
	       }  
	  
	       // 判断当前用户是否为新用户  
	       User user = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getOpenid, openid));  
	  
	       // 如果是新用户，自动完成注册  
	       if (user == null) {  
	          user = User.builder()  
	                .openid(openid)  
	                //已通过MP实现自动填充  
	//              .createTime(LocalDateTime.now())  
	                .build();  
	          userMapper.insert(user);  
	       }  
	  
	       // 返回这个用户对象  
	       return user;  
	    }  
	  
	    /**  
	     * 调用微信接口服务，获取微信用户的openid  
	     * <p>  
	     * 该方法调用微信接口服务，通过传入的code获取当前微信用户的openid。  
	     *  
	     * @param code 微信生成的临时登录凭证code。  
	     * @return String 当前微信用户的openid。  
	     */  
	    private String getOpenid(String code) {  
	       // 调用微信接口服务，获得当前微信用户的openid  
	       Map<String, String> map = new HashMap<>();  
	       map.put("appid", weChatProperties.getAppid());  
	       map.put("secret", weChatProperties.getSecret());  
	       map.put("js_code", code);  
	       map.put("grant_type", "authorization_code");  
	       String json = HttpClientUtil.doGet(WX_LOGIN, map);  
	  
	       JSONObject jsonObject = JSON.parseObject(json);  
	       return jsonObject.getString("openid");  
	    }  
	}
	```

	- `WeChatProperties`

		```java
		package com.sky.properties;  
		  
		import lombok.Data;  
		import org.springframework.beans.factory.annotation.Value;  
		import org.springframework.boot.context.properties.ConfigurationProperties;  
		import org.springframework.stereotype.Component;  
		  
		@Component  
		@ConfigurationProperties(prefix = "sky.wechat")  
		@Data  
		public class WeChatProperties {  
		  
		    private String appid; //小程序的appid  
		    private String secret; //小程序的秘钥  
		    private String mchid; //商户号  
		    private String mchSerialNo; //商户API证书的证书序列号  
		    private String privateKeyFilePath; //商户私钥文件  
		    private String apiV3Key; //证书解密的密钥  
		    private String weChatPayCertFilePath; //平台证书  
		    private String notifyUrl; //支付成功的回调地址  
		    private String refundNotifyUrl; //退款成功的回调地址  
		  
		}
		```

- `JwtTokenUserInterceptor`

	```java
	package com.sky.interceptor;  
	  
	import com.sky.constant.JwtClaimsConstant;  
	import com.sky.context.BaseContext;  
	import com.sky.properties.JwtProperties;  
	import com.sky.utils.JwtUtil;  
	import io.jsonwebtoken.Claims;  
	import lombok.extern.slf4j.Slf4j;  
	import org.springframework.beans.factory.annotation.Autowired;  
	import org.springframework.stereotype.Component;  
	import org.springframework.web.method.HandlerMethod;  
	import org.springframework.web.servlet.HandlerInterceptor;  
	  
	import javax.servlet.http.HttpServletRequest;  
	import javax.servlet.http.HttpServletResponse;  
	  
	/**  
	 * jwt令牌校验的拦截器  
	 */  
	@Component  
	@Slf4j  
	public class JwtTokenUserInterceptor implements HandlerInterceptor {  
	  
	    @Autowired  
	    private JwtProperties jwtProperties;  
	  
	    /**  
	     * 校验jwt  
	     *     * @param request  HTTP请求对象  
	     * @param response HTTP响应对象  
	     * @param handler  处理器对象  
	     * @return 如果令牌校验通过，返回true；否则返回false  
	     * @throws Exception 如果发生异常  
	     */  
	    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {  
	       //判断当前拦截到的是Controller的方法还是其他资源  
	       if (! (handler instanceof HandlerMethod)) {  
	          //当前拦截到的不是动态方法，直接放行  
	          return true;  
	       }  
	  
	       //1、从请求头中获取令牌  
	       String token = request.getHeader(jwtProperties.getUserTokenName());  
	  
	       //2、校验令牌  
	       try {  
	          log.info("jwt校验:{}", token);  
	          Claims claims = JwtUtil.parseJWT(jwtProperties.getUserSecretKey(), token);  
	          Long userId = Long.valueOf(claims.get(JwtClaimsConstant.USER_ID).toString());  
	          log.info("当前用户的id: {}", userId);  
	          BaseContext.setCurrentId(userId);  
	          //3、通过，放行  
	          return true;  
	       } catch (Exception ex) {  
	          //4、不通过，响应 401 状态码  
	          response.setStatus(401);  
	          return false;  
	       }  
	    }  
	}
	```

- `WebMvcConfiguration`

	```java
	@Configuration  
	@Slf4j  
	public class WebMvcConfiguration extends WebMvcConfigurationSupport {  
	  
	    @Autowired  
	    private JwtTokenAdminInterceptor jwtTokenAdminInterceptor;  
	    @Autowired  
	    private JwtTokenUserInterceptor jwtTokenUserInterceptor;  
	  
	    /**  
	     * 注册自定义拦截器  
	     *  
	     * @param registry 拦截器注册表  
	     */  
	    protected void addInterceptors(InterceptorRegistry registry) {  
	       log.info("开始注册自定义拦截器…");  
	       registry.addInterceptor(jwtTokenAdminInterceptor)  
	             .addPathPatterns("/admin/**")  
	             .excludePathPatterns("/admin/employee/login");  
	       registry.addInterceptor(jwtTokenUserInterceptor)  
	             .addPathPatterns("/user/**")  
	             .excludePathPatterns("/user/user/login")  
	             .excludePathPatterns("/user/shop/status");  
	    }
	}
	```

## 11 插入数据时报错

- 出错部分代码

	```java
	// 构造订单数据  
	Order order = Order.builder()  
	       .phone(addressBook.getPhone())  
	       .address(addressBook.getDetail())  
	       .consignee(addressBook.getConsignee())  
	       .number(String.valueOf(System.currentTimeMillis()))  
	       .userId(userId)  
	       .status(Order.PENDING_PAYMENT)  
	       .payStatus(Order.UN_PAID)  
	       .orderTime(LocalDateTime.now())  
	       .build();  
	BeanUtils.copyProperties(ordersSubmitDTO, order);  
	log.info("构造订单:{}", order);  
	orderMapper.insert(order);
	```

- 控制台输出

	```sql
	SQL: INSERT INTO order ( number, status, user_id, address_book_id, order_time, pay_method, pay_status, amount, remark, phone, address, consignee, estimated_delivery_time, delivery_status, pack_amount, tableware_number, tableware_status ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
	Cause: java.sql.SQLSyntaxErrorException: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'order ( number, status, user_id, address_book_id, order_time, pay_method, pay_' at line 1
	```

> [!warning] 表名必须用反引号括起来  
> 在SQL中，order是一个保留关键字。为了避免与SQL语法冲突，必须使用反引号将表名括起来，以明确表示这是一个表名而不是SQL关键字  

- 解决方法
	1. 实体类添加注解

		```java
		@TableName("`order`")  
		public class Order
		```

	2. 手写 SQL 到 `mapper.xml`

		```xml
		<?xml version="1.0" encoding="UTF-8" ?>
		<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
		<mapper namespace="com.sky.mapper.OrderMapper">
		
			<insert id="insert" parameterType="com.sky.entity.Order" useGeneratedKeys="true" keyProperty="id">
				insert into `order`
				(number, status, user_id, address_book_id, order_time, checkout_time, pay_method, pay_status, amount, remark,
				 phone, address, consignee, estimated_delivery_time, delivery_status, pack_amount, tableware_number,
				 tableware_status)
				values (#{number}, #{status}, #{userId}, #{addressBookId}, #{orderTime}, #{checkoutTime}, #{payMethod},
						#{payStatus}, #{amount}, #{remark}, #{phone}, #{address}, #{consignee},
						#{estimatedDeliveryTime}, #{deliveryStatus}, #{packAmount}, #{tablewareNumber}, #{tablewareStatus})
			</insert>
		</mapper>
		```

## 12 微信支付

> [!note] [产品中心 - 微信支付商户平台](https://pay.weixin.qq.com/static/product/product_index.shtml)

## 13 距离检测

通过引入[百度地图API](https://lbsyun.baidu.com/faq/api?title=webapi%2Fguide%2Fwebservice-geocoding) 实现对收货地址和商户地址距离的检测

### 13.1 配置文件

```yaml
sky:
  shop:  
    address: ${sky.shop.address}  
  baidu:  
    ak: ${sky.baidu.ak}
```

### 13.2 字段注入

服务实现类

```java
@Value("${sky.shop.address}")  
private String shopAddress;  
@Value("${sky.baidu.ak}")  
private String ak;
```

```java
/**  
 * 检查客户的收货地址是否超出配送范围  
 *  
 * @param address 客户的收货地址  
 * @throws OrderBusinessException 如果店铺地址解析失败、收货地址解析失败或配送路线规划失败  
 */  
private void checkOutOfRange(String address) {  
    // 创建一个包含店铺地址、输出格式和百度地图API密钥的Map对象  
    Map<String, String> map = new HashMap<>();  
    map.put("address", shopAddress);  
    map.put("output", "json");  
    map.put("ak", ak);  
  
    // 获取店铺的经纬度坐标  
    String shopCoordinate = HttpClientUtil.doGet("https://api.map.baidu.com/geocoding/v3", map);  
  
    // 解析店铺经纬度坐标的JSON响应  
    JSONObject jsonObject = JSON.parseObject(shopCoordinate);  
    if (! jsonObject.getString("status").equals("0")) {  
       throw new OrderBusinessException("店铺地址解析失败");  
    }  
  
    // 从JSON响应中提取店铺的经纬度坐标  
    JSONObject location = jsonObject.getJSONObject("result").getJSONObject("location");  
    String lat = location.getString("lat");  
    String lng = location.getString("lng");  
    String shopLngLat = lat + "," + lng;  
  
    // 更新Map对象中的地址为客户的收货地址  
    map.put("address", address);  
  
    // 获取客户收货地址的经纬度坐标  
    String userCoordinate = HttpClientUtil.doGet("https://api.map.baidu.com/geocoding/v3", map);  
  
    // 解析客户收货地址经纬度坐标的JSON响应  
    jsonObject = JSON.parseObject(userCoordinate);  
    if (! jsonObject.getString("status").equals("0")) {  
       throw new OrderBusinessException("收货地址解析失败");  
    }  
  
    // 从JSON响应中提取客户收货地址的经纬度坐标  
    location = jsonObject.getJSONObject("result").getJSONObject("location");  
    lat = location.getString("lat");  
    lng = location.getString("lng");  
    String userLngLat = lat + "," + lng;  
  
    // 更新Map对象中的起点和终点为店铺和客户的经纬度坐标  
    map.put("origin", shopLngLat);  
    map.put("destination", userLngLat);  
    map.put("steps_info", "0");  
  
    // 获取店铺到客户收货地址的路线规划  
    String json = HttpClientUtil.doGet("https://api.map.baidu.com/directionlite/v1/driving", map);  
  
    // 解析路线规划的JSON响应  
    jsonObject = JSON.parseObject(json);  
    if (! jsonObject.getString("status").equals("0")) {  
       throw new OrderBusinessException("配送路线规划失败");  
    }  
  
    // 从JSON响应中提取路线的距离  
    JSONObject result = jsonObject.getJSONObject("result");  
    JSONArray jsonArray = result.getJSONArray("routes");  
    Integer distance = jsonArray.getJSONObject(0).getInteger("distance");  
  
    // 如果配送距离超过5000米，抛出异常  
    if (distance > 5000) {  
       throw new OrderBusinessException("超出配送范围");  
    }  
}
```

```java
// 检查收货地址是否超出配送范围  
checkOutOfRange(addressBook.getCityName() + addressBook.getDistrictName() + addressBook.getDetail());
```

## 14 [[Spring Task]]

引入 Spring Task 实现定时任务，解决：

- 下单后未支付，订单一直处于**待支付**状态
- 用户收货后管理端未点击完成按钮，订单一直处于**派送中**状态  

通过**定时任务**来修改订单状态：

- 每分钟检查一次是否存在支付超时订单（下单后超过15分钟仍未支付则判定为支付超时订单），如果存在则修改订单状态为“已取消”
- 通过定时任务每天凌晨1点检查一次是否存在“派送中”的订单，如果存在则修改订单状态为“已完成”  

启动类添加注解 `@EnableScheduling // 开启定时任务`

> [!timportant] Cron in Spring  
> 在 Spring 的 `@Scheduled` 注解中，cron 表达式使用了六个字段，而不是传统的五个字段。第六个字段用于表示秒。以下是六个字段的含义：
>
> 1. 秒（0-59）
> 2. 分（0-59）
> 3. 小时（0-23）
> 4. 日（1-31）
> 5. 月（1-12）
> 6. 星期（0-7，0和7都表示星期日）
> 
> 因此，`@Scheduled(cron = "0 0 1 * * ?")` 表示每天凌晨1点执行一次任务。具体解释如下：
>
> - `0`：秒（0秒）
> - `0`：分钟（0分钟）
> - `1`：小时（凌晨1点）
> - `*`：日（每一天）
> - `*`：月（每个月）
> - `?`：星期（不指定）
> 
> 这就是为什么在 Spring 的 `@Scheduled` 注解中，cron 表达式有六个字段。

`OrderTask`

```java
package com.sky.task;  
  
import com.sky.dao.OrderDAO;  
import com.sky.entity.Order;  
import com.sky.mapper.OrderMapper;  
import lombok.extern.slf4j.Slf4j;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.scheduling.annotation.Scheduled;  
import org.springframework.stereotype.Component;  
  
import java.time.LocalDateTime;  
import java.util.Date;  
import java.util.Optional;  
  
/**  
 * 自定义定时任务，实现订单状态定时处理  
 */  
@Component  
@Slf4j  
public class OrderTask {  
  
    @Autowired  
    private OrderMapper orderMapper;  
    @Autowired  
    private OrderDAO orderDAO;  
  
    /**  
     * 处理支付超时订单  
     * <p>  
     * 定时任务，每分钟执行一次，处理支付超时的订单，将其状态更新为已取消  
     */  
    @Scheduled(cron = "0 * * * * ?")  
    public void processTimeoutOrder() {  
       log.info("处理支付超时订单：{}", new Date());  
  
       LocalDateTime time = LocalDateTime.now().plusMinutes(- 15);  
  
       // select * from order where status = 1 and order_time < 当前时间-15分钟  
       Optional.ofNullable(orderDAO.getByStatusAndOrderTimeLT(Order.PENDING_PAYMENT, time))  
             .ifPresent(orderList -> {  
                if (! orderList.isEmpty()) {  
                   orderList.forEach(order -> {  
                      order.setStatus(Order.CANCELLED);  
                      order.setCancelReason("支付超时，自动取消");  
                      order.setCancelTime(LocalDateTime.now());  
                      orderMapper.updateById(order);  
                   });  
                }  
             });  
    }  
  
    /**  
     * 处理“派送中”状态的订单  
     * <p>  
     * 定时任务，每天凌晨1点执行一次，处理派送中超过1小时的订单，将其状态更新为已完成  
     */  
    @Scheduled(cron = "0 0 1 * * ?")  
    public void processDeliveryOrder() {  
       log.info("处理派送中订单：{}", new Date());  
  
       // select * from orders where status = 4 and order_time < 当前时间-1小时  
       LocalDateTime time = LocalDateTime.now().plusMinutes(- 60);  
  
       Optional.ofNullable(orderDAO.getByStatusAndOrderTimeLT(Order.DELIVERY_IN_PROGRESS, time))  
             .ifPresent(orderList -> {  
                if (! orderList.isEmpty()) {  
                   orderList.forEach(order -> {  
                      order.setStatus(Order.COMPLETED);  
                      orderMapper.updateById(order);  
                   });  
                }  
             });  
    }  
  
}
```

`OrderDAO` 添加 `List<Order> getByStatusAndOrderTimeLT(Integer status, LocalDateTime orderTime)`

```java
@Repository  
public class OrderDAO {  
    @Autowired  
    private OrderMapper orderMapper;  
  
    /**  
     * 根据状态和下单时间查询订单  
     *  
     * @param status    订单状态  
     * @param orderTime 下单时间  
     * @return 符合条件的订单列表  
     */  
    public List<Order> getByStatusAndOrderTimeLT(Integer status, LocalDateTime orderTime) {  
       LambdaQueryWrapper<Order> queryWrapper = new LambdaQueryWrapper<>();  
       queryWrapper.eq(Order::getStatus, status)  
             .lt(Order::getOrderTime, orderTime);  
       return orderMapper.selectList(queryWrapper);  
    }
```

## 15 [[WebSocket]]

### 15.1 Spring WebSocket

> [!warning] Spring WebSocket  
>
> - 在 Spring WebSocket 中，`@OnOpen`、`@OnClose` 和 `@OnMessage` 注解通常用于 Java EE 的 WebSocket API（如 javax.websocket），而不是 Spring 的 WebSocket 支持。Spring WebSocket 使用的是 `WebSocketHandler` 接口及其实现类（如 `TextWebSocketHandler`）来处理 WebSocket 事件。
> - 使用 `TextWebSocketHandler` 类重写 WebSocket 事件处理方法是 Spring WebSocket 的推荐方式，而不是使用` @OnOpen`、`@OnClose` 和 `@OnMessage` 注解。

1. 引入依赖

	```xml
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-websocket</artifactId>
	</dependency>
	```

2. 配置类 `WebSocketConfig`

	```java
	package com.sky.config;  
	  
	import com.sky.websocket.MyWebSocketHandler;  
	import org.springframework.context.annotation.Configuration;  
	import org.springframework.web.socket.config.annotation.EnableWebSocket;  
	import org.springframework.web.socket.config.annotation.WebSocketConfigurer;  
	import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;  
	  
	/**  
	 * WebSocket配置类，用于注册WebSocket处理器  
	 */  
	@Configuration  
	@EnableWebSocket  
	public class WebSocketConfig implements WebSocketConfigurer {  
	  
	    /**  
	     * 注册WebSocket处理器  
	     *  
	     * @param registry 用于注册处理器的WebSocketHandlerRegistry  
	     */    @Override  
	    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {  
	       // 注册MyWebSocketHandler，指定端点为"/ws/{sid}"，允许所有来源  
	       registry.addHandler(new MyWebSocketHandler(), "/ws/{sid}")  
	             .setAllowedOrigins("*");  
	    }  
	}
	```

3. `WebSocketHandler` 实现类 `MyWebSocketHandler`

	```java
	package com.sky.websocket;  
	  
	import lombok.extern.slf4j.Slf4j;  
	import org.springframework.stereotype.Component;  
	import org.springframework.web.socket.CloseStatus;  
	import org.springframework.web.socket.TextMessage;  
	import org.springframework.web.socket.WebSocketSession;  
	import org.springframework.web.socket.handler.TextWebSocketHandler;  
	  
	import java.util.HashMap;  
	import java.util.Map;  
	  
	/**  
	 * WebSocket服务  
	 */  
	@Slf4j  
	@Component  
	public class MyWebSocketHandler extends TextWebSocketHandler {  
	  
	    //存放会话对象  
	    private static final Map<String, WebSocketSession> sessionMap = new HashMap<>();  
	  
	    @Override  
	    public void afterConnectionEstablished(WebSocketSession session) throws Exception {  
	       try {  
	          String sid = session.getId();  
	          System.out.println("客户端: " + sid + " 建立连接");  
	          sessionMap.put(sid, session);  
	       } catch (Exception e) {  
	          log.error("Error establishing connection: {}", session.getId(), e);  
	          throw e;  
	       }  
	    }  
	  
	    @Override  
	    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {  
	       try {  
	          String sid = session.getId();  
	          System.out.println("收到来自客户端: " + sid + " 的信息: " + message.getPayload());  
	       } catch (Exception e) {  
	          log.error("Error handling message: {}", session.getId(), e);  
	          throw e;  
	       }  
	    }  
	  
	    @Override  
	    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {  
	       try {  
	          String sid = session.getId();  
	          System.out.println("连接断开: " + sid);  
	          sessionMap.remove(sid);  
	       } catch (Exception e) {  
	          log.error("Error closing connection: {}", session.getId(), e);  
	          throw e;  
	       }  
	    }  
	  
	    /**  
	     * 群发消息  
	     *  
	     * @param message 要发送的消息  
	     */  
	    public void sendToAllClient(String message) {  
	       sessionMap.values().forEach(session -> {  
	          try {  
	             // 服务器向客户端发送消息  
	             session.sendMessage(new TextMessage(message));  
	          } catch (Exception e) {  
	             // 使用日志记录异常  
	             log.error("Error sending message to client: {}", session.getId(), e);  
	          }  
	       });  
	    }  
	}
	```

4. 简易 HTML

	```html
	<!DOCTYPE HTML>  
	<html>  
	<head>  
	    <meta charset="UTF-8">  
	    <title>WebSocket Demo</title>  
	</head>  
	<body>  
	<input id="text" type="text"/>  
	<button onclick="send()">发送消息</button>  
	<button onclick="closeWebSocket()">关闭连接</button>  
	<div id="message">  
	</div>  
	</body>  
	<script type="text/javascript">  
	    let websocket = null;  
	    const clientId = Math.random().toString(36).substr(2);  
	  
	    //判断当前浏览器是否支持WebSocket  
	    if ('WebSocket' in window) {  
	        //连接WebSocket节点  
	        websocket = new WebSocket("ws://localhost:8080/ws/" + clientId);  
	    } else {  
	        alert('Not support websocket')  
	    }  
	  
	    //连接发生错误的回调方法  
	    websocket.onerror = function () {  
	        setMessageInnerHTML("error");  
	    };  
	  
	    //连接成功建立的回调方法  
	    websocket.onopen = function () {  
	        setMessageInnerHTML("连接成功");  
	    }  
	  
	    //接收到消息的回调方法  
	    websocket.onmessage = function (event) {  
	        setMessageInnerHTML(event.data);  
	    }  
	  
	    //连接关闭的回调方法  
	    websocket.onclose = function () {  
	        setMessageInnerHTML("close");  
	    }  
	  
	    //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。  
	    window.onbeforeunload = function () {  
	        websocket.close();  
	    }  
	  
	    //将消息显示在网页上  
	    function setMessageInnerHTML(innerHTML) {  
	        document.getElementById('message').innerHTML += innerHTML + '<br/>';  
	    }  
	  
	    //发送消息  
	    function send() {  
	        const message = document.getElementById('text').value;  
	        websocket.send(message);  
	    }  
	  
	    //关闭连接  
	    function closeWebSocket() {  
	        websocket.close();  
	    }  
	</script>  
	</html>
	```

5. 定时任务 `WebSocketTask`

	```java
	package com.sky.task;  
	  
	import com.sky.websocket.MyWebSocketHandler;  
	import org.springframework.beans.factory.annotation.Autowired;  
	import org.springframework.scheduling.annotation.Scheduled;  
	import org.springframework.stereotype.Component;  
	  
	import java.time.LocalDateTime;  
	import java.time.format.DateTimeFormatter;  
	  
	/**  
	 * WebSocketTask 是一个 Spring 组件，用于定期向 WebSocket 客户端发送消息。  
	 */  
	@Component  
	public class WebSocketTask {  
	    @Autowired  
	    private MyWebSocketHandler myWebSocketHandler;  
	  
	    /**  
	     * 每隔5秒向所有连接的 WebSocket 客户端发送消息。  
	     * <p>  
	     * 消息内容包括当前服务器时间，格式为 HH:mm:ss。  
	     */  
	    @Scheduled(cron = "0/5 * * * * ?")  
	    public void sendMessageToClient() {  
	       myWebSocketHandler.sendToAllClient("这是来自服务端的消息: " + DateTimeFormatter  
	             .ofPattern("HH:mm:ss")  
	             .format(LocalDateTime.now()));  
	    }  
	}
	```

6. 实际应用：来单通知 && 用户催单

	```java
	@Autowired  
	MyWebSocketHandler myWebSocketHandler;
	
	/**  
	 * 支付成功后，修改订单状态  
	 *  
	 * @param outTradeNo 支付交易号  
	 */  
	@Override  
	public void paySuccess(String outTradeNo) {  
	    // 根据订单号查询当前用户的订单  
	    Order orderDB = orderMapper.selectOne(new LambdaQueryWrapper<Order>()  
	          .eq(Order::getNumber, outTradeNo) // 订单号  
	          .eq(Order::getUserId, BaseContext.getCurrentId())); // 用户id  
	  
	    // 根据订单id更新订单的状态、支付方式、支付状态、结账时间  
	    Order order = Order.builder()  
	          .id(orderDB.getId())  
	          .status(Order.TO_BE_CONFIRMED) // 待接单  
	          .payStatus(Order.PAID) // 已支付  
	          .checkoutTime(LocalDateTime.now()) // 结账时间  
	          .build();  
	  
	    orderMapper.updateById(order);  
	  
	    // 支付成功后，向后台客户端发送消息  
	    Map<String, Object> map = new HashMap<>();  
	    map.put("type", 1); // 消息类型，1表示来单提醒  
	    map.put("orderId", order.getId());  
	    map.put("content", "订单号：" + outTradeNo);  
	  
	    // 通过WebSocket实现来单提醒，向客户端浏览器推送消息  
	    myWebSocketHandler.sendToAllClient(JSON.toJSONString(map));  
	}
	
	/**  
	 * 用户催单  
	 *  
	 * @param id 订单ID  
	 */@Override  
	public void reminder(Long id) {  
	    // 查询订单是否存在  
	    Order order = Optional.ofNullable(orderMapper.selectById(id))  
	          .orElseThrow(() -> new OrderBusinessException(MessageConstant.ORDER_NOT_FOUND));  
	  
	    // 基于WebSocket实现催单  
	    Map<String, Object> map = new HashMap<>();  
	    map.put("type", 2); // 2代表用户催单  
	    map.put("orderId", id);  
	    map.put("content", "订单号：" + order.getNumber());  
	  
	    // 通过WebSocket向所有客户端发送催单消息  
	    myWebSocketHandler.sendToAllClient(JSON.toJSONString(map));  
	}
	```

### 15.2 旧的写法 （仅作记录）：

1. `WebSocketServer`

	```java
	package com.sky.websocket;
	
	import org.springframework.stereotype.Component;
	import javax.websocket.OnClose;
	import javax.websocket.OnMessage;
	import javax.websocket.OnOpen;
	import javax.websocket.Session;
	import javax.websocket.server.PathParam;
	import javax.websocket.server.ServerEndpoint;
	import java.util.Collection;
	import java.util.HashMap;
	import java.util.Map;
	
	/**
	 * WebSocket服务
	 */
	@Component
	@ServerEndpoint("/ws/{sid}")
	public class WebSocketServer {
	
	    //存放会话对象
	    private static Map<String, Session> sessionMap = new HashMap();
	
	    /**
	     * 连接建立成功调用的方法
	     */
	    @OnOpen
	    public void onOpen(Session session, @PathParam("sid") String sid) {
	        System.out.println("客户端：" + sid + "建立连接");
	        sessionMap.put(sid, session);
	    }
	
	    /**
	     * 收到客户端消息后调用的方法
	     *
	     * @param message 客户端发送过来的消息
	     */
	    @OnMessage
	    public void onMessage(String message, @PathParam("sid") String sid) {
	        System.out.println("收到来自客户端：" + sid + "的信息:" + message);
	    }
	
	    /**
	     * 连接关闭调用的方法
	     *
	     * @param sid
	     */
	    @OnClose
	    public void onClose(@PathParam("sid") String sid) {
	        System.out.println("连接断开:" + sid);
	        sessionMap.remove(sid);
	    }
	
	    /**
	     * 群发
	     *
	     * @param message
	     */
	    public void sendToAllClient(String message) {
	        Collection<Session> sessions = sessionMap.values();
	        for (Session session : sessions) {
	            try {
	                //服务器向客户端发送消息
	                session.getBasicRemote().sendText(message);
	            } catch (Exception e) {
	                e.printStackTrace();
	            }
	        }
	    }
	
	}
	```

2. `WebSocketConfiguration`

	```java
	package com.sky.config;
	
	import org.springframework.context.annotation.Bean;
	import org.springframework.context.annotation.Configuration;
	import org.springframework.web.socket.server.standard.ServerEndpointExporter;
	
	/**
	 * WebSocket配置类，用于注册WebSocket的Bean
	 */
	@Configuration
	public class WebSocketConfiguration {
	
	    @Bean
	    public ServerEndpointExporter serverEndpointExporter() {
	        return new ServerEndpointExporter();
	    }
	
	}
	```

## 16 [[Apache ECharts]]

## 17 [[Apache POI]]

导出统计数据到 Excel

```java
/**  
 * 导出近30天的运营数据报表  
 *  
 * @param response HttpServletResponse对象，用于写入导出的报表数据  
 **/  
@Override  
public void exportBusinessData(HttpServletResponse response) {  
    LocalDate begin = LocalDate.now().minusDays(30);  
    LocalDate end = LocalDate.now().minusDays(1);  
    // 查询概览运营数据，提供给Excel模板文件  
    BusinessDataVO businessData = workspaceService.getBusinessData(LocalDateTime.of(begin, LocalTime.MIN), LocalDateTime.of(end, LocalTime.MAX));  
    InputStream inputStream = this.getClass().getClassLoader().getResourceAsStream("template/运营数据报表模板.xlsx");  
    try {  
       // 基于提供好的模板文件创建一个新的Excel表格对象  
       assert inputStream != null;  
       XSSFWorkbook excel = new XSSFWorkbook(inputStream);  
       // 获得Excel文件中的一个Sheet页  
       XSSFSheet sheet = excel.getSheet("Sheet1");  
  
       sheet.getRow(1).getCell(1).setCellValue(begin + "至" + end);  
       // 获得第4行  
       XSSFRow row = sheet.getRow(3);  
       // 获取单元格  
       row.getCell(2).setCellValue(businessData.getTurnover());  
       row.getCell(4).setCellValue(businessData.getOrderCompletionRate());  
       row.getCell(6).setCellValue(businessData.getNewUsers());  
       row = sheet.getRow(4);  
       row.getCell(2).setCellValue(businessData.getValidOrderCount());  
       row.getCell(4).setCellValue(businessData.getUnitPrice());  
       for (int i = 0; i < 30; i++) {  
          LocalDate date = begin.plusDays(i);  
          // 准备明细数据  
          businessData = workspaceService.getBusinessData(LocalDateTime.of(date, LocalTime.MIN), LocalDateTime.of(date, LocalTime.MAX));  
          row = sheet.getRow(7 + i);  
          row.getCell(1).setCellValue(date.toString());  
          row.getCell(2).setCellValue(businessData.getTurnover());  
          row.getCell(3).setCellValue(businessData.getValidOrderCount());  
          row.getCell(4).setCellValue(businessData.getOrderCompletionRate());  
          row.getCell(5).setCellValue(businessData.getUnitPrice());  
          row.getCell(6).setCellValue(businessData.getNewUsers());  
       }  
       // 通过输出流将文件下载到客户端浏览器中  
       ServletOutputStream out = response.getOutputStream();  
       excel.write(out);  
       // 关闭资源  
       out.flush();  
       out.close();  
       excel.close();  
  
    } catch (IOException e) {  
       e.printStackTrace();  
    }  
}
```

`WorkspaceService` 关联到的部分方法

```java
/**  
 * 根据订单状态查询订单数量  
 *  
 * @param map    包含查询参数的映射  
 * @param status 要查询的订单状态  
 * @return 指定状态的订单数量，如果没有找到则返回0  
 */private Number getOrderCountByStatus(Map<String, Object> map, Integer status) {  
    map.put("status", status);  
    return Optional.ofNullable(orderDAO.countByMap(map)).orElse(0);  
}  
  
/**  
 * 根据时间段统计营业数据  
 *  
 * @param begin 开始时间  
 * @param end   结束时间  
 * @return 统计的营业数据  
 * <p>  
 * 营业额：当日已完成订单的总金额  
 * 有效订单：当日已完成订单的数量  
 * 订单完成率：有效订单数 / 总订单数  
 * 平均客单价：营业额 / 有效订单数  
 * 新增用户：当日新增用户的数量  
 */  
@Override  
public BusinessDataVO getBusinessData(LocalDateTime begin, LocalDateTime end) {  
  
    Map<String, Object> map = new HashMap<>();  
    map.put("begin", begin);  
    map.put("end", end);  
  
    Integer totalOrderCount = (Integer) getOrderCountByStatus(map, null); // 查询总订单数  
  
    map.put("status", Order.COMPLETED);  
  
    Double turnover = Optional.ofNullable(orderDAO.sumByMap(map)).orElse(0.0); // 营业额  
    Integer validOrderCount = (Integer) getOrderCountByStatus(map, Order.COMPLETED); // 有效订单数  
  
    double unitPrice = 0.0; // 平均客单价  
    double orderCompletionRate = 0.0; // 订单完成率  
    if (totalOrderCount != 0 && validOrderCount != 0) {  
       orderCompletionRate = validOrderCount.doubleValue() / totalOrderCount; // 订单完成率  
       unitPrice = turnover / validOrderCount; // 平均客单价  
    }  
  
    Integer newUsers = userDAO.countByMap(map); // 新增用户数  
  
    return BusinessDataVO.builder()  
          .turnover(turnover)  
          .validOrderCount(validOrderCount)  
          .orderCompletionRate(orderCompletionRate)  
          .unitPrice(unitPrice)  
          .newUsers(newUsers)  
          .build();  
}
```
