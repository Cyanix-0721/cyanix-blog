---
tags:
  - SpringData
  - JPA
  - Hibernate
  - RESTful
  - Swagger
  - SpringBoot
---

# SpringData

> [!tip] 配置相关均在**实例**环节给出，后续仅做*部分*重申。

## 1 Spring Data 简介

Spring Data 是 Spring Framework 的一个子项目，旨在为数据访问层提供统一的编程模型和 API，从而简化对各种数据存储的访问。Spring Data 不仅支持关系型数据库（如 MySQL、PostgreSQL），还支持 NoSQL 数据库（如 MongoDB、Redis），甚至大数据存储（如 Hadoop）。

### 1.1 Spring Data 的核心目标

1. **统一的编程模型：** Spring Data 通过提供一致的接口和抽象，使得开发者可以使用相同的方式来访问不同类型的数据存储，减少了学习成本和开发工作量。
2. **简化数据访问：** Spring Data 提供了丰富的功能和工具，如自动生成查询、分页、排序、事务管理等，大大简化了数据访问层的开发。
3. **支持多种数据存储：** Spring Data 支持多种类型的数据存储，包括关系型数据库、NoSQL 数据库、大数据存储等，为开发者提供了灵活的选择。

### 1.2 Spring Data 的核心组件

1. **统一接口 (Repositories):**

* `Repository<T, ID extends Serializable>`：这是 Spring Data 中最基础的接口，提供了基本的 CRUD (增删改查) 操作。
* `CrudRepository<T, ID extends Serializable>`：继承自 `Repository` 接口，提供了更丰富的 CRUD 操作，如 `saveAll`、`findAllById`、`deleteAll` 等。
* `PagingAndSortingRepository<T, ID extends Serializable>`：继承自 `CrudRepository` 接口，增加了分页和排序功能，如 `findAll(Pageable pageable)`。

1. **模板类 (Templates):**

Spring Data 为不同的 NoSQL 数据库提供了相应的模板类，这些模板类封装了底层的数据访问操作，使得开发者可以使用更简单的方式来操作 NoSQL 数据库。

* `RedisTemplate`：用于操作 Redis 数据库。
* `MongoTemplate`：用于操作 MongoDB 数据库。

1. **JPA (Java Persistence API):**

JPA 是 Java EE 平台的标准 ORM 规范，Spring Data JPA 是 Spring Data 对 JPA 的实现。通过 Spring Data JPA，开发者可以使用面向对象的方式来操作关系型数据库，而无需编写复杂的 SQL 语句。

### 1.3 Spring Data 的优势

* **提高开发效率：** 通过提供统一的编程模型和丰富的功能，Spring Data 可以显著提高数据访问层的开发效率。
* **降低学习成本：** 开发者只需掌握 Spring Data 的核心概念和 API，就可以轻松地访问各种数据存储。
* **增强代码可读性：** Spring Data 的代码简洁易懂，易于维护和扩展。
* **灵活性和可扩展性：** Spring Data 支持多种数据存储，并提供了丰富的自定义选项，可以满足各种复杂的业务需求。

## 2 SpringData 实例

### 2.1 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>SpringBoot_DEMO</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.18</version>
    </parent>
    <dependencies>
        <!--SpringBoot-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>
        <dependency>
            <!--swagger2-->
            <groupId>io.springfox</groupId>
            <artifactId>springfox-swagger2</artifactId>
            <version>2.9.2</version>
        </dependency>
        <dependency>
            <groupId>io.springfox</groupId>
            <artifactId>springfox-swagger-ui</artifactId>
            <version>2.9.2</version>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### 2.2 配置文件

`resources` 中创建 `application.properties`

