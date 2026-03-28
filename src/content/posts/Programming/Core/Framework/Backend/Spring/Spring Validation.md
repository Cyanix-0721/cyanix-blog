---
tags: []
title: Spring Validation
date created: 2024-11-06 03:13:34
date modified: 2026-03-27 07:11:16
---

# Spring Validation

## 1 简介

Spring Validation 提供了便捷的数据校验功能,主要通过 `@Valid` 和 `@Validated` 两个注解来实现。这两个注解虽然功能类似,但使用场景和特点有所不同。

## 2 @Valid 注解

### 2.1 基本使用

`@Valid` 是 JSR-303 规范定义的注解,用于验证嵌套对象的属性:

```java
public class OrderDTO {
    @NotNull(message = "用户ID不能为空")
    private Long userId;
    
    @Valid  // 对 address 对象进行验证
    private Address address;
}

public class Address {
    @NotEmpty(message = "街道不能为空")
    private String street;
    
    @Pattern(regexp = "^\\d{6}$", message = "邮编格式不正确")
    private String zipCode;
}

@RestController
public class OrderController {
    @PostMapping("/orders")
    public void createOrder(@Valid @RequestBody OrderDTO orderDTO) {
        // 如果验证失败,会抛出 MethodArgumentNotValidException
    }
}
```

### 2.2 常见验证注解

- `@NotNull`: 不能为 null
- `@NotEmpty`: 不能为空(字符串、集合、数组等)
- `@NotBlank`: 不能为空白字符串
- `@Size`: 限制大小
- `@Pattern`: 正则表达式匹配
- `@Email`: 邮箱格式
- `@Max/@Min`: 最大/最小值
- `@Range`: 范围值

## 3 @Validated 注解

### 3.1 分组验证

`@Validated` 是 Spring 提供的注解,扩展了 `@Valid` 的功能,支持分组验证:

```java
public interface AddGroup {}
public interface UpdateGroup {}

public class UserDTO {
    @Null(groups = AddGroup.class)  // 新增时ID必须为空
    @NotNull(groups = UpdateGroup.class)  // 更新时ID不能为空
    private Long id;
    
    @NotBlank(groups = {AddGroup.class, UpdateGroup.class})  // 新增和更新时都不能为空
    private String name;
}

@RestController
public class UserController {
    @PostMapping("/users")
    public void addUser(@Validated(AddGroup.class) @RequestBody UserDTO userDTO) {
        // 只验证 AddGroup 组的约束
    }
    
    @PutMapping("/users")
    public void updateUser(@Validated(UpdateGroup.class) @RequestBody UserDTO userDTO) {
        // 只验证 UpdateGroup 组的约束
    }
}
```

### 3.2 方法级别验证

`@Validated` 还可以用于类级别,实现方法参数和返回值的验证:

```java
@Service
@Validated
public class UserService {
    public void updateUser(@NotNull(message = "用户ID不能为空") Long id, 
                          @Valid UserDTO userDTO) {
        // 方法参数验证
    }
    
    @NotNull(message = "返回用户信息不能为空")
    public UserDTO getUser(Long id) {
        // 返回值验证
        return userDTO;
    }
}
```

## 4 统一异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(errors);
    }
    
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Object> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> 
            errors.put(violation.getPropertyPath().toString(), violation.getMessage())
        );
        return ResponseEntity.badRequest().body(errors);
    }
}
```

## 5 最佳实践

1. 使用场景选择:
   - 使用 `@Valid` 用于嵌套对象的验证
   - 使用 `@Validated` 用于分组验证和方法级别的验证

2. 自定义验证:

```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {
    String message() default "手机号格式不正确";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class PhoneValidator implements ConstraintValidator<Phone, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        return value.matches("^1[3-9]\\d{9}$");
    }
}
```

1. 验证分组顺序:

```java
@GroupSequence({AddGroup.class, UpdateGroup.class})
public interface GroupOrder {}

@PostMapping("/users")
public void addUser(@Validated(GroupOrder.class) @RequestBody UserDTO userDTO) {
    // 按顺序验证 AddGroup 和 UpdateGroup
}
```

## 6 注意事项

1. `@Valid` 和 `@Validated` 的主要区别:
   - `@Valid` 是 JSR-303 规范的标准注解
   - `@Validated` 是 Spring 的扩展注解
   - `@Valid` 不支持分组验证
   - `@Validated` 支持分组验证和方法级别验证

2. 性能考虑:
   - 验证注解会在运行时进行反射,建议只在必要的字段上添加验证
   - 对于大量重复验证的场景,考虑使用缓存

3. 安全性:
   - 不要在验证消息中包含敏感信息
   - 考虑对验证失败的日志进行脱敏处理
