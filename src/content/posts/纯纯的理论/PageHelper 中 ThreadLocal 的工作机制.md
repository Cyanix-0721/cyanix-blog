---
tags:
  - SpringBoot
  - MyBatis
  - 分页
---

# PageHelper 中 ThreadLocal 的工作机制

`PageHelper` 中使用 `ThreadLocal` 来存储分页参数的原因是为了让分页参数能够跨层传递，而无需显式地在方法参数中传递。这一设计使得分页功能的使用更加简洁，也避免了修改大量代码来传递分页参数。

## 1 **什么是 ThreadLocal？**

`ThreadLocal` 是 Java 提供的一个特殊的变量，它能够为每个线程存储一份独立的变量副本。在当前线程内，可以随时读取或修改这个变量，而不同线程之间的数据互不干扰。`ThreadLocal` 常用于在线程内部存储一些全局性的状态，比如用户会话、事务、分页参数等。

## 2 **PageHelper 中 ThreadLocal 的工作机制**

在 `PageHelper` 中，分页参数（如 `pageNum` 和 `pageSize`）是通过 `ThreadLocal` 来存储的，这样它们就可以跨层传递。例如，你可以在服务层使用 `PageHelper.startPage(pageNum, pageSize)` 来设置分页参数，而在数据访问层（如 MyBatis Mapper）执行查询时，这些分页参数会自动生效。

### 2.1 `ThreadLocal` 的具体工作流程：

1. **设置分页参数（`PageHelper.startPage`）**：  
   当你调用 `PageHelper.startPage(pageNum, pageSize)` 时，`PageHelper` 会通过 `ThreadLocal` 将 `Page` 对象（包括分页参数）存储到当前线程中。

   ```java
   public static Page<?> startPage(int pageNum, int pageSize) {
       Page<?> page = new Page<>(pageNum, pageSize);
       // 将Page对象存储到ThreadLocal中
       PageHelperLocal.setLocalPage(page);
       return page;
   }
   ```

   `PageHelperLocal` 这个类内部使用了一个 `ThreadLocal<Page<?>>` 来存储分页参数：

   ```java
   public class PageHelperLocal {
       private static final ThreadLocal<Page<?>> LOCAL_PAGE = new ThreadLocal<>();

       public static void setLocalPage(Page<?> page) {
           LOCAL_PAGE.set(page);
       }

       public static Page<?> getLocalPage() {
           return LOCAL_PAGE.get();
       }

       public static void clear() {
           LOCAL_PAGE.remove();
       }
   }
   ```

2. **在 MyBatis 执行查询时**：  
   当 MyBatis 执行查询时，`PageHelper` 的拦截器会从 `ThreadLocal` 中获取当前线程存储的分页参数，并自动将普通的 SQL 转换为分页查询 SQL。

   ```java
   public Object intercept(Invocation invocation) throws Throwable {
       // 从ThreadLocal中获取分页对象
       Page<?> page = PageHelperLocal.getLocalPage();
       if (page != null) {
           // 拦截SQL语句并加入分页逻辑
           String sql = generatePagedSQL(originalSql, page);
           invocation.proceed(); // 执行SQL查询
           // 处理查询结果
           return processResultSet(page, invocation.getResult());
       }
       return invocation.proceed();
   }
   ```

3. **获取分页结果**：  
   在查询结束后，`PageHelper` 拦截器会根据查询结果生成 `PageInfo` 对象，这个对象会包含分页信息和查询的记录列表。

   由于分页参数是存储在 `ThreadLocal` 中，所以分页逻辑在执行 SQL 之前自动生效，开发者在代码中只需要调用 `PageHelper.startPage()`，而不需要显式地传递分页参数给 DAO 层。

4. **线程结束后清理**：  
   使用完分页参数后，`PageHelper` 会调用 `PageHelperLocal.clear()` 来清理当前线程的 `ThreadLocal`，防止内存泄漏。

## 3 **控制器中获取分页参数**

因为分页参数存储在 `ThreadLocal` 中，并且只与当前线程相关，因此即使服务层返回的是一个普通的 `List`，控制器层仍然可以通过调用 `PageHelper` 来获取分页信息。这是因为分页参数和查询结果都被保存在当前线程的 `ThreadLocal` 中，不会因为跨方法调用或跨类调用而丢失。

### 3.1 例如：

```java
// 服务层执行查询
public List<User> getUserList(int pageNum, int pageSize) {
    PageHelper.startPage(pageNum, pageSize); // 设置分页参数
    return userMapper.selectAll(); // 返回列表
}

// 控制器获取分页信息
public CommonPage<User> listUsers(int pageNum, int pageSize) {
    List<User> users = userService.getUserList(pageNum, pageSize); // 调用服务层获取数据
    // 此时可以通过PageHelper构建分页信息，因为ThreadLocal存储了分页参数
    return CommonPage.restPage(users);
}
```

在服务层和控制器层之间，分页参数依然存在于当前线程的 `ThreadLocal` 中，所以即使返回的是普通的 `List<User>`，分页信息依然可以通过 `PageInfo` 计算得到。

## 4 **ThreadLocal 的优缺点**

### 4.1 **优点**

- **简化分页逻辑**：开发者无需显式传递分页参数，在服务层或 DAO 层直接调用 `PageHelper.startPage()`，分页逻辑自动生效。
- **线程隔离**：每个线程都有独立的 `ThreadLocal` 变量，多个线程之间互不干扰，适合并发场景。

### 4.2 **缺点**

- **内存泄漏风险**：如果不及时清理 `ThreadLocal`，可能导致内存泄漏。为此，`PageHelper` 在查询结束后会主动调用 `PageHelperLocal.clear()` 清理 `ThreadLocal` 中的分页参数。
- **线程依赖**：`ThreadLocal` 的数据是线程独享的，因此在使用线程池等场景时需要特别小心，防止数据共享导致问题。

## 5 总结

`PageHelper` 使用 `ThreadLocal` 机制存储分页参数，这种方式允许分页参数自动传递到 MyBatis 查询逻辑中，而不需要显式在参数中传递。`ThreadLocal` 为每个线程存储独立的分页参数，使得分页查询更加灵活和简洁，同时在分页操作完成后会清理，以防内存泄漏。
