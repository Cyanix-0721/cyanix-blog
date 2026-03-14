# Netty WebSocket 实现详解

## 1 WebSocket 简介

WebSocket 是一种网络通信协议，提供全双工通信通道，使得客户端和服务器之间可以进行实时双向数据传输。

### 1.1 主要特点

- 建立在 TCP 协议之上
- 与 HTTP 协议有良好的兼容性
- 数据格式轻量，性能开销小
- 可以发送文本和二进制数据
- 没有同源限制，客户端可以与任意服务器通信

## 2 Netty WebSocket 服务器实现

### 2.1 基础服务器实现

```java
public class WebSocketServer {
    private int port;

    public WebSocketServer(int port) {
        this.port = port;
    }

    public void run() throws Exception {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new WebSocketServerInitializer());

            Channel ch = bootstrap.bind(port).sync().channel();
            ch.closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
}
```

### 2.2 WebSocket 初始化器

```java
public class WebSocketServerInitializer extends ChannelInitializer<SocketChannel> {
    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        ChannelPipeline pipeline = ch.pipeline();
        
        // HTTP 请求解码器
        pipeline.addLast(new HttpServerCodec());
        // HTTP 消息聚合
        pipeline.addLast(new HttpObjectAggregator(65536));
        // WebSocket 协议处理
        pipeline.addLast(new WebSocketServerProtocolHandler("/websocket"));
        // 自定义处理器
        pipeline.addLast(new WebSocketFrameHandler());
    }
}
```

### 2.3 WebSocket 处理器

```java
public class WebSocketFrameHandler extends SimpleChannelInboundHandler<WebSocketFrame> {
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, WebSocketFrame frame) throws Exception {
        // 处理文本消息
        if (frame instanceof TextWebSocketFrame) {
            String request = ((TextWebSocketFrame) frame).text();
            ctx.channel().writeAndFlush(new TextWebSocketFrame("服务器收到消息：" + request));
        }
        // 处理二进制消息
        else if (frame instanceof BinaryWebSocketFrame) {
            ByteBuf content = frame.content();
            ctx.channel().writeAndFlush(new BinaryWebSocketFrame(content.retain()));
        }
        // 处理 Ping 消息
        else if (frame instanceof PingWebSocketFrame) {
            ctx.channel().writeAndFlush(new PongWebSocketFrame(frame.content().retain()));
        }
        // 处理关闭
        else if (frame instanceof CloseWebSocketFrame) {
            ctx.close();
        }
    }

    @Override
    public void handlerAdded(ChannelHandlerContext ctx) {
        System.out.println("Client " + ctx.channel().id() + " connected");
    }

    @Override
    public void handlerRemoved(ChannelHandlerContext ctx) {
        System.out.println("Client " + ctx.channel().id() + " disconnected");
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}
```

## 3 WebSocket 消息类型

### 3.1 文本消息

```java
// 发送文本消息
ctx.channel().writeAndFlush(new TextWebSocketFrame("Hello, WebSocket!"));

// 接收文本消息
if (frame instanceof TextWebSocketFrame) {
    String text = ((TextWebSocketFrame) frame).text();
    // 处理文本消息
}
```

### 3.2 二进制消息

```java
// 发送二进制消息
ByteBuf buffer = Unpooled.buffer();
buffer.writeBytes("Binary Data".getBytes());
ctx.channel().writeAndFlush(new BinaryWebSocketFrame(buffer));

// 接收二进制消息
if (frame instanceof BinaryWebSocketFrame) {
    ByteBuf content = frame.content();
    byte[] data = new byte[content.readableBytes()];
    content.readBytes(data);
    // 处理二进制数据
}
```

## 4 WebSocket 心跳机制

### 4.1 心跳处理器

```java
public class WebSocketHeartbeatHandler extends ChannelInboundHandlerAdapter {
    private static final long HEARTBEAT_INTERVAL = 30000; // 30秒
    
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        scheduleHeartbeat(ctx);
        super.channelActive(ctx);
    }
    
    private void scheduleHeartbeat(ChannelHandlerContext ctx) {
        ctx.executor().schedule(() -> {
            if (ctx.channel().isActive()) {
                ctx.channel().writeAndFlush(new PingWebSocketFrame());
                scheduleHeartbeat(ctx);
            }
        }, HEARTBEAT_INTERVAL, TimeUnit.MILLISECONDS);
    }
}
```

## 5 完整的客户端示例

### 5.1 JavaScript 客户端

