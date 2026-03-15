---
tags: 
title: HealthAIHub
date created: 2024-10-16 01:19:44
date modified: 2026-03-14 09:35:23
date: 2026-03-15 02:52:39
---

# HealthAIHub

## 1 RedisUtil

```java
package com.mole.health.util;  
  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.data.redis.core.RedisTemplate;  
import org.springframework.stereotype.Service;  
  
import java.util.List;  
import java.util.Map;  
import java.util.Set;  
import java.util.concurrent.TimeUnit;  
  
@Service  
public class RedisUtil {  
    private final RedisTemplate<String, Object> redisTemplate;  
  
    @Autowired  
    public RedisUtil(RedisTemplate<String, Object> redisTemplate) {  
        this.redisTemplate = redisTemplate;  
    }  
  
    /**  
     * 保存属性  
     */  
    public void set(String key, Object value, long time) {  
        redisTemplate.opsForValue().set(key, value, time, TimeUnit.SECONDS);  
    }  
  
    /**  
     * 保存属性  
     */  
    public void set(String key, Object value) {  
        redisTemplate.opsForValue().set(key, value);  
    }  
  
    /**  
     * 获取属性  
     */  
    public Object get(String key) {  
        return redisTemplate.opsForValue().get(key);  
    }  
  
    /**  
     * 删除属性  
     */  
    public Boolean del(String key) {  
        return redisTemplate.delete(key);  
    }  
  
    /**  
     * 批量删除属性  
     */  
    public Long del(List<String> keys) {  
        return redisTemplate.delete(keys);  
    }  
  
    /**  
     * 设置过期时间  
     */  
    public Boolean expire(String key, long time) {  
        return redisTemplate.expire(key, time, TimeUnit.SECONDS);  
    }  
  
    /**  
     * 获取过期时间  
     */  
    public Long getExpire(String key) {  
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);  
    }  
  
    /**  
     * 判断是否有该属性  
     */  
    public Boolean hasKey(String key) {  
        return redisTemplate.hasKey(key);  
    }  
  
    /**  
     * 按delta递增  
     */  
    public Long incr(String key, long delta) {  
        return redisTemplate.opsForValue().increment(key, delta);  
    }  
  
    /**  
     * 按delta递减  
     */  
    public Long decr(String key, long delta) {  
        return redisTemplate.opsForValue().increment(key, -delta);  
    }  
  
    /**  
     * 获取Hash结构中的属性  
     */  
    public Object hGet(String key, String hashKey) {  
        return redisTemplate.opsForHash().get(key, hashKey);  
    }  
  
    /**  
     * 向Hash结构中放入一个属性  
     */  
    public Boolean hSet(String key, String hashKey, Object value, long time) {  
        redisTemplate.opsForHash().put(key, hashKey, value);  
        return expire(key, time);  
    }  
  
    /**  
     * 向Hash结构中放入一个属性  
     */  
    public void hSet(String key, String hashKey, Object value) {  
        redisTemplate.opsForHash().put(key, hashKey, value);  
    }  
  
    /**  
     * 直接获取整个Hash结构  
     */  
    public Map<Object, Object> hGetAll(String key) {  
        return redisTemplate.opsForHash().entries(key);  
    }  
  
    /**  
     * 直接设置整个Hash结构  
     */  
    public Boolean hSetAll(String key, Map<String, Object> map, long time) {  
        redisTemplate.opsForHash().putAll(key, map);  
        return expire(key, time);  
    }  
  
    /**  
     * 直接设置整个Hash结构  
     */  
    public void hSetAll(String key, Map<String, ?> map) {  
        redisTemplate.opsForHash().putAll(key, map);  
    }  
  
    /**  
     * 删除Hash结构中的属性  
     */  
    public void hDel(String key, Object… hashKey) {  
        redisTemplate.opsForHash().delete(key, hashKey);  
    }  
  
    /**  
     * 判断Hash结构中是否有该属性  
     */  
    public Boolean hHasKey(String key, String hashKey) {  
        return redisTemplate.opsForHash().hasKey(key, hashKey);  
    }  
  
    /**  
     * Hash结构中属性递增  
     */  
    public Long hIncr(String key, String hashKey, Long delta) {  
        return redisTemplate.opsForHash().increment(key, hashKey, delta);  
    }  
  
    /**  
     * Hash结构中属性递减  
     */  
    public Long hDecr(String key, String hashKey, Long delta) {  
        return redisTemplate.opsForHash().increment(key, hashKey, -delta);  
    }  
  
    /**  
     * 获取Set结构  
     */  
    public Set<Object> sMembers(String key) {  
        return redisTemplate.opsForSet().members(key);  
    }  
  
    /**  
     * 向Set结构中添加属性  
     */  
    public Long sAdd(String key, Object… values) {  
        return redisTemplate.opsForSet().add(key, values);  
    }  
  
    /**  
     * 向Set结构中添加属性  
     */  
    public Long sAdd(String key, long time, Object… values) {  
        Long count = redisTemplate.opsForSet().add(key, values);  
        expire(key, time);  
        return count;  
    }  
  
    /**  
     * 是否为Set中的属性  
     */  
    public Boolean sIsMember(String key, Object value) {  
        return redisTemplate.opsForSet().isMember(key, value);  
    }  
  
    /**  
     * 获取Set结构的长度  
     */  
    public Long sSize(String key) {  
        return redisTemplate.opsForSet().size(key);  
    }  
  
    /**  
     * 删除Set结构中的属性  
     */  
    public Long sRemove(String key, Object… values) {  
        return redisTemplate.opsForSet().remove(key, values);  
    }  
  
    /**  
     * 获取List结构中的属性  
     */  
    public List<Object> lRange(String key, long start, long end) {  
        return redisTemplate.opsForList().range(key, start, end);  
    }  
  
    /**  
     * 获取List结构的长度  
     */  
    public Long lSize(String key) {  
        return redisTemplate.opsForList().size(key);  
    }  
  
    /**  
     * 根据索引获取List中的属性  
     */  
    public Object lIndex(String key, long index) {  
        return redisTemplate.opsForList().index(key, index);  
    }  
  
    /**  
     * 向List结构中添加属性  
     */  
    public Long lPush(String key, Object value) {  
        return redisTemplate.opsForList().rightPush(key, value);  
    }  
  
    /**  
     * 向List结构中添加属性  
     */  
    public Long lPush(String key, Object value, long time) {  
        Long index = redisTemplate.opsForList().rightPush(key, value);  
        expire(key, time);  
        return index;  
    }  
  
    /**  
     * 向List结构中批量添加属性  
     */  
    public Long lPushAll(String key, Object… values) {  
        return redisTemplate.opsForList().rightPushAll(key, values);  
    }  
  
    /**  
     * 向List结构中批量添加属性  
     */  
    public Long lPushAll(String key, Long time, Object… values) {  
        Long count = redisTemplate.opsForList().rightPushAll(key, values);  
        expire(key, time);  
        return count;  
    }  
  
    /**  
     * 从List结构中移除属性  
     */  
    public Long lRemove(String key, long count, Object value) {  
        return redisTemplate.opsForList().remove(key, count, value);  
    }  
}
```

