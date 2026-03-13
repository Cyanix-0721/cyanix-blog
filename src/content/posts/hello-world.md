---
title: Hello World — 欢迎来到 Cyanix Blog
date: 2025-01-21
description: 这是第一篇示例文章，展示本博客支持的所有 Obsidian 语法特性。
tags: [astro, obsidian, markdown, 示例]
draft: false
---

# Hello World 👋

欢迎来到 **Cyanix Blog**！这篇文章是一篇功能演示，用来展示本博客所支持的各种 Markdown 与 Obsidian 语法。

---

## 基础文字排版

这是一段普通正文。你可以使用 **粗体**、*斜体*、~~删除线~~ 以及 `行内代码`。

也可以用 ==高亮== 来标注关键词，或者用 <kbd>Ctrl</kbd> + <kbd>K</kbd> 表示快捷键。

---

## Callout 块（Obsidian 原生语法）

> [!note] 这是一个 Note
> 适合记录普通的补充说明。支持 **行内格式** 和 `代码`。

> [!tip] 小技巧
> 遇到问题先查文档，再问 GPT，最后才去 Stack Overflow。

> [!info] 信息
> Astro 的 Content Collections 会在构建期对 frontmatter 进行类型校验。

> [!warning] 注意
> 将 `draft: true` 的文章推送到仓库后不会被构建，但文件本身仍然公开可见。

> [!important] 重要
> 请务必在 Vercel 项目设置里绑定自定义域名，否则默认域名可能被随机更改。

> [!success] 成功
> 部署成功！你的博客现在可以通过 Vercel URL 访问了。

> [!question] 疑问
> 为什么选 Astro 而不是 Next.js？因为博客不需要那么重的框架。

> [!failure] 失败
> 构建失败通常是 frontmatter 类型不匹配，检查 `date` 字段是否符合格式。

> [!danger] 危险
> 不要把 API Key 直接硬编码在源文件里提交到公开仓库。

> [!bug] Bug
> 已知问题：Obsidian 的 `![[嵌入文件]]` 语法暂不支持，需手动转换为标准图片语法。

> [!example] 示例
> ```js
> const greeting = "Hello, Cyanix!";
> console.log(greeting);
> ```

> [!quote] 引用
> "The best way to predict the future is to invent it." — Alan Kay

> [!abstract] 摘要
> 本文覆盖了 Markdown 基础排版、Callout、代码块、表格、双链等全部支持的语法特性。

> [!todo] 待办
> - [ ] 配置自定义域名
> - [ ] 添加 RSS 订阅页面
> - [x] 完成第一篇博客文章

---

## 代码块（Shiki 高亮）

### TypeScript

```ts
import { getCollection } from 'astro:content';

// 获取所有已发布的文章，按日期倒序排列
const posts = (await getCollection('posts', ({ data }) => !data.draft))
  .sort((a, b) => b