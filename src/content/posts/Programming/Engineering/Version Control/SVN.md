---
tags: [SVN, Subversion]
title: SVN
date created: 2026-03-13 12:32:59
date modified: 2026-03-27 07:11:07
---

# SVN

> [!info]  
> [Apache Subversion](https://subversion.apache.org/)  
> [SVN Book](https://svnbook.red-bean.com/)

## 1 安装

### 1.1 Linux（Arch）

```bash
sudo pacman -S subversion
```

### 1.2 Windows（Scoop）

命令行客户端（SlikSVN）与 GUI 客户端（TortoiseSVN）可按需选择，也可同时安装。

```bash
# 命令行客户端
scoop install sliksvn

# GUI 客户端（需先添加 extras bucket）
scoop bucket add extras
scoop install tortoisesvn
```

> [!tip] TortoiseSVN 命令行工具  
> 安装 TortoiseSVN 时默认不安装命令行工具。若需在终端使用 `svn` 命令，安装时勾选 **command line client tools**，或重新运行安装程序修改安装项。

## 2 核心概念

SVN（Subversion）是一款集中式版本控制系统，所有版本历史存储在唯一的**中央仓库**（Repository）中。开发者通过**检出**（Checkout）获取工作副本，再通过**提交**（Commit）将变更推送回中央仓库。

| 概念 | 说明 |
| --- | --- |
| Repository | 中央仓库，存储全部版本历史 |
| Working Copy | 工作副本，本地可编辑的文件目录 |
| Revision | 修订号，全局单调递增整数，每次提交 +1 |
| trunk | 主干目录，相当于 Git 的 `main` |
| branches | 分支目录 |
| tags | 标签目录，通常作为只读快照 |

## 3 基础命令

### 3.1 Checkout 检出

从仓库获取工作副本到本地：

```bash
svn checkout <repository_url> [<local_path>]
svn co <repository_url> [<local_path>]     # 简写
```

- `<local_path>`：本地目录名，默认为 URL 最后一段路径名。

示例：

```bash
svn co https://svn.example.com/repos/myproject/trunk myproject
```

### 3.2 Update 更新

将仓库最新变更同步到本地工作副本：

```bash
svn update [<path>] [-r <revision>]
svn up                                     # 简写，更新到 HEAD
```

- `-r <revision>`：更新到指定修订号，如 `-r 42`；默认为最新（`HEAD`）。

### 3.3 Add 添加

将新文件或目录纳入版本控制（下次提交时生效）：

```bash
svn add <path> [--non-recursive]
```

- `--non-recursive`：仅添加目录本身，不递归添加子项。

### 3.4 Commit 提交

将本地变更提交到中央仓库：

```bash
svn commit [<path>] -m "commit message"
svn ci -m "commit message"                 # 简写
```

- 不加 `-m` 时会打开默认编辑器填写日志。
- 提交成功后修订号全局 +1。

### 3.5 Status 查看状态

查看工作副本中文件的修改状态：

```bash
svn status [<path>] [-u] [-v]
svn st                                     # 简写
```

状态符号说明：

| 符号 | 含义 |
| --- | --- |
| `A` | 已标记添加（Add） |
| `M` | 已修改（Modified） |
| `D` | 已标记删除（Deleted） |
| `?` | 未纳入版本控制 |
| `!` | 文件丢失（已跟踪但本地缺失） |
| `C` | 冲突（Conflict） |

- `-u`：同时显示仓库中待更新的变更。
- `-v`：显示详细信息，包含修订号与最后修改作者。

### 3.6 Diff 查看差异

```bash
svn diff [<path>] [-r <rev1>[:<rev2>]]
```

- 不加参数：对比工作副本与 BASE 版本的差异。
- `-r 10:20`：对比修订号 10 与 20 之间的差异。
- `-r 10`：对比修订号 10 与工作副本的差异。

### 3.7 Log 查看提交历史

```bash
svn log [<path_or_url>] [-r <revision>] [-l <limit>] [-v]
```

- `-l <limit>`：只显示最近 N 条记录。
- `-v`：同时列出每次提交涉及的文件路径。

示例：

```bash
svn log -l 10 -v https://svn.example.com/repos/myproject/trunk
```

### 3.8 Revert 撤销本地修改

将文件还原为仓库 BASE 版本，**仅影响未提交的本地修改**：

```bash
svn revert <path> [-R]
```

- `-R` / `--recursive`：递归还原目录下所有文件。

> [!warning]  
> `svn revert` 会丢弃所有未提交的本地改动，且操作不可撤销，使用前请确认。

### 3.9 Delete 删除

```bash
svn delete <path_or_url> [-m "log message"]
svn del <path_or_url>                      # 简写
```

- 对本地路径操作后，需再执行 `svn commit` 才能同步到仓库。
- 直接对仓库 URL 操作时，需加 `-m` 提供日志，立即生效。

### 3.10 Move / Rename 移动与重命名

```bash
svn move <src> <dst>
svn mv <src> <dst>                         # 简写
```

同样需要 `svn commit` 才能同步到仓库。

### 3.11 Copy 复制

```bash
svn copy <src> <dst> [-m "log message"]
svn cp <src> <dst>                         # 简写
```

> [!tip]  
> `svn copy` 是创建分支与标签的核心操作。

### 3.12 Info 查看元信息

显示工作副本或仓库 URL 的详细元信息：

```bash
svn info [<path_or_url>]
```

输出包含仓库根 URL、当前修订号、最后修改作者与时间等。

### 3.13 Cleanup 清理

修复工作副本中因操作中断（如网络断开）产生的残留锁：

```bash
svn cleanup [<path>]
```

## 4 分支与标签

SVN 通过目录结构约定管理分支和标签，本质上都是廉价的目录复制（`svn copy`）。

```
myproject/
├── trunk/       # 主干
├── branches/    # 分支
│   └── feature-login/
└── tags/        # 标签（只读快照）
    └── v1.0.0/
```

### 4.1 创建分支

```bash
svn copy \
  https://svn.example.com/repos/myproject/trunk \
  https://svn.example.com/repos/myproject/branches/feature-login \
  -m "创建 feature-login 分支"
```

### 4.2 切换到分支

```bash
svn switch https://svn.example.com/repos/myproject/branches/feature-login
```

### 4.3 创建标签

```bash
svn copy \
  https://svn.example.com/repos/myproject/trunk \
  https://svn.example.com/repos/myproject/tags/v1.0.0 \
  -m "发布 v1.0.0"
```

> [!note]  
> SVN 标签在技术上与分支相同，均为目录副本。「只读」属于约定而非强制，建议不要在 tags 目录下提交修改。

### 4.4 合并分支到主干

在 trunk 工作副本下执行：

```bash
# 查找分支从哪个修订号分叉
svn log --stop-on-copy https://svn.example.com/repos/myproject/branches/feature-login

# 将分支的全部变更合并到当前工作副本
svn merge https://svn.example.com/repos/myproject/branches/feature-login

# 确认合并结果后提交
svn ci -m "合并 feature-login 分支到 trunk"
```

### 4.5 删除分支

```bash
svn delete \
  https://svn.example.com/repos/myproject/branches/feature-login \
  -m "删除已合并的 feature-login 分支"
```

## 5 冲突处理

当多人同时修改同一文件的同一区域时，更新或合并后会产生冲突。

### 5.1 查看冲突

```bash
svn status        # 状态为 C 的文件存在冲突
svn update        # 更新时也会提示冲突文件
```

冲突时 SVN 会生成三个临时文件：

| 文件 | 说明 |
| --- | --- |
| `file.mine` | 本地修改版本 |
| `file.rOLD` | 冲突前的 BASE 版本 |
| `file.rNEW` | 仓库最新版本 |

### 5.2 解决冲突

手动编辑冲突文件，处理完成后标记为已解决：

```bash
svn resolve --accept working <file>   # 使用当前工作副本版本
svn resolve --accept theirs-full <file>  # 直接采用仓库版本
svn resolve --accept mine-full <file>    # 直接保留本地版本
```

标记解决后提交：

```bash
svn ci -m "解决冲突"
```

## 6 属性（Properties）

SVN 属性是附加在文件或目录上的键值元数据，不影响文件内容本身。

### 6.1 常用属性

| 属性 | 说明 |
| --- | --- |
| `svn:ignore` | 忽略指定文件，类似 `.gitignore` |
| `svn:externals` | 引用外部仓库路径 |
| `svn:eol-style` | 控制换行符风格（`native` / `LF` / `CRLF`） |
| `svn:executable` | 标记文件为可执行 |
| `svn:mime-type` | 设置 MIME 类型，二进制文件应设置以防误转换 |

### 6.2 常用命令

```bash
svn propset svn:ignore "*.log" .               # 设置忽略规则
svn propset svn:eol-style native <file>        # 设置换行符为系统原生
svn propedit svn:ignore .                      # 用编辑器编辑忽略列表
svn propget svn:ignore .                       # 查看属性值
svn proplist <path>                            # 列出所有属性
svn propdel svn:ignore .                       # 删除属性
```

> [!tip]  
> 属性变更也需要 `svn commit` 才能同步到仓库。

## 7 仓库管理

> [!note]  
> 以下命令需在**服务器**上执行，或对本地 `file://` 路径的仓库操作。

### 7.1 创建仓库

```bash
svnadmin create /path/to/repos/myproject
```

### 7.2 访问本地仓库

```bash
svn co file:///path/to/repos/myproject/trunk myproject
```

### 7.3 导出备份

```bash
svnadmin dump /path/to/repos/myproject > myproject.dump
```

### 7.4 从备份恢复

```bash
svnadmin create /path/to/repos/myproject_restored
svnadmin load /path/to/repos/myproject_restored < myproject.dump
```

## 8 密钥鉴权

### 8.1 HTTP / HTTPS（Apache + mod_dav_svn）

通过 Apache 托管仓库时，在 `svnserve.conf` 或 Apache 配置中设置账号密码，客户端首次访问时输入凭证，SVN 默认将其缓存在 `~/.subversion/auth/`。

清除缓存凭证：

```bash
rm -rf ~/.subversion/auth/svn.simple/   # Linux
# Windows：删除 %APPDATA%\Subversion\auth\svn.simple\
```

### 8.2 SSH（svn+ssh）

通过 SSH 隧道访问 `svnserve`，无需额外服务器配置：

```bash
svn co svn+ssh://user@svn.example.com/repos/myproject/trunk myproject
```

使用 SSH 密钥免密登录：配置 `~/.ssh/config`，将对应主机的 `IdentityFile` 指向私钥即可。

![[SSH 密钥管理与配置指南]]