## 2 [Sa-Token](https://sa-token.cc/index.html)

使用 Sa-Token 实现用户鉴权，本项目使用 *Simple 简单模式* 实现基础的 jwt 注入：登录数据存储 - Redis / Session 数据存储 - Redis / 注销下线 - 前后端双清除数据

```xml
<!-- sa-token -->  
<dependency>  
    <groupId>cn.dev33</groupId>  
    <artifactId>sa-token-spring-boot3-starter</artifactId>  
</dependency>  
<!-- Sa-Token 整合 Redis (使用fastjson2序列化方式) -->  
<dependency>  
    <groupId>cn.dev33</groupId>  
    <artifactId>sa-token-redis-fastjson2</artifactId>  
</dependency>  
<!-- Sa-Token 整合 jwt --><dependency>  
    <groupId>cn.dev33</groupId>  
    <artifactId>sa-token-jwt</artifactId>  
</dependency>  
<!-- Sa-Token 整合 SpringAOP 实现注解鉴权 -->  
<dependency>  
    <groupId>cn.dev33</groupId>  
    <artifactId>sa-token-spring-aop</artifactId>  
</dependency>
```

```yaml
sa-token:  
  token-name: Authorization  
  timeout: 604800  
  active-timeout: -1  
  is-concurrent: true  
  is-share: false  
  token-style: uuid  
  is-log: false  
  is-read-cookie: false  
  is-read-header: true  
  token-prefix: Bearer  
  jwt-secret-key: puolikaumjhnygbdfvdcsxa  
  is-print: false
```

