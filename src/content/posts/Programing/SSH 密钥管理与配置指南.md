# SSH 密钥管理与配置指南

## 1 算法选择

> [!NOTE] 关于 Ed25519 算法
>
> Ed25519 是目前推荐的 SSH 密钥算法，相比传统的 RSA 算法具有以下优势：
>
> - **更强的安全性**：抵抗侧信道攻击，提供更好的加密强度。
> 
> - **更快的性能**：签名验证速度更快。
> 
> - **更短的密钥**：密钥长度更短，便于管理。
> 
> - **前向安全**：即使私钥泄露，过去的通信也不会被解密。
>  

## 2 密钥生成

### 2.1 Linux / macOS / WSL / Git Bash

生成个人 GitHub 密钥：

```Bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_github -C "your_personal_email@example.com"
```

生成公司 GitLab 密钥：

```Bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_gitlab -C "your_work_email@company.com"
```

### 2.2 Windows (PowerShell)

生成个人 GitHub 密钥：

```PowerShell
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\id_ed25519_github -C "your_personal_email@example.com"
```

生成公司 GitLab 密钥：

```PowerShell
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\id_ed25519_gitlab -C "your_work_email@company.com"
```

> [!INFO] 命令参数说明
>
> - `-t ed25519`：指定采用 Ed25519 加密算法。
> 
> - `-f`：指定生成的密钥文件存放路径和名称。
> 
> - `-C`：添加注释标签（通常为邮箱），方便日后识别该密钥的用途。
>  

## 3 部署公钥到服务器

### 3.1 将公钥复制到远程服务器

使用 `ssh-copy-id` (Linux/Git Bash 推荐)：

```Bash
ssh-copy-id -i ~/.ssh/id_ed25519_github.pub user@remote-server
```

或者手动复制 (Windows/Linux 通用)：

```Bash
cat ~/.ssh/id_ed25519_github.pub | ssh user@remote-server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 3.2 设置正确的文件权限

在远程服务器上执行以下命令以确保安全性：

```Bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## 4 配置 SSH Agent 管理密钥

### 4.1 Linux / macOS / WSL / Git Bash

启动 SSH Agent 并添加密钥：

```Bash
# 启动 SSH Agent
eval "$(ssh-agent -s)"

# 添加个人 GitHub 密钥
ssh-add ~/.ssh/id_ed25519_github

# 添加公司 GitLab 密钥
ssh-add ~/.ssh/id_ed25519_gitlab

# 查看已添加的密钥
ssh-add -l
```

### 4.2 Windows (PowerShell)

启动 SSH Agent 服务并添加密钥：

```PowerShell
# 确保 SSH Agent 服务已启动并设置为自动启动
Get-Service ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent

# 添加个人 GitHub 密钥
ssh-add $env:USERPROFILE\.ssh\id_ed25519_github

# 添加公司 GitLab 密钥
ssh-add $env:USERPROFILE\.ssh\id_ed25519_gitlab

# 查看已添加的密钥
ssh-add -l
```

## 5 配置 SSH Config 文件管理多密钥

创建或编辑 `~/.ssh/config` 文件（Windows 路径为：`$HOME\.ssh\config`），添加以下内容：

```
# 个人 GitHub 账户
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes

# 公司 GitLab 账户
Host gitlab.company.com
  HostName gitlab.company.com
  User git
  IdentityFile ~/.ssh/id_ed25519_gitlab
  IdentitiesOnly yes

# 通用配置 - 适用于所有其他连接
Host *
  AddKeysToAgent yes
  # 如果使用 Windows，可能需要指定 SSH 可执行文件路径
  # ProxyCommand C:/Windows/System32/OpenSSH/ssh.exe -W %h:%p
```

> [!TIP] SSH Config 高级技巧
>
> - 使用 `IdentitiesOnly yes` 确保 SSH 只使用指定的密钥进行身份验证，避免尝试列表中的其他多余密钥。
> 
> - `AddKeysToAgent yes` 会在首次使用某密钥时，自动将其添加到 SSH Agent 缓存中。
> 
> - 您可以为同一个服务（如 GitHub）的不同账户创建不同的 `Host` 配置块。
>  

