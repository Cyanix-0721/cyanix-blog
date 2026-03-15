---
tags: [SpringBoot, MinIO, OSS]
title: MinIO & Spring Boot
date created: 2024-10-16 14:59:46
date modified: 2026-03-14 09:35:36
date: 2026-03-15 02:52:39
---

# MinIO & Spring Boot

## 1 简介

本指南详细介绍了如何在 Spring Boot 应用程序中集成 MinIO 对象存储服务, 包括高级功能如存储桶管理、策略配置、详细日志记录以及区分管理员和普通用户操作。

## 2 MinIO 与对象存储服务 (OSS) 的关系

MinIO 是一个高性能的开源对象存储服务器, 兼容 Amazon S 3 API。它可以视为对象存储服务 (OSS) 的一个开源实现, 具有以下特点:

- 兼容 S 3 API
- 支持本地部署, 提供私有云存储解决方案
- 高性能和可扩展性
- 支持多种编程语言的 SDK

## 3 项目配置

### 3.1 添加依赖

在 `pom.xml` 文件中添加必要的依赖:

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>io.minio</groupId>
        <artifactId>minio</artifactId>
        <version>8.5.12</version>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

### 3.2 配置 MinIO 连接

在 `application.properties` 或 `application.yml` 中添加 MinIO 的连接配置:

```yaml
minio:  
  endpoint: http://localhost:9000 #MinIO服务所在地址  
  external-endpoint: http://localhost:9000 #外部访问地址
  accessKey: minioadmin #访问的key  
  secretKey: minioadmin #访问的秘钥  
  bucketName: testbucket #存储桶名称  
  bucketPolicy: |  
    {      "Version": "2012-10-17",      "Statement": [        {          "Effect": "Allow",          "Principal": {            "AWS": ["*"]          },          "Action": [            "s3:GetBucketLocation",            "s3:ListBucket",            "s3:ListBucketMultipartUploads"          ],          "Resource": ["arn:aws:s3:::your-bucket-name"]        },        {          "Effect": "Allow",          "Principal": {            "AWS": ["*"]          },          "Action": [            "s3:GetObject",            "s3:ListMultipartUploadParts",            "s3:PutObject",            "s3:AbortMultipartUpload",            "s3:DeleteObject"          ],          "Resource": ["arn:aws:s3:::your-bucket-name/*"]        }      ]    }
```

## 4 配置类

### 4.1 MinIO 属性类

创建一个 `MinioProperties` 类来映射配置文件中的 MinIO 属性:

```java
package com.mole.health.properties;  
  
import lombok.Getter;  
import lombok.Setter;  
import org.springframework.boot.context.properties.ConfigurationProperties;  
  
@Getter  
@Setter  
@EnableConfigurationProperties(MinioProperties.class)
@ConfigurationProperties(prefix = "minio")  
public class MinioProperties {  
    private String endpoint;  
    private String externalEndpoint;  
    private String accessKey;  
    private String secretKey;  
    private String bucketName;  
    private String bucketPolicy;  
}
```

### 4.2 MinIO 配置类

创建一个配置类来初始化 MinIO 客户端:

```java
package com.mole.health.config;  
  
import com.mole.health.properties.MinioProperties;  
import io.minio.MinioClient;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.boot.context.properties.EnableConfigurationProperties;  
import org.springframework.context.annotation.Bean;  
import org.springframework.context.annotation.Configuration;  
  
@Configuration  
@EnableConfigurationProperties(MinioProperties.class)  
public class MinioConfig {  
    private final MinioProperties minioProperties;  
  
    @Autowired  
    public MinioConfig(MinioProperties minioProperties) {  
        this.minioProperties = minioProperties;  
    }  
  
    @Bean  
    public MinioClient minioClient() {  
        return MinioClient.builder()  
                .endpoint(minioProperties.getEndpoint())  
                .credentials(minioProperties.getAccessKey(), minioProperties.getSecretKey())  
                .build();  
    }  
}
```

## 5 MinIO 工具类实现

创建一个 `MinioUtil` 类来封装 MinIO 的操作:

