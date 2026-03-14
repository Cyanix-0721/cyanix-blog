---
tags:
  - MyBatis
  - SQL
---

# Mybatis Dynamic SQL

MyBatis 的动态 SQL 实现可以通过注解和 XML 两种方式进行，下面分别介绍这两种方式，包括使用 `Example` 的情况。

## 1 常规的动态 SQL

### 1.1 XML 配置

在 XML 中，可以使用多种动态 SQL 标签，下面是一些常用标签的详细说明：

- `<if>`：根据条件动态添加 SQL 片段。
- `<choose>`、`<when>`、`<otherwise>`：类似于 switch-case 语句，根据条件选择执行的 SQL 片段。
- `<foreach>`：用于遍历集合，动态生成 SQL。

> [!example]
>
> ```xml
> <select id="findUser" parameterType="map" resultType="User">
>     SELECT * FROM users
>     WHERE 1=1
>     <if test="username != null">
>         AND username = #{username}
>     </if>
>     <if test="age != null">
>         AND age = #{age}
>     </if>
>     <if test="status != null">
>         AND status IN
>         <foreach item="s" collection="statusList" open="(" separator="," close=")">
>             #{s}
>         </foreach>
>     </if>
> </select>
> ```
>
> 在这个示例中：
>
> - `1=1` 是为了便于后续的 `AND` 连接。
> - `username` 和 `age` 的存在性检查通过 `<if>` 标签实现。
> - `statusList` 使用 `<foreach>` 遍历集合，将多个状态值动态拼接成 SQL。

### 1.2 注解配置

在注解中，你可以使用 `@SelectProvider` 和 `@UpdateProvider` 来动态生成 SQL。这里的 `SqlProvider` 是一个普通类，用于返回 SQL 字符串。

> [!example]
>
> ```java
> public interface UserMapper {
> 
>     @SelectProvider(type = UserSqlProvider.class, method = "findUser")
>     List<User> findUser(@Param("username") String username, @Param("age") Integer age, @Param("statusList") List<String> statusList);
> }
> 
> public class UserSqlProvider {
>     public String findUser(Map<String, Object> params) {
>         StringBuilder sql = new StringBuilder("SELECT * FROM users WHERE 1=1");
>         
>         if (params.get("username") != null) {
>             sql.append(" AND username = #{username}");
>         }
>         if (params.get("age") != null) {
>             sql.append(" AND age = #{age}");
>         }
>         if (params.get("statusList") != null) {
>             sql.append(" AND status IN (");
>             List<String> statuses = (List<String>) params.get("statusList");
>             for (int i = 0; i < statuses.size(); i++) {
>                 sql.append("#{statusList[").append(i).append("]}");
>                 if (i < statuses.size() - 1) {
>                     sql.append(", ");
>                 }
>             }
>             sql.append(")");
>         }
>         
>         return sql.toString();
>     }
> }
> ```
>
> 在这个例子中：
>
> - `findUser` 方法根据传入参数动态构建 SQL。
> - 使用 `StringBuilder` 来拼接 SQL 字符串。

## 2 Example 用法

### 2.1 XML 配置

`Example` 结合动态 SQL 使用时，可以通过 `where` 标签以及动态标签来构建复杂查询。

> [!example]
>
> ```xml
> <select id="selectByExample" parameterType="UserExample" resultType="User">
>     SELECT * FROM users
>     <where>
>         <if test="example.oredCriteria.size() > 0">
>             <foreach collection="example.oredCriteria" item="criteria" separator="OR">
>                 <if test="criteria.valid">
>                     <choose>
>                         <when test="criteria.criteria.size() > 0">
>                             <foreach collection="criteria.criteria" item="criterion" separator="AND">
>                                 <if test="criterion.value != null">
>                                     ${criterion.condition} #{criterion.value}
>                                 </if>
>                             </foreach>
>                         </when>
>                     </choose>
>                 </if>
>             </foreach>
>         </if>
>     </where>
> </select>
> ```
>
> 在此示例中：
>
> - `<where>` 标签自动处理 SQL 语句中的 `WHERE` 关键字和多余的 `AND`。
> - 通过 `<foreach>` 和 `<if>` 动态处理多个条件。

### 2.2 注解配置

注解方式中，`Example` 可以与 SQL Provider 结合使用。

> [!example]
>
> ```java
> public interface UserMapper {
>     
>     @SelectProvider(type = UserSqlProvider.class, method = "selectByExample")
>     List<User> selectByExample(@Param("example") UserExample example);
> }
> 
> public class UserSqlProvider {
>     public String selectByExample(UserExample example) {
>         StringBuilder sql = new StringBuilder("SELECT * FROM users");
>         if (example != null && example.getOredCriteria().size() > 0) {
>             sql.append(" WHERE ");
>             // 动态构建 SQL
>             for (int i = 0; i < example.getOredCriteria().size(); i++) {
>                 Criteria criteria = example.getOredCriteria().get(i);
>                 if (criteria.valid()) {
>                     if (i > 0) {
>                         sql.append(" OR ");
>                     }
>                     // 处理每个条件
>                     sql.append("(");
>                     for (int j = 0; j < criteria.getAllCriteria().size(); j++) {
>                         Criterion criterion = criteria.getAllCriteria().get(j);
>                         sql.append(criterion.getCondition());
>                         sql.append(" #{example.oredCriteria[").append(i).append("].allCriteria[").append(j).append("].value}");
>                         if (j < criteria.getAllCriteria().size() - 1) {
>                             sql.append(" AND ");
>                         }
>                     }
>                     sql.append(")");
>                 }
>             }
>         }
>         return sql.toString();
>     }
> }
> ```
>
> 在这个示例中：
>
> - 根据 `Example` 对象构建 SQL 语句。
> - 通过 `StringBuilder` 拼接 SQL，根据条件动态生成不同的查询。
>  