```java
package com.mole.health.config;  
  
import cn.dev33.satoken.jwt.StpLogicJwtForSimple;  
import cn.dev33.satoken.stp.StpLogic;  
import cn.dev33.satoken.strategy.SaAnnotationStrategy;  
import jakarta.annotation.PostConstruct;  
import org.springframework.context.annotation.Bean;  
import org.springframework.context.annotation.Configuration;  
import org.springframework.core.annotation.AnnotatedElementUtils;  
  
@Configuration  
public class SaTokenConfig {  
    // Sa-Token 整合 jwt (Simple 简单模式)  
    @Bean  
    public StpLogic getStpLogicJwt() {  
        return new StpLogicJwtForSimple();  
    }  
  
    @PostConstruct  
    public void rewriteSaStrategy() {  
        // 重写Sa-Token的注解处理器，增加注解合并功能  
        SaAnnotationStrategy.instance.getAnnotation = AnnotatedElementUtils::getMergedAnnotation;  
    }  
}
```

### 2.1 身份区分

使用 `StpKit.USER` 代替 `StpUtil` 作为用户相关操作的工具类

```java
package com.mole.health.util;  
  
import cn.dev33.satoken.stp.StpLogic;  
import cn.dev33.satoken.stp.StpUtil;  
  
/**  
 * StpLogic 门面类，管理项目中所有的 StpLogic 账号体系  
 */  
public class StpKit {  
  
    /**  
     * 默认原生会话对象  
     */  
    public static final StpLogic DEFAULT = StpUtil.stpLogic;  
  
    /**  
     * Admin 会话对象，管理 Admin 表所有账号的登录、权限认证  
     */  
    public static final StpLogic ADMIN = new StpLogic("admin");  
  
    /**  
     * User 会话对象，管理 User 表所有账号的登录、权限认证  
     */  
    public static final StpLogic USER = new StpLogic("user");  
  
    /**  
     * XX 会话对象，（项目中有多少套账号表，就声明几个 StpLogic 会话对象）  
     */  
    public static final StpLogic XXX = new StpLogic("xx");  
  
}
```

#### 2.1.1 登录校验

```java
package com.mole.health.annotation;  
  
import cn.dev33.satoken.annotation.SaCheckLogin;  
  
import java.lang.annotation.ElementType;  
import java.lang.annotation.Retention;  
import java.lang.annotation.RetentionPolicy;  
import java.lang.annotation.Target;  
  
/**  
 * 登录认证(User)：只有登录之后才能进入该方法  
 * <p> 可标注在函数、类上（效果等同于标注在此类的所有方法上）  
 */  
@SaCheckLogin(type = "user")  
@Retention(RetentionPolicy.RUNTIME)  
@Target({ElementType.METHOD, ElementType.TYPE})  
public @interface SaUserCheckLogin {  
  
}
```

```java
package com.mole.health.annotation;  
  
import cn.dev33.satoken.annotation.SaCheckLogin;  
  
import java.lang.annotation.ElementType;  
import java.lang.annotation.Retention;  
import java.lang.annotation.RetentionPolicy;  
import java.lang.annotation.Target;  
  
/**  
 * 登录认证(Admin)：只有登录之后才能进入该方法  
 * <p> 可标注在函数、类上（效果等同于标注在此类的所有方法上）  
 */  
@SaCheckLogin(type = "admin")  
@Retention(RetentionPolicy.RUNTIME)  
@Target({ElementType.METHOD, ElementType.TYPE})  
public @interface SaAdminCheckLogin {  
  
}
```

## 3 [[Spring Mail]]

使用 Spring Mail 实现邮箱验证码发送

```yaml
spring:
  mail:  
    host: ${MAIL_HOST:your-mail-host}  
    port: ${MAIL_PORT:your-mail-port}  
	username: ${MAIL_USERNAME:your-dev-email}  
    password: ${MAIL_PASSWORD:your-dev-password}  
    properties:  
      mail:  
        smtp:  
          auth: true  
          starttls:  
            enable: true  
          ssl:  
            enable: true
```