```yaml
# 服务器将在此端口上运行
server.port=4444
# 数据库的URL
spring.datasource.url=jdbc:mysql://localhost:3306/demo?useUnicode=true&characterEncoding=utf8&useSSL=false
# 数据库的用户名
spring.datasource.username=root
# 数据库的密码
spring.datasource.password=114514
# 指定要使用的Hibernate方言。此属性告诉Hibernate如何生成与MySQL数据库兼容的SQL查询。
# 方言类'org.hibernate.dialect.MySQL8Dialect'用于MySQL 8及更高版本。
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
# 指定用于连接数据库的JDBC驱动程序。
# 'com.mysql.cj.jdbc.Driver'驱动程序类用于MySQL数据库。
# JDBC（Java Database Connectivity）是一个Java API，使Java程序能够执行SQL语句。
# 这使Java程序可以与任何符合SQL的数据库进行交互。
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
# 在控制台显示SQL查询
spring.jpa.show-sql=true
# 'spring.jpa.hibernate.ddl-auto'属性控制Hibernate的模式生成行为。
# 它会自动更新数据库模式以匹配应用程序中的实体。
# 此属性的可能值为：
# - 'none'：不执行任何操作。
# - 'validate'：将验证模式。它检查表和列是否存在，如果不存在，它会抛出异常。
# - 'update'：将更新模式。如果表或列不存在，Hibernate将创建它们。
# - 'create'：将创建模式。如果表或列存在，Hibernate将删除它们并创建新的。
# - 'create-drop'：与'create'类似，但是当SessionFactory明确关闭时，模式将被删除，对于单元测试很有用。
spring.jpa.hibernate.ddl-auto=update
# 启用隐藏方法过滤器以支持PUT，PATCH和DELETE请求
spring.mvc.hiddenmethod.filter.enabled=true
# 日期格式
spring.mvc.format.date=yyyy-MM-dd
# 此属性修改Spring Boot用于匹配映射的默认策略。
# 它设置为'ant_path_matcher'以使其与Swagger2兼容。
# 'ant_path_matcher'策略使用Ant风格的路径模式。
# 例如，"/example/**"匹配/example路径下的所有路径。
# 当你想使用Swagger2进行API文档化时，这很有用，因为它需要特定的路径匹配模式。
spring.mvc.pathmatch.matching-strategy=ant_path_matcher
```

### 2.3 主启动程序

```java
package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

public class SpringDataDEMO
{
public static void main( String[] args )
    {
            SpringApplication.run(SpringDataDEMO.class,args);
    }
}
```

### 2.4 Entity

> [!note] Spring Data JPA 与 Hibernate  
> Spring Data JPA 是 Spring Data 项目的一部分，它利用 Hibernate 框架作为底层 ORM (Object-Relational Mapping) 实现。ORM 用于在面向对象的领域模型和关系型数据库之间建立映射关系，使得开发者可以使用面向对象的方式操作数据库，无需编写复杂的 SQL 语句。
>
> Hibernate 注解是用于描述实体类与数据库表之间映射关系的元数据。通过在实体类中添加注解，Hibernate 可以自动生成 SQL 语句，实现对数据库的增删改查操作。
>
> **常用 Hibernate 注解：**
>
> * **@Entity:** 标识一个类为实体类，表示它将映射到数据库中的一个表。
> 	* `name` (可选): 指定实体类对应的表名，默认为实体类的简单名称。
>
> * **@Table:** 指定实体类映射的数据库表的信息。
> 	* `name` (可选): 指定表名，默认为实体类的简单名称。
> 	* `catalog` (可选): 指定数据库的 catalog。
> 	* `schema` (可选): 指定数据库的 schema。
> 	* `uniqueConstraints` (可选): 指定表的唯一约束。
> 	* `indexes` (可选): 指定表的索引。
>
> * **@Id:** 标识实体类的主键属性。
>
> * **@GeneratedValue:** 指定主键生成策略。
> 	* `strategy`: 主键生成策略，常用的有：
> 		* `GenerationType.IDENTITY`: 数据库自增 (适用于 MySQL, SQL Server)。
> 		* `GenerationType.SEQUENCE`: 数据库序列 (适用于 Oracle)。
> 		* `GenerationType.TABLE`: 数据库表生成 (适用于不支持自增和序列的数据库)。
> 		* `GenerationType.AUTO`: 由 Hibernate 根据底层数据库自动选择。
>
> * **@Column:** 指定实体类属性映射的数据库列的信息。
> 	* `name` (可选): 指定列名，默认为属性名称。
> 	* `unique` (可选): 是否唯一。
> 	* `nullable` (可选): 是否允许为空。
> 	* `insertable` (可选): 是否允许插入。
> 	* `updatable` (可选): 是否允许更新。
> 	* `columnDefinition` (可选): 定义列的类型、长度等。
> 	* `length` (可选): 字符串类型的长度。
> 	* `precision`, `scale` (可选): 数值类型的精度和小数位数。

