---
tags: [Github, Action, Workflow, Sync, CI/CD]
title: Action&Workflow
date created: 2024-08-15 04:19:28
date modified: 2026-03-14 09:35:22
date: 2026-03-15 02:52:39
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
# 工作流名称：Sync files from source repository
# 该工作流用于自动将“源仓库”的指定目录同步到“当前仓库”的指定目录

name: Sync files from source repository

# 工作流触发条件
on:
  # 定时触发：每天运行一次
  schedule:
    # UTC 00:00 运行（北京时间 08:00）
    - cron: "0 0 * * *"

  # 手动触发：允许在 GitHub Actions 页面手动运行
  workflow_dispatch:

# 并发控制
# 防止同一个工作流同时运行多个实例
concurrency:
  group: repository-file-sync
  cancel-in-progress: true

# 为 GITHUB_TOKEN 设置权限
permissions:
  contents: write  # 允许工作流向仓库提交和推送更改

# 定义作业
jobs:
  sync:
    # 运行环境：GitHub 托管的最新 Ubuntu Runner
    runs-on: ubuntu-latest

    steps:

      # 步骤 1：检出当前仓库（目标仓库）
      # 同步后的文件将写入这里
      - name: Checkout target repository
        uses: actions/checkout@v4
        with:
          ref: main          # 检出 main 分支
          fetch-depth: 1     # 只获取最近一次提交以加快速度

      # 步骤 2：检出源仓库
      # 将需要同步的仓库 clone 到本地目录
      - name: Checkout source repository
        uses: actions/checkout@v4
        with:
          repository: <SOURCE_OWNER>/<SOURCE_REPOSITORY>  # 源仓库
          path: source_repo                               # 本地目录
          ref: main                                       # 源仓库分支
          fetch-depth: 1
          token: ${{ secrets.PAT_TOKEN }}                 # 用于访问私有仓库

      # 步骤 3：同步指定目录
      - name: Sync files from source to target
        run: |
          # 使用 rsync 进行增量同步
          #
          # 参数说明：
          # -a  归档模式（保持文件属性）
          # -v  输出详细日志
          # -u  只更新较新的文件
          # --delete  删除目标目录中源仓库不存在的文件
          
          rsync -avu --delete \
            --exclude='.git/' \
            --exclude='.github/' \
            --exclude='.gitignore' \
            source_repo/<SOURCE_FOLDER>/ ./<TARGET_FOLDER>/

          # 示例说明：
          #
          # source_repo/docs/      -> 源仓库目录
          # ./docs/                -> 当前仓库目标目录

      # 步骤 4：检测是否有变更并提交
      - name: Commit and push if changed
        run: |

          # 配置 Git 提交身份
          git config user.name "github-actions[bot]"
          git config user.email "actions@users.noreply.github.com"

          # 添加同步后的文件
          git add <TARGET_FOLDER>/

          # 如果没有变化则退出
          if git diff --staged --quiet; then
            echo "No changes detected, nothing to commit."
            exit 0
          fi

          # 获取源仓库 commit 短 SHA
          SOURCE_SHA=$(git -C source_repo rev-parse --short HEAD)

          # 提交更改
          git commit -m "chore: sync files from <SOURCE_REPOSITORY>@${SOURCE_SHA} $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

          # 推送到当前仓库
          git push

          echo "Files have been synced and pushed successfully!"

        env:
          # GitHub 自动提供的 Token
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
