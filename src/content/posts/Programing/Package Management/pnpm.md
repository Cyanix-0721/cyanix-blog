---
tags: 
title: Pnpm 命令行工具文档
aliases: Pnpm 命令行工具文档
date created: 2024-08-15 04:19:28
date modified: 2026-03-14 09:35:26
date: 2026-03-15 02:52:39
---

# Pnpm 命令行工具文档

pnpm 是一种快速且高效的 Node.js 包管理器，它通过硬链接和符号链接来节省磁盘空间和提升安装速度。

## 1 [安装](https://pnpm.io/installation)

### 1.1 使用 Corepack（官方推荐）

Node.js **≥ 16.13** 已内置 `corepack`，这是目前最推荐的方式。

#### 1.1.1 安装 / 更新 Corepack

```sh
npm install --global corepack@latest
```

#### 1.1.2 启用 Pnpm

```sh
corepack enable pnpm
```

启用后，`pnpm` 会由 Corepack 管理版本，而不是直接写入全局 `node_modules`

### 1.2 验证安装是否成功

```sh
pnpm -v
```

输出版本号说明安装成功。

### 1.3 更新 Pnpm

```sh
pnpm self-update
```

该命令会更新当前激活的 pnpm 版本  
若由 Corepack 管理，使用下述命令

```sh
corepack prepare pnpm@latest --activate
```

## 2 基本用法

### 2.1 初始化项目

使用 pnpm 初始化一个新项目：

```sh
pnpm init
```

### 2.2 安装依赖

要安装项目的依赖包，使用以下命令：

```sh
pnpm install
```

安装单个依赖包：

```sh
pnpm add <package_name>
```

例如，安装 lodash：

```sh
pnpm add lodash
```

### 2.3 删除依赖

要删除某个依赖包，使用以下命令：

```sh
pnpm remove <package_name>
```

例如，删除 lodash：

```sh
pnpm remove lodash
```

### 2.4 更新依赖

要更新项目的所有依赖包，使用以下命令：

```sh
pnpm update
```

### 2.5 运行脚本

要运行在 `package.json` 中定义的脚本，使用以下命令：

```sh
pnpm run <script_name>
```

例如，运行测试脚本：

```sh
pnpm run test
```

运行开发环境脚本：

```sh
pnpm run dev
```

运行构建脚本：

```sh
pnpm run build
```

运行自定义脚本：

例如，假设 `package.json` 中定义了一个 `start` 脚本：

```json
"scripts": {
  "start": "node index.js"
}
```

可以运行该脚本：

```sh
pnpm run start
```

## 3 选项详解

pnpm 提供了多种选项来控制其行为。以下是一些常用选项的详细说明：

### 3.1 全局选项

- `--version`：显示 pnpm 的版本信息。
- `--help`：显示帮助信息。
- `--filter`：指定只对某些包执行命令（适用于 monorepo 项目）。

### 3.2 安装命令选项

- `--save-dev` 或 `-D`：将包安装为开发依赖。
- `--save-optional` 或 `-O`：将包安装为可选依赖。
- `--global` 或 `-g`：全局安装包。
- `--shamefully-hoist`：启用此选项后，所有包将会被提升到 node_modules 的顶层目录，这有助于与不兼容 pnpm 的项目进行兼容。

### 3.3 添加命令选项

- `--save-exact` 或 `-E`：保存精确版本。
- `--save-peer`：将包安装为 peer 依赖。

### 3.4 更新命令选项

- `--latest`：更新到最新的版本，不管 package.json 中指定的版本范围。
- `--depth`：指定更新的依赖层级深度。

### 3.5 删除命令选项

- `--global` 或 `-g`：全局删除包。

## 4 示例

### 4.1 全局安装一个包

```sh
pnpm add -g typescript
```

### 4.2 将包添加为开发依赖

```sh
pnpm add jest -D
```

### 4.3 仅更新直接依赖

```sh
pnpm update --depth 0
```

### 4.4 在 Monorepo 项目中，只安装特定包的依赖

```sh
pnpm install --filter <package_name>
```
