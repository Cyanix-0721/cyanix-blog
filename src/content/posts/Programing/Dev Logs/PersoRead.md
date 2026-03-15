---
tags: 
title: PersoRead
date created: 2024-11-07 02:42:11
date modified: 2026-03-14 09:35:23
date: 2026-03-15 02:52:39
---

# PersoRead

## 1 随机服务运行端口

通用模块进行如下配置，并确保配置文件中没有硬编码端口设置，如果有手动端口设置，则不进行随机端口分配

> [!important] 属性源冲突
>
> ### **原因分析**
>
> 1. **属性源名称冲突**：
> 
>     - 当您使用相同的属性源名称（例如 `"randomPort"`）为多个不同的属性添加端口时，第二次添加时会覆盖第一次添加的属性源。这意味着 `server.port` 被设置后，`dubbo.protocol.port` 使用相同的属性源名称会替换掉 `server.port` 的设置。
> 2. **属性源的优先级**：
> 
>     - Spring 环境中的属性源具有优先级，越靠前的属性源优先级越高。因此，确保每个属性源具有唯一名称并正确添加到属性源列表的开头，可以避免覆盖问题。
> 
> ### **解决方案**
>
> 要避免属性源名称冲突，确保每个 `EnvironmentPostProcessor` 实例为不同的属性使用唯一的属性源名称。您已在代码中实现了这一点，通过将 `portProperty` 添加到属性源名称中，如 `"randomPort-server.port"` 和 `"randomPort-dubbo.protocol.port"`。这种方式确保每个属性有一个独立的属性源，不会相互覆盖。

```java
package com.mole.persoread.config;  
  
import lombok.extern.slf4j.Slf4j;  
import org.springframework.boot.SpringApplication;  
import org.springframework.boot.env.EnvironmentPostProcessor;  
import org.springframework.core.env.ConfigurableEnvironment;  
import org.springframework.core.env.PropertiesPropertySource;  
  
import java.io.IOException;  
import java.net.ServerSocket;  
import java.util.Properties;  
import java.util.Random;  
  
@Slf4j  
public abstract class RandomPortEnvironmentPostProcessor implements EnvironmentPostProcessor {  
  
    // 最大尝试次数  
    private static final int MAX_ATTEMPTS = 100;  
  
    // 配置属性名称  
    protected final String portProperty;  
  
    // 最小端口号  
    protected final int minPort;  
  
    // 最大端口号  
    protected final int maxPort;  
  
    /**  
     * 构造函数  
     *  
     * @param portProperty 配置属性名称  
     * @param minPort      最小端口号  
     * @param maxPort      最大端口号  
     */  
    protected RandomPortEnvironmentPostProcessor(String portProperty, int minPort, int maxPort) {  
        this.portProperty = portProperty;  
        this.minPort = minPort;  
        this.maxPort = maxPort;  
    }  
  
    /**  
     * 后置处理环境  
     *  
     * @param environment 环境  
     * @param application 应用  
     */  
    @Override  
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {  
        log.info("{} is being executed", this.getClass().getSimpleName());  
        if (isPortAlreadySet(environment)) {  
            return;  
        }  
        Properties props = new Properties();  
        int port = findRandomAvailablePort();  
        if (port != -1) {  
            props.put(portProperty, port);  
            log.info("Props updated: {}", props);  
            String propertySourceName = "randomPort-" + portProperty;  
            environment.getPropertySources().addFirst(new PropertiesPropertySource(propertySourceName, props));  
            log.info("environment: {}", environment.getProperty(portProperty));  
            log.info("Random port {} assigned to {}", port, portProperty);  
        } else {  
            throw new IllegalStateException("No available ports found in the range " + minPort + "-" + maxPort);  
        }  
    }  
  
    /**  
     * 检查端口是否已经设置  
     *  
     * @param environment 环境  
     * @return 如果端口已设置且不为 -1，则返回 true，否则返回 false  
     */    protected boolean isPortAlreadySet(ConfigurableEnvironment environment) {  
        String portValue = environment.getProperty(portProperty);  
        if (portValue != null && !"-1".equals(portValue)) {  
            log.info("Port {} is already set for {}", portValue, portProperty);  
            return true;  
        }  
        return false;  
    }  
  
    /**  
     * 查找指定范围内的可用随机端口  
     *  
     * @return 可用端口号，如果未找到则返回-1  
     */    private int findRandomAvailablePort() {  
        Random random = new Random();  
        for (int i = 0; i < MAX_ATTEMPTS; i++) {  
            int port = random.nextInt((maxPort - minPort) + 1) + minPort;  
            if (isPortAvailable(port)) {  
                return port;  
            }  
        }  
        return -1;  
    }  
  
    /**  
     * 检查端口是否可用  
     *  
     * @param port 端口号  
     * @return 是否可用  
     */  
    private boolean isPortAvailable(int port) {  
        try (ServerSocket socket = new ServerSocket(port)) {  
            socket.setReuseAddress(true);  
            return true;  
        } catch (IOException e) {  
            log.warn("Port {} is not available", port);  
            return false;  
        }  
    }  
}
```

```java
package com.mole.persoread.config;  
  
public class RandomServerPortEnvironmentPostProcessor extends RandomPortEnvironmentPostProcessor {  
  
    public RandomServerPortEnvironmentPostProcessor() {  
        super("server.port", 8000, 9000);  
    }  
}
```

```java
package com.mole.persoread.config;  
  
public class RandomDubboPortEnvironmentPostProcessor extends RandomPortEnvironmentPostProcessor {  
  
    public RandomDubboPortEnvironmentPostProcessor() {  
        super("dubbo.protocol.port", 20880, 21000);  
    }  
}
```

`src/main/resources/META-INF/spring.factories`

```
org.springframework.boot.env.EnvironmentPostProcessor=com.mole.persoread.config.RandomServerPortEnvironmentPostProcessor,com.mole.persoread.config.RandomDubboPortEnvironmentPostProcessor
```

## 2 分布式事务管理 ![[Spring Cloud Alibaba Seata]]
