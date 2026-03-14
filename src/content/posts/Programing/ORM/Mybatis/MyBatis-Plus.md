# [MyBatis-Plus](https://baomidou.com/)

## 1 配置文件

```yaml
mybatis-plus: # MyBatis Plus配置
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl # 日志实现
    map-underscore-to-camel-case: true # 下划线到驼峰的映射
  global-config:
    db-config:
      logic-delete-field: status # 逻辑删除字段
      logic-delete-value: 0 # 逻辑删除值
      logic-not-delete-value: 1 # 逻辑未删除值
```

## 2 配置类

```java
@Configuration
public class MyBatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 添加分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        // 添加乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        return interceptor;
    }
}
```

## 3 ID 生成策略

- **AUTO(0)**: 使用数据库id自增策略控制id生成
- **NONE(1)**: 不设置id生成策略
- **INPUT(2)**: 用户手工输入id
- **ASSIGN_ID(3)**: 雪花算法生成id (可兼容数值型与字符串型)
- **ASSIGN_UUID(4)**: 以UUID生成算法作为id生成策略

## 4 条件查询

1. **普通格式**

   ```java
   QueryWrapper<User> queryWrapper = new QueryWrapper<>();
   queryWrapper.eq("name", "Tom");
   List<User> users = userMapper.selectList(queryWrapper);
   ```

2. **Lambda格式**

	```java
   QueryWrapper<User> queryWrapper = new QueryWrapper<>();
   queryWrapper.lambda().eq(User::getName, "Tom");
   List<User> users = userMapper.selectList(queryWrapper);
   ```

	```java
   LambdaQueryWrapper<User> lambdaQueryWrapper = new LambdaQueryWrapper<>();
   lambdaQueryWrapper.eq(User::getName, "Tom");
   List<User> users = userMapper.selectList(queryWrapper);
   ```

3. **链式调用格式**

   ```java
   List<User> users = userMapper.selectList(new QueryWrapper<User>().eq("name", "Tom").or().ge("age", 18));
   ```

## 5 条件查询 `null` 判定

1. **isNull条件**

	```java
	QueryWrapper<User> queryWrapper = new QueryWrapper<>();
	queryWrapper.isNull("email");
	List<User> users = userMapper.selectList(queryWrapper);
	```

	```java
	LambdaQueryWrapper<User> lambdaQueryWrapper = new LambdaQueryWrapper<>();
	lambdaQueryWrapper.isNull(User::getEmail);
	List<User> users = userMapper.selectList(lambdaQueryWrapper);
	```

2. **isNotNull条件**

	```java
	QueryWrapper<User> queryWrapper = new QueryWrapper<>();
	queryWrapper.isNotNull("email");
	List<User> users = userMapper.selectList(queryWrapper);
	```

	```java
	LambdaQueryWrapper<User> lambdaQueryWrapper = new LambdaQueryWrapper<>();
	lambdaQueryWrapper.isNotNull(User::getEmail);
	List<User> users = userMapper.selectList(lambdaQueryWrapper);
	```

## 6 查询条件设置

1. **基本查询条件**

   ```java
   QueryWrapper<User> queryWrapper = new QueryWrapper<>();
   queryWrapper.eq("name", "Tom")
			   .gt("age", 18);
   List<User> users = userMapper.selectList(queryWrapper);
   ```

2. **嵌套查询条件**

   ```java
   QueryWrapper<User> queryWrapper = new QueryWrapper<>();
   queryWrapper.eq("status", 1)
               .and(wq -> wq.eq("name", "Tom")
				            .or().gt("age", 18));
   List<User> users = userMapper.selectList(queryWrapper);
   ```

3. **Lambda表达式条件**

   ```java
   LambdaQueryWrapper<User> lambdaQueryWrapper = new LambdaQueryWrapper<>();
   lambdaQueryWrapper.eq(User::getStatus, 1)
                     .and(lqw -> lqw.eq(User::getName, "Tom")
				                    .or().gt(User::getAge, 18));
   List<User> users = userMapper.selectList(lambdaQueryWrapper);
   ```

## 7 查询投影

1. **指定查询字段**

   ```java
   QueryWrapper<User> queryWrapper = new QueryWrapper<>();
   queryWrapper.select("id", "name", "age");
   List<User> users = userMapper.selectList(queryWrapper);
   ```

2. **Lambda表达式方式**

   ```java
   LambdaQueryWrapper<User> lambdaQueryWrapper = new LambdaQueryWrapper<>();
   lambdaQueryWrapper.select(User::getId, User::getName, User::getAge);
   List<User> users = userMapper.selectList(lambdaQueryWrapper);
   ```

