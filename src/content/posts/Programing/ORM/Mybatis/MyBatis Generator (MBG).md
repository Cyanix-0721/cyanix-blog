# MyBatis Generator (MBG)

**简介**：  
MyBatis Generator（MBG）是一个用于自动生成 MyBatis 映射文件和 Java 类的代码生成工具。它可以根据数据库表结构自动生成对应的实体类、Mapper 接口和 XML 配置文件，从而简化了数据访问层的开发过程。

**主要特性**：
1. **支持多种数据库**：MBG 可以与多种主流数据库兼容，如 MySQL、Oracle、PostgreSQL 等。
2. **灵活的配置**：通过 XML 配置文件或 Java API 定制生成的代码内容，支持生成不同风格的代码。
3. **生成注释和 JPA 注解**：可选生成带有注释和 JPA 注解的代码，便于与其他框架集成。
4. **自动化**：能够根据数据库的表结构自动生成所有必要的代码，大幅度提升开发效率。

> [!note] MyBatisX 和 EasyCode
>
> MBG 是一个强大的工具，能够自动生成 MyBatis 所需的代码，MyBatisX 和 EasyCode 则在 MBG 的基础上，提供了更高效、便捷的开发体验。使用这些工具可以极大地提高开发效率，减少手动编码的繁琐过程。
>
> **MyBatisX**：
> - **简介**：MyBatisX 是一个 IntelliJ IDEA 插件，旨在提升 MyBatis 的开发效率。
> - **功能**：
>   - 提供友好的用户界面，支持代码生成功能，用户可以通过简单的操作生成所需的代码。
>   - 支持生成 CRUD 操作，自动生成 Mapper 和 XML 文件。
>   - 提供代码重构和修改的功能，保持与数据库的同步。
> - **优点**：可视化操作方便开发者，无需手动编辑 XML 配置，提升了工作效率。
>
> **EasyCode**：
> - **简介**：EasyCode 是一个代码生成工具，提供丰富的配置选项和模板功能。
> - **功能**：
>   - 通过图形化界面，用户可以选择需要生成的表和配置文件，支持生成多种样式的代码。
>   - 提供自定义模板功能，用户可以根据项目需求自定义生成的代码结构。
>   - 支持生成多种类型的代码，如实体类、Mapper 接口、Service 层等。
> - **优点**：灵活性高，可以根据具体需求快速生成符合项目风格的代码，大幅度降低了开发时间。

## 1 MyBatis Generator (MBG) 的详细使用

### 1.1 添加依赖

在 Maven 项目的 `pom.xml` 文件中添加 MBG 的依赖：

```xml
<dependency>
    <groupId>org.mybatis.generator</groupId>
    <artifactId>mybatis-generator-core</artifactId>
    <version>1.4.0</version>
</dependency>
```

同时，添加 `mybatis` 和 `mysql-connector-j`（或其他数据库驱动）依赖：

```xml
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.5.6</version>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.4.0</version>
</dependency>
```

### 1.2 创建 MBG 配置文件

创建一个 `generatorConfig.xml` 文件，配置数据库连接和生成选项：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<context id="MyBatisGenerator" targetRuntime="MyBatis3">

    <jdbcConnection driverClass="com.mysql.cj.jdbc.Driver"
                    connectionURL="jdbc:mysql://localhost:3306/your_database"
                    userId="your_username"
                    password="your_password">
    </jdbcConnection>

    <javaModelGenerator targetPackage="com.example.model" 
                        targetProject="src/main/java">
        <property name="enableSetter" value="true"/>
    </javaModelGenerator>

    <sqlMapGenerator targetPackage="com.example.mapper" 
                     targetProject="src/main/resources">
    </sqlMapGenerator>

    <javaClientGenerator type="XMLMAPPER" 
                         targetPackage="com.example.mapper" 
                         targetProject="src/main/java">
    </javaClientGenerator>

    <table tableName="your_table" domainObjectName="YourDomainObject"/>
</context>
```

### 1.3 执行代码生成

可以通过以下两种方式执行生成：

- **使用命令行**：创建一个 Java 类，使用 MBG 的 `MyBatisGenerator` 类执行生成。

```java
import org.mybatis.generator.api.MyBatisGenerator;
import org.mybatis.generator.config.Configuration;
import org.mybatis.generator.config.xml.ConfigurationParser;
import org.mybatis.generator.internal.DefaultShellCallback;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class MBGRunner {
    public static void main(String[] args) throws Exception {
        List<String> warnings = new ArrayList<>();
        boolean overwrite = true;
        File configFile = new File("path/to/generatorConfig.xml");
        ConfigurationParser cp = new ConfigurationParser(warnings);
        Configuration config = cp.parseConfiguration(configFile);
        DefaultShellCallback callback = new DefaultShellCallback(overwrite);
        MyBatisGenerator myBatisGenerator = new MyBatisGenerator(config, callback, warnings);
        myBatisGenerator.generate(null);
    }
}
```

- **使用 Maven 插件**：在 `pom.xml` 中添加 MBG Maven 插件配置。

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.mybatis.generator</groupId>
            <artifactId>mybatis-generator-maven</artifactId>
            <version>1.4.0</version>
            <executions>
                <execution>
                    <goals>
                        <goal>generate</goal>
                    </goals>
                </execution>
            </executions>
            <configuration>
                <configurations>
                    <configuration>
                        <javaModelGenerator>
                            <targetPackage>com.example.model</targetPackage>
                            <targetProject>src/main/java</targetProject>
                        </javaModelGenerator>
                    </configuration>
                </configurations>
            </configuration>
        </plugin>
    </plugins>
</build>
```

在终端中运行以下命令执行生成：

```bash
mvn mybatis-generator:generate
```

### 1.4 整合到项目中

生成的代码通常包括以下几个部分：

- **实体类**（Java Model）：对应数据库表的 POJO 类。
- **Mapper 接口**：定义了与数据库交互的方法。
- **XML 映射文件**：包含 SQL 语句和 Mapper 接口的方法的映射关系。

将这些代码集成到你的项目中，并根据需要进行修改和扩展。

### 1.5 自定义生成

可以通过修改 `generatorConfig.xml` 中的配置项来自定义生成的代码，例如：

- **添加插件**：可以添加插件以扩展生成的功能。
- **自定义模板**：可以使用自定义模板生成特定风格的代码。

### 1.6 维护和更新

每次数据库表结构发生变化时，可以修改 `generatorConfig.xml` 文件并重新运行代码生成。可以选择是否覆盖生成的代码。