```java
package org.example.entity;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import org.hibernate.annotations.DynamicUpdate;

import javax.persistence.*;
import java.util.Date;

/**
 * Game类代表游戏实体，并将其映射到数据库中的"tab_game"表。
 *
 * @Entity 这个注解表明这个类是一个实体。这是一个JPA注解，用于指定该类是一个持久化的Java类。
 * @Table(name="tab_game") 这个注解用于指定该实体映射到数据库中的哪个表。如果省略@Table注解，表名将与类名相同。
 * @DynamicUpdate 这是一个特定于Hibernate的注解，启用后，只更新数据库中值已更改的列。这可能比更新所有列更有效率。
 * @ApiModel(description="游戏实体") 这个注解是一个Swagger注解，用于在生成的Swagger文档中为模型定义添加元数据。description属性提供了模型的简短描述。
 */
@Entity
@Table(name = "tab_game")
@DynamicUpdate
@ApiModel(description = "游戏实体")
public class Game {
    /**
     * gid字段代表游戏的ID。
     * @Id 注解用于表示这个字段是主键。
     * @GeneratedValue 注解用于指定主键生成策略，这里是自增。
     * @Column 注解用于指定该字段映射到数据库中的哪个列。
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "g_id")
    @ApiModelProperty("游戏ID")
    private Integer gid;

    /**
     * gname字段代表游戏的名称。
     * 它映射到数据库中的"g_name"列，其最大长度为200个字符。
     */
    @Column(name = "g_name", length = 200)
    @ApiModelProperty(value = "游戏名称", example = "暗黑破坏神2")
    private String gname;

    /**
     * gprice字段代表游戏的价格。
     * 它映射到数据库中的"g_price"列。
     */
    @Column(name = "g_price")
    @ApiModelProperty("游戏价格")
    private Double gprice;

    /**
     * gdate字段代表游戏的发布日期。
     * 它映射到数据库中的"g_date"列。
     * @Temporal注解用于指定日期的类型，这里是DATE。
     */
    @Column(name = "g_date")
    @Temporal(TemporalType.DATE)
    @ApiModelProperty(value = "游戏发售日期", example = "2024-01-10")
    private Date gdate;

    /**
     * gdesc字段代表游戏的描述。
     * 它映射到数据库中的"g_desc"列。
     */
    @Column(name = "g_desc")
    @ApiModelProperty("游戏备注")
    private String gdesc;

    /**
     * 默认构造函数。
     */
    public Game() {
    }

    /**
     * 包含所有字段的构造函数。
     */
    public Game(Integer gid, String gname, Double gprice, Date gdate, String gdesc) {
        this.gid = gid;
        this.gname = gname;
        this.gprice = gprice;
        this.gdate = gdate;
        this.gdesc = gdesc;
    }

    /**
     * 重写toString方法，提供Game对象的字符串表示形式。
     */
    @Override
    public String toString() {
        return "Game{" +
                "gid=" + gid +
                ", gname='" + gname + '\'' +
                ", gprice=" + gprice +
                ", gdate=" + gdate +
                ", gdesc='" + gdesc + '\'' +
                '}';
    }

    // Getters and setters…

    public Integer getGid() {
        return gid;
    }

    public void setGid(Integer gid) {
        this.gid = gid;
    }

    public String getGname() {
        return gname;
    }

    public void setGname(String gname) {
        this.gname = gname;
    }

    public Double getGprice() {
        return gprice;
    }

    public void setGprice(Double gprice) {
        this.gprice = gprice;
    }

    public Date getGdate() {
        return gdate;
    }

    public void setGdate(Date gdate) {
        this.gdate = gdate;
    }

    public String getGdesc() {
        return gdesc;
    }

    public void setGdesc(String gdesc) {
        this.gdesc = gdesc;
    }
}
```

### 2.5 Repository

```java
package org.example.repository;

import org.example.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * 这是GameRepository接口。
 * 它扩展了JpaRepository以利用Spring Data JPA。
 * Spring Data JPA提供了一种非常简单且一致的方式来定义数据访问层。
 *
 * @author wryyyy4444
 * @Repository 注解用于指示GameRepository接口是一个Bean。
 * 它将在Spring进行组件扫描时自动被检测到。
 * 这意味着这个接口的实现将由Spring自动创建。
 * 我们可以在任何想要使用它的地方使用@Autowired进行注入。
 */
@Repository
public interface GameRepository extends JpaRepository<Game, Integer>, JpaSpecificationExecutor<Game> {
// JpaRepository<Game,Integer> 是针对ID类型为Integer的Game实体。
// JpaSpecificationExecutor<Game> 基于JPA criteria API执行Specifications。
// Specification支持：
// - 动态查询构造
// - 所有查询条件
// - 子查询，连接查询，排序，分页
// - 不支持自定义模型。只能返回定义的实体。
// 对于大于或小于等查询，使用Specification。
}
```

### 2.6 Service

