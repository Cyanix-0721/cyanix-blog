---
tags: [package-management, nodejs, npm]
title: Npm
date modified: 2026-03-27 07:11:16
aliases: Npm
date created: 2024-11-26 05:57:50
---

# Npm

> [!abstract] 概览  
> `npm` 是 Node.js 官方包管理器，用于依赖管理、脚本执行、发布和配置管理。

## 安装 / 启用

> [!info] 说明  
> npm 随 Node.js 一起安装。

## 常用命令

```bash
npm init -y
npm install <package>
npm install --save-dev <package>
npm uninstall <package>
npm update <package>
npm run <script>
npm list
npm outdated
```

## 进阶用法

```bash
npm ci
npm login
npm publish
npm version patch
npm config set <key> <value>
```

## 注意事项

> [!warning] 风险提示  
> `npm unpublish --force` 影响范围大，除紧急情况外不建议使用。