## 8 映射匹配兼容性

在MyBatisPlus中，映射匹配的兼容性可以通过配置和注解来实现：

1. **自动映射**  
   MyBatisPlus默认会根据实体类的属性名称和数据库表的列名称进行自动映射。

2. **@TableField注解**  
   可以通过在实体类的字段上使用@TableField注解来指定数据库表中的列名称，从而实现字段和列的映射。

   ```java
   @TableField("user_name")
   private String name;
   ```

3. **全局配置**  
   可以在MyBatisPlus的全局配置中设置是否开启驼峰命名转换，从而提高映射的兼容性。

   ```yaml
   mybatis-plus:
     configuration:
       map-underscore-to-camel-case: true
   ```

## 9 逻辑删除

1. **配置逻辑删除字段**  
	在实体类中配置逻辑删除字段，并使用 `@TableLogic` 注解。

	```java
	@TableLogic(value = "1", delval = "0")
	private Integer deleted;
	```

2. **全局配置逻辑删除**  
	在 `application.yml` 文件中配置逻辑删除字段：

	```yaml
	mybatis-plus:
	  global-config:
	    db-config:
	      logic-delete-field: deleted
	      logic-delete-value: 0
	      logic-not-delete-value: 1
	```

3. **逻辑删除操作**  
	逻辑删除操作和普通删除操作一样，MyBatis-Plus 会自动处理逻辑删除。

	```java
	int result = userMapper.deleteById(1); // 实际上是更新 deleted 字段的值为1
	```

## 10 乐观锁

乐观锁是一种控制并发的机制，MyBatis-Plus 支持通过版本号来实现乐观锁。

1. **配置版本号字段**  
	在实体类中配置版本号字段，并使用 `@Version` 注解。

	```java
	@Version
	private Integer version;
	```

2. **全局配置乐观锁**  
	在 `application.yml` 文件中配置乐观锁插件（[[#2 配置类|可用配置类代替]]）：

	```yaml
	mybatis-plus:
	  configuration:
	    interceptor: com.baomidou.mybatisplus.extension.plugins.OptimisticLockerInterceptor
	```

3. **乐观锁更新操作**  
	在进行更新操作时，MyBatis-Plus 会自动根据版本号来控制并发。

	```java
	User user = userMapper.selectById(1);
	user.setName("New Name");
	int result = userMapper.updateById(user); // MyBatis-Plus 会自动处理版本号
	```

## 11 代码生成器

MyBatis-Plus 提供了代码生成器，可以根据数据库表自动生成实体类、Mapper 接口、Mapper XML、Service、Controller 等。

1. **配置代码生成器**  
	使用代码生成器前，需要配置数据源和生成策略。

	```java
	DataSourceConfig dataSourceConfig = new DataSourceConfig.Builder(
	    "jdbc:mysql://localhost:3306/dbname", "username", "password").build();

	GlobalConfig globalConfig = new GlobalConfig.Builder()
	    .outputDir("src/main/java") // 代码生成目录
	    .author("author") // 作者
	    .build();

	PackageConfig packageConfig = new PackageConfig.Builder()
	    .parent("com.example") // 父包名
	    .moduleName("module") // 模块名
	    .build();

	StrategyConfig strategyConfig = new StrategyConfig.Builder()
	    .addInclude("table_name") // 需要生成的表名
	    .entityBuilder().enableLombok() // 实体类使用 Lombok
	    .build();
	```

2. **生成代码**

	```java
	AutoGenerator autoGenerator = new AutoGenerator(dataSourceConfig)
	    .global(globalConfig)
	    .packageInfo(packageConfig)
	    .strategy(strategyConfig);

	autoGenerator.execute();
	```

## 12 字段填充

字段填充是 MyBatis-Plus 中的一种特性，可以在插入和更新操作时自动为某些字段填充默认值，例如创建时间、更新时间等。以下是如何实现自动填充字段的步骤：

### 12.1 在实体类中配置字段填充

在需要自动填充的字段上使用 `@TableField` 注解，并指定 `fill` 属性为 `FieldFill.INSERT`、`FieldFill.UPDATE` 或 `FieldFill.INSERT_UPDATE`，以便在插入、更新或两者时进行填充。

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ApiModel(description = "员工实体类，表示员工的详细信息")
public class Employee implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "员工ID")
    private Long id;

    @ApiModelProperty(value = "员工用户名")
    private String username;

    @ApiModelProperty(value = "员工姓名")
    private String name;

    @ApiModelProperty(value = "员工密码")
    private String password;

    @ApiModelProperty(value = "员工电话")
    private String phone;

    @ApiModelProperty(value = "员工性别")
    private String sex;

    @ApiModelProperty(value = "员工身份证号")
    private String idNumber;

    @ApiModelProperty(value = "员工状态，1表示正常，0表示锁定")
    private Integer status;

    @ApiModelProperty(value = "记录创建时间")
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @ApiModelProperty(value = "记录更新时间")
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @ApiModelProperty(value = "记录创建人ID")
    @TableField(fill = FieldFill.INSERT)
    private Long createUser;

    @ApiModelProperty(value = "记录更新人ID")
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateUser;

    @Version
    private Integer version;
}
```

### 12.2 实现 `MetaObjectHandler` 接口

创建一个类实现 `MetaObjectHandler` 接口，用于定义具体的填充逻辑。

```java
package com.sky.handler;  
  
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;  
import com.sky.constant.AutoFillConstant;  
import com.sky.context.BaseContext;  
import org.apache.ibatis.reflection.MetaObject;  
import org.slf4j.Logger;  
import org.slf4j.LoggerFactory;  
import org.springframework.stereotype.Component;  
  
