# Podman

> [!nnote]  
> [Podman 官方文档](https://podman.io/getting-started)  
> [Podman GitHub 页面](https://github.com/containers/podman)  
> [Podman - ArchWiki](https://wiki.archlinux.org/title/Podman)

## 1 安装 Podman

在 Arch Linux 上，你可以使用 `pacman` 安装 Podman：

```bash
sudo pacman -S podman
```

## 2 核心命令

### 2.1 查看 Podman 版本

```bash
podman --version
```

### 2.2 拉取镜像

```bash
podman pull <image-name>
```

例如，拉取 Alpine 镜像：

```bash
podman pull alpine
```

### 2.3 列出镜像

```bash
podman images
```

### 2.4 运行容器

```bash
podman run [OPTIONS] <image-name> [COMMAND] [ARG...]
```

例如，以交互模式运行 Alpine 容器：

```bash
podman run -it alpine sh
```

### 2.5 列出运行中的容器

```bash
podman ps
```

### 2.6 列出所有容器（包括已停止的）

```bash
podman ps -a
```

### 2.7 停止容器

```bash
podman stop <container-id>
```

### 2.8 删除容器

```bash
podman rm <container-id>
```

### 2.9 构建镜像

```bash
podman build -t <tag> <path>
```

例如，从当前目录构建一个名为 `my-image` 的镜像：

```bash
podman build -t my-image .
```

## 3 Podman Compose

Podman 支持类似 Docker Compose 的工具 `podman-compose`，用于管理多容器应用。

### 3.1 安装 `podman-compose`

在 Arch Linux 上安装：

```bash
sudo pacman -S podman-compose
```

### 3.2 使用 `podman-compose`

创建一个 `docker-compose.yml` 文件，然后用 `podman-compose` 启动服务：

```bash
podman-compose -f docker-compose.yml up
```

## 4 使用 Podman 的 Docker CLI 兼容层

Podman 提供了 `podman-docker` 包，以便可以使用 Docker CLI 命令与 Podman 交互。

### 4.1 安装 `podman-docker`

在 Arch Linux 上安装：

```bash
sudo pacman -S podman-docker
# sudo touch /etc/containers/nodocker
```

## 5 高级功能

### 5.1 Pod 管理

Podman 引入了 Pod 的概念，使你可以将多个容器组合在一起共享同一网络命名空间。

#### 5.1.1 创建 Pod

```bash
podman pod create --name <pod-name>
```

#### 5.1.2 运行容器到指定 Pod

```bash
podman run -d --pod <pod-name> <image-name>
```

#### 5.1.3 查看 Pods

```bash
podman pod ps
```

#### 5.1.4 删除 Pod

```bash
podman pod rm <pod-name>
```

### 5.2 使用 Buildah 构建镜像

`Buildah` 是一个用于构建容器镜像的工具，通常与 Podman 配合使用。

#### 5.2.1 安装 Buildah

```bash
sudo pacman -S buildah
```

#### 5.2.2 使用 Buildah 构建镜像

```bash
buildah bud -t <tag> <path>
```

## 6 配置镜像源

```bash
# 创建配置文件并写入内容
sudo tee /etc/containers/registries.conf.d/10-unqualified-search-registries.conf << EOF
unqualified-search-registries = ["docker.io"]
EOF
```

## 7 Rootless 模式

> [!note] Rootless vs Rootful  
> Podman 支持两种运行模式：
> - **Rootless（无根模式）**：普通用户运行容器，网络会自动设置，容器没有独立 IP 地址，安全性更高
> - **Rootful（有根模式）**：root 用户运行容器，容器有独立 IP 地址

> [!info] Rootless 模式的优势
>
> - **安全优势**
> 	- **权限隔离**：容器进程以普通用户权限运行，即使容器被攻破，攻击者也无法获得宿主机 root 权限
> 	- **无守护进程**：Podman 采用无守护进程架构，消除单点故障和安全风险
> 	- **用户隔离**：不同用户的容器相互隔离，无法访问彼此的容器  
> - **资源效率**
> 	- Podman 无守护进程架构占用系统资源更少，适合资源受限环境
> 	- 每个用户独立管理自己的容器环境

### 7.1 启用 Rootless 模式

#### 7.1.1 启用用户命名空间

```bash
# 检查当前设置
sysctl kernel.unprivileged_userns_clone

# 如果输出为 0，则临时启用
sudo sysctl kernel.unprivileged_userns_clone=1

# 永久启用（在 /etc/sysctl.d/ 中创建配置文件）
echo 'kernel.unprivileged_userns_clone=1' | sudo tee /etc/sysctl.d/99-podman.conf
```

> **注意**：使用 `linux-hardened` 内核时，此选项默认关闭，需手动开启。

#### 7.1.2 配置用户子 UID/GID

```bash
# 为用户分配子 UID 和 GID 范围
sudo usermod --add-subuids 100000-165535 --add-subgids 100000-165535 $USER

# 应用更改
podman system migrate
```

### 7.2 验证 Rootless 模式

```bash
# 以普通用户身份运行容器测试
podman run --rm alpine echo "Hello Rootless Podman"

# 检查容器是否以当前用户身份运行
podman ps
```

## 8 故障排查

### 8.1 镜像拉取失败

如果配置镜像源后仍无法拉取镜像，可检查镜像源可用性：

```bash
# 启用详细日志查看具体错误
podman --log-level=debug pull alpine
```

### 8.2 Rootless 网络问题

Rootless 模式下容器网络受限，如需更复杂的网络配置，可考虑：

```bash
# 创建自定义网络（需要安装 CNI 插件）
podman network create my-network
podman run --network=my-network --rm alpine ping example.com
```
