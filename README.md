# Cyanix Blog

基于 Astro 7 构建的个人技术博客，内容主要在 Obsidian 中撰写，使用 Git 同步，部署在 Vercel。

## 项目简介

- 框架：Astro 7（静态输出，Vite 8）
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

| 层            | 技术                                                             |
| ------------- | ---------------------------------------------------------------- |
| 应用框架      | Astro 7（Vite 8）                                                |
| 内容系统      | astro:content + zod                                              |
| Markdown 扩展 | remark-wiki-link + 自定义 remark/rehype 插件（unified 管线）     |
| 样式系统      | Tailwind CSS v4                                                  |
| 搜索          | astro-pagefind 2（@pagefind/component-ui 自定义元素）            |
| 部署适配      | @astrojs/vercel                                                  |
| 包管理        | pnpm                                                             |
| 格式化        | prettier（+ prettier-plugin-astro、prettier-plugin-tailwindcss） |

## 环境要求

| 用途         | 版本      | 声明位置                           | 谁读它                       |
| ------------ | --------- | ---------------------------------- | ---------------------------- |
| 本地 Node.js | `26.9.0`  | `.node-version`                    | fnm（`cd` 进仓库时自动切换） |
| 线上 Node.js | `24.x`    | `package.json` 的 `engines.node`   | Vercel                       |
| pnpm         | `12.10.1` | `package.json` 的 `packageManager` | pnpm / Corepack              |

**为什么 Node 分两处写**：Vercel 目前只提供 `24.x` / `22.x` / `20.x`，且只认主版本；本地可以跑更新的版本。因此 `.node-version` 与 `engines.node` 允许不同，**改其中一个不要顺手改另一个**（改 `engines.node` 会直接改变线上运行时）。

本机 Node 由 **fnm** 管理（不是 mise）：mise 的 pnpm 后端带 `overrides = ["node"]`，会在仓库内把 node 一并纳入 mise 管辖、与 fnm 抢 PATH。

pnpm 配置写在 `pnpm-workspace.yaml`（`allowBuilds`）：pnpm v11 起**不再读取 `package.json` 的 `pnpm` 字段**，历史上用过的 `pnpm.onlyBuiltDependencies` 已失效。

## 本地开发

```bash
pnpm install
pnpm dev
```

> 增删依赖或改动 `packageManager` / `engines.node` 后必须重跑 `pnpm install` 并提交 `pnpm-lock.yaml`。pnpm 会把解析到的 pnpm 版本写进 lockfile 前导 env 文档，而 `--frozen-lockfile`（CI / Vercel 默认）不会自动改写它——只改 `package.json` 会让安装以 `ERR_PNPM_FROZEN_LOCKFILE_WITH_OUTDATED_LOCKFILE` 失败。

默认访问：`http://localhost:4321`

## 构建与预览

```bash
pnpm build
pnpm preview
```

说明：

- 构建后会自动执行 `postbuild`，将 `dist/pagefind` 复制到 `.vercel/output/static/pagefind`，用于兼容 Vercel 输出目录。

## 代码格式化

规则在 `.prettierrc`，忽略范围在 `.prettierignore`（prettier 有意不支持全局配置，规则必须留在仓库里）。

```bash
pnpm exec prettier --write .   # 格式化
pnpm exec prettier --check .   # 只检查
```

约定：

- 插件顺序有硬要求：`prettier-plugin-tailwindcss` **必须放数组最后一位**。
- Tailwind 是 v4，必须用 `tailwindStylesheet` 指向 CSS 入口（不是 v3 的 `tailwindConfig`）。
- `src/content/` 已被忽略：该目录由 workflow 同步（见下），格式化结果会被下次同步冲掉。
- `astroCompressHTML: true` 不要删：它告诉 Astro 插件编译器会折叠哪种空白。插件默认值 `'jsx'` 是 Astro 7 起的语义；本项目虽已升 Astro 7，但 `astro.config.mjs` 显式设了 `compressHTML: true`（保持 Astro 6 的 HTML-aware 行为，避免行内元素之间的空格被吃掉），所以这里必须同为 `true`。**`compressHTML` 与 `astroCompressHTML` 必须始终一致。**
- 行尾：`.gitattributes` 声明 `eol=lf`，prettier 的 `endOfLine` 也是 `lf`，两者配合才能保证仓库里只有 LF。本机 git 的 `core.autocrlf` 是个人配置，管不住仓库，不能替代 `.gitattributes`。
- 首次启用 `.gitattributes` 后需要一次性重规范行尾：`git add --renormalize .`，作为**独立提交**。

## 内容同步（自动）

`.github/workflows/sync-memo.yml` 每天 UTC 00:00（北京时间 08:00）把 `Cyanix-0721/memo` 的 `memo/` 目录 `rsync --delete` 到 `src/content/posts/`，补写 frontmatter 后**直接推送到 `main`**。

因此：

- **不要手工编辑或新增 `src/content/posts/` 下的文件**（会被覆盖或删除）；改文章请去 memo 仓库。
- 本地动手前先 `git pull`。`main` 不是纯人工分支。
- 本仓库没有 lint / format / build 的 CI 检查；`pnpm build` 是唯一的自检手段。

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
├─ .node-version
├─ .prettierrc
├─ .prettierignore
├─ .gitattributes
├─ pnpm-workspace.yaml
├─ AGENTS.md
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