## 6 确保 SSH Agent 运行

### 6.1 确保 SSH 配置正确

您的 `~/.ssh/config` 应该包含以下基础通用设置：

```
Host *
  AddKeysToAgent yes
```

### 6.2 终端环境自动化配置

> [!NOTE] 简化 Fish Shell 配置
>
> 在 `~/.config/fish/config.fish` 中添加以下内容，实现在无 SSH_AUTH_SOCK 时通过临时文件静默启动：
>
> ```fish
> if not set -q SSH_AUTH_SOCK
>   ssh-agent -c | sed 's/^setenv/set -gx/' | source > /dev/null 2>&1
> end
> ```

> [!NOTE] 简化 Bash / Zsh 配置
>
> 如果您使用的是更为常见的 Bash 或 Zsh 环境，可以在 `~/.bashrc` 或 `~/.zshrc` 中添加：
>
> ```Bash
> if [ -z "$SSH_AUTH_SOCK" ]; then
>     eval "$(ssh-agent -s)" > /dev/null
> fi
> ```

## 7 测试连接

测试 GitHub 连接：

```Bash
ssh -T git@github.com
```

测试 GitLab 连接：

```Bash
ssh -T git@gitlab.company.com
```

成功连接时，终端会显示相应的欢迎信息。

## 8 故障排除

### 8.1 验证 SSH Agent 状态

查看当前已加载的密钥列表：

```Bash
ssh-add -l
```

### 8.2 调试连接问题

使用带有 `-v`（详细模式）的参数查看连接握手的详细过程，便于定位网络或密钥拒绝问题：

```Bash
ssh -T -v git@github.com
```

### 8.3 检查文件权限

SSH 守护进程对文件权限非常严格，权限设置错误会导致密钥被拒绝。

|**文件/目录**|**推荐权限**|**权限说明**|
|---|---|---|
|`~/.ssh`|`700` (drwx------)|只有所有者可以读、写、执行|
|`~/.ssh/authorized_keys`|`600` (-rw-------)|只有所有者可以读写|
|`~/.ssh/id_ed25519_github` (私钥)|`600` (-rw-------)|只有所有者可以读写|
|`~/.ssh/id_ed25519_github.pub` (公钥)|`644` (-rw-r--r--)|所有者可读写，其他人只读|
|`~/.ssh/known_hosts`|`644` (-rw-r--r--)|所有者可读写，其他人只读|
|`~/.ssh/config`|`600` (-rw-------) 或 `644`|强烈建议使用 `600` 以提高安全性|

#### 8.3.1 一键设置所有权限的脚本

您可以将以下代码保存为 `setup_ssh_permissions.sh` 脚本文件，以便一键修复常见权限问题：

```sh
#!/bin/bash

# SSH 目录权限设置脚本
# 安全地设置 ~/.ssh 目录及其文件的权限

set -e # 遇到错误立即退出

SSH_DIR="$HOME/.ssh"

echo "正在设置 SSH 目录权限…"

# 检查 SSH 目录是否存在
if [ ! -d "$SSH_DIR" ]; then
  echo "错误: SSH 目录不存在: $SSH_DIR"
  exit 1
fi

# 设置 SSH 目录权限为 700 (drwx------)
chmod 700 "$SSH_DIR"
echo "✓ 设置目录权限: $SSH_DIR -> 700"

# 设置文件权限
for file in "$SSH_DIR"/*; do
  if [ -f "$file" ]; then
    case "$(basename "$file")" in
    # 配置文件设置为 600 (-rw-------)
    "config" | "known_hosts" | "known_hosts.old" | "authorized_keys")
      chmod 600 "$file"
      echo "✓ 设置文件权限: $(basename "$file") -> 600"
      ;;
    # 公钥文件设置为 644 (-rw-r--r--)
    *.pub)
      chmod 644 "$file"
      echo "✓ 设置文件权限: $(basename "$file") -> 644"
      ;;
    # 私钥文件设置为 600 (-rw-------)
    id_*)
      if [[ "$file" != *.pub ]]; then
        chmod 600 "$file"
        echo "✓ 设置文件权限: $(basename "$file") -> 600"
      fi
      ;;
    # 其他文件设置为 600
    *)
      chmod 600 "$file"
      echo "✓ 设置文件权限: $(basename "$file") -> 600"
      ;;
    esac
  fi
done

# 设置目录所有权（确保属于当前用户）
chown -R "$USER:$USER" "$SSH_DIR"
echo "✓ 设置目录所有权: $USER:$USER"

echo ""
echo "✅ SSH 目录权限设置完成！"
echo "当前权限状态:"
ls -la "$SSH_DIR"
```

