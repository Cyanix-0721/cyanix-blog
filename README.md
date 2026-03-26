# Cyanix Blog

基于 Astro 6 构建的个人技术博客，内容主要在 Obsidian 中撰写，使用 Git 同步，部署在 Vercel。

## 项目简介

- 框架：Astro 6（静态输出）
- 内容：Markdown / MDX（Astro Content Collections）
- 样式：Tailwind CSS v4
- 搜索：Pagefind（`astro-pagefind` 集成）
- 部署：Vercel（`@astrojs/vercel`）

## 核心特性

- Obsidian 友好写作流
  - 支持 `[[wikilink]]` 双链
  - 支持 `![[embed]]` 嵌入链接
  - 支持 Obsidian Callout（`> [!note]` 等）
- 完整博客能力
  - 首页时间线 + 标签筛选
  - 标签聚合页与标签详情页
  - RSS 输出（`/rss.xml`）
  - Sitemap 自动生成
- 阅读体验
  - 代码高亮（Shiki，亮/暗主题）
  - 代码块一键复制
  - 图片缩放（medium-zoom）
  - 浮动目录（TOC）与标题锚点
  - 明暗主题切换

## 技术栈

| 层 | 技术 |
|---|---|
| 应用框架 | Astro 6 |
| 内容系统 | astro:content + zod |
| Markdown 扩展 | remark-wiki-link + 自定义 remark/rehype 插件 |
| 样式系统 | Tailwind CSS v4 |
| 搜索 | astro-pagefind |
| 部署适配 | @astrojs/vercel |
| 包管理 | pnpm |

## 环境要求

- Node.js：`24.x`（与 `package.json` 中 `engines.node` 保持一致）
- pnpm：建议最新稳定版

## 本地开发

```bash
pnpm install
pnpm dev
```

默认访问：`http://localhost:4321`

## 构建与预览

```bash
pnpm build
pnpm preview
```

说明：
- 构建后会自动执行 `postbuild`，将 `dist/pagefind` 复制到 `.vercel/output/static/pagefind`，用于兼容 Vercel 输出目录。

## 内容写作规范

文章放在：`src/content/posts/`（支持子目录）

### Frontmatter（当前项目有效字段）

```yaml
---
title: 文章标题
date created: 2026-03-26
date modified: 2026-03-26
description: 可选摘要
tags:
  - Astro
  - Obsidian
draft: false
cover: /images/cover.png
---
```

字段说明：

- `title`：必填，字符串
- `date created`：必填，发布日期（可被 `z.coerce.date()` 解析）
- `date modified`：可选，最后修改时间
- `description`：可选，摘要
- `tags`：可选，数组；也支持逗号分隔字符串，会自动转换
- `draft`：可选，默认 `false`；`true` 时不会出现在站点中
- `cover`：可选，封面图地址

## 路由说明

- `/`：首页（时间线、标签筛选、搜索）
- `/posts/[...slug]`：文章详情页
- `/tags`：标签总览
- `/tags/[tag]`：标签详情
- `/about`：关于页
- `/rss.xml`：RSS

## 目录结构（精简）

```text
cyanix-blog/
├─ src/
│  ├─ content/
│  │  └─ posts/
│  ├─ components/
│  ├─ layouts/
│  ├─ pages/
│  ├─ plugins/
│  ├─ scripts/
│  ├─ styles/
│  └─ utils/
├─ public/
├─ astro.config.mjs
├─ package.json
└─ README.md
```

## 部署

推荐 Vercel：

1. 将仓库推送到 GitHub
2. 在 Vercel 导入项目
3. 使用默认 Astro 构建配置完成部署

当前 `site` 已配置为：`https://cyanix-blog.vercel.app`

如需自定义域名，请同步更新 `astro.config.mjs` 中的 `site` 字段。

## License

- 代码（布局、组件、配置、插件等）遵循 [MIT](./LICENSE)
- `src/content/posts/` 下文章内容默认保留版权
