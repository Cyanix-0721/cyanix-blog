# Mybatis 二级缓存

MyBatis的二级缓存是针对整个SqlSessionFactory的缓存机制，能够在多个SqlSession之间共享缓存数据，主要用于提高查询性能。它的使用步骤如下：

1. **开启二级缓存**：在`mybatis-config.xml`中配置 `<settings>` 标签，设置 `cacheEnabled` 为 `true`。

2. **配置 Mapper**：在每个 Mapper 接口的 XML 文件中，添加 `<cache>` 标签来启用二级缓存。

3. **使用缓存**：在查询方法中，MyBatis 会自动从二级缓存中获取数据，如果缓存中没有，则执行数据库查询并将结果存入缓存。

4. **自定义缓存**：可以通过实现 `org.apache.ibatis.cache.Cache` 接口自定义缓存实现。

要注意的是，二级缓存是基于对象的，不会缓存 SQL 语句的结果集，因此对于频繁变动的数据，需谨慎使用。
