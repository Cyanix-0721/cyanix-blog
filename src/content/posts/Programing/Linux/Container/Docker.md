> [!info]  
> CLI Reference part fetch from official documents  
> [Docker Official Doc](https://docs.docker.com/)  
> [Docker Desktop Install](https://docs.docker.com/desktop/install/linux-install/) (Docker Desktop include CLI)  
> [Docker Hub]( https://hub.docker.com/ )

# Docker

Docker是一个开源的应用容器引擎，基于 Go，开源协议 Apache 2.0。它允许开发者将应用及其依赖打包成轻量级、可移植的容器，然后可以在任何支持Docker的Linux服务器上运行。这些容器是使用沙箱机制隔离的，彼此之间不会有任何接口，同时容器的开销非常低。

Docker的核心优势包括：

- 灵活性：即使是最复杂的应用也可以容器化。  
- 轻量级：容器共享主机的内核，减少了额外的负担。  
- 可互换性：可以快速部署更新和升级。  
- 便携性：在本地构建，部署到云，并在任何地方运行。  
- 可扩展性：可以增加并自动分发容器副本。  
- 可堆叠性：可以垂直和即时堆叠服务。  

Docker的应用场景：

- Web 应用的自动化打包和发布。
- 自动化测试和持续集成、发布。
- 在服务型环境中部署和调整数据库或其他的后台应用。
- 从头编译或者扩展现有的 OpenShift 或 Cloud Foundry 平台来搭建自己的 PaaS 环境。

## 1 Base Command

- 查看运行中的容器（使用 `-a` 选项查看所有容器）：

	```bash
    docker ps [-a]
    ```

- 运行容器（`-d` 选项表示以守护进程方式运行，`-i` 选项表示附加到容器的 STDIN，`-t` 选项表示分配一个伪终端，`-P` 选项表示随机映射 `EXPOSE` 的所有端口到宿主机）：

	```bash
    docker run [--name {CONTAINER_NAME}] [-d] [-it] [-p {LOCAL_PORT}:{CONTAINER_PORT}] [-P] [-v {/PATH/TO/LOCAL/DIRECTORY}:{/PATH/IN/CONTAINER}] {IMAGE_NAME} {SHELL_NAME}
    ```

- 在容器内部额外启动新进程（`-d` 选项表示在后台运行命令，`-i` 选项表示附加到容器的 STDIN，`-t` 选项表示分配一个伪终端）：

	```bash
    docker exec [-d] [-it] {CONTAINER_NAME/CONTAINER_ID} [{SHELL_NAME}]
    ```

- 获取容器日志：

	```bash
    docker logs {CONTAINER_NAME/CONTAINER_ID}
    ```

- 查看容器内的进程：

	```bash
    docker top {CONTAINER_NAME/CONTAINER_ID}
    ```

- 启动容器（`-i` 选项表示附加到容器的 STDIN，`-a` 选项表示附加 STDOUT/STDERR 并转发信号（可以分解为单独的 attach 命令））：

	```bash
    docker start [-i] [-a] {CONTAINER_NAME/CONTAINER_ID}
    ```

- 附着容器：

	```bash
    docker attach {CONTAINER_NAME/CONTAINER_ID}
    ```

- 停止容器：

	```bash
    docker stop {CONTAINER_NAME/CONTAINER_ID}
    ```

- 删除容器：

	```bash
    docker rm {CONTAINER_NAME/CONTAINER_ID}
    ```

- 查看所有镜像：

	```bash
    docker images
    ```

- 拉取镜像：

	```bash
    docker pull {IMAGE_NAME}
    ```

- 删除镜像：

	```bash
	docker rmi {IMAGE_NAME[:TAG]}
	```

- 构建镜像：
	- 使用容器构建：

		```bash
		docker commit {CONTAINER_ID} {IMAGE_NAME}
		```

	- 使用 Dockerfile 构建（`-t` 选项表示以 `name:tag` 格式指定名称和标签，最后的 `.` 表示在当前目录寻找 Dockerfile）：

		```bash
		docker build [-f {DOCKERFILE_PATH}] [{DOCKERFILE_URL}] [- < Dockerfile] [--no-cache] [-t {Name}:{TAG}] {PATH/TO/DOCKERFILE}
		```

- 私有镜像库
	- `/usr/lib/systemd/system/docker.service`
		- `ExecStart=/usr/bin/dockerd-current` 中加入 `--insecure-registry <host_ip:registry_port>`
	- 重新启动docker和docker的后台服务  
		- ` systemctl daemon-reload`
		- `systemctl restart docker`
	- 容器启动 `registry`
		- ` docker run -p <host_port:registry_port> -d registry `
	- 镜像加 tag（可重复执行进行多 tag 标记）
		- `docker tag [OPTIONS] IMAGE[:TAG] [REGISTRYHOST/][USERNAME/]NAME[:TAG]`
	- 推送到仓库
		- `docker push [OPTIONS] [REGISTRYHOST/][USERNAME/]NAME[:TAG]`

## 2 [Dockerfile](https://docs.docker.com/reference/dockerfile/)

### 2.1 Overview

> [!tip] 如果在一个目录中存放多个 Dockerfile，可以给予不同的命名用于区分，如 `Dockerfile.nginx`

| Instruction                                                                         | Description                                                 |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`ADD`](https://docs.docker.com/reference/dockerfile/#add)                          | Add local or remote files and directories.                  |
| [`ARG`](https://docs.docker.com/reference/dockerfile/#arg)                          | Use build-time variables.                                   |
| [`CMD`](https://docs.docker.com/reference/dockerfile/#cmd)                          | Specify default commands.                                   |
| [`COPY`](https://docs.docker.com/reference/dockerfile/#copy)                        | Copy files and directories.                                 |
| [`ENTRYPOINT`](https://docs.docker.com/reference/dockerfile/#entrypoint)            | Specify default executable.                                 |
| [`ENV`](https://docs.docker.com/reference/dockerfile/#env)                          | Set environment variables.                                  |
| [`EXPOSE`](https://docs.docker.com/reference/dockerfile/#expose)                    | Describe which ports your application is listening on.      |
| [`FROM`](https://docs.docker.com/reference/dockerfile/#from)                        | Create a new build stage from a base image.                 |
| [`HEALTHCHECK`](https://docs.docker.com/reference/dockerfile/#healthcheck)          | Check a container's health on startup.                      |
| [`LABEL`](https://docs.docker.com/reference/dockerfile/#label)                      | Add metadata to an image.                                   |
| [`MAINTAINER`](https://docs.docker.com/reference/dockerfile/#maintainer-deprecated) | Specify the author of an image.                             |
| [`ONBUILD`](https://docs.docker.com/reference/dockerfile/#onbuild)                  | Specify instructions for when the image is used in a build. |
| [`RUN`](https://docs.docker.com/reference/dockerfile/#run)                          | Execute build commands.                                     |
| [`SHELL`](https://docs.docker.com/reference/dockerfile/#shell)                      | Set the default shell of an image.                          |
| [`STOPSIGNAL`](https://docs.docker.com/reference/dockerfile/#stopsignal)            | Specify the system call signal for exiting a container.     |
| [`USER`](https://docs.docker.com/reference/dockerfile/#user)                        | Set user and group ID.                                      |
| [`VOLUME`](https://docs.docker.com/reference/dockerfile/#volume)                    | Create volume mounts.                                       |
| [`WORKDIR`](https://docs.docker.com/reference/dockerfile/#workdir)                  | Change working directory.                                   |

> [!tip] `CMD` 和 `ENTRYPOINT` 效果相同，但是 `CMD` 可以被覆盖

| 特征  | 绑定挂载               | 数据卷                                              |
| --- | ------------------ | ------------------------------------------------ |
| 持久性 | 与主机上的原始文件或目录共享生命周期 | 持久性存储，即使容器被删除，数据也会保留
| 共享  | 只能用于单个容器           | 可以跨容器共享
| 位置  | 直接挂载到主机上的目录或文件     |   默认存储在 Docker 主机上，默认 `/var/lib/docker/volumes`
| 用例  | 在主机和容器之间共享临时数据     | 存储需要持久化的数据，并在多个容器之间共享数据

### 2.2 Centos 7 + OpenJDK 21 + Tomcat 10

```dockerfile
# 使用官方的 CentOS 7 镜像作为基础
FROM centos:7

# 安装必要的工具
RUN ["yum", "-y", "install", "wget"]

# 设置工作目录，可以省略解压时使用`-C`指定解压目录
# WORKDIR /opt

# 下载并安装 Liberica JDK
RUN ["wget", "https://download.bell-sw.com/java/21.0.2+14/bellsoft-jdk21.0.2+14-linux-amd64-full.tar.gz"]
RUN ["tar", "-xvf", "bellsoft-jdk21.0.2+14-linux-amd64-full.tar.gz", "-C", "/opt"]
RUN ["rm", "bellsoft-jdk21.0.2+14-linux-amd64-full.tar.gz"]

# 设置 JAVA_HOME 环境变量
ENV JAVA_HOME /opt/jdk-21.0.2-full
ENV PATH $PATH:$JAVA_HOME/bin

# 下载并安装 Tomcat 10
RUN ["wget", "https://dlcdn.apache.org/tomcat/tomcat-10/v10.1.20/bin/apache-tomcat-10.1.20.tar.gz", "-P", "/tmp"]
RUN ["tar", "-xf", "/tmp/apache-tomcat-10.1.20.tar.gz", "-C", "/opt"]
RUN ["mv", "/opt/apache-tomcat-10.1.20", "/opt/tomcat10"]

# 设置 CATALINA_HOME 环境变量
ENV CATALINA_HOME /opt/tomcat10
ENV PATH $PATH:$CATALINA_HOME/bin

# 开放 8080 端口
EXPOSE 8080

# 启动 Tomcat
ENTRYPOINT ["/opt/tomcat10/bin/catalina.sh", "run"]
```

### 2.3 MySQL 8

```dockerfile
# 使用官方的 mysql 8 镜像作为基础镜像
FROM mysql:8.0

# 设置 mysql 的 root 用户的密码
ENV MYSQL_ROOT_PASSWORD my-secret-pw

# 将你的数据库初始化脚本复制到 /docker-entrypoint-initdb.d/ 目录
# 这个目录中的脚本会在容器启动时自动执行
# COPY ./your-script.sql /docker-entrypoint-initdb.d/

# 暴露 3306 端口，这是 mysql 服务的默认端口
EXPOSE 3306
```

### 2.4 Maven+SpringBoot+MySQL 项目打包部署到 Docker

1. 首先，你需要在项目的根目录下创建一个 `Dockerfile`。这个文件定义了如何构建你的 Docker 镜像。以下是一个基本的 `Dockerfile` 示例：

	```dockerfile
	# 基于 OpenJDK 8 构建镜像
	FROM openjdk:8-jdk-alpine
	
	# 创建临时数据的命名卷
	VOLUME /tmp
	
	# 定义 JAR 文件路径参数
	ARG JAR_FILE=target/*.jar
	
	# 将 JAR 文件复制到容器的文件系统
	COPY ${JAR_FILE} app.jar
	
	# 暴露 Spring Boot 应用使用的端口 8080
	EXPOSE 8080
	
	# 设置启动命令，运行 Spring Boot 应用
	ENTRYPOINT ["java", "-jar", "/app.jar"]
    ```

2. 这个 `Dockerfile` 做了以下几件事：
	- 从一个基础镜像 `openjdk:8-jdk-alpine` 开始。
	- 创建一个 `/tmp` 的卷，这对于运行 Spring Boot 应用是必要的。
	- 将你的 Spring Boot 应用的 jar 文件复制到镜像中，并命名为 `app.jar`。
	- 定义了容器启动后运行的命令。
3. 在项目的根目录下运行 `mvn package` 命令，这将会创建一个可执行的 jar 文件。  
	- [Project Package](../../Build%20Tool/Project%20Package.md)
4. 然后，你可以使用 `docker build` 命令来构建你的 Docker 镜像。例如：

	```bash
    docker build -t myapp:1.0 .
    ```

	这将会创建一个名为 `myapp`，标签为 `1.0` 的 Docker 镜像。

5. 创建一个 Docker 网络：

	```bash
    docker network create my-network
    ```

6. 你需要运行一个 MySQL 容器作为你的数据库服务器，并将它加入到刚才创建的网络。例如：

	```bash
    docker run --name some-mysql --network my-network -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:tag
    ```

	这将会启动一个 MySQL 容器，并设置 root 用户的密码为 `my-secret-pw`。

7. 然后，你可以使用 `docker run` 命令来运行你的应用，并将它加入到同一个网络。例如：

	```bash
	docker run --name myapp -v /my/own/datadir:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw --network my-network -p 8080:8080 myapp:1.0
	```

上述命令将执行以下操作：

- 启动一个名为 `myapp` 的容器，并将其加入到 `my-network` 网络中。
- 将本地目录 `/my/own/datadir` 挂载到容器中的 `/var/lib/mysql` 目录，以便持久化 MySQL 数据。
- 设置 MySQL root 用户的密码为 `my-secret-pw`。
- 将容器的 8080 端口映射到主机的 8080 端口，以便可以从主机访问应用程序。
- 运行 `myapp:1.0` 镜像。

这样，你的应用程序就可以连接到 MySQL 容器，并通过主机的 8000 端口访问。  
	这将会启动你的应用，并将其加入到同一个网络。你的应用现在可以通过 `some-mysql` 主机名（和你在应用配置中设置的端口）来访问 MySQL 服务器。

## 3 [Docker Compose](https://docs.docker.com/compose/)

Docker Compose 是一个用于定义和运行多容器 Docker 应用的工具。通过使用单一的 `docker-compose.yml` 文件，你可以配置应用的所有服务、网络和数据卷，并通过一个简单的命令来启动和管理这些服务。

### 3.1 基本概念

- **服务（Services）**: 定义应用的各个组件，每个组件在一个单独的容器中运行。可以指定镜像、命令、环境变量、端口映射等配置。
- **网络（Networks）**: 允许容器之间的通信。Docker Compose 默认会为项目创建一个网络，你也可以自定义网络。
- **卷（Volumes）**: 用于数据的持久化和共享，可以在容器之间共享数据。

### 3.2 Docker Compose 文件结构

`docker-compose.yml` 文件使用 YAML 格式来描述应用的服务、网络和卷。以下是一个简单的示例：

```yaml
version: '3.8'  # 指定 Docker Compose 文件的版本(不是安装的版本，3.8兼容性好)

services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"  # 映射主机的8080端口到容器的80端口

  database:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: example
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

在这个例子中，我们定义了两个服务：`web` 和 `database`。`web` 服务使用 Nginx 镜像，并将主机的 8080 端口映射到容器的 80 端口。`database` 服务使用 MySQL 镜像，并设置了 `MYSQL_ROOT_PASSWORD` 环境变量，同时使用了一个名为 `db_data` 的卷来持久化数据库数据。

### 3.3 常用命令

> [!tip]  
>
> 在较新的 Docker 版本中，Docker Compose 已经集成到 Docker CLI 中，因此你应该使用 `docker compose` 替换 `docker-compose`

- **启动服务**: 使用 `docker-compose up` 命令启动所有服务。加上 `-d` 参数可以在后台运行。

  ```bash
  docker-compose up -d
  ```

- **停止服务**: 使用 `docker-compose down` 命令停止并移除容器、网络等。

  ```bash
  docker-compose down
  ```

- **查看日志**: 使用 `docker-compose logs` 查看服务的日志输出。

  ```bash
  docker-compose logs
  ```

- **重启服务**: 使用 `docker-compose restart` 重启服务。

  ```bash
  docker-compose restart
  ```

- **缩放服务**: 使用 `docker-compose scale` 命令可以调整服务实例的数量。

  ```bash
  docker-compose up --scale web=3
  ```

- **指定配置文件**: 使用 `-f` 选项可以指定要使用的 `docker-compose.yml` 配置文件。当有多个配置文件时，这个选项尤其有用。

  ```bash
  docker-compose -f custom-compose.yml up
  ```

- **指定环境变量文件**: 使用 `--env-file` 选项可以指定包含环境变量的文件，默认情况下是项目目录下的 `.env` 文件。

  ```bash
  docker-compose --env-file ./config/.env up
  ```

- **查看容器状态**: 使用 `docker-compose ps` 可以查看所有由当前 Compose 项目管理的容器的状态。

  ```bash
  docker-compose ps
  ```

- **检查容器详情**: 使用 `docker-compose inspect` 可以查看特定容器或服务的详细信息。

  ```bash
  docker-compose inspect web
  ```

### 3.4 实战示例：Spring Boot + MySQL

下面是一个更复杂的示例，其中包含一个 Spring Boot 应用和一个 MySQL 数据库：

```yaml
version: '3.8'

services:
  app:
    image: my-spring-boot-app:latest
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://database:3306/mydb
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: my-secret-pw
    depends_on:
      - database

  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: my-secret-pw
      MYSQL_DATABASE: mydb
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

在这个示例中，`app` 服务运行一个自定义的 Spring Boot 应用，并依赖 `database` 服务。`database` 服务使用 MySQL 镜像，并初始化一个名为 `mydb` 的数据库。`db_data` 卷用于持久化 MySQL 数据。

### 3.5 进阶功能

- **网络**: Docker Compose 允许你定义多个网络并指定每个服务应该加入哪个网络。这对复杂应用的网络隔离和安全性非常有帮助。

- **多环境配置**: 你可以使用多个 `docker-compose.yml` 文件或使用 `.env` 文件来管理不同环境（如开发、测试、生产）的配置。

- **扩展和覆盖**: 使用 `docker-compose.override.yml` 文件可以覆盖默认的 `docker-compose.yml` 配置。