```java
package com.mole.health.util;  
  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.beans.factory.annotation.Value;  
import org.springframework.mail.SimpleMailMessage;  
import org.springframework.mail.javamail.JavaMailSender;  
import org.springframework.stereotype.Component;  
  
@Component  
public class EmailUtil {  
  
    private final JavaMailSender mailSender;  
    @Value("${spring.mail.username}")  
    private String emailFrom;  
  
    @Autowired  
    public EmailUtil(JavaMailSender mailSender) {  
        this.mailSender = mailSender;  
    }  
  
    /**  
     * 发送简单文本邮件  
     *  
     * @param to      收件人邮箱地址  
     * @param subject 邮件主题  
     * @param text    邮件内容  
     */  
    public void sendSimpleEmail(String to, String subject, String text) {  
        SimpleMailMessage message = new SimpleMailMessage();  
        message.setFrom(emailFrom);  
        message.setTo(to);  
        message.setSubject(subject);  
        message.setText(text);  
        mailSender.send(message);  
    }  
}
```

### 3.1 Controller

```java
package com.mole.health.controller;  
  
import com.mole.health.result.CommonResult;  
import com.mole.health.util.EmailUtil;  
import io.swagger.v3.oas.annotations.Operation;  
import io.swagger.v3.oas.annotations.tags.Tag;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.web.bind.annotation.PostMapping;  
import org.springframework.web.bind.annotation.RequestMapping;  
import org.springframework.web.bind.annotation.RequestParam;  
import org.springframework.web.bind.annotation.RestController;  
  
@RestController  
@RequestMapping("/email")  
@Tag(name = "EmailController", description = "邮件发送接口")  
public class EmailController {  
  
    private final EmailUtil emailUtil;  
  
    @Autowired  
    public EmailController(EmailUtil emailUtil) {  
        this.emailUtil = emailUtil;  
    }  
  
    /**  
     * 发送简单文本邮件  
     *  
     * @param to      收件人邮箱地址  
     * @param subject 邮件主题  
     * @param text    邮件内容  
     * @return CommonResult<String> 返回结果  
     */  
    @PostMapping("/simple")  
    @Operation(summary = "发送简单文本邮件", description = "发送简单文本邮件")  
    public CommonResult<String> sendSimpleEmail(@RequestParam String to,  
                                                @RequestParam String subject,  
                                                @RequestParam String text) {  
        try {  
            emailUtil.sendSimpleEmail(to, subject, text);  
            return CommonResult.success("Simple email sent successfully");  
        } catch (Exception e) {  
            return CommonResult.failed("Error sending simple email: " + e.getMessage());  
        }  
    }  
}
```

```java
package com.mole.health.controller;  
  
import com.mole.health.dto.user.EmailDto;  
import com.mole.health.result.CommonResult;  
import com.mole.health.service.EmailVerificationCodeService;  
import io.swagger.v3.oas.annotations.Operation;  
import io.swagger.v3.oas.annotations.Parameter;  
import io.swagger.v3.oas.annotations.responses.ApiResponse;  
import io.swagger.v3.oas.annotations.tags.Tag;  
import lombok.extern.slf4j.Slf4j;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.web.bind.annotation.PostMapping;  
import org.springframework.web.bind.annotation.RequestBody;  
import org.springframework.web.bind.annotation.RequestMapping;  
import org.springframework.web.bind.annotation.RestController;  
  
@Slf4j  
@RestController  
@RequestMapping("/email-verification")  
@Tag(name = "EmailVerificationCodeController", description = "邮箱验证码控制器")  
public class EmailVerificationCodeController {  
  
    private final EmailVerificationCodeService emailVerificationCodeService;  
  
    @Autowired  
    public EmailVerificationCodeController(EmailVerificationCodeService emailVerificationCodeService) {  
        this.emailVerificationCodeService = emailVerificationCodeService;  
    }  
  
    /**  
     * 发送验证码接口  
     *  
     * @param emailDto 用户邮箱DTO  
     * @return 发送结果  
     */  
    @PostMapping("/send-code")  
    @Operation(summary = "发送验证码", description = "向指定邮箱发送验证码")  
    @ApiResponse(responseCode = "200", description = "验证码发送成功")  
    public CommonResult<String> sendVerificationCode(@RequestBody @Parameter(description = "用户邮箱") EmailDto emailDto) {  
        try {  
            String code = emailVerificationCodeService.generateCode(emailDto);  
            emailDto.setEmailVerificationCode(code);  
            emailVerificationCodeService.sendCode(emailDto);  
            return CommonResult.success("验证码已发送");  
        } catch (Exception e) {  
            log.error("发送验证码失败", e);  
            return CommonResult.failed("发送验证码失败：" + e.getMessage());  
        }  
    }  
  
    /**  
     * 验证验证码接口  
     *  
     * @param emailDto 包含邮箱和验证码的DTO  
     * @return 验证结果  
     */  
    @PostMapping("/verify-code")  
    @Operation(summary = "验证验证码", description = "验证用户输入的验证码是否正确")  
    @ApiResponse(responseCode = "200", description = "验证码验证结果")  
    public CommonResult<Boolean> verifyCode(@RequestBody @Parameter(description = "邮箱和验证码") EmailDto emailDto) {  
        boolean isValid = emailVerificationCodeService.verifyCode(emailDto);  
        return CommonResult.success(isValid);  
    }  
}
```

