# Spring Authorization Server

在微服务架构中，**Spring Authorization Server** 为构建统一的认证与授权服务提供了极大的便利。通过它，开发者可以快速实现 OAuth2 的认证服务、客户端、资源服务等功能，并结合 Spring Cloud Gateway 实现基于 OAuth2 的微服务权限控制。

**Sentinel** 等限流组件可以与 OAuth2 结合，用于保护认证服务的可用性。而 **Seata** 则在分布式事务管理中发挥重要作用，与 OAuth2 的认证授权互补，解决不同层面的系统挑战。

## 1 Spring Authorization Server：实现OAuth2认证服务

**Spring Authorization Server** 是一个提供 OAuth 2.0 和 OpenID Connect (OIDC) 授权服务的框架，能够帮助开发者快速实现认证和授权功能。在电商平台或微服务架构中，认证服务是系统安全的核心，它确保用户或客户端能够在受限资源上进行访问。

1. **依赖配置**：  
   首先，在项目的 `pom.xml` 或 `build.gradle` 文件中添加 Spring Authorization Server 的依赖：

   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-oauth2-authorization-server</artifactId>
   </dependency>
   ```

2. **配置 Authorization Server**：  
   创建一个配置类，启用授权服务器功能：

   ```java
   @Configuration
   @EnableAuthorizationServer
   public class AuthorizationServerConfig extends AuthorizationServerConfigurerAdapter {
       // 配置客户端、token等相关信息
   }
   ```

3. **注册客户端**：  
   配置客户端信息，设置 `client_id`、`client_secret` 等，用于认证授权流程。

4. **测试授权流程**：  
   使用工具如 Postman 模拟请求，测试 `Authorization Code`、`Password` 等 OAuth 2.0 授权模式。

## 2 Spring Authorization Server：实现自定义JWT中内容及异常响应

在 OAuth 2.0 中，JWT（JSON Web Token）用于在客户端和服务器之间安全地传递信息。开发者可以根据业务需求对 JWT 进行自定义，例如向 JWT 中添加用户角色、权限等额外信息。

### 2.1 自定义 JWT 内容

1. **自定义 JWT 生成器**：  
   使用 `JwtCustomizer` 或 `JwtEncoder` 自定义 JWT 中的 Claims。

   ```java
   public class CustomJwtTokenEnhancer implements JwtCustomizer {
       @Override
       public void customize(JwtEncodingContext context) {
           context.getClaims().claim("custom-claim", "custom-value");
       }
   }
   ```

2. **配置 JWT 签名与加密**：  
   配置 JWT 的签名算法和密钥，确保 JWT 在生成和验证时的一致性。

### 2.2 自定义异常响应

自定义认证和授权过程中的异常响应，返回符合业务需求的错误信息。

```java
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
   @Override
   public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) {
       response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
       response.getWriter().write("Custom error message");
   }
}
```

## 3 Spring Authorization Server：实现OAuth2客户端

**OAuth2 客户端**允许应用程序通过授权服务器获取访问令牌，从而访问受保护的资源。

1. **依赖配置**：  
   添加 Spring Security OAuth2 客户端的依赖：

   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-oauth2-client</artifactId>
   </dependency>
   ```

2. **配置 OAuth2 客户端**：  
   在 `application.yml` 或 `application.properties` 中配置 OAuth2 客户端的基本信息，包括 `client_id`、`client_secret` 和 `authorization-uri`。

   ```yaml
   spring:
     security:
       oauth2:
         client:
           registration:
             my-client:
               client-id: your-client-id
               client-secret: your-client-secret
               authorization-grant-type: authorization_code
               redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
   ```

3. **OAuth2 登录流程**：  
   使用 Spring Security 提供的 OAuth2 客户端登录功能：

   ```java
   @GetMapping("/login/oauth2/code/{registrationId}")
   public String oauth2Login(@RequestParam String code) {
       // 使用授权码获取 token
   }
   ```

## 4 Spring Authorization Server：实现OAuth2资源服务

**资源服务**是指受 OAuth2 授权保护的 API 服务，只有经过认证的客户端才能访问。

1. **依赖配置**：  
   添加资源服务的依赖：

   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
   </dependency>
   ```

2. **配置资源服务**：  
   在 `application.yml` 中指定 JWT 解码的配置，确保资源服务能够正确验证客户端的 JWT：

   ```yaml
   spring:
     security:
       oauth2:
         resourceserver:
           jwt:
             issuer-uri: https://your-authorization-server
   ```

3. **资源服务保护**：  
   在控制器中使用安全注解或配置类保护受 OAuth2 保护的资源：

   ```java
   @RestController
   public class ProtectedController {
       @PreAuthorize("hasAuthority('SCOPE_read')")
       @GetMapping("/protected-resource")
       public String getProtectedResource() {
           return "This is a protected resource";
       }
   }
   ```

## 5 Spring Authorization Server：基于Gateway和OAuth2的微服务权限解决方案

在微服务架构中，使用 **API Gateway** 作为统一入口，通过 **OAuth2** 和 **JWT** 来实现对各微服务的权限控制是一种常见的方案。

1. **配置 Gateway 与 OAuth2 集成**：  
   使用 Spring Cloud Gateway 和 Spring Security OAuth2 来保护网关层，通过 JWT 解析访问请求。

   ```yaml
   spring:
     cloud:
       gateway:
         routes:
           - id: secured-route
             uri: http://microservice-url
             predicates:
               - Path=/api/**
             filters:
               - StripPrefix=1
               - TokenRelay
   ```

2. **OAuth2 鉴权与 JWT 校验**：  
   在网关中配置 `TokenRelay` 过滤器，确保请求中的 JWT 能正确传递到下游微服务。同时在下游微服务中校验 JWT，确定用户权限。

3. **微服务权限控制**：  
   在每个微服务中，根据用户的角色、权限信息进行授权控制。例如：

   ```java
   @PreAuthorize("hasRole('ADMIN')")
   @GetMapping("/admin-resource")
   public String adminResource() {
       return "This is an admin resource";
   }
   ```

4. **集中式认证与分布式授权**：  
   API Gateway 负责集中管理认证逻辑，OAuth2 认证服务器提供集中式的授权和 token 颁发，下游的微服务根据 JWT 进行分布式的权限验证。
