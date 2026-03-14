# Spring Cloud Alibaba Seata

**Spring Cloud Alibaba Seata** 是一个专门用于解决分布式事务问题的开源框架。分布式事务是指在分布式系统中跨多个服务或数据库的事务，通常很难保证数据一致性。Seata 提供了高效、简单的分布式事务解决方案，支持微服务架构中的**强一致性**和**最终一致性**。

在电商平台中，多个微服务（如订单、库存、支付等）可能需要跨服务或数据库操作。Seata 能够保证这些操作在出现异常时保持事务的一致性，避免因服务之间的部分失败而导致数据不一致。

> [!summary]
>
> Spring Cloud Alibaba Seata 提供了一个强大且易用的分布式事务解决方案，适合电商平台等分布式系统中的事务处理需求。通过 Seata 的 AT 模式，开发者可以轻松实现跨服务、跨数据库的事务管理，保证数据的一致性和系统的稳定性。

## 1 Seata 的分布式事务模型

Seata 提供了一种**AT 模式（Automatic Transaction）**的分布式事务解决方案，它通过**两阶段提交协议**来确保事务的一致性：

- **第一阶段**：服务执行本地事务，准备提交。
- **第二阶段**：全局事务协调器（TC，Transaction Coordinator）根据各服务的提交情况决定是提交整个事务还是回滚。

Seata 的核心组件：

- **TC**（Transaction Coordinator）：全局事务协调器，负责全局事务的协调和最终提交/回滚。
- **TM**（Transaction Manager）：事务管理器，负责开启全局事务。
- **RM**（Resource Manager）：资源管理器，负责管理本地资源和分支事务的提交/回滚。

## 2 Seata 的应用场景

在电商平台中，常见的分布式事务场景包括：

- **订单服务**调用**库存服务**和**支付服务**，保证订单、库存扣减和支付扣款的一致性。
- **促销活动**中，多个服务如**优惠券**、**库存**、**订单**等需要同步操作，防止数据不一致问题。

## 3 Seata 的集成步骤

### 3.1 添加 Seata 依赖

在 Spring Cloud 项目中，首先需要为各个微服务添加 Seata 依赖。在 `pom.xml` 文件中添加如下依赖：

```xml
<dependency>  
    <groupId>org.apache.seata</groupId>  
    <artifactId>seata-spring-boot-starter</artifactId>  
</dependency>
```

### 3.2 Seata 服务器的部署

Seata 需要运行一个独立的**TC（Transaction Coordinator）**服务器。你可以在本地或集群环境中部署 Seata 服务器，来协调分布式事务的提交与回滚。

以下是 docker compose 部署示例

```yaml
services:  
  mysql:  
    image: mysql:8  
    container_name: mysql  
    command: mysqld --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci  
    restart: always  
    environment:  
      MYSQL_ROOT_PASSWORD: root  
    ports:  
      - "3306:3306"  
    volumes:  
      - mysql_data:/var/lib/mysql  
      - mysql_conf:/etc/mysql/conf.d  
      - mysql_log:/var/log/mysql  
      - ../../docs/mysql/nacos_init.sql:/docker-entrypoint-initdb.d/nacos_init.sql:ro  
      - ../../docs/mysql/seata_init.sql:/docker-entrypoint-initdb.d/seata_init.sql:ro  
      - ../../docs/mysql/perso_read_init.sql:/docker-entrypoint-initdb.d/perso_read_init.sql:ro  
    deploy:  
      resources:  
        limits:  
          cpus: "1.0"  
          memory: 1G  
    networks:  
      - persoread_network  
    healthcheck:  
      test: ["CMD", "mysqladmin", "ping", "-u", "root", "-proot"]  
      interval: 30s  
      timeout: 10s  
      retries: 5  
  
  nacos:  
    image: nacos/nacos-server:v2.4.3  
    container_name: nacos  
    environment:  
      MODE: standalone  
      SPRING_DATASOURCE_PLATFORM: mysql  
      MYSQL_SERVICE_HOST: mysql  
      MYSQL_SERVICE_PORT: 3306  
      MYSQL_SERVICE_DB_NAME: nacos_config  
      MYSQL_SERVICE_USER: root  
      MYSQL_SERVICE_PASSWORD: root  
      MYSQL_SERVICE_DB_PARAM: characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&allowPublicKeyRetrieval=true&useSSL=false  
      MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE: "*"  
      MANAGEMENT_ENDPOINT_PROMETHEUS_ENABLED: "true"  
      NACOS_AUTH_ENABLE: true  
      NACOS_AUTH_TOKEN: EnSSMLn7PD2TCcOefT+1itpD9+zy1SDyPGJhRL0zWgo=  
      NACOS_AUTH_IDENTITY_KEY: custom_server_identity_key  
      NACOS_AUTH_IDENTITY_VALUE: custom_server_identity_value  
      JVM_XMS: "512m"  
      JVM_XMX: "512m"  
      JVM_XMN: "256m"  
    ports:  
      - "8848:8848"  
      - "9848:9848"  
    volumes:  
      - nacos_data:/home/nacos/data  
    restart: always  
    depends_on:  
      - mysql  
    deploy:  
      resources:  
        limits:  
          cpus: "1.0"  
          memory: 1G  
    networks:  
      - persoread_network  
    healthcheck:  
      test:  
        [  
          "CMD",  
          "curl",  
          "-f",  
          "http://localhost:8848/nacos/v1/console/health/liveness",  
        ]  
      interval: 30s  
      timeout: 10s  
      retries: 5  
  
  seata-server:  
    image: seataio/seata-server:2.0.0  
    container_name: seata-server  
    volumes:  
      - ../../docs/seata/application.yml:/seata-server/resources/application.yml:ro  
    environment:  
      - STORE_MODE=db  
      - SEATA_PORT=8091  
      - SEATA_IP=192.168.43.177  
    depends_on:  
      mysql:  
        condition: service_healthy  
      nacos:  
        condition: service_healthy  
    ports:  
      - "8091:8091"  
      - "7091:7091"  
    networks:  
      - persoread_network
```

