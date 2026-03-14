# Spring 注解总结

在 Spring Boot 与 MyBatis 整合过程中，使用的常用注解可以分为 Spring 的基础注解和 MyBatis 特有的注解

## 1 Spring 基础注解

1. **@Component**
   - **作用**: 将类标记为 Spring 的组件，自动扫描并注册为 Bean。
   - **常见属性**:
	 - `value`: 指定 Bean 的名称，默认为类名首字母小写。

2. **@Service**
   - **作用**: 标记业务层组件，表示该类包含业务逻辑。
   - **常见属性**:
	 - `value`: 指定 Bean 的名称。

3. **@Repository**
   - **作用**: 标记数据访问层组件，主要用于数据访问异常的转换。
   - **常见属性**:
	 - `value`: 指定 Bean 的名称。

4. **@Controller**
   - **作用**: 标记控制层组件，负责处理 HTTP 请求和返回响应。
   - **常见属性**:
	 - `value`: 指定 Bean 的名称。

5. **@RestController**
   - **作用**: 是 `@Controller` 与 `@ResponseBody` 的组合，简化 RESTful API 的开发。
   - **常见属性**:
	 - `value`: 指定 Bean 的名称。

6. **@Autowired**
   - **作用**: 自动注入依赖。
   - **常见属性**:
	 - `required`: 指定是否必须注入（默认 `true`）。

7. **@Value**
   - **作用**: 注入配置文件中的值。
   - **常见属性**:
	 - `value`: 指定要注入的属性名。

8. **@Configuration**
   - **作用**: 表示该类是一个配置类，可以定义 Bean。
   - **常见属性**:
	 - `value`: 指定配置类的名称。

9. **@Bean**
   - **作用**: 在 `@Configuration` 类中定义 Bean。
   - **常见属性**:
	 - `name`: 指定 Bean 的名称。
	 - `initMethod`: 指定初始化方法名。
	 - `destroyMethod`: 指定销毁方法名。

10. **@Transactional**
	- **作用**: 声明方法或类是事务的。
	- **常见属性**:
	  - `propagation`: 事务传播行为（如 `REQUIRED`、`REQUIRES_NEW` 等）。
	  - `isolation`: 事务隔离级别（如 `READ_COMMITTED`、`SERIALIZABLE` 等）。
	  - `timeout`: 事务超时时间。
	  - `readOnly`: 指定是否只读事务（默认 `false`）。

11. **@RequestMapping**
	- **作用**: 定义请求的映射路径。
	- **常见属性**:
	  - `value`: 映射的请求路径。
	  - `method`: 支持的 HTTP 请求方法（GET、POST 等）。

12. **@PathVariable**
	- **作用**: 从 URI 模板中提取变量。
	- **常见属性**:
	  - `value`: URI 模板中变量的名称。

13. **@RequestParam**
	- **作用**: 提取请求参数。
	- **常见属性**:
	  - `value`: 请求参数的名称。
	  - `required`: 是否必须（默认 `true`）。
	  - `defaultValue`: 默认值。

14. **@ResponseBody**
	- **作用**: 将方法返回的对象直接写入 HTTP 响应体。
	- **常见属性**: 无特定属性。

15. **@ExceptionHandler**
	- **作用**: 处理控制器中的异常。
	- **常见属性**:
	  - `value`: 指定要处理的异常类型。

## 2 MyBatis 注解

1. **@Mapper**
   - **作用**: MyBatis 提供的注解，用于标识 Mapper 接口。
   - **常见属性**: 无特定属性，直接标注接口。

2. **@Select**
   - **作用**: 定义查询 SQL 语句。
   - **常见属性**:
	 - `value`: 指定查询的 SQL 语句。

3. **@Insert**
   - **作用**: 定义插入操作的 SQL 语句。
   - **常见属性**:
	 - `value`: 指定插入的 SQL 语句。

4. **@Update**
   - **作用**: 定义更新操作的 SQL 语句。
   - **常见属性**:
	 - `value`: 指定更新的 SQL 语句。

5. **@Delete**
   - **作用**: 定义删除操作的 SQL 语句。
   - **常见属性**:
	 - `value`: 指定删除的 SQL 语句。

6. **@Results**
   - **作用**: 定义查询结果的映射关系。
   - **常见属性**:
	 - `value`: 指定映射的结果集。

7. **@Result**
   - **作用**: 定义单个结果的映射关系。
   - **常见属性**:
	 - `property`: 对象的属性名。
	 - `column`: 数据库中的列名。
