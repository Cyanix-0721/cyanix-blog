# Maven

> [!info] [Maven](https://maven.apache.org/)

## 1 配置文件 `settings.xml`

```xml
<settings>
    <proxies>
        <proxy>
            <id>local-proxy</id>
            <active>true</active>
            <protocol>http</protocol>
            <host>127.0.0.1</host>
            <port>7897</port>
        </proxy>
        <proxy>
            <id>local-https-proxy</id>
            <active>true</active>
            <protocol>https</protocol>
            <host>127.0.0.1</host>
            <port>7897</port>
        </proxy>
    </proxies>
	<mirrors>
	<!-- central指向阿里云仓库，查找失败后使用中央仓库 -->
		<mirror>
			<id>aliyunmaven</id>
			<mirrorOf>central</mirrorOf>
			<name>阿里云公共仓库</name>
			<url>https://maven.aliyun.com/repository/public</url>
		</mirror>
		<mirror>
			<id>central</id>
			<mirrorOf>*</mirrorOf>
			<name>中央仓库</name>
			<url>https://repo.maven.apache.org/maven2</url>
		</mirror>
		<mirror>
			<id>backup-repo</id>
			<mirrorOf>*, !aliyunmaven, !central</mirrorOf>
			<name>备用仓库</name>
			<url>https://repo1.maven.org/maven2</url>
	    </mirror>
	</mirrors>
	<profiles>
		<profile>
		  <id>JDK-1.8</id>
		  <activation>
			<!--<activeByDefault>true</activeByDefault>默认激活该profile,且该标签最多一个，和底部标签<activeProfile>profile_id</activeProfile>中填写ID效果一致，可选择一个或同时使用 -->
			<activeByDefault>false</activeByDefault>
		  </activation>
		  <properties>
			<JdkVersion>1.8</JdkVersion>
			<maven.compiler.source>${JdkVersion}</maven.compiler.source>
			<maven.compiler.target>${JdkVersion}</maven.compiler.target>
		  </properties>
		</profile>
		<profile>
		  <id>JDK-17</id>
		  <activation>
			<!--<activeByDefault>true</activeByDefault>默认激活该profile,且该标签最多一个，和底部标签<activeProfile>profile_id</activeProfile>中填写ID效果一致，可选择一个或同时使用 -->
			<activeByDefault>false</activeByDefault>
		  </activation>
		  <properties>
			<JdkVersion>17</JdkVersion>
			<maven.compiler.source>${JdkVersion}</maven.compiler.source>
			<maven.compiler.target>${JdkVersion}</maven.compiler.target>
		  </properties>
		</profile>
		<profile>  
			<id>custom-repos</id>  
			<activation>  
				<activeByDefault>true</activeByDefault>  
			</activation>  
			<repositories>  
				<repository>  
					<id>aliyunmaven</id>  
					<name>阿里云公共仓库</name>  
					<url>https://maven.aliyun.com/repository/public</url>  
				</repository>  
				<repository>  
					<id>central</id>  
					<name>中央仓库</name>  
					<url>https://repo.maven.apache.org/maven2</url>  
				</repository>  
				<repository>  
					<id>backup-repo</id>  
					<name>备用仓库</name>  
					<url>https://repo1.maven.org/maven2</url>  
				</repository>  
			</repositories>  
			<pluginRepositories>  
				<pluginRepository>  
					<id>aliyunmaven</id>  
					<name>阿里云公共仓库</name>  
					<url>https://maven.aliyun.com/repository/public</url>  
				</pluginRepository>  
				<pluginRepository>  
					<id>central</id>  
					<name>中央仓库</name>  
					<url>https://repo.maven.apache.org/maven2</url>  
				</pluginRepository>  
				<pluginRepository>  
					<id>backup-repo</id>  
					<name>备用仓库</name>  
					<url>https://repo1.maven.org/maven2</url>  
				</pluginRepository>  
			</pluginRepositories>  
		</profile>
	</profiles>
	<activeProfiles>
		<!-- <activeProfile></activeProfile> 中填写激活profile_id -->
	</activeProfiles>
</settings>
```

## 2 可选依赖和排除依赖

在 `pom.xml` 中，可以为特定的依赖配置可选依赖和排除依赖。

### 2.1 可选依赖

```xml
<dependency>
  <groupId>com.example</groupId>
  <artifactId>example-dependency</artifactId>
  <version>1.0.0</version>
  <optional>true</optional>
</dependency>
```

### 2.2 排除依赖

```xml
<dependency>
  <groupId>com.example</groupId>
  <artifactId>example-dependency</artifactId>
  <version>1.0.0</version>
  <exclusions>
    <exclusion>
      <groupId>com.unwanted</groupId>
      <artifactId>unwanted-dependency</artifactId>
    </exclusion>
  </exclusions>
</dependency>
```

## 3 聚合

Maven 聚合允许在一个项目中管理多个模块。

### 3.1 父 `pom.xml`

```xml
<modules>
  <module>module-a</module>
  <module>module-b</module>
</modules>
```

### 3.2 子模块 `pom.xml`

```xml
<parent>
  <groupId>com.example</groupId>
  <artifactId>parent-project</artifactId>
  <version>1.0.0</version>
</parent>
```

## 4 继承

子项目可以继承父项目的配置。

通过 `dependencyManagement` 管理依赖的版本。

### 4.1 父项目 `pom.xml`

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>com.example</groupId>
      <artifactId>example-dependency</artifactId>
      <version>1.0.0</version>
    </dependency>
  </dependencies>
</dependencyManagement>
```

### 4.2 子项目 `pom.xml`

```xml
<parent>
  <groupId>com.example</groupId>
  <artifactId>parent-project</artifactId>
  <version>1.0.0</version>
</parent>
<dependencies>
  <dependency>
    <groupId>com.example</groupId>
    <artifactId>example-dependency</artifactId>
  </dependency>
</dependencies>
```

## 5 属性

可以在 `pom.xml` 中定义和使用属性。

```xml
<properties>
  <java.version>1.8</java.version>
</properties>

<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
    <version>${spring.boot.version}</version>
  </dependency>
</dependencies>
```

## 6 多环境开发

通过 profiles 支持多环境配置。

- 通过读取 `env` 判断使用的 `profile`，然后设置 `properties` 中 `env` 为对应值  
- `<activation><activeByDefault>true</activeByDefault></activation>` 可以默认激活 `profile`

```xml
<profiles>
  <profile>
    <id>development</id>
    <properties>
      <env>development</env>
    </properties>
    <activation>
      <property>
        <name>env</name>
        <value>dev</value>
      </property>
    </activation>
  </profile>
  <profile>
    <id>production</id>
    <properties>
      <env>production</env>
    </properties>
    <activation>
      <property>
        <name>env</name>
        <value>prod</value>
      </property>
    </activation>
  </profile>
</profiles>
```

在命令行中激活 profile：

- 使用 `PROFILE_ID`

	```sh
	mvn clean install -P development
	```

- 使用 `ACTIVATION` 标签中指定的值（如环境变量 `env`）

	```sh
	mvn clean install -Denv=dev
	```

## 7 跳过测试

可以通过命令行参数跳过测试。

```sh
mvn clean install -DskipTests
```

## 8 私服搭建

可以使用 Nexus 或 Artifactory 来搭建 Maven 私服。

### 8.1 Nexus 配置示例

```xml
<distributionManagement>
  <repository>
    <id>nexus</id>
    <name>Nexus Repository</name>
    <url>http://localhost:8081/repository/maven-releases/</url>
  </repository>
  <snapshotRepository>
    <id>nexus-snapshots</id>
    <name>Nexus Snapshot Repository</name>
    <url>http://localhost:8081/repository/maven-snapshots/</url>
  </snapshotRepository>
</distributionManagement>
```

## 9 私服仓库分类

配置多个私服仓库分类，例如 release 和 snapshot。

```xml
<repositories>
  <repository>
    <id>release-repo</id>
    <url>http://localhost:8081/repository/maven-releases/</url>
    <releases>
      <enabled>true</enabled>
    </releases>
    <snapshots>
      <enabled>false</enabled>
    </snapshots>
  </repository>
  <repository>
    <id>snapshot-repo</id>
    <url>http://localhost:8081/repository/maven-snapshots/</url>
    <releases>
      <enabled>false</enabled>
    </releases>
    <snapshots>
      <enabled>true</enabled>
    </snapshots>
  </repository>
</repositories>
```

## 10 本地仓库访问私服配置

在 `settings.xml` 中配置私服信息。

```xml
<mirrors>
  <mirror>
    <id>nexus</id>
    <mirrorOf>*</mirrorOf>
    <url>http://localhost:8081/repository/maven-public/</url>
  </mirror>
</mirrors>
<servers>
  <server>
    <id>nexus</id>
    <username>admin</username>
    <password>admin123</password>
  </server>
</servers>
```

## 11 私服的资源上传下载

配置 `distributionManagement` 和 `repositories` 来上传和下载资源。

### 11.1 上传资源

```sh
mvn deploy
```

### 11.2 下载资源

在 `pom.xml` 中定义依赖，Maven 会自动从私服下载资源。

```xml
<dependency>
  <groupId>com.example</groupId>
  <artifactId>example-dependency</artifactId>
  <version>1.0.0</version>
</dependency>
```

## 12 代理

在 Maven 中，可以通过编辑 `settings.xml` 文件配置 HTTP 或 HTTPS 代理。该文件通常位于以下位置：

- **Windows**: `%USERPROFILE%\.m2\settings.xml`
- **Linux/macOS**: `~/.m2/settings.xml`

如果不存在 `settings.xml`，可以手动创建一个。

1. 打开或创建 `settings.xml` 文件。
2. 在文件中添加 `<proxies>` 配置，用来设置 HTTP 或 HTTPS 代理。

示例 `settings.xml` 文件：

```xml
<settings>
    <proxies>
        <proxy>
            <id>example-proxy</id>
            <active>true</active>
            <protocol>http</protocol>
            <host>proxy.example.com</host>
            <port>8080</port>
            <username>your-username</username>
            <password>your-password</password>
            <nonProxyHosts>www.google.com|*.example.com</nonProxyHosts>
        </proxy>
        <proxy>
            <id>example-https-proxy</id>
            <active>true</active>
            <protocol>https</protocol>
            <host>proxy.example.com</host>
            <port>443</port>
            <username>your-username</username>
            <password>your-password</password>
        </proxy>
    </proxies>
</settings>
```

- `id`: 代理配置的唯一标识符。
- `active`: 是否激活该代理（`true` 或 `false`）。
- `protocol`: 使用的协议（`http` 或 `https`）。
- `host`: 代理服务器的主机名。
- `port`: 代理服务器的端口号。
- `username` 和 `password`: 如果代理需要认证，填写用户名和密码。
- `nonProxyHosts`: 不走代理的主机，可以用 `|` 分隔多个主机名。

## 13 Maven Wrapper

Maven Wrapper (`mvnw`) 可以帮助项目使用指定版本的 Maven，而不需要每个开发者手动安装相同版本的 Maven。它自动下载并管理 Maven 版本，确保团队一致性。

1. **添加 Maven Wrapper 到项目中**

   如果你的项目中还没有 Maven Wrapper，可以通过以下命令来添加：

   ```bash
   mvn -N io.takari:maven:wrapper
   ```

   该命令会生成以下文件：

   - `mvnw`: Maven Wrapper 可执行文件 (Linux/macOS)。
   - `mvnw.cmd`: Maven Wrapper 可执行文件 (Windows)。
   - `.mvn/wrapper/maven-wrapper.jar`: Maven Wrapper 的核心文件。
   - `.mvn/wrapper/maven-wrapper.properties`: Maven Wrapper 的配置文件。

2. **自定义 Maven Wrapper 配置**

   打开 `.mvn/wrapper/maven-wrapper.properties` 文件，可以自定义下载的 Maven 版本：

   ```properties
   distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip
   ```

   `distributionUrl` 指定了 Maven 的下载路径和版本。

3. **使用 Maven Wrapper**

   之后，你可以通过以下命令来构建项目，而不需要依赖系统全局的 Maven：

   - 在 **Linux/macOS** 上运行：

	 ```bash
     ./mvnw clean install
     ```

   - 在 **Windows** 上运行：

	 ```bash
     mvnw.cmd clean install
     ```

Maven Wrapper 会根据 `maven-wrapper.properties` 下载指定版本的 Maven 并进行构建。