seata 的配置文件

```yaml
#  Copyright 1999-2019 Seata.io Group.  
#  
#  Licensed under the Apache License, Version 2.0 (the "License");  
#  you may not use this file except in compliance with the License.  
#  You may obtain a copy of the License at  
#  
#  http://www.apache.org/licenses/LICENSE-2.0  
#  
#  Unless required by applicable law or agreed to in writing, software  
#  distributed under the License is distributed on an "AS IS" BASIS,  
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  
#  See the License for the specific language governing permissions and  
#  limitations under the License.  
  
server:  
  port: 7091  
  
spring:  
  application:  
    name: seata-server  
  
logging:  
  config: classpath:logback-spring.xml  
  file:  
    path: ${log.home:${user.home}/logs/seata}  
  extend:  
    logstash-appender:  
      destination: 127.0.0.1:4560  
    kafka-appender:  
      bootstrap-servers: 127.0.0.1:9092  
      topic: logback_to_logstash  
  
console:  
  user:  
    username: seata  
    password: seata  
seata:  
  config:  
    # support: nacos, consul, apollo, zk, etcd3  
    type: nacos  
    nacos:  
      server-addr: nacos:8848  
      namespace:  
      group: SEATA_GROUP  
      username: nacos  
      password: nacos  
      data-id: seataServer.properties  
  registry:  
    # support: nacos, eureka, redis, zk, consul, etcd3, sofa  
    type: nacos  
    nacos:  
      application: seata-server  
      server-addr: nacos:8848  
      group: SEATA_GROUP  
      namespace:  
      # tc集群名称  
      cluster: default  
      username: nacos  
      password: nacos  
  store:  
    # support: file 、 db 、 redis    mode: db  
  #  server:  
  #    service-port: 8091 #If not configured, the default is '${server.port} + 1000'  security:  
    secretKey: SeataSecretKey0c382ef121d778043159209298fd40bf3850a017  
    tokenValidityInMilliseconds: 1800000  
    ignore:  
      urls: /,/**/*.css,/**/*.js,/**/*.html,/**/*.map,/**/*.svg,/**/*.png,/**/*.jpeg,/**/*.ico,/api/v1/auth/login
```

seata 初始化数据库

