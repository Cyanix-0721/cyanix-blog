# 使用 Maven/Grandle 打包 Spring Boot 项目

根据你的项目使用的构建工具，你可以选择使用 Maven 或 Gradle 来打包你的 Spring Boot 项目。

## 1 使用 Maven 打包 Spring Boot 项目

1. 打开你的项目。

2. 在右侧的 Maven 工具窗口中，展开 "Lifecycle"。

3. 双击 "package"。这将会运行 `mvn package` 命令。  
这个命令将会编译你的代码，运行测试，并将你的应用打包为一个可执行的 JAR 文件。你可以在 `target` 目录下找到这个 JAR 文件。

如果你的项目配置正确，这个 JAR 文件应该是一个独立的 Spring Boot 应用，你可以使用 `java -jar` 命令来运行它。

注意：在运行 `mvn package` 命令之前，你需要确保你的 `pom.xml` 文件中包含了正确的 Spring Boot Maven 插件配置。这个插件负责将你的应用打包为一个可执行的 JAR 文件。以下是一个基本的配置示例：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

## 2 使用 Gradle 打包 Spring Boot 项目

以下是使用 Gradle 打包 Spring Boot 项目的步骤：

1. 打开你的项目。

2. 在右侧的 Gradle 工具窗口中，展开 "Tasks" -> "boot"。

3. 双击 "bootJar" 或 "bootWar"。这将会运行相应的 Gradle 任务。

这个任务将会编译你的代码，运行测试，并将你的应用打包为一个可执行的 JAR 或 WAR 文件。你可以在 `build/libs` 目录下找到这个文件。

如果你的项目配置正确，这个 JAR 或 WAR 文件应该是一个独立的 Spring Boot 应用，你可以使用 `java -jar` 命令来运行它。

注意：在运行 `bootJar` 或 `bootWar` 任务之前，你需要确保你的 `build.gradle` 文件中包含了正确的 Spring Boot Gradle 插件配置。这个插件负责将你的应用打包为一个可执行的 JAR 或 WAR 文件。以下是一个基本的配置示例：

```groovy
plugins {
    id 'org.springframework.boot' version '2.5.4'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    id 'java'
}

bootJar {
    mainClassName = 'com.example.demo.DemoApplication'
}
```