```java
package org.example.service;

import org.example.entity.Game;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 这是Game实体的服务接口。
 * 定义了为Game实体提供业务逻辑的方法。
 */
public interface GameService {

    /**
     * 从数据库中获取所有Game实体。
     *
     * @return 所有Game实体的列表。
     */
    List<Game> findAll();

    /**
     * 从数据库中获取所有Game实体，并按价格降序排序。
     *
     * @return 按价格排序的所有Game实体的列表。
     */
    List<Game> findAllByGPriceDesc();

    /**
     * 根据其ID获取Game实体。
     *
     * @param gid 要获取的Game实体的ID。
     * @return 具有给定ID的Game实体，如果不存在此类实体，则返回null。
     */
    Game findByGid(Integer gid);

    /**
     * 获取具有给定名称的所有Game实体。
     *
     * @param gname 要获取的Game实体的名称。
     * @return 具有给定名称的所有Game实体的列表。
     */
    List<Game> findByGname(String gname);

    /**
     * 获取名称包含给定子字符串的所有Game实体。
     *
     * @param gname 要在Game实体的名称中搜索的子字符串。
     * @return 名称包含给定子字符串的所有Game实体的列表。
     */
    List<Game> findLikeGname(String gname);

    /**
     * 获取价格高于给定值的所有Game实体。
     *
     * @param gprice 用于比较的价格值。
     * @return 价格高于给定值的所有Game实体的列表。
     */
    List<Game> findAboveGprice(Double gprice);

    /**
     * 从数据库中获取Game实体的页面。
     *
     * @param pageNo   要获取的页面的编号。
     * @param pageSize 要获取的页面的大小。
     * @return Game实体的页面。
     */
    Page<Game> findByPage(int pageNo, int pageSize);

    /**
     * 将新的Game实体插入数据库。
     *
     * @param game 要插入的Game实体。
     * @return 如果插入成功，则返回true，否则返回false。
     */
    boolean insert(Game game);

    /**
     * 在数据库中更新现有的Game实体。
     *
     * @param game 要更新的Game实体。
     * @return 如果更新成功，则返回true，否则返回false。
     */
    boolean update(Game game);

    /**
     * 从数据库中删除Game实体。
     *
     * @param gid 要删除的Game实体的ID。
     * @return 如果删除成功，则返回true，否则返回false。
     */
    boolean delete(Integer gid);
}
```

#### 2.6.1 ServiceImpl

> [!note] 增加&更新&删除
>
> * SpringData 的增加和更新均使用 `save` 方法，根据主键是否为空判断。
> * 删除时失败抛出异常，使用 `try-catch` 处理。