### 3.2 Service

```java
package com.mole.health.service;  
  
import com.mole.health.dto.user.EmailDto;  
  
public interface EmailVerificationCodeService {  
  
    /**  
     * 生成验证码  
     *  
     * @param emailDto 包含邮箱的DTO  
     * @return 生成的验证码  
     */  
    String generateCode(EmailDto emailDto);  
  
    /**  
     * 发送验证码  
     *  
     * @param emailDto 包含邮箱和验证码的DTO  
     */    void sendCode(EmailDto emailDto);  
  
    /**  
     * 验证验证码  
     *  
     * @param emailDto 包含邮箱和验证码的DTO  
     * @return 验证结果  
     */  
    boolean verifyCode(EmailDto emailDto);  
}
```

```java
package com.mole.health.service.impl;  
  
import com.mole.health.dto.user.EmailDto;  
import com.mole.health.service.EmailVerificationCodeService;  
import com.mole.health.util.EmailUtil;  
import com.mole.health.util.RedisUtil;  
import lombok.extern.slf4j.Slf4j;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.stereotype.Service;  
  
import java.util.Random;  
  
@Slf4j  
@Service  
public class EmailVerificationCodeServiceImpl implements EmailVerificationCodeService {  
  
    // 验证码过期时间，单位为分钟  
    private static final long CODE_EXPIRE_TIME = 30;  
    private final RedisUtil redisUtil;  
    private final EmailUtil emailUtil;  
  
    /**  
     * 构造函数，通过依赖注入初始化 RedisUtil 和 EmailUtil  
     * @param redisUtil Redis 工具类  
     * @param emailUtil 邮件工具类  
     */  
    @Autowired  
    public EmailVerificationCodeServiceImpl(RedisUtil redisUtil, EmailUtil emailUtil) {  
        this.redisUtil = redisUtil;  
        this.emailUtil = emailUtil;  
    }  
  
    /**  
     * 生成验证码并存储到 Redis 中  
     *  
     * @param emailDto 包含邮箱的 DTO  
     * @return 生成的验证码  
     */  
    @Override  
    public String generateCode(EmailDto emailDto) {  
        String code = generateRandomCode(); // 生成随机验证码  
        // 将验证码存储到 Redis 中，并设置过期时间  
        redisUtil.set(getRedisKey(emailDto.getEmail()), code, CODE_EXPIRE_TIME * 60); // 转换为秒  
        log.info("为邮箱 {} 生成验证码：{}", emailDto.getEmail(), code); // 记录日志  
        return code; // 返回生成的验证码  
    }  
  
    /**  
     * 发送验证码到指定邮箱  
     *  
     * @param emailDto 包含邮箱和验证码的 DTO  
     */    @Override  
    public void sendCode(EmailDto emailDto) {  
        String code = emailDto.getEmailVerificationCode(); // 获取验证码  
        // 发送简单文本邮件  
        emailUtil.sendSimpleEmail(emailDto.getEmail(), "验证码", "您的验证码是：" + code);  
        log.info("向邮箱 {} 发送验证码：{}", emailDto.getEmail(), code); // 记录日志  
    }  
  
    /**  
     * 验证用户输入的验证码是否正确  
     *  
     * @param emailDto 包含邮箱和验证码的 DTO  
     * @return 验证结果  
     */  
    @Override  
    public boolean verifyCode(EmailDto emailDto) {  
        // 从 Redis 中获取存储的验证码  
        String storedCode = (String) redisUtil.get(getRedisKey(emailDto.getEmail()));  
        log.info("验证邮箱 {} 的验证码：{}", emailDto.getEmail(), storedCode); // 记录日志  
        // 比较用户输入的验证码和存储的验证码是否一致  
        boolean isValid = emailDto.getEmailVerificationCode().equals(storedCode);  
        log.info("验证码验证结果：{}", isValid ? "成功" : "失败"); // 记录验证结果  
        return isValid; // 返回验证结果  
    }  
  
    /**  
     * 生成6位随机数字验证码  
     *  
     * @return 生成的验证码  
     */  
    private String generateRandomCode() {  
        Random random = new Random();  
        StringBuilder sb = new StringBuilder();  
        for (int i = 0; i < 6; i++) {  
            sb.append(random.nextInt(10)); // 生成0-9之间的随机数  
        }  
        return sb.toString(); // 返回生成的验证码  
    }  
  
    /**  
     * 获取存储验证码的 Redis 键  
     *  
     * @param email 邮箱地址  
     * @return Redis 键  
     */  
    private String getRedisKey(String email) {  
        return "email_verification_code:" + email; // 拼接 Redis 键  
    }  
}
```

