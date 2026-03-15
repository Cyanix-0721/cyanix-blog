---
tags: [Git, Github]
title: Git
date created: 2024-08-15 04:19:28
date modified: 2026-03-14 09:51:55
date: 2026-03-15 02:52:39
---

# Git

> [!info]  
> [Git](https://git-scm.com/)  
> [gitignore](https://git-scm.com/docs/gitignore)

## 1 安装

### 1.1 Linux（Arch）

```bash
sudo pacman -S git
```

### 1.2 Windows（Scoop）

```bash
scoop install git
```

## 2 基础命令

Git 是一款功能强大的分布式版本控制系统，旨在追踪代码库的变更，为开发者提供高效的项目管理工具。它通过记录每一次的改动，使得开发者能够轻松地回溯到以前的版本，并支持多人协作开发，极大地提高了开发效率。

### 2.1 Config 配置

```bash
git config [--global] user.name "Your Name"           # 设置用户名
git config [--global] user.email "your@example.com"   # 设置邮箱
git config [--global] http.proxy  http://127.0.0.1:7897
git config [--global] https.proxy http://127.0.0.1:7897
```

### 2.2 Init 初始化仓库

```bash
git init [--bare] [--initial-branch=<branch-name>]
```

- `--bare`：创建裸仓库，不含工作区，通常用于远程中央仓库。
- `--initial-branch=<branch-name>`：设置初始分支名称，默认为 `main`。

### 2.3 Clone 克隆远程仓库

```bash
git clone <repository_url> [<directory>] [--branch=<branch-name>] [--depth=<depth>]
```

- `<directory>`：本地目录名，默认为远程仓库名。
- `--branch=<branch-name>`：指定克隆分支，默认为 `main`。
- `--depth=<depth>`：浅克隆，只取最近若干次提交，加快速度。

### 2.4 Add 添加

```bash
git add [<file_name> | .] [-p | -u | -A]
```

- `-p`：交互式添加，逐块选择要暂存的内容。
- `-u`：只添加已跟踪文件的修改和删除，不添加新文件。
- `-A`：添加所有修改、删除和新文件。

### 2.5 Commit 提交

```bash
git commit [-m "commit message"] [-a] [--amend]
```

- `-a`：跳过 `git add`，直接提交所有已跟踪文件的修改。
- `--amend`：修改最近一次提交的内容或提交信息。

### 2.6 Status 查看仓库状态

```bash
git status [-s | -u]
```

- `-s`：短格式输出，更简洁。
- `-u`：显示未跟踪的文件。

### 2.7 Diff 查看差异

```bash
git diff [<commit_id> | <branch_name>] [--staged] [<file_name>]
```

- `--staged`：查看暂存区与 HEAD 的差异。
- `<file_name>`：指定要查看差异的文件。

### 2.8 Stash 贮藏更改

`git stash` 用于暂时保存工作目录和索引中未提交的更改，便于在不提交的情况下切换分支或拉取代码。

#### 2.8.1 常用命令

| 命令 | 说明 |
| --- | --- |
| `git stash push [-u] [-a] [-m <msg>] [<path>]` | 贮藏当前更改 |
| `git stash list` | 列出所有贮藏 |
| `git stash show [<stash>]` | 查看指定贮藏的内容 |
| `git stash apply [<stash>]` | 应用贮藏，不从列表中移除 |
| `git stash pop [<stash>]` | 应用贮藏并从列表中移除 |
| `git stash drop [<stash>]` | 删除指定贮藏 |
| `git stash clear` | 清空所有贮藏 |
| `git stash branch <branch> [<stash>]` | 基于贮藏创建新分支 |

#### 2.8.2 常用选项

- `-u` / `--include-untracked`：包含未跟踪的文件。
- `-a` / `--all`：包含所有被忽略的文件。
- `-m` / `--message <msg>`：添加自定义贮藏描述。

#### 2.8.3 示例

```bash
git stash push -u -m "my stash"   # 贮藏当前更改（含未跟踪文件）
git stash list                     # 查看贮藏列表
git stash apply                    # 应用最近的贮藏
git stash pop stash@{1}            # 应用并移除指定贮藏
```

### 2.9 Pull 拉取更新

```bash
git pull [<repository> [<refspec>]] [--rebase]
```

- `<repository>`：远程仓库名，默认为 `origin`。
- `--rebase`：拉取后将本地提交变基到远程分支，保持线性历史。

### 2.10 Push 推送更改

```bash
git push [-u <repository> <branch>] [--force-with-lease | --force]
```

- `--force-with-lease`：安全强制推送，若远端被他人更新则拒绝，避免覆盖他人提交。
- `--force` / `-f`：强制推送，直接覆盖，个人仓库可用，协作仓库慎用。

### 2.11 Branch 分支管理

```bash
git branch                    # 列出所有本地分支
git branch <branch_name>      # 创建分支
git branch -d <branch_name>   # 删除分支
```

### 2.12 Checkout 切换分支

```bash
git checkout <branch_name>
```

- `--orphan`：创建一个无历史记录的孤儿分支。

### 2.13 Merge 合并分支

```bash
git merge <branch_name> [--no-ff]
```

- `--no-ff`：禁用 Fast-forward 合并，保留分支独立的提交节点。

### 2.14 Cherry-pick 选择性应用提交

```bash
git cherry-pick <commit_hash> [-e] [-x] [-n]
```

- `-e` / `--edit`：应用后打开编辑器修改提交信息。
- `-x`：在提交信息末尾追加来源说明，方便追踪。
- `-n` / `--no-commit`：只将修改应用到暂存区，不自动提交。

### 2.15 Rebase 变基

```bash
git rebase <base_branch> [-i] [--onto <newbase>] [--abort] [--continue] [--skip]
```

- `-i` / `--interactive`：交互式变基，可选择保留、合并、修改或删除提交。
- `--onto <newbase>`：将提交变基到指定的新基底。
- `--abort`：中止 rebase，恢复到操作前的状态。
- `--continue`：解决冲突后继续 rebase。
- `--skip`：跳过当前提交，继续处理下一个。

### 2.16 Log 查看提交历史

```bash
git log [--oneline] [--graph] [--all]
```

- `--oneline`：每条提交压缩为一行显示。
- `--graph`：以 ASCII 图形展示分支结构。

### 2.17 Reset 版本回退

> [!tip] `HEAD`  
> HEAD 是指向当前分支最新提交的指针。

```bash
git reset HEAD~1              # 回退一个提交，保留工作区更改
git reset <commit_id>         # 回退到指定提交，保留工作区更改
git reset --hard <commit_id>  # 回退到指定提交，丢弃所有更改
```

### 2.18 Tag 标签

```bash
git tag <tag_name>     # 创建标签
git tag                # 列出所有标签
git tag -d <tag_name>  # 删除标签
```

### 2.19 Remote 远程仓库

```bash
git remote add <name> <url>    # 添加远程仓库
git remote -v                  # 查看所有远程仓库
git remote remove <name>       # 删除远程仓库
```

### 2.20 Proxy 代理

```bash
git config [--global] [--unset] http.proxy  http://<ip>:<port>
git config [--global] [--unset] https.proxy http://<ip>:<port>
```

### 2.21 Worktree 多工作区

`git worktree` 允许在同一仓库中创建多个工作目录，从而同时处理多个分支。

```bash
git worktree add <path> <branch>      # 添加新工作区并检出指定分支
git worktree list                      # 列出所有工作区
git worktree remove <path>             # 移除工作区
git worktree remove --force <path>     # 强制移除（工作区有未提交更改时）
```

### 2.22 文件权限

#### 2.22.1 修改文件权限

```bash
git update-index --chmod=+x <file>   # 添加可执行权限
git update-index --chmod=-x <file>   # 移除可执行权限
```

> [!note]  
> 该命令只修改 Git 索引中的权限元数据，不会改变文件系统中实际的文件权限。

#### 2.22.2 查看文件权限

```bash
git ls-files --stage <file>
```

输出示例：

```
100644 e69de29bb2d1d6434b8b29ae775ad8c2e48c5391 0  example.sh
```

文件模式说明：

| 模式 | 含义 |
| --- | --- |
| `100644` | 普通文件，所有者读写，其他人只读 |
| `100755` | 可执行文件，所有者读写执行，其他人读执行 |

模式前缀 `100` 为常规文件的固定标识，后三位 `644` / `755` 表示 Unix 权限位。

## 3 协作开发

### 3.1 Rebase & Merge

> [!tip]  
> 开发分支在 `push` 前，先 `git pull --rebase <父级分支>` 进行同步与调试，再由父级分支 `merge` 开发分支。

#### 3.1.1 使用 `--no-ff` 禁用 Fast-forward

默认 Fast-forward 合并会丢失分支信息，使用 `--no-ff` 强制创建合并节点，保留每个开发者分支的提交历史和作者信息。

```bash
git checkout dev
git merge --no-ff <developer_branch>
```

#### 3.1.2 避免使用 `--squash`

`--squash` 会将多个提交压缩为一个，导致原始作者信息丢失。

#### 3.1.3 使用 Cherry-pick 或交互式 Rebase 保留作者

```bash
# cherry-pick
git checkout dev
git cherry-pick <commit_hash>

# 交互式 rebase
git checkout dev
git rebase -i origin/main
```

#### 3.1.4 临时保存与撤销

```bash
git commit -am "temp"           # 快速暂存所有已跟踪文件的修改
git reset --soft HEAD^          # 撤销上一次提交，保留工作区更改
git commit --amend -m "新信息"  # 修改最后一次提交信息
```

#### 3.1.5 最佳实践

- 每位开发者在独立分支上开发，完成后提交 PR 到 `dev`。
- PR 中进行代码审查，确保提交信息准确。
- 合并 PR 时统一使用 `--no-ff`。
- 定期将 `dev` 合并到 `main`，保持主分支更新。

> [!warning]  
> 修改提交历史可能引发协作冲突，团队环境中操作前须与成员协商。

### 3.2 Feature Branch Workflow

1. 从开发分支创建功能分支

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature
   ```

2. 在功能分支上正常开发、提交。

3. 定期同步开发分支，减少最终合并时的冲突

   ```bash
   git checkout feature/new-feature
   git merge develop
   ```

4. 功能完成后，推送分支并创建 Pull Request 到开发分支。

5. 团队成员在 PR 中进行代码审查和讨论。

6. PR 批准后合并到开发分支

   ```bash
   git checkout develop
   git merge --no-ff feature/new-feature
   git push origin develop
   ```

7. 删除功能分支

   ```bash
   git branch -d feature/new-feature
   ```

## 4 删除提交记录

| 场景 | 方法 |
| --- | --- |
| 删除某几条特定的 commit | `git rebase -i`（交互式变基） |
| 清除全部历史，只保留当前文件状态 | `git checkout --orphan` |

### 4.1 删除特定 Commit

`git rebase -i`（交互式变基）通过**重写历史**的方式，将指定 commit 标记为 `drop` 后彻底丢弃，不留任何痕迹。

#### 4.1.1 操作步骤

以目标 commit 的**前一个** commit 为基点启动交互式变基：

```bash
git log --oneline  # 找到目标 commit 及其前一个 commit 的 hash

git rebase -i <目标commit的前一个hash>
```

示例 log（从新到旧）：

```
c3f1a2b chore: 第四次提交   ← 最新
b7e9d1f docs: 第三次提交
a4c8e0d feat: 第二次提交    ← 想删除这条
9d2b7c1 feat: 第一次提交    ← 目标的前一个，作为基点
```

在编辑器中将目标行的 `pick` 改为 `drop`，保存退出，rebase 自动完成：

```
drop a4c8e0d feat: 第二次提交    ← 丢弃
pick b7e9d1f docs: 第三次提交
pick c3f1a2b chore: 第四次提交
```

#### 4.1.2 自动化（跳过编辑器交互）

适合脚本或已知精确 hash 的场景，用 `GIT_SEQUENCE_EDITOR` 注入 `sed` 替代手动编辑：

```bash
GIT_SEQUENCE_EDITOR="sed -i 's/^pick <hash>/drop <hash>/'" \
  git rebase -i <目标的前一个hash>
```

#### 4.1.3 有未暂存改动时

rebase 前工作区必须干净，先用 stash 临时保存：

```bash
git stash
git rebase -i <hash>
git stash pop
```

#### 4.1.4 常用 Rebase 指令

| 指令 | 含义 |
| --- | --- |
| `pick` | 保留该 commit（默认） |
| `drop` | 删除该 commit |
| `squash` | 将该 commit 合并进上一条 |
| `reword` | 保留 commit 但修改提交信息 |
| `edit` | 暂停 rebase，允许修改该 commit 的内容 |

### 4.2 清除所有提交历史

创建一个**孤儿分支**（orphan branch）——无任何历史记录的全新分支，将当前文件状态作为首个 commit 提交，再替换原分支，实现历史清零。

```bash
git checkout --orphan latest_branch  # 创建孤儿分支
git add -A                           # 暂存所有文件
git commit -m "Initial commit"       # 提交为新的初始 commit
git branch -D main                   # 删除原分支（替换为当前分支名）
git branch -m main                   # 重命名孤儿分支为主分支
git push -f origin main              # 强制推送到远端
```

### 4.3 注意事项

> [!warning] 多人协作慎用  
> 两种方式都会重写历史，所有后续 commit 的 hash 都会改变。在多人协作的分支上操作前，必须与团队协商，否则会导致其他人的本地历史冲突。

> [!tip] 删除多条 commit  
> 使用 `rebase -i` 时，在编辑器中把多行都改为 `drop` 即可，支持一次删除多条不连续的 commit。

> [!caution] 操作不可逆  
> 历史一旦清除无法恢复，操作前请确认已备份重要数据，或通过 `git reflog` 在本地过期前找回。

## 5 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/)

## 6 Gitignore

`.gitignore` 用于指定 Git 不跟踪的文件，保持仓库整洁。

### 6.1 基础语法

- 从上到下逐行匹配
- `#` 开头为注释
- `!` 前缀表示排除（不忽略）
- `?` 匹配单个任意字符（不匹配 `/`、空格、`.`）
- `*` 匹配单级路径中的任意字符
- `**` 匹配多级目录

### 6.2 示例

```gitignore
### IntelliJ IDEA ###
**/.idea/
**/out/
!**/src/main/**/out/
!**/src/test/**/out/
**/target/
**/*.iml
**/*.ipr
**/*.iws
**/*.bak

### Eclipse ###
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
.sts4-cache
bin/
!**/src/main/**/bin/
!**/src/test/**/bin/

### VS Code ###
.vscode/

### Mac OS ###
.DS_Store
```

## 7 统一换行符

### 7.1 为什么要统一

- Windows 默认 `CRLF`（`\r\n`），Linux / macOS 默认 `LF`（`\n`）。
- 换行符不一致时，Git 可能将其识别为文件变更，导致提交历史混乱。

### 7.2 全局设置

```bash
# 提交时转换为 LF，检出时不转换（Linux / macOS）
git config --global core.autocrlf input

# 提交时转换为 LF，检出时转换为 CRLF（Windows）
git config --global core.autocrlf true
```

### 7.3 单项目设置（.gitattributes）

```gitattributes
# 所有文本文件统一使用 LF
* text=auto eol=lf

*.sh  text eol=lf
*.bat text eol=crlf

# 二进制文件不转换，防止损坏
*.png binary
*.jpg binary
```

### 7.4 清理已有仓库的换行符混乱

```bash
git rm --cached -r .
git reset --hard
```

## 8 密钥鉴权

### 8.1 HTTPS

#### 8.1.1 启用凭证助手

> [!tip] `git-credential-manager`  
> Git 2.29 及以上内置，安全性高，`GCM core` 的 `core` 后缀已移除。

```bash
git config --global credential.helper manager
```

#### 8.1.2 Personal Access Token (PAT)

1. 登录 Git 托管平台，在设置中创建 PAT 并授予所需权限（如 `repo`、`user`）。
2. HTTPS 操作时，用户名填 Git 用户名，密码处粘贴 PAT。

### 8.2 SSH

![[SSH 密钥管理与配置指南]]
