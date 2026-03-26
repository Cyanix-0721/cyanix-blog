---
tags: []
title: Chezmoi 跨平台 Dotfiles 管理指南
aliases: Chezmoi 跨平台 Dotfiles 管理指南
date created: 2025-09-28 17:07:42
date modified: 2026-03-25 09:10:32
---

# Chezmoi 跨平台 Dotfiles 管理指南

> 更多细节请查阅 [Chezmoi 官方文档](https://www.chezmoi.io/) 和 [GitHub 仓库](https://github.com/twpayne/chezmoi)。

## 1 安装与配置

### 1.1 在 Arch Linux 上安装

```bash
sudo pacman -S chezmoi
```

## 2 核心概念与默认位置

理解以下几个关键概念和路径，对熟练使用 Chezmoi 至关重要：

- **源目录 (Source Directory)**:  
  这是 Chezmoi 用于存储和管理您的配置文件模板与脚本的地方。通过配置文件中的 `sourceDir` 设置，您可以指定其位置。默认情况下，chezmoi 会使用 `$HOME/.local/share/chezmoi` 。
- **目标目录 (Destination Directory)**:  
  这是 Chezmoi 将配置文件应用到的位置，通常是您的家目录 (`~`)。
- **工作原理简述**:  
  Chezmoi 会比较**源目录**和**目标目录**中文件的状态。当您执行 `chezmoi apply` 时，它会根据源目录中的内容，在目标目录中创建、更新或删除相应的文件和目录，使其与源目录的定义保持一致。

## 3 配置文件

### 3.1 配置文件位置与创建

Chezmoi 的配置文件通常位于 `~/.config/chezmoi/chezmoi.toml`。如果该文件不存在，您可以手动创建它。

### 3.2 基础配置示例

以下是一个基础的配置文件示例，它使用环境变量来定义关键路径，使得配置可以在不同的机器或用户环境下更灵活地工作：

```toml
# Chezmoi 配置文件

# 编辑命令的配置
[edit]
    # 设置默认编辑器为 nvim
    command = "nvim"
    # 设置编辑器参数，'--wait' 确保在文件关闭后才继续执行命令 
    args = ["--wait"]

# 差异对比命令的配置
[diff]
    command = "diff"
    args = ["-u"]

# 更新配置
[update]
    # 设置为 false 后，`chezmoi update` 只会拉取变更，不会自动应用
    # 您需要手动执行 `chezmoi apply` 来应用变更
    apply = false
```

> **关键说明**：
> - **编辑器设置**：`args = ["--wait"]` 确保了 `chezmoi edit` 命令会在您关闭编辑器后才继续执行后续操作。
> - **安全更新**：`[update] apply = false` 允许您先检查变更内容，再手动应用，更加安全。

## 4 初始化

| 初始化类型          | 命令示例                  | 说明与注意事项                                            |
| :------------- | :-------------------- | :------------------------------------------------- |
| **本地目录**       | `chezmoi init`        | **依赖配置文件**：确保已正确设置配置文件的 `sourceDir` 参数，指向您的本地仓库路径。 |
| **HTTPS 远程仓库** | `chezmoi init <REPO>` | 默认会克隆到 `~/.local/share/chezmoi`。                   |

## 5 基本使用与工作流

### 5.1 管理 Dotfile 的基本步骤

假设您要管理 `~/.bashrc`：

1. **添加文件到 Chezmoi 管理**：

    ```bash
    chezmoi add ~/.bashrc
    ```

    这个命令会把 `~/.bashrc` 复制到源目录，并重命名为 `dot_bashrc`（用 `dot_` 替换开头的点）。

2. **编辑已管理的文件**：

    ```bash
    chezmoi edit ~/.bashrc
    ```

    此命令会根据您的配置，使用 Neovim 打开源目录中的对应文件进行编辑。**请务必通过此命令编辑，而不是直接修改目标目录 `~` 下的文件**。

3. **检查更改**：

    ```bash
    chezmoi diff ~/.bashrc
    ```

4. **应用更改**：

    ```bash
    chezmoi apply ~/.bashrc
    ```

    此命令会将源目录中的内容同步到目标目录。使用 `chezmoi apply` 可应用所有变更。

5. **同步到 Git 仓库**：

    ```bash
    # 进入 Chezmoi 的源目录
    chezmoi cd
    # 添加所有变更
    git add .
    # 提交变更
    git commit -m "描述您的更改"
    # 推送到远程仓库
    git push origin main
    # 退出源目录 (如果使用 chezmoi cd 进入了子shell)
    exit
    ```

### 5.2 常用命令速览

| 命令 | 作用 | 示例 |
| :--- | :--- | :--- |
| `chezmoi add <file>` | 将文件纳入管理 | `chezmoi add ~/.vimrc` |
| `chezmoi edit <file>` | 编辑源目录中的文件 | `chezmoi edit ~/.vimrc` |
| `chezmoi diff` | 查看所有待应用的变更 | `chezmoi diff` |
| `chezmoi apply` | 应用所有变更 | `chezmoi apply` |
| `chezmoi cd` | 进入源目录 | `chezmoi cd` |
| `chezmoi update` | 从远程仓库拉取并（可选）应用变更 | `chezmoi update` |