```java
package com.mole.health.util;  
  
import cn.hutool.core.util.StrUtil;  
import com.mole.health.properties.MinioProperties;  
import io.minio.*;  
import io.minio.http.Method;  
import lombok.extern.slf4j.Slf4j;  
import org.apache.commons.io.IOUtils;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.stereotype.Component;  
import org.springframework.web.multipart.MultipartFile;  
  
import java.io.InputStream;  
import java.util.concurrent.TimeUnit;  
  
@Component  
@Slf4j  
public class MinioUtil {  
    private final MinioClient minioClient;  
    private final MinioProperties minioProperties;  
  
    @Autowired  
    public MinioUtil(MinioClient minioClient, MinioProperties minioProperties) {  
        this.minioClient = minioClient;  
        this.minioProperties = minioProperties;  
    }  
  
    /**  
     * 检查存储桶是否存在  
     *  
     * @param bucketName 存储桶名称  
     * @return 存储桶是否存在  
     * @throws Exception 异常  
     */  
    public boolean bucketExists(String bucketName) throws Exception {  
        return minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());  
    }  
  
    /**  
     * 创建存储桶  
     *  
     * @param bucketName 存储桶名称  
     * @throws Exception 异常  
     */  
    public void createBucket(String bucketName) throws Exception {  
        if (!bucketExists(bucketName)) {  
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());  
            log.info("Bucket {} created successfully", bucketName);  
        }  
    }  
  
    /**  
     * 设置存储桶策略  
     *  
     * @param bucketName 存储桶名称  
     * @throws Exception 异常  
     */  
    public void setBucketPolicy(String bucketName) throws Exception {  
        String policy = minioProperties.getBucketPolicy().replace("your-bucket-name", bucketName);  
        minioClient.setBucketPolicy(SetBucketPolicyArgs.builder().bucket(bucketName).config(policy).build());  
        log.info("Bucket policy set for {}", bucketName);  
    }  
  
    /**  
     * 上传文件到指定存储桶  
     *  
     * @param bucketName 存储桶名称  
     * @param file       文件  
     * @return 文件名  
     * @throws Exception 异常  
     */  
    public String uploadFile(String bucketName, MultipartFile file) throws Exception {  
        String fileName = file.getOriginalFilename();  
        minioClient.putObject(PutObjectArgs.builder().bucket(bucketName).object(fileName).stream(file.getInputStream(), file.getSize(), -1).contentType(file.getContentType()).build());  
        log.info("File {} uploaded successfully to bucket {}", fileName, bucketName);  
        return fileName;  
    }  
  
    /**  
     * 上传文件到指定存储桶并指定文件名  
     *  
     * @param bucketName 存储桶名称  
     * @param fileName   文件名  
     * @param file       文件  
     * @return 文件名  
     * @throws Exception 异常  
     */  
    public String uploadFileWithFileName(String bucketName, String fileName, MultipartFile file) throws Exception {  
        minioClient.putObject(PutObjectArgs.builder()  
                .bucket(bucketName)  
                .object(fileName)  
                .stream(file.getInputStream(), file.getSize(), -1)  
                .contentType(file.getContentType())  
                .build());  
        log.info("File {} uploaded successfully to bucket {}", fileName, bucketName);  
        return fileName;  
    }  
  
    /**  
     * 从指定存储桶下载文件  
     *  
     * @param bucketName 存储桶名称  
     * @param fileName   文件名  
     * @return 文件字节数组  
     * @throws Exception 异常  
     */  
    public byte[] downloadFile(String bucketName, String fileName) throws Exception {  
        InputStream stream = minioClient.getObject(GetObjectArgs.builder().bucket(bucketName).object(fileName).build());  
        return IOUtils.toByteArray(stream);  
    }  
  
    /**  
     * 从指定存储桶删除文件  
     *  
     * @param bucketName 存储桶名称  
     * @param fileName   文件名  
     * @throws Exception 异常  
     */  
    public void deleteFile(String bucketName, String fileName) throws Exception {  
        minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucketName).object(fileName).build());  
        log.info("File {} deleted successfully from bucket {}", fileName, bucketName);  
    }  
  
    /**  
     * 获取文件的预签名 URL  
     *     * @param bucketName 存储桶名称  
     * @param fileName   文件名  
     * @return 预签名 URL  
     * @throws Exception 异常  
     */  
    public String getFileUrl(String bucketName, String fileName) throws Exception {  
        String internalUrl = minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()  
                .method(Method.GET)  
                .bucket(bucketName)  
                .object(fileName)  
                .expiry(7, TimeUnit.DAYS)  
                .build());  
  
        return StrUtil.isNotBlank(minioProperties.getExternalEndpoint())  
                ? StrUtil.replace(internalUrl, minioProperties.getEndpoint(), minioProperties.getExternalEndpoint())  
                : internalUrl;  
    }  
}
```

## 6 控制器实现

### 6.1 统一响应对象

创建一个统一的响应对象 `R`:

```java
package com.mole.mall.common.model;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class R<T> {
    private Integer code;
    private String message; 
    private T data;
    
    public static <T> R<T> ok(T data) {
        return new R<>(200, "操作成功", data);
    }
    
    public static <T> R<T> error(String message) {
        return new R<>(500, message, null);
    }
}
```

