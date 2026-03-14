---
tags:
  - WebSocket
---

# WebSocket 使用指南

## 1 介绍

WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议。它最初由 HTML5 规范引入，旨在提供一种在客户端和服务器之间建立实时通信的标准化方法。与传统的 HTTP 请求-响应模式不同，WebSocket 允许服务器主动向客户端发送数据，实现了更加高效的双向通信。

## 2 HTTP协议和WebSocket协议对比

### 2.1 HTTP协议

1. **请求-响应模式**：客户端发送请求，服务器返回响应。每个请求和响应都是一次性事务。
2. **无状态**：每次请求都是独立的，服务器不会保留之前请求的状态。
3. **资源消耗**：每次请求都需要新建一个连接，消耗更多资源。

### 2.2 WebSocket协议

1. **全双工通信**：客户端和服务器之间可以双向传输数据，不需要客户端发起请求。
2. **长连接**：一旦建立连接，就可以保持连接状态，直到客户端或服务器关闭连接。
3. **低延迟**：由于是持久连接，数据可以即时传输，延迟较低。
4. **节省资源**：减少了频繁创建和关闭连接的开销，节省了服务器和网络资源。

## 3 WebSocket的优缺点

### 3.1 优点

1. **实时通信**：支持双向数据流，可以实现实时更新，适合在线游戏、实时聊天、股票行情等场景。
2. **低延迟**：由于是持久连接，数据可以即时传输，延迟较低。
3. **节省资源**：减少了频繁创建和关闭连接的开销，节省了服务器和网络资源。
4. **简化开发**：提供了一个标准化的 API，简化了实时通信应用的开发。

### 3.2 缺点

1. **复杂性**：相对于简单的 HTTP 请求-响应模式，WebSocket 的实现和维护更为复杂。
2. **浏览器支持**：虽然现代浏览器基本都支持 WebSocket，但在一些老旧浏览器中可能不支持。
3. **安全性**：需要注意 WebSocket 的安全问题，如跨站脚本攻击（XSS）、跨站请求伪造（CSRF）等。
4. **调试难度**：调试 WebSocket 通信相比于 HTTP 更加困难，需要使用专门的工具和方法。

## 4 Spring下WebSocket的应用

### 4.1 依赖配置

在使用Spring WebSocket之前，需要在项目中添加相关依赖。对于Maven项目，编辑 `pom.xml` 并添加以下依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### 4.2 启用WebSocket

在Spring Boot应用中，可以通过配置类启用WebSocket功能。

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new MyWebSocketHandler(), "/websocket")
                .setAllowedOrigins("*");
    }
}
```

### 4.3 实现WebSocketHandler

```java
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

public class MyWebSocketHandler extends TextWebSocketHandler {

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("Connection established");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        System.out.println("Received message: " + message.getPayload());
        session.sendMessage(new TextMessage("Echo: " + message.getPayload()));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("Connection closed");
    }
}
```

## 5 示例代码

### 5.1 配置类

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

### 5.2 WebSocketHandler实现类

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

## 6 常见问题

### 6.1 为什么我的WebSocket连接无法建立？

1. **确保WebSocket依赖已正确配置**: 检查`pom.xml`或`build.gradle`中的依赖配置。
2. **检查WebSocket路径**: 确保客户端连接的路径与服务器端配置的路径一致。
3. **浏览器兼容性**: 确保使用支持WebSocket的浏览器。

### 6.2 如何处理WebSocket连接的重连？

1. **客户端重连机制**: 在客户端实现重连逻辑，例如在连接关闭时尝试重新连接。
2. **心跳机制**: 通过发送心跳消息来检测连接状态并在必要时重连。