```java
package org.example.service.impl;

import org.example.entity.Game;
import org.example.repository.GameRepository;
import org.example.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * 这是GameServiceImpl类。
 * 它实现了GameService接口并为应用程序提供业务逻辑。
 * 它使用GameRepository与数据库进行交互。
 *
 * @author wryyyy4444
 * @Service 注解用于指示GameServiceImpl类是一个Bean。
 * 它将在Spring进行组件扫描时自动被检测到。
 */
@Service
public class GameServiceImpl implements GameService {
    /**
     * 该服务将用于与数据库交互的GameRepository。
     */
    @Autowired
    private GameRepository gameRepository;

    /**
     * 返回数据库中的所有游戏。
     *
     * @return 所有游戏的列表。
     */
    @Override
    public List<Game> findAll() {
        return gameRepository.findAll();
    }

    /**
     * 返回按价格降序排序的所有游戏。
     *
     * @return 按价格降序排序的所有游戏的列表。
     */
    @Override
    public List<Game> findAllByGPriceDesc() {
        // 创建一个Sort对象来定义排序条件。
        Sort sort = Sort.by(Sort.Direction.DESC, "gprice");
        // 使用GameRepository获取按定义的条件排序的所有游戏。
        return gameRepository.findAll(sort);
    }

    /**
     * 该方法用于通过其ID在数据库中查找游戏。
     *
     * @param gid 要搜索的游戏的ID。
     * @return 如果找到，则返回Game对象，否则返回null。
     */
    @Override
    public Game findByGid(Integer gid) {
        // 使用GameRepository获取具有指定ID的游戏。
        // findById方法返回一个Optional<Game>对象。
        Optional<Game> game = gameRepository.findById(gid);
        // 如果存在，则返回Game对象，否则返回null。
        // orElse方法返回值（如果存在），否则返回指定的默认值。
        return game.orElse(null);
    }

    /**
     * 返回具有特定名称的所有游戏。
     *
     * @param gname 要搜索的游戏的名称。
     * @return 具有指定名称的游戏的列表。
     */
    @Override
    public List<Game> findByGname(String gname) {
        Game gameSearch = new Game();
        gameSearch.setGname(gname);
        Example<Game> example = Example.of(gameSearch);
        return gameRepository.findAll(example);
    }

    /**
     * 返回名称包含特定字符串的所有游戏。
     *
     * @param gname 要在游戏名称中搜索的字符串。
     * @return 名称包含指定字符串的所有游戏的列表。
     */
    @Override
    public List<Game> findLikeGname(String gname) {
        // ExampleMatcher的matching方法是个链式结构，它将在执行完后返回自己
        ExampleMatcher exampleMatcher = ExampleMatcher.matching().withMatcher("gname",
                ExampleMatcher.GenericPropertyMatcher::contains);
        Game gameSearch = new Game();
        gameSearch.setGname(gname);
        Example<Game> example = Example.of(gameSearch, exampleMatcher);
        return gameRepository.findAll(example);
    }

    /**
     * 该方法用于查找数据库中价格大于指定值的所有游戏。
     *
     * @param gprice 用于比较的价格值。所有价格大于此值的游戏将被返回。
     * @return 价格大于指定值的所有游戏的列表。
     */
    @Override
    public List<Game> findAboveGprice(Double gprice) {

        // 创建一个Specification对象来定义查询条件。
        Specification<Game> specification = new Specification<Game>() {
            /**
             * 该方法用于构造查询条件。
             *
             * @param root            表单中的根类型，始终引用查询定义的实体。
             * @param query           CriteriaQuery对象，用于添加限制，排序，聚合等。
             * @param criteriaBuilder 用于构造Predicate，表达式，排序和聚合函数。
             * @return 包含查询条件的Predicate对象。
             */
            @Override
            public Predicate toPredicate(Root<Game> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) {
                // 创建一个列表来存储查询谓词。
                List<Predicate> predicates = new ArrayList<>();
                // 向列表中添加一个谓词：游戏价格应大于或等于指定的值。
                predicates.add(criteriaBuilder.ge(root.get("gprice"), gprice));
                // 将谓词列表转换为数组。
                Predicate[] pre = new Predicate[predicates.size()];
                predicates.toArray(pre);
                // 将谓词添加到查询中并返回更新后的查询。
                return query.where(pre).getRestriction();
            }
        };

        // 执行查询并返回结果。
        return gameRepository.findAll(specification);
    }

    /**
     * 从数据库中返回游戏的页面。
     *
     * @param pageNo   要获取的页面的编号。页面编号从1开始。
     * @param pageSize 单个页面中要包含的游戏数量。
     * @return 包含指定页面中的游戏的Page对象。
     */
    @Override
    public Page<Game> findByPage(int pageNo, int pageSize) {
        // 计算页面的起始索引。
        int start = (pageNo - 1) * pageSize;
        // 创建一个Pageable对象来定义分页条件。
        Pageable pageable = PageRequest.of(start, pageSize);
        // 使用GameRepository获取指定的游戏页面。
        return gameRepository.findAll(pageable);
    }

    /**
     * 将新游戏插入数据库。
     *
     * @param game 要插入的游戏。
     * @return 如果操作成功，则返回true，否则返回false。
     */
    @Override
    public boolean insert(Game game) {
        try {
            gameRepository.save(game);
            return true;
        } catch (Exception e) {
            System.out.println("保存游戏时出现错误：" + e.getMessage());
            return false;
        }
    }

    /**
     * 在数据库中更新现有的游戏。
     *
     * @param game 要更新的游戏。
     * @return 如果操作成功，则返回true，否则返回false。
     */
    @Override
    public boolean update(Game game) {
        try {
            gameRepository.save(game);
            return true;
        } catch (Exception e) {
            System.out.println("更新游戏时出现错误：" + e.getMessage());
            return false;
        }
    }

    /**
     * 从数据库中删除游戏。
     *
     * @param gid 要删除的游戏的id。
     * @return 如果操作成功，则返回true，否则返回false。
     */
    @Override
    public boolean delete(Integer gid) {
        try {
            gameRepository.deleteById(gid);
            return true;
        } catch (EmptyResultDataAccessException e) {
            System.out.println("删除游戏时出现错误：游戏不存在，ID为 " + gid);
            return false;
        } catch (Exception e) {
            System.out.println("删除游戏时出现错误：" + e.getMessage());
            return false;
        }
    }
}
```

### 2.7 Controller

> [!tip] `@RequestBody` & `@PathVariable`
>
> * 使用 `@RequestBody` 注解参数 => 前端传输 JSON
> * 使用 `@PathVariable` 标注 `Mapping` 中参数

```java
package org.example.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.example.entity.Game;
import org.example.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * GameController是一个处理与游戏相关的HTTP请求的REST控制器。
 * 它使用GameService与底层数据存储进行交互。
 *
 * @RestController 注解将此类直接改为RestFul风格。也就是说，接口以json模式显示。相当于：
 * @Controller + @ResponseBody 这两个注解的结合。
 * 在SpringBoot中，使用Jackson框架直接将对象序列化并转换为Json数据。
 */
@RestController
@Api(tags = "游戏接口")
public class GameController {

    @Autowired
    private GameService gameService;

    @GetMapping("/games")
    @ApiOperation(value = "获取所有游戏")
    public List<Game> findAll() {
        return gameService.findAll();
    }

    @GetMapping("/game/{gid}")
    @ApiOperation(value = "根据gid获取单条游戏数据")
    public Game findByGid(@PathVariable("gid") Integer gid) {

        return gameService.findByGid(gid);
    }

    @PostMapping("/game")
    @ApiOperation(value = "新增游戏")
    public Boolean insert(@RequestBody Game game) {
        return gameService.insert(game);
    }

    @PutMapping("/game")
    @ApiOperation(value = "更新游戏")
    @ApiParam(value = "需要传入需要更新的游戏实体，JSON格式")
    public Boolean update(@RequestBody Game game) {
        return gameService.update(game);
    }

    @DeleteMapping("/game/{gid}")
    @ApiOperation(value = "根据gid删除游戏")
    public Boolean delete(@PathVariable("gid") Integer gid) {
        return gameService.delete(gid);
    }
}
```