## 4 ![[MinIO & Spring Boot|MinIO]]

## 5 SpringAI

通过 SpringAI 接入 ZhiPuAI （接入操作可参考 [[Spring AI 集成 OpenAI]]）实现个人健康助手，基于 Websocket 实现信息收发，消息持久化到 MongoDB 并缓存到 Redis

### 5.1 后端

```yaml
spring:
  ai:  
    zhipuai:  
      api-key: ${API_KEY:your-default-dev-key}  
      chat:  
        options:  
          model: GLM-4-Flash  
          temperature: 0.7
```

```java
package com.mole.health.config;  
  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.context.annotation.Configuration;  
import org.springframework.web.socket.config.annotation.EnableWebSocket;  
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;  
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;  
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;  
  
import com.mole.health.websocket.AiChatWebSocketHandler;  
  
@Configuration  
@EnableWebSocket  
public class WebSocketConfig implements WebSocketConfigurer {  
  
    private final AiChatWebSocketHandler aiChatWebSocketHandler;  
  
    @Autowired  
    public WebSocketConfig(AiChatWebSocketHandler aiChatWebSocketHandler) {  
        this.aiChatWebSocketHandler = aiChatWebSocketHandler;  
    }  
  
    @Override  
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {  
        registry.addHandler(aiChatWebSocketHandler, "/ws/ai-chat").addInterceptors(new HttpSessionHandshakeInterceptor()).setAllowedOrigins("*");  
    }  
}
```