```javascript
const ws = new WebSocket('ws://localhost:8080/websocket');

ws.onopen = function() {
    console.log('Connected to WebSocket server');
    ws.send('Hello from client!');
};

ws.onmessage = function(event) {
    console.log('Received message:', event.data);
};

ws.onclose = function() {
    console.log('Disconnected from WebSocket server');
};

ws.onerror = function(error) {
    console.error('WebSocket error:', error);
};
```

### 5.2 Java 客户端

```java
public class WebSocketClient {
    private final String url;
    private Channel channel;
    private EventLoopGroup group;

    public WebSocketClient(String url) {
        this.url = url;
    }

    public void connect() throws Exception {
        group = new NioEventLoopGroup();
        Bootstrap bootstrap = new Bootstrap();
        bootstrap.group(group)
                .channel(NioSocketChannel.class)
                .handler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel ch) {
                        ChannelPipeline pipeline = ch.pipeline();
                        pipeline.addLast(new HttpClientCodec());
                        pipeline.addLast(new HttpObjectAggregator(65536));
                        pipeline.addLast(WebSocketClientCompressionHandler.INSTANCE);
                        pipeline.addLast(new WebSocketClientProtocolHandler(
                            new URI(url), WebSocketVersion.V13, null, true, 
                            new DefaultHttpHeaders(), 65536));
                        pipeline.addLast(new WebSocketClientHandler());
                    }
                });

        channel = bootstrap.connect(URI.create(url).getHost(), 
                                  URI.create(url).getPort()).sync().channel();
    }

    public void send(String message) {
        if (channel != null && channel.isActive()) {
            channel.writeAndFlush(new TextWebSocketFrame(message));
        }
    }

    public void disconnect() {
        if (channel != null) {
            channel.close();
        }
        if (group != null) {
            group.shutdownGracefully();
        }
    }
}
```

## 6 性能优化建议

### 6.1 消息压缩

```java
// 在 pipeline 中添加压缩处理器
pipeline.addLast(WebSocketClientCompressionHandler.INSTANCE);
```

### 6.2 连接池管理

```java
public class WebSocketConnectionPool {
    private final ConcurrentHashMap<String, Channel> channels = new ConcurrentHashMap<>();
    
    public void addChannel(String id, Channel channel) {
        channels.put(id, channel);
    }
    
    public Channel getChannel(String id) {
        return channels.get(id);
    }
    
    public void removeChannel(String id) {
        channels.remove(id);
    }
}
```

## 7 安全性考虑

### 7.1 SSL/TLS 支持

```java
public class SecureWebSocketServerInitializer extends ChannelInitializer<SocketChannel> {
    private final SslContext sslCtx;
    
    public SecureWebSocketServerInitializer(SslContext sslCtx) {
        this.sslCtx = sslCtx;
    }
    
    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        ChannelPipeline pipeline = ch.pipeline();
        // 添加 SSL 处理器
        pipeline.addLast(sslCtx.newHandler(ch.alloc()));
        // 其他处理器
        pipeline.addLast(new HttpServerCodec());
        pipeline.addLast(new HttpObjectAggregator(65536));
        pipeline.addLast(new WebSocketServerProtocolHandler("/websocket"));
        pipeline.addLast(new WebSocketFrameHandler());
    }
}
```

## 8 常见问题及解决方案

### 8.1 连接断开检测

```java
@Override
public void userEventTriggered(ChannelHandlerContext ctx, Object evt) {
    if (evt instanceof IdleStateEvent) {
        IdleStateEvent e = (IdleStateEvent) evt;
        if (e.state() == IdleState.READER_IDLE) {
            ctx.close(); // 读超时，关闭连接
        } else if (e.state() == IdleState.WRITER_IDLE) {
            ctx.writeAndFlush(new PingWebSocketFrame()); // 写超时，发送心跳
        }
    }
}
```

### 8.2 重连机制

```java
public class WebSocketReconnectHandler {
    private static final int MAX_RETRY = 5;
    private static final long RETRY_DELAY = 5000; // 5秒
    private int retryCount = 0;
    
    public void reconnect(WebSocketClient client) {
        if (retryCount < MAX_RETRY) {
            new Timer().schedule(new TimerTask() {
                @Override
                public void run() {
                    try {
                        client.connect();
                        retryCount = 0;
                    } catch (Exception e) {
                        retryCount++;
                        reconnect(client);
                    }
                }
            }, RETRY_DELAY);
        }
    }
}
```

## 9 总结

Netty 实现 WebSocket 提供了高性能、可扩展的解决方案。通过合理使用 Netty 的各种组件和处理器，可以构建稳定可靠的 WebSocket 应用。本文详细介绍了从基础实现到性能优化的各个方面，包括服务器端和客户端的完整示例代码。
