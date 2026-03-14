# Spring中的ResponseBodyAdvice和ControllerAdvice详细指南

## 1 ControllerAdvice简介

@ControllerAdvice是Spring框架中的一个注解,它是@Component注解的一个特殊变体。这个注解主要用于定义全局性的控制器相关行为,可以应用于整个应用程序的所有控制器。

@ControllerAdvice的主要特点:

- 集中化：允许将通用逻辑集中在一个地方,而不是分散在各个控制器中。
- 全局性：定义的行为可以应用于所有的@Controller或特定的一组控制器。
- 灵活性：可以与@ExceptionHandler, @InitBinder, 和 @ModelAttribute等注解结合使用。

## 2 ControllerAdvice的主要用途

### 2.1 全局异常处理

使用@ExceptionHandler注解,我们可以集中处理应用中抛出的特定类型的异常。

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "An unexpected error occurred"
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFoundException(UserNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
}
```

这种方法允许我们:

- 集中处理异常,提高代码的可维护性。
- 为不同类型的异常定制响应。
- 确保整个应用程序的异常处理一致性。

### 2.2 全局数据绑定

使用@InitBinder注解,我们可以自定义Spring MVC的数据绑定过程。

```java
@ControllerAdvice
public class GlobalBindingInitializer {

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        dateFormat.setLenient(false);
        binder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, false));
    }
}
```

这种方法允许我们:

- 为整个应用程序定义统一的数据绑定规则。
- 自定义复杂对象的绑定过程。
- 在请求处理之前对输入数据进行预处理或验证。

### 2.3 全局数据预处理

使用@ModelAttribute注解,我们可以在所有的@RequestMapping方法之前添加一些公共的属性或操作。

```java
@ControllerAdvice
public class GlobalModelAttributes {

    @ModelAttribute
    public void addAttributes(Model model) {
        model.addAttribute("globalAttribute", "This is available to all controllers");
    }
}
```

这种方法允许我们:

- 为所有视图添加通用的数据。
- 执行一些预处理操作,如设置用户时区或加载用户首选项。

## 3 ResponseBodyAdvice简介

ResponseBodyAdvice是Spring框架提供的一个接口,它允许我们在响应体写入之前对其进行修改或包装。这个接口在Spring 4.1版本中引入,为HTTP响应的处理提供了更大的灵活性。

ResponseBodyAdvice的主要特点:

- 拦截：能够拦截控制器方法的返回值。
- 修改：可以修改或重新包装响应体。
- 灵活：可以根据不同的条件决定是否修改响应。

## 4 ResponseBodyAdvice的实现

要使用ResponseBodyAdvice,我们需要创建一个实现了这个接口的类,并使用@ControllerAdvice注解。

```java
@ControllerAdvice
public class CustomResponseBodyAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // 决定这个advice是否应该被应用
        return true; // 应用于所有响应
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        // 在这里修改或包装响应体
        if (body instanceof String) {
            // 特殊处理字符串类型
            return "{\"message\": \"" + body + "\"}";
        }
        if (!(body instanceof CustomResponse)) {
            return new CustomResponse(200, "Success", body);
        }
        return body;
    }
}
```

在这个例子中:

- supports方法决定这个advice是否应该被应用。
- beforeBodyWrite方法允许我们修改响应体。
- 我们可以根据不同的条件对响应进行不同的处理。

## 5 ResponseBodyAdvice和ControllerAdvice的结合使用

ResponseBodyAdvice通常与@ControllerAdvice一起使用,这样可以将响应体处理逻辑应用于整个应用程序。

```java
@ControllerAdvice
public class GlobalResponseHandler implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        if (body instanceof ErrorResponse) {
            return body; // 错误响应不做处理
        }
        return new SuccessResponse(body); // 包装成统一的成功响应格式
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        ErrorResponse errorResponse = new ErrorResponse(500, ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

这种组合使用方式允许我们:

- 统一处理所有的正常响应和异常响应。
- 在一个地方定义全局的响应格式。
- 简化控制器代码,让它们只关注业务逻辑。

## 6 高级用法和最佳实践

1. 条件化的ResponseBodyAdvice

有时,我们可能只想对特定的控制器或方法应用ResponseBodyAdvice。我们可以通过自定义注解来实现这一点:

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface WrapResponse {}

@ControllerAdvice
public class ConditionalResponseBodyAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return returnType.hasMethodAnnotation(WrapResponse.class) ||
               returnType.getContainingClass().isAnnotationPresent(WrapResponse.class);
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        // 包装逻辑
    }
}
```

1. 根据内容类型进行不同处理

我们可以根据不同的内容类型(如JSON, XML)来进行不同的处理:

```java
@Override
public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                              Class<? extends HttpMessageConverter<?>> selectedConverterType,
                              ServerHttpRequest request, ServerHttpResponse response) {
    if (selectedContentType.includes(MediaType.APPLICATION_JSON)) {
        // JSON处理逻辑
    } else if (selectedContentType.includes(MediaType.APPLICATION_XML)) {
        // XML处理逻辑
    }
    // 默认处理逻辑
}
```

1. 组合多个ControllerAdvice

当我们有多个ControllerAdvice时,可以使用@Order注解来控制它们的执行顺序:

```java
@ControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class FirstAdvice { /* ... */ }

@ControllerAdvice
@Order(Ordered.LOWEST_PRECEDENCE)
public class LastAdvice { /* ... */ }
```

## 7 注意事项和潜在陷阱

1. 性能考虑  
   过度使用ResponseBodyAdvice可能会影响应用程序的性能。确保在beforeBodyWrite方法中的逻辑尽可能简单和高效。

2. 循环依赖  
   在ResponseBodyAdvice中注入其他bean时要小心,因为它可能会导致循环依赖。

3. 内容协商  
   记住ResponseBodyAdvice在内容协商之后执行。如果你的逻辑依赖于最终的内容类型,这一点很重要。

4. 异常处理  
   在ResponseBodyAdvice中抛出的异常不会被@ExceptionHandler捕获。确保在beforeBodyWrite方法中妥善处理所有可能的异常。

5. 返回类型一致性  
   在修改响应体时,确保返回的对象类型与原始返回类型兼容,否则可能会导致序列化错误。

通过深入理解和正确使用ControllerAdvice和ResponseBodyAdvice,我们可以大大提高Spring应用程序的可维护性、一致性和灵活性。这些工具为我们提供了强大的能力来集中处理横切关注点,使我们的控制器代码更加简洁和专注于核心业务逻辑。