保存后，运行以下命令赋予其执行权限并运行：

```Bash
chmod +x setup_ssh_permissions.sh
./setup_ssh_permissions.sh
```

## 9 SSH 常用命令语法

> [!INFO] 基础语法结构
>
> SSH 的基本命令格式为：`ssh [参数] [用户名@主机地址] [远程命令]`。  
> 该命令用于建立加密连接、执行远程命令或创建网络隧道。

## 10 基础连接与执行

```bash
# 基础连接（默认使用 22 端口）
ssh user@hostname

# 指定端口连接
ssh -p 2222 user@hostname

# 连接并直接执行远程命令，执行完毕后自动断开
ssh user@hostname "ls -la /var/www"
```

> [!NOTE] 语法说明
>
> - `ssh user@hostname`
> 
>     - `user`：远程服务器用户名
> 
>     - `hostname`：服务器 IP 或域名
> 
> - `-p`：指定 SSH 服务端口
> 
> - `"command"`：连接后在远程主机执行的命令
> 
> 
> 如果指定远程命令，命令执行完成后 SSH 会自动退出。

## 11 文件传输 (SCP)

SCP 是基于 SSH 协议的加密文件传输工具。

```bash
# 从本地复制到远程
scp -P 22 local_file.txt user@hostname:/remote/path/

# 从远程复制到本地
scp -P 22 user@hostname:/remote/path/remote_file.txt ./local_path/
```

> [!NOTE] 语法说明
>
> `scp` 命令格式：
>
> ```bash
> scp [参数] 源文件 目标路径
> ```
>
> - `-P`：指定 SSH 端口（注意是 **大写 P**）
> 
> - `local_file.txt`：本地文件
> 
> - `user@hostname:/remote/path/`：远程路径
> 
> 
> SCP 使用 **SSH 加密传输**，无需额外开放端口。

## 12 端口转发（隧道）

端口转发分为三种模式：

- 本地转发 `-L`
    
- 远程转发 `-R`
    
- 动态转发 `-D`（SOCKS 代理）

### 12.1 本地转发 (`-L`)：映射远程端口到本地

**场景**：远程服务器内网有一个数据库（3306），你想在自己电脑上通过 `localhost:8080` 访问它。

```bash
# 将远程服务器的 3306 端口映射到本地的 8080 端口
ssh -L 8080:localhost:3306 user@hostname
```

> [!NOTE] 语法说明
>
> ```bash
> ssh -L [本地端口]:[目标地址]:[目标端口] user@hostname
> ```
>
> - `[本地端口]`：本机监听端口
> 
> - `[目标地址]`：远程服务器访问的目标地址
> 
> - `[目标端口]`：远程服务端口
> 
> 
> 数据流向：
>
> ```
> 本地 localhost:8080 → SSH 隧道 → 远程 localhost:3306
> ```

### 12.2 远程转发 (`-R`)：反代本地端口到远程

**场景**：将本地服务（如 Web 项目）发布到公网服务器。

```bash
# 将公网服务器的 8080 端口转发到你本地的 3000 端口
ssh -R 8080:localhost:3000 user@remote_host
```