```sql
-- -------------------------------- The script used when storeMode is 'db' --------------------------------  
SET NAMES utf8mb4;  
  
CREATE DATABASE IF NOT EXISTS seata  
  DEFAULT CHARACTER SET utf8mb4;  
  
USE seata;  
-- the table to store GlobalSession data  
CREATE TABLE IF NOT EXISTS `global_table`  
(  
    `xid`                       VARCHAR(128) NOT NULL,  
    `transaction_id`            BIGINT,  
    `status`                    TINYINT      NOT NULL,  
    `application_id`            VARCHAR(32),  
    `transaction_service_group` VARCHAR(32),  
    `transaction_name`          VARCHAR(128),  
    `timeout`                   INT,  
    `begin_time`                BIGINT,  
    `application_data`          VARCHAR(2000),  
    `gmt_create`                DATETIME,  
    `gmt_modified`              DATETIME,  
    PRIMARY KEY (`xid`),  
    KEY `idx_status_gmt_modified` (`status` , `gmt_modified`),  
    KEY `idx_transaction_id` (`transaction_id`)  
) ENGINE = InnoDB  
  DEFAULT CHARSET = utf8mb4;  
  
-- the table to store BranchSession data  
CREATE TABLE IF NOT EXISTS `branch_table`  
(  
    `branch_id`         BIGINT       NOT NULL,  
    `xid`               VARCHAR(128) NOT NULL,  
    `transaction_id`    BIGINT,  
    `resource_group_id` VARCHAR(32),  
    `resource_id`       VARCHAR(256),  
    `branch_type`       VARCHAR(8),  
    `status`            TINYINT,  
    `client_id`         VARCHAR(64),  
    `application_data`  VARCHAR(2000),  
    `gmt_create`        DATETIME(6),  
    `gmt_modified`      DATETIME(6),  
    PRIMARY KEY (`branch_id`),  
    KEY `idx_xid` (`xid`)  
) ENGINE = InnoDB  
  DEFAULT CHARSET = utf8mb4;  
  
-- the table to store lock data  
CREATE TABLE IF NOT EXISTS `lock_table`  
(  
    `row_key`        VARCHAR(128) NOT NULL,  
    `xid`            VARCHAR(128),  
    `transaction_id` BIGINT,  
    `branch_id`      BIGINT       NOT NULL,  
    `resource_id`    VARCHAR(256),  
    `table_name`     VARCHAR(32),  
    `pk`             VARCHAR(36),  
    `status`         TINYINT      NOT NULL DEFAULT '0' COMMENT '0:locked :rollbacking',  
    `gmt_create`     DATETIME,  
    `gmt_modified`   DATETIME,  
    PRIMARY KEY (`row_key`),  
    KEY `idx_status` (`status`),  
    KEY `idx_branch_id` (`branch_id`),  
    KEY `idx_xid` (`xid`)  
) ENGINE = InnoDB  
  DEFAULT CHARSET = utf8mb4;  
  
CREATE TABLE IF NOT EXISTS `distributed_lock`  
(  
    `lock_key`       CHAR(20) NOT NULL,  
    `lock_value`     VARCHAR(20) NOT NULL,  
    `expire`         BIGINT,  
    primary key (`lock_key`)  
) ENGINE = InnoDB  
  DEFAULT CHARSET = utf8mb4;  
  
INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('AsyncCommitting', ' ', 0);  
INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('RetryCommitting', ' ', 0);  
INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('RetryRollbacking', ' ', 0);  
INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('TxTimeoutCheck', ' ', 0);
```

项目数据库添加回滚表

```sql
CREATE TABLE IF NOT EXISTS `undo_log` (  
    `id` bigint(20) NOT NULL AUTO_INCREMENT,  
    `branch_id` bigint(20) NOT NULL,  
    `xid` varchar(100) NOT NULL,  
    `context` varchar(128) NOT NULL,  
    `rollback_info` longblob NOT NULL,  
    `log_status` int(11) NOT NULL,  
    `log_created` datetime NOT NULL,  
    `log_modified` datetime NOT NULL,  
    PRIMARY KEY (`id`),  
    UNIQUE KEY `ux_undo_log` (`xid`, `branch_id`)  
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 AUTO_INCREMENT = 1 COMMENT = 'AT事务补偿日志表';
```

### 3.3 配置 Seata 客户端

在各个微服务的 `application.yml` 文件中配置 Seata 相关信息：

```yaml
spring:  
  application:  
    name: persoread-admin-service  
  cloud:  
    nacos:  
      discovery:  
        server-addr: ${NACOS_SERVER_ADDR:localhost:8848}  
        username: nacos  
        password: nacos  
      config:  
        server-addr: ${NACOS_SERVER_ADDR:localhost:8848}  
        username: nacos  
        password: nacos  
        file-extension: yaml  
        shared-configs[0]:  
          data-id: common.yaml  
          refresh: true  
  
dubbo:  
  registry:  
    address: nacos://${NACOS_SERVER_ADDR:localhost:8848}?username=nacos&password=nacos # Nacos 注册中心地址  
    register-mode: instance  
  scan:  
    base-packages: com.mole.persoread.service # 扫描服务的包路径  
  protocol:  
    name: dubbo  
    port: -1  
  
seata:  
  enabled: true  
  application-id: ${spring.application.name}  
  tx-service-group: default_tx_group  
  service:  
    vgroup-mapping:  
      default_tx_group: default  
  registry:  
    type: nacos  
    nacos:  
      server-addr: ${NACOS_SERVER_ADDR:localhost:8848}  
      username: nacos  
      password: nacos  
      application: seata-server  
      group: SEATA_GROUP  
      namespace: ""
```

### 3.4 使用 Seata 事务注解

