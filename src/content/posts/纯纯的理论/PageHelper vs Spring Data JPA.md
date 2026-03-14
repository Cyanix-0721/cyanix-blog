---
tags:
  - SpringBoot
  - MyBatis
  - 分页
---

# PageHelper vs Spring Data JPA

`PageHelper` 和 Spring 原生分页（Spring Data JPA 分页）在实现分页功能时，虽然都能方便地进行数据分页，但其底层实现方式、使用场景和性能各有差异。下面我将对这两种分页方式进行对比，帮助你更好地理解它们的区别和各自的适用场景。

## 1 **原理与机制**

- **PageHelper（基于 MyBatis）**：
  - **拦截器机制**：通过 MyBatis 的拦截器机制实现，拦截 SQL 执行，并在执行前修改 SQL。
  - **SQL 改写**：通过拦截 `Executor.query()` 方法，将普通 SQL 改写为带有分页限制的 SQL 语句。
  - **分页参数的传递**：使用 `ThreadLocal` 保存分页参数。([[PageHelper 中 ThreadLocal 的工作机制]])
  - **查询总记录数**：在分页查询前，会生成一条额外的 `COUNT(*)` SQL 来查询总记录数。

- **Spring Data JPA**：
  - **基于 JPA 和 Repository**：通过 `Pageable` 和 `Page` 机制，与 Spring Data JPA 无缝集成。
  - **SQL 生成**：通过 JPA 的规范，自动生成带有分页和排序的 SQL。分页语句的生成依赖于底层数据库的 SQL 特性，如 `LIMIT` 和 `OFFSET`。
  - **查询总记录数**：同样会在分页查询时生成一条查询总记录数的 SQL。

**比较**：
- `PageHelper` 通过拦截器机制实现分页，而 Spring Data JPA 通过 JPA 规范的 `Pageable` 和 `Page` 实现。`PageHelper` 更适合 MyBatis 用户，而 Spring Data JPA 则适合 JPA 项目，内置分页更方便与 Spring 的无缝结合。

> [!note] PageHelper 可以直接返回列表而不是封装的 `PageInfo`
>
> `PageHelper ` 使用 ` ThreadLocal ` 来传递分页参数，所以在某些场景下，你可以直接返回查询结果的 ` List `，而不需要使用 ` PageInfo ` 进行额外封装。这在不需要分页信息（如总页数、总记录数）时，可以简化代码并减少不必要的开销。
>
> ### 示例代码
>
> ```java
> // 开启分页
> PageHelper.startPage(pageNum, pageSize);
> 
> // 执行查询，直接返回结果列表
> List<User> users = userMapper.selectAll();
> 
> // 返回列表，不封装成 PageInfo
> return users;
> ```
>
> ### 使用场景
> 这种做法适用于以下场景：
> 1. **不需要分页的元数据**：例如，你只关心当前页的数据，不关心总页数或总记录数。
> 2. **性能优化**：在一些性能敏感的场景下，减少不必要的对象封装操作，比如你只需要返回数据而不是分页信息时，直接返回 `List` 会略微提升性能。
> 3. **API 简单化**：如果你提供的接口或者服务层不需要返回分页信息，仅关注数据本身，可以避免多余的封装，简化接口设计。
> 
> ### PageInfo 的作用
> `PageInfo` 的作用在于封装分页的元数据，包含了总页数、总记录数、是否有下一页等信息：
>
> ```java
> PageHelper.startPage(pageNum, pageSize);
> List<User> users = userMapper.selectAll();
> PageInfo<User> pageInfo = new PageInfo<>(users);
> return pageInfo;
> ```
>
> ### 当你应该使用 `PageInfo`
> - 需要返回 **总记录数** (`total`)、**总页数** (`pages`) 等信息时。
> - 需要在前端做分页控制（如分页导航、显示分页信息等）。
> 
> ### 小结
> 当你不需要分页的元数据时，完全可以直接返回 `List`，而不是使用 `PageInfo`。这样既能简化代码，又避免了不必要的封装操作，从而提升性能。而在需要分页元数据的场景下，`PageInfo` 仍是必不可少的。