```java
package com.mole.health.websocket;  
  
import com.fasterxml.jackson.databind.ObjectMapper;  
import com.mole.health.pojo.UserAiInteraction;  
import com.mole.health.repository.UserAiInteractionRepository;  
import com.mole.health.util.RedisUtil;  
import com.mole.health.util.TokenUtil;  
import lombok.extern.slf4j.Slf4j;  
import org.springframework.ai.chat.messages.Message;  
import org.springframework.ai.chat.messages.UserMessage;  
import org.springframework.ai.chat.model.ChatResponse;  
import org.springframework.ai.chat.prompt.Prompt;  
import org.springframework.ai.zhipuai.ZhiPuAiChatModel;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.stereotype.Component;  
import org.springframework.web.socket.CloseStatus;  
import org.springframework.web.socket.TextMessage;  
import org.springframework.web.socket.WebSocketSession;  
import org.springframework.web.socket.handler.TextWebSocketHandler;  
  
import java.time.Instant;  
import java.util.ArrayList;  
import java.util.List;  
import java.util.Objects;  
import java.util.Optional;  
  
/**  
 * 处理 AI 聊天 WebSocket 连接的处理器。  
 */  
@Slf4j  
@Component  
public class AiChatWebSocketHandler extends TextWebSocketHandler {  
  
    private final ObjectMapper objectMapper;  
    private final ZhiPuAiChatModel chatModel;  
    private final RedisUtil redisUtil;  
    private final UserAiInteractionRepository userAiInteractionRepository;  
    private final TokenUtil tokenUtil;  
    private final String basePrompt;  
  
    /**  
     * 构造函数，注入所需的依赖。  
     *  
     * @param objectMapper                用于 JSON 序列化和反序列化的 ObjectMapper  
     * @param chatModel                   用于处理聊天的 AI 模型  
     * @param redisUtil                   用于 Redis 操作的工具类  
     * @param userAiInteractionRepository 用户 AI 交互的存储库  
     */  
    @Autowired  
    public AiChatWebSocketHandler(ObjectMapper objectMapper, ZhiPuAiChatModel chatModel, RedisUtil redisUtil, UserAiInteractionRepository userAiInteractionRepository, TokenUtil tokenUtil) {  
        this.objectMapper = objectMapper;  
        this.chatModel = chatModel;  
        this.redisUtil = redisUtil;  
        this.userAiInteractionRepository = userAiInteractionRepository;  
        this.tokenUtil = tokenUtil;  
        this.basePrompt = "你是一个专业的健康助手AI。请根据以下问题提供简洁、准确的健康建议。如果遇到需要专业医疗诊断的问题，请建议用户咨询医生：\n\n";  
    }  
  
    /**  
     * 处理收到的文本消息。  
     *  
     * @param session 当前的 WebSocket 会话  
     * @param message 收到的文本消息  
     * @throws Exception 处理消息时可能抛出的异常  
     */  
    @Override  
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {  
        log.info("Received message: {}", message.getPayload());  
        String userId = getUserIdFromSession(session);  
        String sessionId = getSessionIdFromSession(session);  
        String question = message.getPayload();  
        log.info("User ID: {}, Session ID: {}, Question: {}", userId, sessionId, question);  
  
        String cacheKey = "user_ai_interaction:" + userId + ":" + sessionId;  
        UserAiInteraction interaction;  
  
        // 尝试从 Redis 缓存中获取交互信息  
        String cachedInteraction = (String) redisUtil.get(cacheKey);  
        log.info("Cached interaction: {}", cachedInteraction);  
        if (cachedInteraction != null) {  
            interaction = objectMapper.readValue(cachedInteraction, UserAiInteraction.class);  
        } else {  
            // 如果缓存中没有，则从数据库中获取  
            Optional<UserAiInteraction> interactionOpt = userAiInteractionRepository.findByUserIdAndSessionId(userId, sessionId);  
            interaction = interactionOpt.orElseGet(() -> UserAiInteraction.builder().userId(userId).sessionId(sessionId).context(new ArrayList<>()).timestamp(Instant.now()).build());  
        }  
  
        List<Message> messages = new ArrayList<>();  
        messages.add(new UserMessage(basePrompt));  
        for (UserAiInteraction.Message contextMessage : interaction.getContext()) {  
            messages.add(new UserMessage(contextMessage.getContent()));  
        }  
        messages.add(new UserMessage(question));  
  
        var prompt = new Prompt(messages);  
        ChatResponse response = chatModel.call(prompt);  
        String answer = response.getResult().getOutput().getContent();  
        log.info("Answer: {}", answer);  
  
        interaction.getContext().add(UserAiInteraction.Message.builder().role("user").content(question).build());  
  
        interaction.getContext().add(UserAiInteraction.Message.builder().role("assistant").content(answer).build());  
        userAiInteractionRepository.save(interaction);  
  
        session.sendMessage(new TextMessage(answer));  
        log.info("Sent answer: {}", answer);  
    }  
  
    /**  
     * 从 WebSocket 会话中获取用户 ID。  
     *  
     * @param session 当前的 WebSocket 会话  
     * @return 用户 ID  
     */    
     private String getUserIdFromSession(WebSocketSession session) {  
        return session.getAttributes().get("userId").toString();  
    }  
  
    /**
     * 从 WebSocket 会话中获取会话 ID。  
     *  
     * @param session 当前的 WebSocket 会话  
     * @return 会话 ID  
     */    
     private String getSessionIdFromSession(WebSocketSession session) {  
        // 直接返回 WebSocket 会话的 ID        
        return session.getId();  
    }  
  
    /**  
     * 在连接建立时进行初始化操作。  
     *  
     * @param session 当前的 WebSocket 会话  
     * @throws Exception 初始化操作时可能抛出的异常  
     */  
    @Override  
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {  
        String query = Objects.requireNonNull(session.getUri()).getQuery();  
        String token = null;  
        if (query != null && query.startsWith("token=")) {  
            token = query.substring(6);  
        }  
  
        if (token != null && !token.isEmpty()) {  
            // 验证 token            
            String userId = tokenUtil.validateTokenAndGetUserId(token);  
            if (userId != null) {  
                session.getAttributes().put("userId", userId);  
                log.info("WebSocket connection established for user: {}", userId);  
            } else {  
                // token 无效，关闭连接  
                session.close(CloseStatus.POLICY_VIOLATION);  
                log.info("WebSocket connection closed due to invalid token");  
            }  
        } else {  
            // 没有提供 token，关闭连接  
            session.close(CloseStatus.POLICY_VIOLATION);  
            log.info("WebSocket connection closed due to missing token");  
        }  
    }  
}
```