在涉及分布式事务的业务逻辑中，可以通过 `@GlobalTransactional` 注解开启 Seata 全局事务。Seata 会自动管理涉及多个服务的分布式事务。

**示例：订单服务调用库存服务和支付服务**

```java
import io.seata.spring.annotation.GlobalTransactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private PaymentService paymentService;

    @GlobalTransactional(name = "createOrder", rollbackFor = Exception.class)
    public void createOrder(String productId, String userId, double amount) {
        // 1. 创建订单
        createOrderRecord(productId, userId, amount);

        // 2. 扣减库存
        inventoryService.deduct(productId);

        // 3. 执行支付
        paymentService.pay(userId, amount);
    }

    private void createOrderRecord(String productId, String userId, double amount) {
        // 创建订单逻辑
    }
}
```

在上面的例子中，`createOrder` 方法涉及创建订单、扣减库存和执行支付这三个步骤。Seata 将确保这三个步骤在不同服务中的操作是原子操作，即要么全部成功，要么全部回滚。如果任何步骤失败，Seata 将自动回滚所有操作，确保分布式事务的一致性。

## 4 事务冲突与回滚

在分布式事务中，事务冲突和回滚是常见问题。Seata 提供了自动回滚机制来处理失败的事务。例如，在电商平台中，如果库存不足或支付失败，整个订单事务将回滚，避免数据不一致。

Seata 的 AT 模式采用了**乐观锁**机制，可以减少冲突的发生。它会在事务提交时检查数据是否被修改过，如果检测到冲突，则回滚整个事务。

## 5 Seata 的事务模式

Seata 支持多种事务模式，适用于不同的业务场景：

- **AT 模式**：推荐使用的模式，自动管理事务的两阶段提交过程，适合大多数场景。
- **TCC 模式**：Try-Confirm-Cancel 模式，手动管理事务的提交和回滚，适用于精细化控制的场景。
- **Saga 模式**：长事务模式，适合需要最终一致性的场景，如订单长流程中的异步处理。
- **XA 模式**：分布式数据库的强一致性支持，适合有分布式数据库的场景。

## 6 在电商平台中的应用场景

在电商平台中，Seata 可以帮助处理多个服务之间的跨服务事务，常见的应用场景包括：

- **订单服务与库存服务、支付服务的跨服务事务**：保证订单创建、库存扣减和支付过程的一致性。
- **用户服务与优惠券服务、积分服务的联合操作**：确保用户优惠券发放、积分增加等操作是原子的，避免出现部分成功、部分失败的情况。
- **促销活动中的多服务协作**：在秒杀、拼团等促销活动中，多个服务之间的状态变更（如订单生成、库存扣减、优惠券发放等）需要统一管理。

## 7 不开启 Seata 的事务管理方案

### 7.1 使用本地事务和补偿机制

如果不使用 Seata，可以采用本地事务和手动补偿的方式来管理事务。

#### 7.1.1 本地事务

在每个微服务中使用 Spring 的本地事务管理器：

```java
@Service
public class InventoryService {

    @Transactional
    public void updateInventory(Order order) {
        // 更新库存
    }
}
```

#### 7.1.2 手动补偿

在调用服务时，捕获异常并进行补偿：

```java
@Service
public class OrderService {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private PaymentService paymentService;

    public void createOrder(Order order) {
        try {
            // 扣减库存
            inventoryService.updateInventory(order);
            // 扣减余额
            paymentService.debit(order);
            // 保存订单
            orderRepository.save(order);
        } catch (Exception e) {
            // 补偿操作
            inventoryService.rollbackInventory(order);
            paymentService.credit(order);
            throw new RuntimeException("订单创建失败，已执行补偿操作", e);
        }
    }
}
```

### 7.2 使用消息队列实现最终一致性

通过消息队列（如 RabbitMQ、Kafka）实现异步处理和最终一致性。

#### 7.2.1 发送消息

```java
@Service
public class OrderService {

    @Autowired
    private KafkaTemplate<String, Order> kafkaTemplate;

    public void createOrder(Order order) {
        // 保存订单
        orderRepository.save(order);
        // 发送订单创建消息
        kafkaTemplate.send("order-topic", order);
    }
}
```

#### 7.2.2 消费消息

```java
@Service
public class InventoryService {

    @KafkaListener(topics = "order-topic")
    public void handleOrderCreated(Order order) {
        // 更新库存
        updateInventory(order);
    }
}
```

## 8 总结

通过 Docker 部署 Seata、Dubbo 和 Nacos，可以轻松构建分布式微服务架构，实现高性能的分布式事务管理。如果不使用 Seata，可以采用本地事务结合手动补偿或消息队列的方式来管理事务，但这些方案可能需要更多的开发和维护成本。