## 2 **使用方式**

- **PageHelper**：  
  需要手动调用 `PageHelper.startPage()` 方法设置分页参数，例如：

  ```java
  PageHelper.startPage(pageNum, pageSize);
  List<User> users = userMapper.selectAll();
  ```

- **Spring Data JPA**：  
  通过 `Pageable` 参数进行分页，无需显式调用分页方法。例如：

  ```java
  Pageable pageable = PageRequest.of(pageNum, pageSize);
  Page<User> users = userRepository.findAll(pageable);
  ```

**比较**：
- `PageHelper` 需要手动调用 `startPage()`，分页的职责在业务代码中较明显；Spring Data JPA 分页则通过参数自动管理，使用更加简洁、透明，与 Spring 的架构风格一致。

## 3 **SQL 生成**

- **PageHelper**：
  - 通过 MyBatis 执行 SQL，在 MyBatis 生成的 SQL 语句基础上，`PageHelper` 插件拦截并添加分页逻辑。例如：

	```sql
    SELECT * FROM users LIMIT 10 OFFSET 20;
    ```

- **Spring Data JPA**：
  - JPA 根据 `Pageable` 自动生成分页的 SQL，底层通过 `LIMIT` 和 `OFFSET` 进行分页操作。例如：

	```sql
    SELECT * FROM users ORDER BY name ASC LIMIT 10 OFFSET 20;
    ```

**比较**：
- 两者都可以生成带分页的 SQL 语句，但 `PageHelper` 插件是通过 MyBatis 代理实现的，SQL 生成是在 SQL 执行的拦截环节；而 Spring Data JPA 是在查询时通过 `Pageable` 参数直接生成的。

## 4 **查询总记录数**

- **PageHelper**：
  - 会自动生成查询总记录数的 SQL 语句，通常是 `SELECT COUNT(*) FROM ...` 语句。该操作是透明的，开发者无需额外配置。

- **Spring Data JPA**：
  - 同样会生成一条 `COUNT(*)` 查询语句，Spring Data JPA 通过返回 `Page` 对象封装了分页结果，包括总记录数和总页数。

**比较**：
- 两者都会生成额外的查询总记录数 SQL，区别不大，性能消耗也类似。

## 5 **结果封装**

- **PageHelper**：
  - 通过 `PageInfo` 对象封装查询结果和分页信息。`PageInfo` 中包含当前页的数据列表、总页数、总记录数等信息。
  - 使用方式：

	```java
    PageHelper.startPage(pageNum, pageSize);
    List<User> users = userMapper.selectAll();
    PageInfo<User> pageInfo = new PageInfo<>(users);
    ```

- **Spring Data JPA**：
  - 返回 `Page<T>` 或 `Slice<T>`，其中 `Page` 包含更全面的分页信息（如总记录数、总页数），而 `Slice` 仅包含分页数据，通常用于滚动加载分页。
  - 使用方式：

	```java
    Page<User> page = userRepository.findAll(pageable);
    List<User> users = page.getContent();
    ```

**比较**：
- `PageInfo` 和 `Page<T>` 都封装了分页信息，但 `Page` 在 Spring Data JPA 中是更原生的实现，直接与 JPA 规范结合。`Page` 提供更多的分页信息，而 `Slice` 则适合轻量级分页场景。

## 6 **适用场景**

- **PageHelper**：
  - 适用于 MyBatis 项目，特别是在已有 MyBatis 项目中，需要添加分页功能时，使用 `PageHelper` 非常便捷。
  - 适用于需要手动控制 SQL 生成和查询逻辑的场景。

- **Spring Data JPA**：
  - 适用于基于 JPA 实现的项目，特别是使用 Spring Data JPA 时，原生的分页支持无缝集成，能够简化代码复杂度。
  - 适合与 Spring MVC 和 Spring Boot 项目集成，特别是在 REST API 分页查询中使用。

## 7 **性能**

