---
tags:
  - Github
  - Action
  - Workflow
  - Sync
  - CI/CD
---

# Action&Workflow

## 1 简介

在 GitHub Actions 中，`workflow` 和 `action` 是两个不同的概念，但它们是协同工作的：

- **Workflow**:
  - 是一个由多个步骤组成的自动化过程。工作流定义了要在特定事件发生时执行的任务的集合，例如代码推送、PR 创建或定期调度。工作流使用 YAML 文件配置，通常位于 `.github/workflows` 目录下。
  - 一个工作流可以包括多个作业（jobs），每个作业可以有多个步骤（steps），这些步骤可以是直接运行的命令或调用其他动作。

- **Action**:
  - 是可以在工作流中使用的可重用单元。动作封装了特定功能或操作的代码，如检查出代码、设置环境、部署应用等。动作可以是 GitHub 官方提供的，也可以是由社区或开发者自定义和发布的。
  - 在工作流的步骤中，使用 `uses` 关键字来调用动作。

**示例**:

- **Workflow** 文件配置（`.github/workflows/ci.yml`）:

  ```yaml
  name: CI

  on: [push]

  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout code
          uses: actions/checkout@v4  # 使用 GitHub 提供的动作
        - name: Run tests
          run: npm test  # 运行自定义命令
  ```

- **Action** 的定义（可以是公开的或自定义的动作）:

  ```yaml
  name: 'Checkout'
  description: 'Checks out a repository so your workflow can access it'
  inputs:
    ref:
      description: 'The branch, tag, or SHA to checkout'
      required: false
      default: 'main'
  runs:
    using: 'docker'
    image: 'Dockerfile'
  ```

总结来说，`workflow` 是容器，用于组织和执行一系列任务；`action` 是构建这些任务的基础模块。

## 2 仓库同步

> [!note] [[Cron|Cron使用说明]]

- 以下 workflow 实现对 B 仓库中目标文件夹更新到 A 仓库目标文件夹
	- `cron`
		- `cron` 是一个用于定期执行任务的时间表工具。例如，`'0 0 * * *'` 表示每天午夜 0 点执行一次工作流
	- `rsync -av --delete`
		- `rsync`: 一个用于同步文件和目录的工具
		- `-a`: 归档模式，保留文件权限、时间戳等信息
		- `-v`: 显示详细的同步过程信息
		- `--delete`: 删除目标目录中在源目录中不存在的文件
	- `secrets.GITHUB_TOKEN`
		- `secrets.GITHUB_TOKEN` 是 GitHub Actions 自动生成的秘密变量，用于在工作流中进行身份验证。
			- **自动生成**: 当工作流运行时，GitHub 会自动生成这个 token，无需手动在仓库设置中创建或填入。
			- **临时性**: 这个 token 只在当前工作流运行期间有效，工作流完成后会自动失效。
			- **权限配置**: 可以通过 `permissions` 配置来指定 token 的权限，控制其对仓库的访问级别，例如读取和写入权限。

> [!note] `permissions`
>
> - **`permissions`** 是 GitHub Actions 工作流的一个配置选项，用于定义 `GITHUB_TOKEN` 权限范围。通过设置 `permissions`，可以控制工作流对 GitHub 仓库和资源的访问权限。以下是 `permissions` 配置的一些要点：
>   - **访问控制**: 通过指定 `permissions`，可以精确控制 `GITHUB_TOKEN` 允许的操作，如读取、写入、创建和删除等。
>   - **默认权限**: 如果未显式设置 `permissions`，默认情况下，`GITHUB_TOKEN` 拥有基本的权限，如推送代码和创建合并请求。
>   - **配置示例**:
> 
> 	```yaml
>     permissions:
>       contents: write  # 允许写入仓库内容
>       issues: read     # 允许读取问题
>       pull-requests: write  # 允许写入合并请求
>     ```

```yaml
# 工作流名称：Sync B to A
# 该工作流自动从 B 仓库同步文件到 A 仓库
name: Sync B to A

# 工作流触发条件
on:
  # 定时触发：每天午夜运行一次
  schedule:
    - cron: '0 0 * * *'
  # 手动触发：在 GitHub Actions 页面手动触发
  workflow_dispatch:

# 为 GITHUB_TOKEN 设置权限
permissions:
  contents: write  # 允许工作流对仓库内容进行写操作

# 定义作业（jobs）
jobs:
  sync:
    # 指定运行环境：使用最新的 Ubuntu LTS 版本
    runs-on: ubuntu-latest

    # 步骤定义
    steps:
      # 第一步：检出（Checkout）A 仓库的代码
      - name: Checkout A repository
        uses: actions/checkout@v4  # 使用官方的 checkout 动作
        with:
          ref: main  # 检出 A 仓库的 main 分支

      # 第二步：检出 B 仓库的代码
      - name: Checkout B repository
        uses: actions/checkout@v4  # 依然使用 checkout 动作
        with:
          repository: owner/repository-name  # 指定 B 仓库的所有者和仓库名，替换为实际值
          path: B_repo  # 将 B 仓库检出到本地的 B_repo 目录
          ref: main  # 检出 B 仓库的 main 分支
          token: ${{ secrets.PAT_TOKEN }}  # 使用 GitHub Secrets 中的个人访问令牌 (PAT) 进行身份验证

      # 第三步：同步 B 仓库中的文件到 A 仓库
      - name: Sync files from B to A
        run: |
          # 使用 rsync 命令同步 B_repo 目录下的文件到当前工作目录中的对应目录
          rsync -avu --delete B_repo/folder1/ ./folder1/  # 同步文件夹1，删除 A 仓库中不存在于 B 仓库的文件
          rsync -avu --delete B_repo/folder2/ ./folder2/  # 同步文件夹2，同上

      # 第四步：移除临时的 B_repo 目录
      - name: Remove B_repo directory
        run: rm -rf B_repo  # 删除 B 仓库的检出目录，清理工作目录

      # 第五步：提交并推送更改到 A 仓库
      - name: Commit and push changes
        run: |
          # 配置 Git 用户信息，以便工作流提交更改时显示正确的提交者信息
          git config user.name "GitHub Actions Bot"  # 使用通用的 GitHub Actions Bot 名称
          git config user.email "actions@github.com"  # 使用通用的 GitHub Actions 邮箱
          
          # 添加所有更改文件并提交到本地仓库
          git add .
          git commit -m "Sync files from B repository"  # 添加提交信息
          
          # 推送更改到 A 仓库的远程 main 分支
          git push
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}  # 使用 GITHUB_TOKEN 环境变量进行身份验证，推送更改到 A 仓库
```
