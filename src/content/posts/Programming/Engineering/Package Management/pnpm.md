---
tags: [package-management, nodejs, pnpm]
title: Pnpm
date modified: 2026-03-27 07:11:07
aliases: Pnpm
date created: 2024-08-15 04:19:28
---

# Pnpm

> [!abstract] 概览  
> pnpm 是高性能 Node.js 包管理器，通过内容寻址存储和硬链接减少磁盘占用。

## 安装 / 启用

```bash
npm install --global corepack@latest
corepack enable pnpm
pnpm -v
```

## 常用命令

```bash
pnpm init
pnpm install
pnpm add <package_name>
pnpm add -D <package_name>
pnpm remove <package_name>
pnpm update
pnpm run <script>
```

## 进阶用法

```bash
pnpm install --filter <package_name>
pnpm update --latest
corepack prepare pnpm@latest --activate
```

## 注意事项

> [!tip] 团队实践
> - 提交 `pnpm-lock.yaml` 保证可复现。
> - CI 建议使用 `pnpm install --frozen-lockfile`。