### 6.2 管理员控制器

创建一个 `AdminMinioController` 类,提供管理员级别的操作:

```java
package com.mole.mall.common.controller;

@RestController
@RequestMapping("/admin/minio")
@Tag(name = "管理员文件存储接口")
@Slf4j
public class AdminMinioController {
    @Autowired
    private MinioService minioService;

    @Autowired
    private MinioProperties minioProperties;

    @Operation(summary = "上传文件")
    @PostMapping("/upload")
    public R<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        // 文件验证
        if (file.isEmpty()) {
            return R.error("上传文件不能为空");
        }
        if (file.getSize() > 100 * 1024 * 1024) {
            return R.error("文件大小不能超过100MB");
        }
        
        try {
            String bucketName = minioProperties.getBucketName();
            if (!minioService.bucketExists(bucketName)) {
                minioService.createBucket(bucketName);
                minioService.setBucketPolicy(bucketName);
            }
            
            String fileName = minioService.uploadFile(file, bucketName);
            String fileUrl = minioService.getFileUrl(bucketName, fileName);
            
            Map<String, String> result = new HashMap<>();
            result.put("fileName", fileName);
            result.put("fileUrl", fileUrl);
            
            log.info("文件上传成功: {}", result);
            return R.ok(result);
        } catch (Exception e) {
            log.error("文件上传失败", e);
            return R.error("文件上传失败: " + e.getMessage());
        }
    }

    @Operation(summary = "下载文件")
    @GetMapping("/download/{fileName}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String fileName) {
        try {
            byte[] data = minioService.downloadFile(minioProperties.getBucketName(), fileName);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(data);
        } catch (Exception e) {
            log.error("文件下载失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Operation(summary = "删除文件")
    @DeleteMapping("/delete/{fileName}")
    public R<String> deleteFile(@PathVariable String fileName) {
        try {
            minioService.deleteFile(minioProperties.getBucketName(), fileName);
            log.info("文件删除成功: {}", fileName);
            return R.ok("文件删除成功: " + fileName);
        } catch (Exception e) {
            log.error("文件删除失败", e);
            return R.error("文件删除失败: " + e.getMessage());
        }
    }
}
```

### 6.3 普通用户控制器

创建一个 `CommonMinioController` 类,提供基本的文件操作:

```java
package com.mole.mall.common.controller;

@RestController
@RequestMapping("/minio")
@Tag(name = "普通用户文件存储接口")
@Slf4j
public class CommonMinioController {
    @Autowired
    private MinioService minioService;

    @Autowired
    private MinioProperties minioProperties;

    @Operation(summary = "上传文件")
    @PostMapping("/upload")
    public R<String> uploadFile(@RequestParam("file") MultipartFile file) {
        // 文件验证
        if (file.isEmpty()) {
            return R.error("上传文件不能为空");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            return R.error("文件大小不能超过10MB");
        }
        
        try {
            String fileName = minioService.uploadFile(file, minioProperties.getBucketName());
            log.info("文件上传成功: {}", fileName);
            return R.ok(fileName);
        } catch (Exception e) {
            log.error("文件上传失败", e);
            return R.error("文件上传失败: " + e.getMessage());
        }
    }

    @Operation(summary = "下载文件")
    @GetMapping("/download/{fileName}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String fileName) {
        try {
            byte[] data = minioService.downloadFile(minioProperties.getBucketName(), fileName);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(data);
        } catch (Exception e) {
            log.error("文件下载失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
```

## 7 管理员控制器与普通控制器的区别

1. 权限级别:
   - 管理员控制器具有完整的文件管理权限,包括上传、下载、删除等操作
   - 普通控制器仅具有基本的上传和下载权限

2. 文件大小限制:
   - 管理员控制器允许上传最大100MB的文件
   - 普通控制器限制文件大小在10MB以内

3. 存储桶管理:
   - 管理员控制器在上传文件时会检查存储桶是否存在,不存在则创建并设置策略
   - 普通控制器不处理存储桶的存在性检查或创建

4. 响应格式:
   - 管理员控制器上传成功后返回文件名和访问URL
   - 普通控制器仅返回文件名

5. 日志记录:
   - 两个控制器都进行了详细的日志记录
   - 统一使用中文提示信息,便于维护和排错

## 8 安全性考虑

- 在生产环境中, 确保使用 HTTPS 来保护数据传输。
- 实现适当的身份验证和授权机制, 以确保只有授权用户可以访问管理员功能。
- 考虑实现文件大小限制和文件类型验证以增强安全性。
- 对于大文件, 可能需要实现分片上传和断点续传功能。
