---
tags:
  - SpringBoot
  - Mail
---

# Spring Mail

## 1 简介

Spring Mail 是 Spring Framework 提供的一个模块，用于简化在 Java 应用程序中发送电子邮件的过程。它封装了 Jakarta Mail API（在较新版本中替代了 JavaMail API），提供了一个更加友好和易用的接口。本指南将详细介绍如何在 Spring Boot 应用中集成和使用 Spring Mail。

## 2 环境配置

首先，确保您的项目中包含必要的依赖。在 `pom.xml` 文件中添加以下依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

注意：`spring-boot-starter-mail` 已经包含了必要的 Jakarta Mail API，无需单独添加 `jakarta.mail` 依赖。

## 3 基本配置

在 `application.properties` 或 `application.yml` 文件中配置邮件服务器的详细信息。以下是一个使用 Gmail SMTP 服务器的示例配置：

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.ssl.enable=true
```

注意：对于 Gmail，您可能需要生成一个应用专用密码或开启低安全性应用访问。

## 4 创建 Email 服务

创建一个 `EmailService` 类来封装邮件发送逻辑：

```java
package com.mole.health.service;  
  
import jakarta.mail.MessagingException;  
import jakarta.mail.internet.MimeMessage;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.beans.factory.annotation.Value;  
import org.springframework.core.io.FileSystemResource;  
import org.springframework.mail.SimpleMailMessage;  
import org.springframework.mail.javamail.JavaMailSender;  
import org.springframework.mail.javamail.MimeMessageHelper;  
import org.springframework.stereotype.Service;  
  
import java.io.File;  
  
@Service  
public class EmailService {  
  
    private final JavaMailSender mailSender;  
  
    @Autowired  
    public EmailService(JavaMailSender mailSender) {  
        this.mailSender = mailSender;  
    }  
  
    @Value("${spring.mail.username}")  
    private String emailFrom;  
  
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
  
    /**  
     * 发送HTML格式的邮件  
     *  
     * @param to       收件人邮箱地址  
     * @param subject  邮件主题  
     * @param htmlBody 邮件HTML内容  
     * @throws MessagingException 如果创建或发送邮件时发生错误  
     */  
    public void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {  
        MimeMessage message = mailSender.createMimeMessage();  
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");  
		
		helper.setFrom(emailFrom);
        helper.setTo(to);  
        helper.setSubject(subject);  
        helper.setText(htmlBody, true);  
  
        mailSender.send(message);  
    }  
  
    /**  
     * 发送带附件的邮件  
     *  
     * @param to             收件人邮箱地址  
     * @param subject        邮件主题  
     * @param text           邮件内容  
     * @param attachmentPath 附件路径  
     * @throws MessagingException 如果创建或发送邮件时发生错误  
     */  
    public void sendEmailWithAttachment(String to, String subject, String text, String attachmentPath) throws MessagingException {  
        MimeMessage message = mailSender.createMimeMessage();  
        MimeMessageHelper helper = new MimeMessageHelper(message, true);  

		helper.setFrom(emailFrom);
        helper.setTo(to);  
        helper.setSubject(subject);  
        helper.setText(text);  
  
        FileSystemResource file = new FileSystemResource(new File(attachmentPath));  
        helper.addAttachment("附件名称.jpg", file);  
  
        mailSender.send(message);  
    }  
}
```

## 5 实现控制器

创建一个控制器来处理邮件发送请求：

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/simple")
    public ResponseEntity<String> sendSimpleEmail(@RequestParam String to, 
                                                  @RequestParam String subject, 
                                                  @RequestParam String text) {
        try {
            emailService.sendSimpleEmail(to, subject, text);
            return ResponseEntity.ok("Simple email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error sending simple email: " + e.getMessage());
        }
    }

    @PostMapping("/html")
    public ResponseEntity<String> sendHtmlEmail(@RequestParam String to, 
                                                @RequestParam String subject, 
                                                @RequestParam String htmlBody) {
        try {
            emailService.sendHtmlEmail(to, subject, htmlBody);
            return ResponseEntity.ok("HTML email sent successfully");
        } catch (MessagingException e) {
            return ResponseEntity.badRequest().body("Error sending HTML email: " + e.getMessage());
        }
    }

    @PostMapping("/attachment")
    public ResponseEntity<String> sendEmailWithAttachment(@RequestParam String to, 
                                                          @RequestParam String subject, 
                                                          @RequestParam String text, 
                                                          @RequestParam String attachmentPath) {
        try {
            emailService.sendEmailWithAttachment(to, subject, text, attachmentPath);
            return ResponseEntity.ok("Email with attachment sent successfully");
        } catch (MessagingException e) {
            return ResponseEntity.badRequest().body("Error sending email with attachment: " + e.getMessage());
        }
    }
}
```