### 2.8 SpringBootTest

> [!tip] PackageName better be same to main

> [!note] ![](杂七杂八.md#5.1%20断言方法|断言方法)

```java
package org.example.service;

import org.example.entity.Game;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

// @SpringBoot 标注为SpringBoot测试类
@SpringBootTest
class GameServiceTest {
    @Autowired
    private GameService gameService;

	// @Test 标注为测试用例
    @Test
    public void testFindAll() {
        List<Game> gameList = gameService.findAll();
        gameList.forEach(System.out::println);
    }

    @Test
    public void testFindByGname() {
        List<Game> gameList = gameService.findByGname("test game");
        assertNotNull(gameList, "The returned game list is null");
        gameList.forEach(System.out::println);
    }

    @Test
    public void testFindLikeGname() {
        List<Game> gameList = gameService.findLikeGname("test");
        gameList.forEach(System.out::println);
        assertFalse(gameList.isEmpty(), "模糊查询失败！返回数据：" + gameList.size() + "条");
    }

    @Test
    public void testFindAboveGprice() {
        List<Game> gameList = gameService.findAboveGprice(300d);
        gameList.forEach(System.out::println);
        assertFalse(gameList.isEmpty(), "模糊查询失败！返回数据：" + gameList.size() + " 条");
    }

    @Test
    public void testFindAllByGPriceDesc() {
        List<Game> gameList = gameService.findAllByGPriceDesc();
        gameList.forEach(System.out::println);
        assertFalse(gameList.isEmpty(), "模糊查询失败！返回数据：" + gameList.size() + " 条");
    }

    @Test
    public void testFindByPage() {
        Page<Game> gamePage = gameService.findByPage(1, 1);
        System.out.println(gamePage.getTotalElements());
        System.out.println(gamePage.getTotalPages());
        System.out.println(gamePage.getNumber());
        List<Game> gameList = gamePage.getContent();
        gameList.forEach(System.out::println);
        assertFalse(gameList.isEmpty(), "模糊查询失败！返回数据：" + gameList.size() + " 条");
    }


    @Test
    public void testInsert() {
        Game game = new Game(null, "暗黑四", 399d, new Date(), "角色扮演动作类游戏！");
        game.setGname("test game");
        boolean result = gameService.insert(game);
        assertTrue(result, "Insert operation failed");
    }

    @Test
    public void testUpdate() {
        Game game = new Game();
        // 修改game的某些属性
        game.setGid(2);
        game.setGname("test game2");
        boolean result = gameService.update(game);
        assertTrue(result, "Update operation failed");
    }

    @Test
    public void testDelete() {
        Game game = new Game();
        // 设置game的属性
        game.setGid(2);
        boolean result = gameService.delete(game.getGid());
        assertTrue(result, "Delete operation failed");
    }
}
```

## 3 动态查询

> [!note] 有时，我们需要执行动态查询，例如根据名字进行模糊查询。Spring Data 提供了 `Example` 类来构建动态 SQL 查询。

### 3.1 Example 查询（QBE - Query By Example）

Example 查询是一种用户友好的查询技术，允许动态创建查询，无需编写包含字段名称的查询，也不需要使用特定数据库的查询语言。

**优势：**

* 使用动态或静态限制进行查询
* 重构实体时，无需担心影响现有查询
* 独立于数据查询 API

**劣势：**

* 不支持组合查询（如 firstname = ? or (firstname = 1 and lastname = 2)）
* 仅支持字符串的 starts/contains/ends/regex 匹配，对非字符串属性仅支持精确匹配

#### 3.1.1 精确查询

```java
/**
 * 返回具有特定名称的所有游戏。
 *
 * @param gname 要搜索的游戏的名称。
 * @return 具有指定名称的游戏的列表。
 */
@Override
public List<Game> findByGname(String gname) {
	Game gameSearch = new Game();
	gameSearch.setGname(gname);
	Example<Game> example = Example.of(gameSearch);
	return gameRepository.findAll(example);
}
```

#### 3.1.2 条件查询

使用 `ExampleMatcher` 类进行各种字符串匹配条件查询。

```java
/**
 * 返回名称包含特定字符串的所有游戏。
 *
 * @param gname 要在游戏名称中搜索的字符串。
 * @return 名称包含指定字符串的所有游戏的列表。
 */
@Override
public List<Game> findLikeGname(String gname) {
	// ExampleMatcher的matching方法是个链式结构，它将在执行完后返回自己
	ExampleMatcher exampleMatcher = ExampleMatcher.matching().withMatcher("gname",
			ExampleMatcher.GenericPropertyMatcher::contains);
	Game gameSearch = new Game();
	gameSearch.setGname(gname);
	Example<Game> example = Example.of(gameSearch, exampleMatcher);
	return gameRepository.findAll(example);
}
```

### 3.2 Specification (复杂查询)

> [!tip] 如果需要大于、小于等查询条件，可以使用 `Specification`。

* 动态构建查询语句
* 支持所有查询条件、子查询、连接查询、排序、分页
* **不支持自定义模型**，无法做到将查询的结果封装为自定义的 model，或类似 `List<String>` 的单列结果。只能返回 DAO 定义的 entity

#### 3.2.1 继承接口

`Repo` 类继承 `JpaSpecificationExecutor`

```java
public interface GameRepository extends JpaRepository<Game, Integer>, JpaSpecificationExecutor<Game>
```

#### 3.2.2 编写查询条件

```java
/**
 * 该方法用于查找数据库中价格大于指定值的所有游戏。
 *
 * @param gprice 用于比较的价格值。所有价格大于此值的游戏将被返回。
 * @return 价格大于指定值的所有游戏的列表。
 */
@Override
public List<Game> findAboveGprice(Double gprice) {

	// 创建一个Specification对象来定义查询条件。
	Specification<Game> specification = new Specification<Game>() {
		/**
		 * 该方法用于构造查询条件。
		 *
		 * @param root            表单中的根类型，始终引用查询定义的实体。
		 * @param query           CriteriaQuery对象，用于添加限制，排序，聚合等。
		 * @param criteriaBuilder 用于构造Predicate，表达式，排序和聚合函数。
		 * @return 包含查询条件的Predicate对象。
		 */
		@Override
		public Predicate toPredicate(Root<Game> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) {
			// 创建一个列表来存储查询谓词。
			List<Predicate> predicates = new ArrayList<>();
			// 向列表中添加一个谓词：游戏价格应大于或等于指定的值。
			predicates.add(criteriaBuilder.ge(root.get("gprice"), gprice));
			// 将谓词列表转换为数组。
			Predicate[] pre = new Predicate[predicates.size()];
			predicates.toArray(pre);
			// 将谓词添加到查询中并返回更新后的查询。
			return query.where(pre).getRestriction();
		}
	};
```

## 4 排序和分页

### 4.1 使用 Sort 对象排序

```java
/**
 * 返回按价格降序排序的所有游戏。
 *
 * @return 按价格降序排序的所有游戏的列表。
 */
@Override
public List<Game> findAllByGPriceDesc() {
	// 创建一个Sort对象来定义排序条件。
	Sort sort = Sort.by(Sort.Direction.DESC, "gprice");
	// 使用GameRepository获取按定义的条件排序的所有游戏。
	return gameRepository.findAll(sort);
}
```

### 4.2 使用 Pageable 对象分页

```java
/**
 * 从数据库中返回游戏的页面。
 *
 * @param pageNo   要获取的页面的编号。页面编号从1开始。
 * @param pageSize 单个页面中要包含的游戏数量。
 * @return 包含指定页面中的游戏的Page对象。
 */
@Override
public Page<Game> findByPage(int pageNo, int pageSize) {
	// 计算页面的起始索引。
	int start = (pageNo - 1) * pageSize;
	// 创建一个Pageable对象来定义分页条件。
	Pageable pageable = PageRequest.of(start, pageSize);
	// 使用GameRepository获取指定的游戏页面。
	return gameRepository.findAll(pageable);
}
```

## 5 RESTful

RESTful (Representational State Transfer) 是一种软件架构风格，它将网络操作视为对资源的调度。每个资源由唯一的 URI (Uniform Resource Identifier) 标识，客户端通过标准的 HTTP 方法 (GET, POST, PUT, DELETE) 对这些资源进行操作。

**RESTful 的核心原则：**

* **资源为中心：** 系统中的所有实体都被抽象为资源，每个资源都有唯一的标识符。
* **统一接口：** 使用标准的 HTTP 方法对资源进行操作，包括获取 (GET)、创建 (POST)、更新 (PUT) 和删除 (DELETE)。
* **无状态：** 服务器不保存客户端的状态信息，每个请求都是独立的，包含了处理该请求所需的全部信息。
* **可缓存：** 服务器的响应可以被客户端缓存，从而提高性能和可扩展性。
* **分层系统：** 系统可以分为多个层次，每个层次只负责特定的功能，提高了系统的可维护性和可扩展性。

**RESTful 与传统架构风格的对比：**

| 操作         | 传统架构风格                              | RESTful 架构风格                              |
| ------------ | ------------------------------------- | --------------------------------------- |
| 读取所有数据 | `/games/all.do` (GET)                 | `/games` (GET)                          |
| 读取单条数据 | `/games/get.do?gid=1` (GET)            | `/games/{gid}` (GET)                     |
| 新增单条数据 | `/games/save.do` (POST)                | `/games` (POST)                          |
| 更新单条数据 | `/games/update.do` (POST)              | `/games/{gid}` (PUT)                     |
| 删除单条数据 | `/games/delete.do?gid=1` (GET/POST) | `/games/{gid}` (DELETE)                  |

**RESTful 的优势：**

* **简单易用：** 使用标准的 HTTP 方法和 URI，使得 API 易于理解和使用。
* **可扩展性强：** 无状态设计使得系统更容易扩展，可以轻松地添加新的服务器来处理更多的请求。
* **松耦合：** 客户端和服务器之间的耦合度低，使得系统更易于维护和升级。
* **跨平台：** RESTful API 可以被多种类型的客户端访问，包括 Web 浏览器、移动应用等。

RESTful 架构风格已经成为 Web 服务设计的主流，被广泛应用于各种类型的应用程序中。

### 5.1 `application.properties`

```yaml
# 启用隐藏方法过滤器以支持PUT，PATCH和DELETE请求
spring.mvc.hiddenmethod.filter.enabled=true
# 日期格式
spring.mvc.format.date=yyyy-MM-dd
```

## 6 Swagger 2

### 6.1 Dependency

> [!tip] Include in `pom. xml` at front

```xml
<!--swagger2-->
<dependency>
	<groupId>io.springfox</groupId>
	<artifactId>springfox-swagger2</artifactId>
	<version>2.9.2</version>
</dependency>
<dependency>
	<groupId>io.springfox</groupId>
	<artifactId>springfox-swagger-ui</artifactId>
	<version>2.9.2</version>
</dependency>
```

#### 6.1.1 Config for Swagger2

```java
package org.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
public class SwaggerConfig {

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                .select()
                .apis(RequestHandlerSelectors.basePackage("org.example.controller"))
                .paths(PathSelectors.any())
                .build()
                .apiInfo(apiInfo())
                .enable(true);
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("游戏管理系统接口文档")
                .description("接口文档")
                .version("1.0.0")
                .build();
    }

}
```

#### 6.1.2 `application.properties`

```yaml
# 此属性修改Spring Boot用于匹配映射的默认策略。
# 它设置为'ant_path_matcher'以使其与Swagger2兼容。
# 'ant_path_matcher'策略使用Ant风格的路径模式。
# 例如，"/example/**"匹配/example路径下的所有路径。
# 当你想使用Swagger2进行API文档化时，这很有用，因为它需要特定的路径匹配模式。
spring.mvc.pathmatch.matching-strategy=ant_path_matcher
```

#### 6.1.3 注解

**Controller 层注解：**

* `@Api`：用于类上，描述 API 接口的整体信息，如标签、描述等。
* `@ApiOperation`：用于方法上，描述接口方法的用途、参数、返回值等。
* `@ApiImplicitParams`：用于方法上，描述隐式参数（如请求头、Cookie 等）。
* `@ApiResponses`：用于方法上，描述接口方法可能返回的 HTTP 状态码及响应信息。
* `@ApiParam`：用于方法的参数上，描述参数的含义、类型、是否必填等信息。

**Model 层注解：**

* `@ApiModel`：用于类上，描述实体类的信息。
* `@ApiModelProperty`：用于属性上，描述实体类属性的信息，如类型、描述、是否必填等。

**其他注解：**

* `@ApiIgnore`：用于类、方法或属性上，表示忽略该元素，不在 API 文档中显示。
* `@ApiModelPropertyOptional`：用于属性上，表示该属性为可选参数。

**示例：**

```java
@Api(tags = "用户管理")
@RestController
public class UserController {

    @ApiOperation("获取用户信息")
    @GetMapping("/users/{id}")
    public User getUser(@ApiParam("用户ID") @PathVariable Long id) {
        // …
    }
}

@ApiModel("用户实体")
public class User {

    @ApiModelProperty("用户ID")
    private Long id;

    @ApiModelProperty("用户名")
    private String name;

    // …
}
```