- **PageHelper**：
  - 性能主要取决于 MyBatis 执行 SQL 的效率以及数据库本身的性能。由于 `PageHelper` 会拦截 SQL 进行改写，性能相对较高，但需要依赖线程局部变量存储分页信息。

- **Spring Data JPA**：
  - 性能取决于 JPA 的实现和底层数据库的优化程度。由于 JPA 自动管理 SQL 的生成，性能表现通常与 JPA 项目一致。如果是复杂查询，性能可能受限于 JPA 生成 SQL 的效率。

**比较**：
- 如果在 MyBatis 项目中，`PageHelper` 的性能通常优于 Spring Data JPA 分页，因为它直接对 SQL 进行拦截改写，而 JPA 需要解析实体类和生成 SQL。

## 8 **总结对比**

| 特性                   | PageHelper（MyBatis）                                       | Spring Data JPA                                           |
|------------------------|------------------------------------------------------------|-----------------------------------------------------------|
| 实现方式               | 通过 MyBatis 拦截器机制，拦截 SQL 并改写分页                | 通过 `Pageable` 和 `PageRequest` 实现分页，无缝集成 JPA    |
| 分页参数传递           | 通过 `ThreadLocal` 传递                                     | 通过 `Pageable` 对象进行分页参数传递                      |
| 查询结果封装           | 使用 `PageInfo` 封装分页结果                                | 使用 `Page<T>` 或 `Slice<T>` 封装分页结果                 |
| 使用场景               | MyBatis 项目，适合已有 MyBatis 项目集成分页                 | 基于 JPA 实现，适合 Spring Data JPA 和 Spring 项目         |
| SQL 生成               | 拦截后改写 SQL                                              | 根据 `Pageable` 自动生成带分页和排序的 SQL                 |
| 总记录数查询           | 自动生成 `COUNT(*)` 查询                                    | 自动生成 `COUNT(*)` 查询                                   |
| 性能                   | 拦截器效率较高，适合大规模数据分页                          | 受 JPA 性能影响，适合较标准的分页查询                      |
| 集成复杂度             | 需要额外引入 `PageHelper` 插件，MyBatis 用户常用             | 无缝集成，Spring 项目使用最方便                            |

> [!important]
>
> 可以使用封装的通用分页类对上述 2 种情况进行统一处理
>
> ```java
> package com.mole.persoread.result;  
>   
> import com.github.pagehelper.PageInfo;  
> import lombok.Builder;  
> import lombok.Data;  
> import org.springframework.data.domain.Page;  
>   
> import java.util.List;  
>   
> @Data  
> @Builder  
> public class PageResult<T> {  
>     private Integer pageNum;  
>     private Integer pageSize;  
>     private Integer totalPage;  
>     private Long total;  
>     private List<T> list;  
>   
>     /**  
>      * 将PageHelper分页后的list转为分页信息  
>      */  
>     public static <T> PageResult<T> restPage(List<T> list) {  
>         PageInfo<T> pageInfo = new PageInfo<>(list);  
>         return PageResult.<T>builder()  
>                 .totalPage(pageInfo.getPages())  
>                 .pageNum(pageInfo.getPageNum())  
>                 .pageSize(pageInfo.getPageSize())  
>                 .total(pageInfo.getTotal())  
>                 .list(pageInfo.getList())  
>                 .build();  
>     }  
>   
>     /**  
>      * 将SpringData分页后的list转为分页信息  
>      */  
>     public static <T> PageResult<T> restPage(Page<T> pageInfo) {  
>         return PageResult.<T>builder()  
>                 .totalPage(pageInfo.getTotalPages())  
>                 .pageNum(pageInfo.getNumber())  
>                 .pageSize(pageInfo.getSize())  
>                 .total(pageInfo.getTotalElements())  
>                 .list(pageInfo.getContent())  
>                 .build();  
>     }  
> }
> ```

## 9 总结

- 如果项目基于 MyBatis，`PageHelper` 是最合适的选择，功能强大且性能优越。
- 如果项目基于 JPA，尤其是使用 Spring Data JPA，Spring 原生分页的方式与 Spring 框架紧密集成，提供更自然的分页支持。