import java.time.LocalDateTime;  
  
@Component  
public class MyMetaObjectHandler implements MetaObjectHandler {  
    private static final Logger logger = LoggerFactory.getLogger(MyMetaObjectHandler.class);  
  
    @Override  
    public void insertFill(MetaObject metaObject) {  
       logger.info("Start insert fill…");  
       // 插入时自动填充创建时间、更新时间和创建人、更新人  
       this.setFieldValByName(AutoFillConstant.CREATE_TIME, LocalDateTime.now(), metaObject);  
       this.setFieldValByName(AutoFillConstant.UPDATE_TIME, LocalDateTime.now(), metaObject);  
       this.setFieldValByName(AutoFillConstant.CREATE_USER, BaseContext.getCurrentId(), metaObject);  
       this.setFieldValByName(AutoFillConstant.UPDATE_USER, BaseContext.getCurrentId(), metaObject);  
    }  
  
    @Override  
    public void updateFill(MetaObject metaObject) {  
       logger.info("Start update fill…");  
       // 更新时自动填充更新时间和更新人  
       this.setFieldValByName(AutoFillConstant.UPDATE_TIME, LocalDateTime.now(), metaObject);  
       this.setFieldValByName(AutoFillConstant.UPDATE_USER, BaseContext.getCurrentId(), metaObject);  
    }  
}
```

## 13 配置类中添加 `GlobalConfig` 进行 `setMetaObjectHandler`

```java
package com.sky.config;  
  
import com.baomidou.mybatisplus.annotation.DbType;  
import com.baomidou.mybatisplus.core.config.GlobalConfig;  
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;  
import com.baomidou.mybatisplus.extension.plugins.inner.OptimisticLockerInnerInterceptor;  
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;  
import com.sky.handler.MyMetaObjectHandler;  
import org.springframework.context.annotation.Bean;  
import org.springframework.context.annotation.Configuration;  
  
@Configuration  
public class MyBatisPlusConfig {  
  
    @Bean  
    public MybatisPlusInterceptor mybatisPlusInterceptor() {  
       MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();  
       // 添加分页插件  
       interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));  
       // 添加乐观锁插件  
       interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());  
       return interceptor;  
    }  
  
    @Bean  
    public GlobalConfig globalConfig() {  
       GlobalConfig globalConfig = new GlobalConfig();  
       globalConfig.setMetaObjectHandler(new MyMetaObjectHandler());  
       return globalConfig;  
    }  
}
```

### 13.1 设置枚举类<sup>Optional</sup>

```java
package com.sky.constant;  
  
/**  
 * 公共字段自动填充相关常量  
 */  
public class AutoFillConstant {  
    /**  
     * 实体类中的方法名称  
     */  
    public static final String SET_CREATE_TIME = "setCreateTime";  
    public static final String SET_UPDATE_TIME = "setUpdateTime";  
    public static final String SET_CREATE_USER = "setCreateUser";  
    public static final String SET_UPDATE_USER = "setUpdateUser";  
  
    /**  
     * 实体类中的属性名称  
     */  
    public static final String CREATE_TIME = "createTime";  
    public static final String UPDATE_TIME = "updateTime";  
    public static final String CREATE_USER = "createUser";  
    public static final String UPDATE_USER = "updateUser";  
}
```
