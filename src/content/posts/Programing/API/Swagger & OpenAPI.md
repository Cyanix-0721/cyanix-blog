---
tags:
  - Swagger
  - OpenAPI
  - API
---

# Swagger & OpenAPI

> [!note] Swagger & OpenAPI  
>
> [Swagger](https://swagger.io/) 和 [OpenAPI](https://springdoc.org/) 是用于设计、构建、记录和使用RESTful APIs的工具和规范。最初，Swagger是一个API文档工具，后来演变为一个广泛接受的规范，即OpenAPI。  

## 1 Swagger 和 OpenAPI 的注解对比

在使用Java等语言时，Swagger和OpenAPI的注解非常相似，但也有一些差异。以下是常用注解的对比：

### 1.1 `@Api` 注解

- **Swagger**: 使用 `@Api` 注解来描述API的整体信息，例如标题、描述和版本。
- **OpenAPI**: 使用 `@OpenAPIDefinition` 注解来提供类似的信息。

```java
// Swagger 注解
@Api(value = "User Management API", description = "Operations pertaining to user management")
public class UserController {}

// OpenAPI 注解
@OpenAPIDefinition(
    info = @Info(
        title = "User Management API",
        version = "1.0",
        description = "Operations pertaining to user management"
    )
)
public class UserController {}
```

### 1.2 `@ApiOperation` 注解

- **Swagger**: 使用 `@ApiOperation` 注解来描述一个API操作的方法级信息，例如操作名称和描述。
- **OpenAPI**: 使用 `@Operation` 注解提供相同的信息。

```java
// Swagger 注解
@ApiOperation(value = "Get user by ID", notes = "Returns a user by their ID")
public User getUserById(@PathVariable Long id) {}

// OpenAPI 注解
@Operation(summary = "Get user by ID", description = "Returns a user by their ID")
public User getUserById(@PathVariable Long id) {}
```

### 1.3 `@ApiResponse` 和 `@ApiResponses` 注解

- **Swagger**: 使用 `@ApiResponse` 和 `@ApiResponses` 注解来描述方法的响应。
- **OpenAPI**: 使用 `@ApiResponse` 和 `@ApiResponses` 注解相同，但需要导入不同的包。

```java
// Swagger 注解
@ApiResponses(value = {
    @ApiResponse(code = 200, message = "Successfully retrieved user"),
    @ApiResponse(code = 404, message = "User not found")
})
public User getUserById(@PathVariable Long id) {}

// OpenAPI 注解
@ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Successfully retrieved user"),
    @ApiResponse(responseCode = "404", description = "User not found")
})
public User getUserById(@PathVariable Long id) {}
```

### 1.4 `@ApiParam` 和 `@Parameter` 注解

- **Swagger**: 使用 `@ApiParam` 注解来描述参数。
- **OpenAPI**: 使用 `@Parameter` 注解来提供相同的功能。

```java
// Swagger 注解
@ApiParam(value = "ID of the user to be retrieved", required = true)
@PathVariable Long id

// OpenAPI 注解
@Parameter(description = "ID of the user to be retrieved", required = true)
@PathVariable Long id
```

### 1.5 `@ApiModel` 和 `@Schema` 注解

- **Swagger**: 使用 `@ApiModel` 注解来描述实体类。
- **OpenAPI**: 使用 `@Schema` 注解来提供相同的功能。

```java
// Swagger 注解
@ApiModel(description = "User entity")
public class User {
    // Swagger 注解
    @ApiModelProperty(value = "ID of the user", required = true)
    private Long id;

    @ApiModelProperty(value = "Name of the user")
    private String name;
}

// OpenAPI 注解
@Schema(description = "User entity")
public class User {
    // OpenAPI 注解
    @Schema(description = "ID of the user", required = true)
    private Long id;

    @Schema(description = "Name of the user")
    private String name;
}
```

### 1.6 `@ApiModelProperty` 和 `@Schema` 注解

- **Swagger**: 使用 `@ApiModelProperty` 注解来描述实体类的属性。
- **OpenAPI**: 使用 `@Schema` 注解来描述实体类的属性。

```java
// Swagger 注解
@ApiModelProperty(value = "ID of the user", required = true)
private Long id;

@ApiModelProperty(value = "Name of the user")
private String name;

// OpenAPI 注解
@Schema(description = "ID of the user", required = true)
private Long id;

@Schema(description = "Name of the user")
private String name;
```

### 1.7 其他常用注解

在Swagger和OpenAPI中，还可以使用其他注解来更详细地描述数据模型，例如：

- **`@JsonProperty`**：用于指定JSON序列化和反序列化时的属性名称。
- **`@NotNull`** 和 **`@NotBlank`**：用于验证字段是否为空。
- **`@Size`**：用于指定字符串或集合的大小范围。
- **`@Pattern`**：用于指定字段必须符合的正则表达式模式。

```java
// Swagger 和 OpenAPI 都适用
@Schema(description = "Email of the user", example = "user@example.com")
@NotBlank(message = "Email is mandatory")
@Email(message = "Email should be valid")
private String email;

@Schema(description = "Age of the user", example = "30")
@Min(18)
@Max(100)
private int age;
```
