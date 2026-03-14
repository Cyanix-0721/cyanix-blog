---
tags:
  - RESTful
  - SpringBoot
  - Swagger
  - Mybatis-Plus
  - Actuator
  - Thymeleaf
  - Interceptor
  - MyBatis
  - SLF4J
  - Logback
  - Logs
---

# SpringBoot+MyBatis-Plus

> [!info] [MyBatis-Plus](https://baomidou.com/)

> [!tip] 主要代码在 `MyBatis-Plus` 部分给出，后续仅作部分重申，已有代码尽量使用已有标题索引，少部分为上文未曾出现的新内容

## 1 MyBatis-Plus

### 1.1 `pom.xml` E.G.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://maven.apache.org/POM/4.0.0"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>SpringBoot_MBP_DEMO</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
    </properties>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <!--2.7.18和swagger2.9.2冲突（仅在SpringBoot+Mybatis-Plus下出现，使用JPA正常）-->
        <version>2.5.6</version>
    </parent>

    <dependencies>
        <!-- SpringBoot -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <!-- Database -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>
        <!-- 监控 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <!-- 模板引擎 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <!-- Mybatis-Plus -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.5.6</version>
        </dependency>
        <!-- Swagger -->
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
        <!-- WebJars -->
        <dependency>
            <groupId>org.webjars</groupId>
            <artifactId>jquery</artifactId>
            <version>3.7.1</version>
        </dependency>
        <dependency>
            <groupId>org.webjars</groupId>
            <artifactId>bootstrap</artifactId>
            <version>5.3.3</version>
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

### 1.2 Entity

```java
package org.example.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

import java.util.Date;

@TableName("tab_car")
@ApiModel(description = "汽车实体")
public class Car {
    // 主键字段强烈建议使用@TableId注解指定主键字段，否则会出现主键字段无法自增的问题
    // 其他字段非特殊情况可以省略@TableField注解
    @TableId(value = "c_id", type = IdType.AUTO)
    @ApiModelProperty(value = "汽车编号，插入时无需提供，系统自增")
    private Integer cId;

    @TableField("c_name")
    @ApiModelProperty(value = "汽车名称")
    private String cName;

    @TableField("c_date")
    @ApiModelProperty(value = "汽车发布时间", example = "2024-01-09")
    private Date cDate;

    @TableField("c_price")
    @ApiModelProperty(value = "汽车价格")
    private Double cPrice;

    @TableField("c_desc")
    @ApiModelProperty(value = "汽车描述")
    private String cDesc;

    @TableField("c_status")
    // MyBatis-Plus逻辑删除注解,默认逻辑删除字段为1，删除后为0,可在application.properties中统一配置
    @TableLogic(value = "1", delval = "0")
    @ApiModelProperty(value = "汽车状态，用于逻辑删除")
    private Integer cStatus;

    public Car() {
    }

    public Car(Integer cId, String cName, Date cDate, Double cPrice, String cDesc, Integer cStatus) {
        this.cId = cId;
        this.cName = cName;
        this.cDate = cDate;
        this.cPrice = cPrice;
        this.cDesc = cDesc;
        this.cStatus = cStatus;
    }

    // getter和setter方法，以及toString方法
    public Integer getcId() {
        return cId;
    }

    public void setcId(Integer cId) {
        this.cId = cId;
    }

    public String getcName() {
        return cName;
    }

    public void setcName(String cName) {
        this.cName = cName;
    }

    public Date getcDate() {
        return cDate;
    }

    public void setcDate(Date cDate) {
        this.cDate = cDate;
    }

    public Double getcPrice() {
        return cPrice;
    }

    public void setcPrice(Double cPrice) {
        this.cPrice = cPrice;
    }

    public String getcDesc() {
        return cDesc;
    }

    public void setcDesc(String cDesc) {
        this.cDesc = cDesc;
    }

    public Integer getcStatus() {
        return cStatus;
    }

    public void setcStatus(Integer cStatus) {
        this.cStatus = cStatus;
    }

    @Override
    public String toString() {
        return "Car{" +
                "cId=" + cId +
                ", cName='" + cName + '\'' +
                ", cDate=" + cDate +
                ", cPrice=" + cPrice +
                ", cDesc='" + cDesc + '\'' +
                ", cStatus=" + cStatus +
                '}';
    }
}
```

### 1.3 消息通知类

```java
package org.example.entity;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

/**
 * 这个类代表一个通用的响应消息。
 * 它包括一个status，一个msg和一个data。
 * status由一个枚举表示。
 * msg是一个字符串，提供关于响应的额外信息。
 * data是一个通用类型，可以容纳与响应相关的任何类型的数据。
 * 使用泛型而不是object给出数据的类型。编译时检查类型，避免转型错误，安全性和灵活性更高。
 */
@ApiModel(description = "通用响应消息体")
public class ResponseMsg<T> {

    public final static int HANDLE_SUCCESS = 200;
    public final static int HANDLE_FAIL = 500;
    public final static int HANDLE_FAIL_DATA_FORMAT_ERROR = 501;

    @ApiModelProperty(value = "状态码")
    private Integer status;

    @ApiModelProperty(value = "返回的信息")
    private String msg;

    @ApiModelProperty(value = "返回的数据")
    private T data;

    /**
     * ResponseMsg的默认构造函数。
     */
    public ResponseMsg() {
    }

    /**
     * 带有状态和消息的ResponseMsg构造函数。
     *
     * @param status 响应的状态
     * @param msg    响应的消息
     */
    public ResponseMsg(Integer status, String msg) {
        this.status = status;
        this.msg = msg;
    }

    /**
     * 带有状态，消息和数据的ResponseMsg构造函数。
     *
     * @param status 响应的状态
     * @param msg    响应的消息
     * @param data   响应的数据
     */
    public ResponseMsg(Integer status, String msg, T data) {
        this.status = status;
        this.msg = msg;
        this.data = data;
    }

    /**
     * 这个方法返回响应的状态。
     *
     * @return 响应的状态
     */
    public Integer getStatus() {
        return status;
    }

    /**
     * 这个方法设置响应的状态。
     *
     * @param status 要设置的状态
     */
    public void setStatus(Integer status) {
        this.status = status;
    }

    /**
     * 这个方法返回响应的消息。
     *
     * @return 响应的消息
     */
    public String getMsg() {
        return msg;
    }

    /**
     * 这个方法设置响应的消息。
     *
     * @param msg 要设置的消息
     */
    public void setMsg(String msg) {
        this.msg = msg;
    }

    /**
     * 这个方法返回响应的数据。
     *
     * @return 响应的数据
     */
    public T getData() {
        return data;
    }

    /**
     * 这个方法设置响应的数据。
     *
     * @param data 要设置的数据
     */
    public void setData(T data) {
        this.data = data;
    }

    /**
     * 这个方法返回响应的字符串表示形式。
     *
     * @return 响应的字符串表示形式
     */
    @Override
    public String toString() {
        return "ResponseMsg{" +
                "status=" + status +
                ", msg='" + msg + '\'' +
                ", data=" + data +
                '}';
    }

}
```

### 1.4 Mapper

```java
package org.example.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.example.entity.Car;

/**
 * CarMapper接口
 * 这个接口继承了MyBatis Plus的BaseMapper接口，用于执行与Car实体相关的数据库操作
 * 由于继承了BaseMapper，所以这个接口自动拥有了一些基本的CRUD方法
 */
public interface CarMapper extends BaseMapper<Car> {
}
```

### 1.5 Service

```java
package org.example.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import org.example.entity.Car;

import java.util.List;

/**
 * CarService 是一个接口，定义了可以对 Car 进行的操作。
 */
public interface CarService {

    /**
     * 从数据库中获取所有的汽车。
     *
     * @return 所有汽车的列表。
     */
    List<Car> findAll();

    /**
     * 通过 ID 获取汽车。
     *
     * @param cId 要获取的汽车的 ID。
     * @return 给定 ID 的汽车，如果不存在则返回 null。
     */
    Car findByCId(Integer cId);

    /**
     * 通过名称获取汽车。
     *
     * @param cName 要获取的汽车的名称。
     * @return 给定名称的汽车列表。
     */
    List<Car> findByCName(String cName);

    /**
     * 通过分页获取汽车。
     *
     * @param page 分页参数。
     * @return 给定分页参数的汽车列表。
     */
    public IPage<Car> findByPage(IPage page);

    /**
     * 在数据库中插入新的汽车。
     *
     * @param car 要插入的汽车。
     * @return 如果汽车成功插入，则返回 true，否则返回 false。
     */
    boolean insert(Car car);

    /**
     * 在数据库中更新现有的汽车。
     *
     * @param car 具有更新详细信息的汽车。
     * @return 如果汽车成功更新，则返回 true，否则返回 false。
     */
    boolean update(Car car);

    /**
     * 从数据库中删除汽车。
     *
     * @param cId 要删除的汽车的 ID。
     * @return 如果汽车成功删除，则返回 true，否则返回 false。
     */
    boolean delete(Integer cId);

}
```

#### 1.5.1 ServiceImpl

```java
package org.example.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.example.entity.Car;
import org.example.mapper.CarMapper;
import org.example.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * CarService的实现类
 * 该类实现了CarService接口中定义的所有方法，用于处理与Car相关的业务逻辑
 */
@Service
public class CarServiceImpl implements CarService {

    // 自动注入CarMapper
    @Autowired
    private CarMapper carMapper;

    /**
     * 查询所有Car
     *
     * @return 返回所有Car的列表
     */
    @Override
    public List<Car> findAll() {
        return carMapper.selectList(null);
    }

    /**
     * 根据cId查询Car
     *
     * @param cId 要查询的Car的cId
     * @return 返回匹配的Car，如果没有找到，返回null
     */
    @Override
    public Car findByCId(Integer cId) {
        return carMapper.selectById(cId);
    }

    /**
     * 根据cName查询Car
     *
     * @param cName 要查询的Car的cName
     * @return 返回所有cName匹配的Car的列表
     */
    @Override
    public List<Car> findByCName(String cName) {
        QueryWrapper<Car> queryWrapper = new QueryWrapper<>();
        queryWrapper.like("c_name", cName);

        return carMapper.selectList(queryWrapper);
    }

    @Override
    public IPage<Car> findByPage(IPage page) {
        return carMapper.selectPage(page, null);
    }

    /**
     * 插入一条Car记录
     *
     * @param car 要插入的Car
     * @return 如果插入成功，返回true，否则返回false
     */
    @Override
    public boolean insert(Car car) {
        return carMapper.insert(car) == 1;
    }

    /**
     * 更新一条Car记录
     *
     * @param car 要更新的Car
     * @return 如果更新成功，返回true，否则返回false
     */
    @Override
    public boolean update(Car car) {
        return carMapper.updateById(car) == 1;
    }

    /**
     * 根据cId删除一条Car记录
     *
     * @param cId 要删除的Car的cId
     * @return 如果删除成功，返回true，否则返回false
     */
    @Override
    public boolean delete(Integer cId) {
        return carMapper.deleteById(cId) == 1;
    }
}
```

### 1.6 Controller

#### 1.6.1 `CarController`

```java
package org.example.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.example.entity.Car;
import org.example.entity.ResponseMsg;
import org.example.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Api(tags = "汽车管理接口")
public class CarController {

    //查询需要data判断，逻辑较复杂，所以不定义返回MSG为常量
    private static final ResponseMsg<Void> INSERT_SUCCESS_MSG = new ResponseMsg<>(ResponseMsg.HANDLE_SUCCESS, "插入数据成功！");
    private static final ResponseMsg<Void> INSERT_FAIL_MSG = new ResponseMsg<>(ResponseMsg.HANDLE_FAIL, "插入数据失败！");
    private static final ResponseMsg<Void> UPDATE_SUCCESS_MSG = new ResponseMsg<>(ResponseMsg.HANDLE_SUCCESS, "修改数据成功！");
    private static final ResponseMsg<Void> UPDATE_FAIL_MSG = new ResponseMsg<>(ResponseMsg.HANDLE_FAIL, "修改数据失败！");
    private static final ResponseMsg<Void> DELETE_SUCCESS_MSG = new ResponseMsg<>(ResponseMsg.HANDLE_SUCCESS, "删除数据成功！");
    private static final ResponseMsg<Void> DELETE_FAIL_MSG = new ResponseMsg<>(ResponseMsg.HANDLE_FAIL, "删除数据失败！");

    @Autowired
    private CarService carService;

    @GetMapping("/cars")
    @ApiOperation(value = "获取所有汽车信息")
    public ResponseMsg<List<Car>> findAll() {
        List<Car> list = carService.findAll();
        if (list != null && !list.isEmpty()) {
            return new ResponseMsg<>(ResponseMsg.HANDLE_SUCCESS, "查询成功！", list);
        } else {
            return new ResponseMsg<>(ResponseMsg.HANDLE_FAIL, "查询失败！");
        }
    }

    @GetMapping("/car/{cId}")
    @ApiOperation(value = "通过ID获取汽车信息")
    @ApiParam(value = "汽车ID")
    public ResponseMsg<Car> findByCId(@PathVariable Integer cId) {
        Car car = carService.findByCId(cId);
        if (car != null) {
            return new ResponseMsg<>(ResponseMsg.HANDLE_SUCCESS, "查询成功！", car);
        } else {
            return new ResponseMsg<>(ResponseMsg.HANDLE_FAIL, "查询失败！");
        }
    }

    @GetMapping("/cars/name")
    @ApiOperation(value = "通过名称获取汽车信息")
    @ApiParam(value = "汽车名称")
    public ResponseMsg<List<Car>> findByCName(@RequestParam String cName) {
        List<Car> list = carService.findByCName(cName);
        if (list != null && !list.isEmpty()) {
            return new ResponseMsg<>(ResponseMsg.HANDLE_SUCCESS, "查询成功！", list);
        } else {
            return new ResponseMsg<>(ResponseMsg.HANDLE_FAIL, "查询失败！");
        }
    }

    @GetMapping("/cars/page/{pageNum}")
    @ApiOperation(value = "分页查询汽车信息")
    @ApiParam(value = "页码")
    public ResponseMsg<IPage<Car>> findByPage(@PathVariable("pageNum") int pageNum) {
        Page<Car> page = new Page<>(pageNum, 2);
        //findByPage直接修改page对象，不需要返回值,可以不存储IPage对象，直接使用Page对象
        IPage<Car> resultPage = carService.findByPage(page);
        return new ResponseMsg<>(ResponseMsg.HANDLE_SUCCESS, "分页查询成功！", resultPage);
    }

    @PostMapping("/car")
    @ApiOperation(value = "新增汽车信息")
    @ApiParam(value = "汽车实体(JSON)")
    public ResponseMsg<Void> insert(@RequestBody Car car) {
        return carService.insert(car) ? INSERT_SUCCESS_MSG : INSERT_FAIL_MSG;

    }

    @PutMapping("/car")
    @ApiOperation(value = "修改汽车信息")
    @ApiParam(value = "汽车实体(JSON)")
    public ResponseMsg<Void> update(@RequestBody Car car) {
        return carService.update(car) ? UPDATE_SUCCESS_MSG : UPDATE_FAIL_MSG;

    }

    @DeleteMapping("/car/{cId}")
    @ApiOperation(value = "删除汽车信息")
    @ApiParam(value = "汽车ID")
    public ResponseMsg<Void> delete(@PathVariable Integer cId) {
        return carService.delete(cId) ? DELETE_SUCCESS_MSG : DELETE_FAIL_MSG;
    }

    //模拟异常
    @GetMapping("/makeerr")
    public List<Car> makeError() {
        carService = null;
        return carService.findAll();
    }

    //处理空指针异常
    @ExceptionHandler(value = NullPointerException.class)
    public String nullPointExceptionHandler(Exception e) {
        return "空指针异常了！" + e.toString();
    }
}
```

#### 1.6.2 `CarThymeleafController`

> [!tip] 普通 Controller, 不能使用 `@RequestBody`

```java
package org.example.controller;

import org.example.entity.Car;
import org.example.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

@Controller
@RequestMapping("/html")
public class CarThymeleafController {

    @Autowired
    private CarService carService;

    @GetMapping("/cars")
    public ModelAndView findAll() {
        List<Car> list = carService.findAll();
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.addObject("cars", list);
        modelAndView.setViewName("cars");
        return modelAndView;
    }
}
```

#### 1.6.3 `LoginController`

```java
package org.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpSession;
import java.util.Map;

@Controller
public class LoginController {

/*
    @PostMapping("/login")
    public String login(@RequestParam("username") String username,
                        @RequestParam("password") String password,
                        Map<String, Object> map, HttpSession session) {
        if ("zhangsan".equals(username) && "123456".equals(password)) {
            //登录成功
            session.setAttribute("loginUser", "zhangsan");
            return "redirect:/cars";
        } else {
            map.put("msg", "登录失败！用户名或者密码错误！");
            return "login";
        }
    }
*/

    @PostMapping("/login")
    public ModelAndView login(@RequestParam("username") String username,
                              @RequestParam("password") String password,
                              HttpSession session) {
        ModelAndView modelAndView = new ModelAndView();
        if ("zhangsan".equals(username) && "123456".equals(password)) {
            // 登录成功
            session.setAttribute("loginUser", "zhangsan");
            modelAndView.setViewName("redirect:/cars");
        } else {
            modelAndView.addObject("msg", "登录失败！用户名或者密码错误！");
            modelAndView.setViewName("login");
        }
        return modelAndView;
    }
}
```

#### 1.6.4 `GlobeExceptionHandlerController`

```java
package org.example.controller;

import org.example.entity.ResponseMsg;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;

/**
 * 这是一个全局异常处理控制器。
 * 它被标记为RestController，意味着它用于处理RESTful请求。
 * ControllerAdvice注解使其适用于所有控制器。
 * 注意：这是一个紧耦合的实现，不推荐使用。
 */
@RestController
@ControllerAdvice
public class GlobeExceptionHandlerController {

    /**
     * 此方法处理HttpMessageNotReadableException。
     * 当抛出此类异常时，此方法将被调用来处理。
     * 它记录异常并返回一个表示失败的响应消息。
     *
     * @param e 发生的异常。
     * @return 包含异常状态和消息的ResponseMsg对象。
     */
    @ExceptionHandler(value = {HttpMessageNotReadableException.class})
    public ResponseMsg ExceptionHandler(Exception e) {
        System.out.println(e.toString());
        ResponseMsg responseMsg = new ResponseMsg();
        responseMsg.setStatus(ResponseMsg.HANDLE_FAIL);
        responseMsg.setMsg("异常：" + e.getLocalizedMessage());
        return responseMsg;
    }

}
```

### 1.7 主启动程序

```java
package org.example;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * DemoApplication 是 Spring Boot 应用的主入口点。
 * 它使用 @SpringBootApplication 注解来启用自动配置和组件扫描。
 * 它还使用 @MapperScan 注解来扫描指定包中的映射器接口。
 */
@SpringBootApplication
@MapperScan("org.example.mapper")
public class DemoApplication {

    /**
     * 主方法，作为 JVM 的入口点。
     * 它通过调用 run 方法委托给 Spring Boot 的 SpringApplication 类。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

### 1.8 配置

#### 1.8.1 配置文件

> [!tip] [YAML](YAML.md)  
> 仅展示 `yaml`，取代 `properties` 格式，文本格式化

##### 1.8.1.1 `application.yaml`

```yaml
# 自定义参数,命令行设置自定义参数：java -jar xxx.jar --my.db=192.168.43.51
my:
  db: localhost

# 服务器配置
server:
  # 服务器端口
  port: 4444

# Spring配置
spring:
  # 数据源配置
  datasource:
    # 数据源驱动类名
    driver-class-name: com.mysql.cj.jdbc.Driver
    # 数据源URL，包括数据库名称、SSL设置和字符编码
    url: jdbc:mysql://${my.db}:3306/demo?useSSL=false&characterEncoding=utf8
    # 数据源用户名
    username: root
    # 数据源密码
    password: 114514
  # 自定义profile,仅覆盖部分
  profiles:
    active: dev

  # Spring MVC配置
  mvc:
    # 启用隐藏方法过滤器，支持HTML中的PUT和DELETE方法
    hiddenmethod:
      filter:
        enabled: true
    # 路径匹配策略
    pathmatch:
      matching-strategy: ant_path_matcher

# MyBatis-Plus配置
mybatis-plus:
  configuration:
    # 日志实现类
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    # 将数据库表的下划线命名转换为驼峰命名
    map-underscore-to-camel-case: true

  # 全局配置
  global-config:
    # 数据库配置
    db-config:
      # 逻辑删除字段
      logic-delete-field: c_status
      # 逻辑删除值
      logic-delete-value: 0
      # 逻辑未删除值
      logic-not-delete-value: 1

# 管理端点配置
management:
  # 端点配置
  endpoints:
    # web端点配置
    web:
      # 开启所有端点
      exposure:
        include: "*"
      # 修改端点路径 `/actuator/` 到 `/`
      # base-path: /
  # 端点配置
  endpoint:
    # 健康端点配置
    health:
      # 显示详细信息
      show-details: always
    # httptrace端点配置
    httptrace:
      # 启用httptrace端点
      enabled: true
```

##### 1.8.1.2 `application-dev.yaml`

```yaml
server:
  port: 8080
```

##### 1.8.1.3 `logback-spring.xml`

```xml
<configuration>

    <contextName>SpringBoot_MBP_DEMO</contextName>

    <property name="log.path" value="D:/Temporary/logs"/>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    <!-- 文件输出日志格式 -->
    <appender name="DEBUG_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文档的路径及文档名 -->
        <file>${log.path}/web_debug.log</file>
        <!--日志文档输出格式-->
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset> <!-- 设置字符集 -->
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- 日志归档 -->
            <fileNamePattern>${log.path}/web-debug-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文档保留天数-->
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <!-- 此日志文档只记录debug级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>debug</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <logger name="org.example" level="DEBUG"/>
    <root level="DEBUG">
        <appender-ref ref="STDOUT"/>
        <appender-ref ref="DEBUG_FILE"/>
    </root>
</configuration>
```

#### 1.8.2 配置类

##### 1.8.2.1 `MyBatisPlusConfig`

```java
package org.example.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 这是一个MyBatis Plus的配置类。
 * 它配置了MyBatis Plus的拦截器，用于向MyBatis Plus添加功能。
 */
@Configuration
public class MyBatisPlusConfig {

    /**
     * 这个方法创建了一个MyBatis Plus的拦截器bean。
     * 这个拦截器包含了一个针对MySQL的分页拦截器，用于实现分页功能。
     *
     * @return MyBatis Plus的拦截器
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor mybatisPlusInterceptor = new MybatisPlusInterceptor();
        mybatisPlusInterceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return mybatisPlusInterceptor;
    }

}
```

##### 1.8.2.2 `MVCConfig`

```java
package org.example.config;

import org.example.interceptor.LoginInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/*
 * application.properties进行如下配置可以简化MVCConfig.java的配置
 * spring.mvc.view.prefix=<view_path>
 * spring.mvc.view.suffix=<view_filename>
 */
@Configuration
public class MVCConfig implements WebMvcConfigurer {

    @Override
    // 添加视图控制器，将根路径重定向到登录页面
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("login");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        /*
         * addInterceptor：添加拦截器
         * addPathPatterns：拦截路径
         * excludePathPatterns：排除路径，不需要校验
         * *：表示一级目录
         * **：表示所有子目录
         */
        registry.addInterceptor(new LoginInterceptor()).addPathPatterns("/**")
                .excludePathPatterns("/", "/login", "/cars/**", "/css/**");
    }
}
```

##### 1.8.2.3 `SwaggerConfig`

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

/**
 * Swagger配置类
 * 该类用于配置Swagger，使其能够自动生成API文档
 */
@Configuration
@EnableSwagger2
public class SwaggerConfig {

    /**
     * 配置Docket
     * Docket是Swagger的主要配置类，通过它可以配置Swagger的基本信息，以及扫描的包路径等
     *
     * @return 返回配置好的Docket实例
     */
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

    /**
     * 配置API的基本信息
     * 通过ApiInfoBuilder可以配置API的标题、描述、版本等信息
     *
     * @return 返回配置好的ApiInfo实例
     */
    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("汽车管理系统接口文档")
                .description("接口文档")
                .version("1.0.0")
                .build();
    }

}
```

### 1.9 测试类

```java
package org.example.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.example.entity.Car;
import org.example.mapper.CarMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.util.Assert;

import java.util.Date;
import java.util.List;

@SpringBootTest
public class CarServiceTest {

    @Autowired
    private CarService carService;
    @Autowired
    private CarMapper carMapper;

    @Test
    public void testFindAll() {
        List<Car> list = carService.findAll();
        for (Car car : list) {
            System.out.println(car);
        }
    }

    @Test
    public void test() {
        List<Car> cars = carMapper.selectList(null);
        for (Car car : cars) {
            System.out.println(car);
        }
    }

    @Test
    public void testFindByCId() {
        Car car = carService.findByCId(1);
        System.out.println(car);
    }

    @Test
    public void testFindByName() {
        List<Car> list = carService.findByCName("宝");
        for (Car car : list) {
            System.out.println(car);
        }
    }

    @Test
    public void testPage() {
        Page<Car> page = new Page<Car>(1, 2);
        carService.findByPage(page);
        List<Car> list = page.getRecords();
        for (Car car : list) {
            System.out.println(car);
        }
    }

    @Test
    public void testInsert() {
        Car car = new Car(0, "宝马", new Date(), 1000000d, "好车", 1);
        boolean isok = carService.insert(car);
        Assert.isTrue(isok, "插入测试失败！");
    }

    @Test
    public void testUpdate() {
        Car car = new Car();
        car.setcId(2);
        car.setcPrice(2000000d);
        boolean isok = carService.update(car);
        Assert.isTrue(isok, "修改测试失败！");
    }

    @Test
    public void testFindByCName() {
        String carName = "宝";
        List<Car> list = carService.findByCName(carName);
        for (Car car : list) {
            System.out.println(car);
        }
    }

    @Test
    public void testDelete() {
        boolean isok = carService.delete(2);
        Assert.isTrue(isok, "删除测试失败！");
    }

}
```

### 1.10 分页查询

#### 1.10.1 ![[#1.8.2.1 `MyBatisPlusConfig`|配置类]]

#### 1.10.2 Service

```java
/**
 * 通过分页获取汽车。
 *
 * @param page 分页参数。
 * @return 给定分页参数的汽车列表。
 */
public IPage<Car> findByPage(IPage page);
```

##### 1.10.2.1 ServiceImpl

```java
@Override
public IPage<Car> findByPage(IPage page) {
	return carMapper.selectPage(page, null);
}
```

#### 1.10.3 Controller

```java
@GetMapping("/cars/page/{pageNum}")
@ApiOperation(value = "分页查询汽车信息")
@ApiParam(value = "页码")
public ResponseMsg<IPage<Car>> findByPage(@PathVariable("pageNum") int pageNum) {
	Page<Car> page = new Page<>(pageNum, 2);
	//findByPage直接修改page对象，不需要返回值,可以不存储IPage对象，直接使用Page对象
	IPage<Car> resultPage = carService.findByPage(page);
	return new ResponseMsg<>(ResponseMsg.HANDLE_SUCCESS, "分页查询成功！", resultPage);
}
```

### 1.11 逻辑删除

```yaml
# MyBatis-Plus配置
mybatis-plus:
  # 全局配置
  global-config:
    # 数据库配置
    db-config:
      # 逻辑删除字段
      logic-delete-field: c_status
      # 逻辑删除值
      logic-delete-value: 0
      # 逻辑未删除值
      logic-not-delete-value: 1
```

```java
@TableField("c_status")
    // MyBatis-Plus逻辑删除注解,默认逻辑删除字段为1，删除后为0,可在application.properties中统一配置
    @TableLogic(value = "1", delval = "0")
    @ApiModelProperty(value = "汽车状态，用于逻辑删除")
    private Integer cStatus;
```

## 2 Actuator

> [!info] [Actuator REST API](https://docs.spring.io/spring-boot/api/rest/actuator/index.html#overview)

### 2.1 引入依赖

```xml
<!-- 监控 -->
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 2.2 配置文件

```yaml
# 管理端点配置
management:
  # 端点配置
  endpoints:
    # web端点配置
    web:
      # 开启所有端点
      exposure:
        include: "*"
      # 修改端点路径 `/actuator/` 到 `/`
      # base-path: /
  # 端点配置
  endpoint:
    # 健康端点配置
    health:
      # 显示详细信息
      show-details: always
    # httptrace端点配置
    httptrace:
      # 启用httptrace端点
      enabled: true
```

### 2.3 Endpoint

- 访问 `<ip:port>/actuator/mappings` 查看监控
- 访问 `<ip:port>/actuator/<endpoint>` 查看 Endpoint
- 常用的 Endpoints
	- health：应用健康情况
	- metrics：提供了一些有用的应用程序指标（JVM 内存使用、系统CPU使用等）
	- info：应用程序信息
- Actuator 模块本来就有的端点 => 原生端点
- 根据端点的作用，大概可以分为三大类
	- **应用配置类**：获取应用程序中加载的应用配置、环境变量、自动化配置报告等与Spring Boot应用密切相关的配置类信息
	- **度量指标类**：获取应用程序运行过程中用于监控的度量指标，比如：内存信息、线程池信息、HTTP请求统计等
	- **操作控制类**：提供了对应用的关闭等操作类功能
- 配置文件中添加 `management.endpoint.shutdown.enabled=true` 后可以通过 POST `<ip:port>/actuator/shutdown` 关闭该微服务

## 3 Thymeleaf

Thymeleaf 是一款用于 Web 和独立环境的现代服务器端 Java 模板引擎，能够处理 HTML、XML、JavaScript、CSS 甚至纯文本。它旨在成为 JSP 的替代品，提供更优雅、更自然的模板编写方式。

### 3.1 引入依赖

> [!note] [WebJars](https://www.webjars.org/)  
> 可直接访问 js `<ip:port>/webjars/jquery/3.7.1/jquery.js`

```xml
<!-- Thymeleaf -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
<!-- WebJars -->
<dependency>
	<groupId>org.webjars</groupId>
	<artifactId>jquery</artifactId>
	<version>3.7.1</version>
</dependency>
<dependency>
	<groupId>org.webjars</groupId>
	<artifactId>bootstrap</artifactId>
	<version>5.3.3</version>
</dependency>
```

### 3.2 创建模板文件夹

- Thymeleaf的默认文件夹为 `classpath:templates`
	- `resources` 下创建文件夹 `templates`
- SpringBoot提供了以下的静态文件夹，优先顺序是**从上到下**
	- classpath:/META-INF/resources/
	- classpath:/resources/
	- classpath:/static/
	- classpath:/public/
		- `resources` 下创建文件夹 `static`
			- `static` 下创建文件夹 `css`

> [!note] CSS  
> 可直接访问 CSS `<ip:port>/css/main.css

#### 3.2.1 `cars.html`

```html
<!DOCTYPE html>
<html lang="zh" xmlns:th="http://www.thymeleaf.org">
<head>
    <title>所有车辆</title>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
    <link href="/webjars/bootstrap/5.3.3/css/bootstrap.css" rel="stylesheet">
</head>
<body>
<div class="container">
    <table class="table table-hover">
        <tr>
            <th>#</th>
            <th>车名</th>
            <th>价格</th>
            <th>发布时间</th>
            <th>简介</th>
            <th>状态</th>
        </tr>
        <tr th:each="car:${cars}">
            <td th:text="${car.cId}">1</td>
            <td th:text="${car.cName}">暗黑</td>
            <td th:text="${car.cPrice}">22</td>
            <td th:text="${#dates.format(car.cDate, 'yyyy-MM-dd')}">2024-03-25</td>
            <td th:text="${car.cDesc}">这是一辆车</td>
            <td th:text="${car.cStatus}">1</td>
        </tr>
    </table>
</div>
</body>
</html>
```

#### 3.2.2 `login.html`

```html
<!DOCTYPE html>
<html lang="zh" xmlns:th="http://www.thymeleaf.org">
<head>
    <title>登录</title>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
</head>
<body>
<p><!-- 接受msg提示错误信息 -->
    <span th:if="${not #strings.isEmpty(msg)}" th:text="${msg}"></span>
</p>
<form action="#" method="post" th:action="@{/login}">
    用户名：<input name="username" type="text"/><br/>
    密码：<input name="password" type="password"/><br/>
    <input type="submit"/>
</form>
</body>
</html>
```

#### 3.2.3 `error.html`

```html
<!DOCTYPE html>
<html lang="zh" xmlns:th="http://www.thymeleaf.org">
<head>
    <title>异常</title>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
</head>
<body>
<p>出现了异常,请与管理员联系。<span th:text="${exception}"></span></p>
</body>
</html>
```

#### 3.2.4 `main.css`

```css
body{
    background-color: aliceblue;
}
```

### 3.3 CarThymeleafController

![[#1.6.2 `CarThymeleafController`]]

### 3.4 Thymeleaf 语法

#### 3.4.1 命名空间声明

在使用 Thymeleaf 之前，需要在 HTML 文档的 `<html>` 标签中声明 Thymeleaf 的命名空间：

```html
<html xmlns:th="http://www.thymeleaf.org">
```

#### 3.4.2 标准表达式语法

Thymeleaf 的标准表达式语法有以下几种：

- **变量表达式**：`${...}`，用于访问上下文中的变量。
- **选择变量表达式**：`*{...}`，用于访问选定对象中的属性。
- **消息表达式**：`#{...}`，用于获取外部化文本消息。
- **链接表达式**：`@{...}`，用于构建 URL。
- **片段表达式**：`~{...}`，用于引用模板片段。

#### 3.4.3 常用 `th` 属性

Thymeleaf 提供了丰富的 `th` 属性来实现各种功能：

- **`th:text`:** 设置元素的文本内容。
- **`th:utext`:** 设置元素的 HTML 内容（不转义）。
- **`th:value`:** 设置 input、select 等元素的值。
- **`th:each`:** 迭代集合对象。
- **`th:if`、`th:unless`、`th:switch`、`th:case`:** 条件判断。
- **`th:insert`、`th:replace`、`th:include`:** 包含其他模板片段。
- **`th:fragment`:** 定义可重用的模板片段。
- **`th:object`:** 绑定对象到上下文。
- **`th:attr`:** 设置元素的属性。
- **`th:class`:** 动态设置 CSS 类。
- **`th:style`:** 动态设置 CSS 样式。

#### 3.4.4 内置对象

Thymeleaf 提供了一些内置对象，可以在模板中直接使用：

- **`#ctx`:** 上下文对象，可以访问上下文中的变量和工具方法。
- **`#vars`:** 变量映射对象，可以访问上下文中的所有变量。
- **`#locale`:** 当前语言环境。
- **`#request`:** HttpServletRequest 对象（仅在 Web 环境中可用）。
- **`#session`:** HttpSession 对象（仅在 Web 环境中可用）。
- **`#servletContext`:** ServletContext 对象（仅在 Web 环境中可用）。

#### 3.4.5 内置工具对象

Thymeleaf 还提供了一些内置的工具对象，可以方便地完成一些常见任务：

- **`#dates`:** 日期处理工具。
- **`#calendars`:** 日历处理工具。
- **`#numbers`:** 数字格式化工具。
- **`#strings`:** 字符串处理工具。
- **`#objects`:** 对象处理工具。
- **`#bools`:** 布尔值处理工具。
- **`#arrays`:** 数组处理工具。
- **`#lists`:** 列表处理工具。
- **`#sets`:** 集合处理工具。
- **`#maps`:** 映射处理工具。
- **`#aggregates`:** 聚合函数工具。

#### 3.4.6 自定义方言

除了标准方言外，Thymeleaf 还支持自定义方言，可以扩展 Thymeleaf 的功能。

#### 3.4.7 示例

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Thymeleaf Example</title>
</head>
<body>
    <h1 th:text="${title}"></h1>
    <ul>
        <li th:each="item : ${items}" th:text="${item}"></li>
    </ul>
</body>
</html>
```

在上面的示例中，`th:text="${title}"` 将 `title` 变量的值设置为 `h1` 元素的文本内容，`th:each="item : ${items}"` 迭代 `items` 集合，并将每个元素的文本内容设置为 `li` 元素的文本内容。

## 4 Interceptor

### 4.1 `login.html`

![[#3.2.2 `login.html`]]

### 4.2 LoginController

![[#1.6.3 `LoginController`]]

### 4.3 拦截器

```java
package org.example.interceptor;

import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/*
 * 拦截器HandlerInterceptor主要有三个方法对应三个触发时机：
 * preHandle：预处理，我们希望在登录后才执行其他操作，所以在这个方法编写代码。
 * postHandle：事后处理
 * afterCompletion：所有任务完成后
 */
public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Object loginUser = request.getSession().getAttribute("loginUser");
        if (loginUser == null) {    //未登录
            request.setAttribute("msg", "当前用户没有权限，请登录后重试！");
            // 我们在SpringMVC中配置了/根路径跳转访问login.html，所以这里直接跳转根路径即可。
            // 当没有匹配到任何Controller方法时，SpringBoot尝试找到一个默认的视图
            request.getRequestDispatcher("/").forward(request, response);
            return false;
        } else {  // 已经登录
            return true;
        }
    }
}
```

### 4.4 配置访问页面至拦截器

![[#1.8.2.2 `MVCConfig`]]

## 5 异常

### 5.1 `error.html`

![[#3.2.3 `error.html`]]

### 5.2 `@ExceptionHandler`

```java
//模拟异常
@GetMapping("/makeerr")
public List<Car> makeError() {
	carService = null;
	return carService.findAll();
}

//处理空指针异常
@ExceptionHandler(value = NullPointerException.class)
public String nullPointExceptionHandler(Exception e) {
	return "空指针异常了！" + e.toString();
}
```

### 5.3 `ControllerAdvice`

定义一个专门的异常处理类，通过注解@ControllerAdvice来实现

![[#1.6.4 `GlobeExceptionHandlerController`]]

### 5.4 AOP

> [!note] [AOP 概述](杂七杂八.md#4.3.1%20AOP%20概述)

**AOP 处理异常的原理**

1. **切面（Aspect）：** 定义一个类，使用 `@Aspect` 注解标记，表示这是一个切面。切面中包含了处理异常的逻辑，即通知（Advice）。
2. **通知（Advice）：** 定义在切面中的方法，使用 `@AfterThrowing` 注解标记，表示这是一个异常处理通知。当目标方法抛出异常时，该通知会被执行。
3. **切入点（Pointcut）：** 定义一个表达式，用于匹配需要处理异常的目标方法。可以使用 `execution` 表达式来匹配方法的签名，例如 `execution(* com.example.service.*.*(..))` 表示匹配 `com.example.service` 包下所有类的所有方法。
4. **织入（Weaving）：** 在运行时，AOP 框架会将切面中的通知织入到目标方法中，当目标方法抛出异常时，通知会被执行。

**AOP 处理异常的优势**

- **非侵入式：** 不需要修改原有的业务逻辑代码，只需定义切面和通知即可。
- **集中处理：** 将异常处理逻辑集中在一个地方，便于维护和管理。
- **灵活配置：** 可以通过配置文件或注解来配置切面、通知和切入点，实现灵活的异常处理。

**实例：使用 AOP 处理全局异常**

```java
@Aspect
@Component
public class GlobalExceptionHandlerAspect {

    @AfterThrowing(pointcut = "execution(* com.example..*(..))", throwing = "ex")
    public void handleException(JoinPoint joinPoint, Throwable ex) {
        // 获取异常信息
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getName();

        // 记录日志
        logger.error("Exception occurred in {}.{}: {}", className, methodName, ex.getMessage(), ex);

        // 处理异常，例如返回统一的错误响应
        // …
    }
}
```

**解释：**

1. `@Aspect` 注解表示这是一个切面。
2. `@AfterThrowing` 注解表示这是一个异常处理通知，当目标方法抛出异常时会被执行。
   - `pointcut` 属性指定了切入点，这里表示匹配 `com.example` 包及其子包下的所有方法。
   - `throwing` 属性指定了异常变量的名称，这里为 `ex`。
3. `handleException` 方法是通知方法，它接收两个参数：
   - `JoinPoint` 对象：包含了目标方法的信息，例如方法名、参数等。
   - `Throwable` 对象：表示抛出的异常。
4. 在通知方法中，可以获取异常信息、记录日志、处理异常等。

**注意事项：**

- **异常处理顺序：** 如果有多个切面都处理同一个异常，它们的执行顺序可以通过 `@Order` 注解来指定。
- **异常传播：** 如果在 AOP 中捕获了异常，但没有重新抛出，那么异常就不会传播到上层调用者。
- **性能影响：** AOP 会对性能产生一定的影响，但通常情况下影响不大。

## 6 [[YAML]]

## 7 日志

常见的日志级别有以下几种（从低到高）：

- **TRACE:** 最详细的日志信息，通常用于调试。
- **DEBUG:** 详细的调试信息，用于开发和测试。
- **INFO:** 重要的业务信息，用于记录系统运行状态。
- **WARN:** 警告信息，表示潜在的错误或问题。
- **ERROR:** 错误信息，表示系统发生了错误，需要处理。
- **FATAL:** 致命错误信息，表示系统无法继续运行。

> [!tip] Logback 无 `FATAL` 等级，最高到 `ERROR`

### 7.1 日志设置

**核心日志配置**

- `logging.level.*`: 设置指定包或类的日志级别。
	- `logging.level.root`: 设置根日志级别，默认是 INFO。
	- `logging.level.com.example`: 设置 `com.example` 包下的日志级别。
- `logging.pattern.console`: 设置控制台日志输出格式。
- `logging.pattern.file`: 设置文件日志输出格式。
- `logging.file.name`: 设置日志文件的文件名。
- `logging.file.path`: 设置日志文件的目录。

**文件日志配置**

- `logging.file.max-size`: 设置单个日志文件的最大大小。
- `logging.file.max-history`: 设置保留的日志文件数量。
- `logging.file.total-size-cap`: 设置所有日志文件的总大小上限。

**其他日志配置**

- `logging.register-shutdown-hook`: 设置是否在 JVM 关闭时刷新日志。
- `logging.exception-conversion-word`: 设置异常转换词，用于控制台日志输出。
- `logging.group.*`: 对 logger 进行分组，方便管理和配置。

**配置文件示例（application.properties）**

> [!tip] 可以通过 `logging.config` 属性指定自定义的日志配置文件。

```
# 根日志级别为ERROR
logging.level.root=ERROR

# com.example 包下的日志级别为INFO
logging.level.com.example=INFO

# 控制台日志输出格式
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n

# 文件日志输出格式
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n

# 日志文件名
logging.file.name=my-app.log

# 日志文件目录
logging.file.path=/var/log
```

> [!note] Spring Boot 与 SLF4J 和 Logback 的关系
> - **SLF4J (Simple Logging Facade for Java)**
> 	- SLF4J 是一个*日志门面（facade）*，它本身不提供具体的日志实现，而是定义了一套统一的日志接口。这使得开发者可以在不修改代码的情况下，自由切换底层的日志实现框架
> - **Logback**
> 	- Logback 是一个高性能的*日志实现框架*，它是 Log4j 的继任者，由 Log4j 的原作者设计。Logback 在性能、功能和灵活性方面都优于 Log4j
> - **Spring Boot 与 SLF4J 和 Logback**
> 	- Spring Boot 默认使用 SLF 4 J 作为日志门面，并内置了 Logback 作为默认的日志实现框架。这意味着你在 Spring Boot 项目中可以直接使用 SLF4J 的 API 来记录日志，无需额外的配置。额外的配置

### 7.2 `logback-spring.xml`

![[#1.8.1.3 `logback-spring.xml`|`logback-spring.xml`]]