> [!NOTE] 语法说明
>
> ```bash
> ssh -R [远程端口]:[目标地址]:[目标端口] user@remote_host
> ```
>
> - `[远程端口]`：远程服务器监听端口
> 
> - `[目标地址]`：SSH 客户端可访问地址（通常是 localhost）
> 
> - `[目标端口]`：本地服务端口
> 
> 
> 数据流向：
>
> ```
> 远程 server:8080 → SSH 隧道 → 本地 localhost:3000
> ```

### 12.3 动态转发 (`-D`)：创建 SOCKS 代理

**场景**：在本地创建一个 SOCKS5 代理，让浏览器或程序通过远程服务器访问网络。

```bash
# 在本地创建 SOCKS5 代理
ssh -D 1080 user@hostname
```

然后在浏览器或系统代理中设置：

```
SOCKS5
127.0.0.1
1080
```

> [!NOTE] 语法说明
>
> ```bash
> ssh -D [本地端口] user@hostname
> ```
>
> - `[本地端口]`：本机 SOCKS 代理监听端口
> 
> 
> 数据流向：
>
> ```
> 应用程序 → 本地 SOCKS5 (1080) → SSH 隧道 → 远程服务器 → 目标网站
> ```
>
> 与 `-L` / `-R` 不同，`-D` 不指定目标地址，而是动态代理任意连接。

## 13 进阶应用：共享本地代理给服务器

这是一个特殊形式的远程转发：将本地的 SOCKS 代理端口（如 `7897`）映射到远程服务器，使服务器可以利用本地网络环境。

### 13.1 建立反向代理隧道

在本地终端执行，将本地的 `7897` 代理端口挂载到远程服务器的 `7897` 上：

```bash
# 在本地执行
ssh -R 7897:localhost:7897 user@remote_host
```

> [!NOTE] 语法说明
>
> 该命令通过 **远程端口转发**实现：
>
> ```
> 远程 server:7897 → SSH 隧道 → 本地 localhost:7897
> ```
>
> 远程服务器访问 `127.0.0.1:7897` 时，实际会使用本地代理。

### 13.2 在服务器上使用该代理

连接成功后，在**远程服务器**的终端执行以下命令，即可让服务器流量走本地代理：

```bash
# 为当前会话设置环境变量
export ALL_PROXY=socks5://127.0.0.1:7897

# 测试代理是否畅通
curl -vv https://www.google.com
```

> [!TIP] 说明
>
> `ALL_PROXY` 是常见代理环境变量，许多 CLI 工具（如 `curl`、`git`、`wget`）会自动读取。

> [!TIP] 配合 Proxychains (可选)
>
> 如果某些服务器程序不遵循 `ALL_PROXY` 环境变量，你可以在服务器安装 `proxychains4`，并在配置文件末尾添加：
>
> ```
> socks5 127.0.0.1 7897
> ```
>
> 之后使用：
>
> ```bash
> proxychains4 <command>
> ```
>
> 强制程序走代理。

## 14 常用参数说明

| 参数             | 说明                 |
| -------------- | ------------------ |
| `-p`           | 指定远程 SSH 服务端口      |
| `-i`           | 指定身份验证文件（私钥路径）     |
| `-v`           | 详细模式，输出调试信息        |
| `-vv` / `-vvv` | 更详细的调试信息           |
| `-C`           | 启用压缩数据传输           |
| `-N`           | 不执行远程命令，仅建立隧道      |
| `-f`           | SSH 连接建立后进入后台      |
| `-L`           | 本地端口转发（本地到远程）      |
| `-R`           | 远程端口转发（远程到本地）      |
| `-D`           | 动态端口转发（SOCKS 代理）   |
| `-o`           | 指定 SSH 配置选项        |
| `-T`           | 禁用伪终端（适合脚本）        |
| `-A`           | 启用 SSH Agent 转发    |
| `-J`           | 通过跳板机（Jump Host）连接 |