## 6 高级功能

### 6.1 发送带内联图片的 HTML 邮件

要在 HTML 邮件中包含内联图片，可以使用 `MimeMessageHelper` 的 `addInline` 方法：

```java
public void sendEmailWithInlineImage(String to, String subject, String htmlBody, String imagePath) throws MessagingException {
    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true);
    helper.setTo(to);
    helper.setSubject(subject);
    
    String imageResourceName = "image001";
    htmlBody = htmlBody.replace("cid:image001", "cid:" + imageResourceName);
    helper.setText(htmlBody, true);
    
    FileSystemResource resource = new FileSystemResource(new File(imagePath));
    helper.addInline(imageResourceName, resource);
    
    mailSender.send(message);
}
```

在 HTML 中，可以这样引用内联图片：

```html
<img src="cid:image001" />
```

### 6.2 使用模板引擎

对于复杂的 HTML 邮件，建议使用模板引擎如 Thymeleaf。首先，添加 Thymeleaf 依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

然后，创建一个 Thymeleaf 模板（例如 `src/main/resources/templates/email-template.html`）：

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title th:text="${subject}"></title>
</head>
<body>
    <h1 th:text="${header}"></h1>
    <p th:text="${message}"></p>
</body>
</html>
```

在 `EmailService` 中使用模板：

```java
@Autowired
private TemplateEngine templateEngine;

public void sendTemplatedEmail(String to, String subject, String templateName, Context context) throws MessagingException {
    String process = templateEngine.process(templateName, context);
    sendHtmlEmail(to, subject, process);
}
```

## 7 最佳实践和注意事项

1. **安全性**：不要在代码或配置文件中硬编码敏感信息如密码。使用环境变量或安全的配置管理系统。

2. **异步发送**：对于大量邮件发送，考虑使用异步方法以提高性能。

3. **重试机制**：实现重试逻辑以处理临时的邮件服务器故障。

4. **日志记录**：详细记录邮件发送的成功和失败情况，以便于故障排除。

5. **限流**：实现发送速率限制，以避免被邮件服务器标记为垃圾邮件发送者。

6. **测试**：在开发环境中使用假的 SMTP 服务器（如 GreenMail）进行测试。

## 8 故障排除

- **身份验证失败**：检查用户名和密码是否正确，对于 Gmail，确保启用了"低安全性应用访问"或使用应用专用密码。

- **连接超时**：检查网络设置，确保没有防火墙阻止 SMTP 端口。

- **SSL/TLS 错误**：确保使用了正确的端口和 SSL/TLS 设置。

- **附件问题**：检查文件路径是否正确，确保有读取权限。

## 9 总结

Spring Mail 提供了一个强大而灵活的框架来处理电子邮件发送。通过本指南，您应该能够在 Spring Boot 应用程序中轻松集成邮件功能，从简单的文本邮件到复杂的 HTML 邮件和带附件的邮件。记住要遵循最佳实践，特别是在处理敏感信息和大规模邮件发送时。随着您的应用程序的增长，可以进一步探索更高级的功能，如邮件模板、国际化和更复杂的邮件队列系统。

使用 Spring Mail 时，请确保您的代码与您使用的 Spring Boot 版本兼容。本指南中的代码示例适用于 Spring Boot 3. x 版本，它使用 Jakarta Mail API。如果您使用的是较旧的 Spring Boot 版本，可能需要将 `jakarta.mail` 导入语句改为 `javax.mail`。