因为 StpUtil 无法在非常规 HTTP 上下文中操作，所以创建 TokenUtil 作为中间层引用

```java
package com.mole.health.util;  
  
import lombok.extern.slf4j.Slf4j;  
import org.springframework.stereotype.Component;  
  
@Component  
@Slf4j  
public class TokenUtil {  
  
    public String validateTokenAndGetUserId(String token) {  
        try {  
            // 使用 Sa-Token 验证 token
            Object loginId = StpKit.USER.getLoginIdByToken(token);  
            if (loginId != null) {  
                return loginId.toString();  
            }  
        } catch (Exception e) {  
            // 处理验证过程中的异常  
            log.error("Token validation error", e);  
        }  
        return null;  
    }  
}
```

### 5.2 前端

```ts
import { ref } from 'vue'
import type { Ref } from 'vue'

const apiBasePath = import.meta.env.VITE_API_BASE_PATH || '/api'
const isDevelopment = import.meta.env.MODE === 'development'
const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'

let wsBaseUrl: string

if (isDevelopment) {
  const backendUrl =
    import.meta.env.VITE_DEV_SERVER_URL || window.location.origin
  wsBaseUrl = `${wsProtocol}://${new URL(backendUrl).host}/ws`
} else {
  // 在生产环境中，使用当前页面的主机名
  wsBaseUrl = `${wsProtocol}://${window.location.host}${apiBasePath}/ws`
}

export const useWebSocket = (endpoint: string) => {
  const socket: Ref<WebSocket | null> = ref(null)
  const isConnected = ref(false)

  const connect = () => {
    const token = localStorage.getItem('token')
    socket.value = new WebSocket(`${wsBaseUrl}/${endpoint}?token=${token}`)

    socket.value.onopen = () => {
      isConnected.value = true
      console.log('WebSocket connected')
    }

    socket.value.onclose = () => {
      isConnected.value = false
      console.log('WebSocket disconnected')
    }
    
    socket.value.onerror = error => {
      console.error('WebSocket error:', error)
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
    }
  }

  const sendMessage = (message: string) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(message)
    } else {
      console.error('WebSocket is not connected')
    }
  }
  
  return {
    socket,
    isConnected,
    connect,
    disconnect,
    sendMessage,
  }
}
```

```ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useWebSocket } from '@/service/websocket'

export const useAiChatStore = defineStore('aiChat', () => {
  const { socket, isConnected, connect, disconnect, sendMessage } =
    useWebSocket('ai-chat')
  const messages = ref([
    {
      role: 'assistant',
      content: '您好！我是您的健康助手。有什么可以帮助您的吗？',
    },
  ])
  const isLoading = ref(false)

  const initWebSocket = () => {
    connect()
    if (socket.value) {
      socket.value.onmessage = event => {
        console.log('收到消息:', event.data)
        messages.value.push({ role: 'assistant', content: event.data })
        isLoading.value = false
      }
    }
  }

  const sendChatMessage = (message: string) => {
    if (message.trim() && !isLoading.value) {
      messages.value.push({ role: 'user', content: message })
      isLoading.value = true
      console.log('发送消息:', message)
      sendMessage(message)
    }
  }

  watch(isConnected, newValue => {
    console.log('WebSocket连接状态变化:', newValue)
    if (newValue) {
      console.log('WebSocket已连接')
    } else {
      console.log('WebSocket已断开')
    }
  })

  watch(
    () => socket.value,
    newSocket => {
      console.log('WebSocket实例变化:', newSocket)
      if (newSocket) {
        console.log('新的WebSocket实例已创建')
      } else {
        console.log('WebSocket实例已销毁')
      }
    },
  )

  return {
    messages,
    isLoading,
    isConnected,
    initWebSocket,
    sendChatMessage,
    disconnect,
  }
})
```
