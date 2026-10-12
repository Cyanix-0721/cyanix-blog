# AGENTS.md — Cyanix Blog(项目级)

> 读者对象:AI 助手与仓库维护者。本文件回答「仓库**内部怎么运作**、改动怎样才安全」;「有哪些功能、怎么安装部署」见 [README.md](./README.md)。
> 本文件优先级低于用户当回合指令,高于全局 AGENTS.md。

## 1. 仓库概览

- Astro 7 **静态**博客(`output: "static"`,Vite 8),部署在 Vercel(`@astrojs/vercel`);站点地址见 `astro.config.mjs` 的 `site`。
- **文章不在本仓库撰写**:内容在 Obsidian 中写、推到 `Cyanix-0721/memo`,再由 GitHub Actions 每日同步进 `src/content/posts/`(见 §3)。
- 包管理 pnpm;本地 Node 由 fnm 管理;格式化用 prettier。
- 本仓库**没有测试,也没有 lint / format 的 CI 检查**;唯一的 workflow 是内容同步(§3)。`pnpm build` 是唯一自检手段。

## 2. 文档层级(谁在哪记录什么)

| 文件                              | 职责                                                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `README.md`                       | 门面:技术栈、环境要求、本地开发/构建命令、Frontmatter 规范、路由、目录结构、部署                                   |
| `AGENTS.md`                       | 本文件:内部运作机制、不可违背的约定、工具链与格式化规则                                                            |
| `astro.config.mjs`                | 站点与管线唯一权威:site、集成、`compressHTML`、unified 的 remark/rehype 插件链、Shiki 主题、Tailwind 接入、adapter |
| `src/content.config.ts`           | Frontmatter schema 唯一权威(字段、默认值、transform)                                                               |
| `package.json`                    | 依赖、`engines.node`(给 Vercel 读)、scripts                                                                        |
| `.node-version`                   | 本地 Node 版本(给 fnm 读);**与 `engines.node` 不是同一件事**,见 §5                                                 |
| `.prettierrc` / `.prettierignore` | 格式化规则与忽略范围                                                                                               |
| `.gitattributes`                  | 行尾与二进制声明(见 §6)                                                                                            |

**变更路由**:新增/修改 remark/rehype 插件、集成、Shiki 配置 → 只改 `astro.config.mjs`;新增/修改 Frontmatter 字段 → 先改 `src/content.config.ts`,再同步 `README.md` 的字段表和 `scripts/inject_frontmatter.py` 的补写逻辑,**三处必须一致**;环境/工具链变动 → 同步本文件 §5 与 `README.md` 环境要求段。

## 3. 内容管线(本仓库最易踩的部分)

数据流:`Obsidian` → `Cyanix-0721/memo` → `.github/workflows/sync-memo.yml` → `src/content/posts/` → 构建时读入。

workflow 每天 UTC 00:00(北京时间 08:00)在 `main` 上执行:

1. checkout 本仓库(`main`)与 `Cyanix-0721/memo`(需要 `secrets.PAT_TOKEN`);
2. `rsync -avu --delete` 把 `memo_repo/memo/` 同步到 `./src/content/posts/`,排除 `.obsidian/`、`.trash/`、`*.canvas`、`*.excalidraw.md`、`.gitignore`;
3. 运行 `python scripts/inject_frontmatter.py` 补写缺失的 frontmatter;
4. `git add src/content/posts/` → 有差异就 commit 并 **直接 push 到 main**。

由此推出四条硬规则:

1. **`src/content/posts/` 是机器同步目录,不要手工编辑或新增文件**。手改会被下一次同步覆盖;本地新增的文件会被 `--delete` 删除。要改文章,去 memo 仓库改。
2. **`scripts/inject_frontmatter.py` 会就地改写文件**。它只对缺少 `title` / `date created` / `date modified` 的文件动手,但**不要在本仓库随意运行**:它的日期取自文件系统时间(Windows 用 `os.path.getctime`,Linux 用 `st_birthtime`),不是 Obsidian 元数据。注意 CI 中新同步进来的文件,其「创建时间」实际是同步时间。
3. **`src/content/posts/**` 含大量图片等二进制资源**(`assets/` 子目录),同步时按原样带过来。
4. **`main` 会被 CI 直接推送**,不是纯人工分支;本地动手前先 `git pull`。

## 4. 不可违背的约定

1. **Frontmatter 以 `src/content.config.ts` 为准**。字段:`title`(必填)、`date created`(必填,`z.coerce.date()`)、`date modified`(可选)、`description`(可选)、`tags`(可选,数组或逗号分隔字符串,默认 `[]`)、`draft`(默认 `false`)、`cover`(可选)。schema 会 transform 出 `dateCreated` / `dateModified`,页面里用后者。
2. **`draft: true` 的文章不出现在站点**,但文件仍在仓库里;不要用删文件来表达「不发布」。
3. **文章正文的首个 H1 会被剥掉**(`src/plugins/rehype-strip-leading-h1.ts`),标题由布局渲染。不要在正文里靠 H1 当标题。
4. **wikilink 解析依赖构建时的目录扫描**:`astro.config.mjs` 在加载时同步调用 `buildWikilinkMap(postsDir)` 遍历 `src/content/posts`,为每个 `.md` / `.mdx` 建三个键(文件名小写、文件名连字符化、相对路径 id 小写连字符化)。改文件名或目录名会改变 `[[wikilink]]` 的解析结果。
5. **`rehype-autolink-headings` 会给标题注入 `anchor-link` 自链接**,`src/pages/rss.xml.js` 专门做了剥离。改标题锚点行为时同步检查 RSS 输出。
6. **`postbuild` 会把 `dist/pagefind` 复制到 `.vercel/output/static/pagefind`**;改构建输出结构时要一并考虑这一步。
7. **搜索用 astro-pagefind 2(`@pagefind/component-ui` 自定义元素),不是旧的 `@pagefind/default-ui`**。三条硬约束:
   - 组件导入**必须带 `.astro` 后缀**:`import Search from 'astro-pagefind/components/Search.astro'`(该包 exports 为 `"./components/*": "./src/components/*"`,省略后缀会构建失败)。
   - `Search` 的 props 是 `className` / `searchboxOptions` / `configOptions`(旧版的 `id`、`uiOptions` 已不存在)。
   - 主题:`component-ui` **没有** `prefers-color-scheme` 回退、也不用 `light-dark()`,只认 `[data-pf-theme="dark"]`。该属性由 `src/layouts/Layout.astro` 的防 FOUC 内联脚本与 `src/scripts/theme-manager.ts` 的 `applyTheme()` / `resolveTheme()` 共同维护(`auto` 在这里解析成实际的明/暗);配色通过 `src/styles/global.css` 里 `.pagefind-ui` 上的 `--pf-*` 变量映射。**改主题逻辑时这三处要一起看**。
8. **不提交构建产物与本地环境目录**:`dist/`、`.astro/`、`node_modules/`、`.vercel/`、`.env*` 已在 `.gitignore`;AI 助手工作目录 `.agents/` 也已忽略。

## 5. 工具链与版本声明

| 用途           | 落点                               | 谁读它                                  |
| -------------- | ---------------------------------- | --------------------------------------- |
| 本地 Node 版本 | `.node-version`                    | fnm(`--use-on-cd` 在 `cd` 进仓库时切换) |
| 线上 Node 版本 | `package.json` 的 `engines.node`   | Vercel(决定构建与 Functions 运行时)     |
| pnpm 版本      | `package.json` 的 `packageManager` | pnpm / Corepack                         |
| pnpm 项目配置  | `pnpm-workspace.yaml`              | pnpm v11+                               |

**为什么 Node 分两处写**:Vercel 目前只提供 `24.x`(默认)/ `22.x` / `20.x`,且只认主版本;本地可以跑更新的版本。因此 `.node-version` 与 `engines.node` 允许不同,**改其中一个不要顺手改另一个**。

**为什么不用 `.mise.toml`**:本机 Node 由 fnm 管理,而 mise 的 pnpm 后端带 `overrides = ["node"]`,会在仓库内把 node 一并纳入 mise 管辖、与 fnm 抢 PATH。工具版本声明落在 `.node-version`(fnm 原生读取)。

**pnpm 配置的载体**:pnpm v11 起**不再读 `package.json` 的 `pnpm` 字段**。本项目历史上用过的 `pnpm.onlyBuiltDependencies` 已失效,等价写法是 `pnpm-workspace.yaml` 里的 `allowBuilds`(map:包名 → `true`/`false`)。单包项目可以只写这一个文件、不写 `packages` 字段。

**改版本或增删依赖后的必做动作**:必须跑一次 `pnpm install` 并提交 `pnpm-lock.yaml`。pnpm 会把解析到的 pnpm 版本写进 lockfile 的前导 env 文档,而 `--frozen-lockfile`(CI / Vercel 默认)不会自动改写它——只改 `package.json` 不重跑 install,会让安装以 `ERR_PNPM_FROZEN_LOCKFILE_WITH_OUTDATED_LOCKFILE` 失败。

## 6. 格式化(prettier)

- 配置在 `.prettierrc`,忽略范围在 `.prettierignore`。**prettier 有意不支持全局配置**,规则必须留在仓库里。
- 插件顺序有硬要求:`prettier-plugin-tailwindcss` **必须放数组最后一位**。
- Tailwind 是 v4,必须用 `tailwindStylesheet` 指向 CSS 入口(不是 v3 的 `tailwindConfig`)。
- 忽略范围里**必须包含 `src/content/`**:该目录是机器同步的(§3),格式化结果会被下次同步冲掉。
- `astroCompressHTML: true` **必须保留**。该选项告诉 `prettier-plugin-astro` 编译器会折叠哪种空白,避免「格式化改变渲染结果」。插件的默认值是 `'jsx'`,那是 Astro 7.0 起的**新**默认;本仓库虽然已升到 Astro 7,但 `astro.config.mjs` 显式设了 `compressHTML: true`(保持 Astro 6 的 HTML-aware 行为:默认的 `'jsx'` 会吃掉行内元素之间的空格,例如「195 篇文章 134 个标签」会渲染成「195 篇文章134 个标签」),因此这里必须同为 `true`。**这三处(`astro.config.mjs` 的 `compressHTML`、`.prettierrc` 的 `astroCompressHTML`、本行)必须始终一致。**
- 行尾:`.gitattributes` 声明 `eol=lf`,prettier 的 `endOfLine` 也用 `lf`,两者配合才能保证「仓库里只有 LF」。本机 git 的 `core.autocrlf=true` 是个人配置,管不住仓库,也不能替代 `.gitattributes`。
- 常用命令:`pnpm exec prettier --write .` / `pnpm exec prettier --check .`。

## 7. 该做 / 不该做

**该做**:改文章去 memo 仓库;改站点能力改 `astro.config.mjs` + `src/`;改 Frontmatter 字段三处同步(§2);改动后跑 `pnpm build` 自检。

**不该做**:

- 不手工编辑或新增 `src/content/posts/` 下的文件;
- 不在本仓库随意运行 `scripts/inject_frontmatter.py`;
- 不提交构建产物、`.vercel/`、`.env*`、`.agents/`;
- 不改 `engines.node` 去迁就本地版本(会直接改变线上运行时);
- 不用 `mise use -g` 之类的全局命令改工具版本(会绕过 chezmoi 造成漂移)。

## 8. Git 提交规范

- 遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/),格式 `type(scope): 描述`,**描述用中文**。
- `type` 小写:`feat` / `fix` / `refactor` / `chore` / `docs` / `style` / `test` / `perf`;`scope` 取改动模块(如 `content`、`layout`、`plugins`、`config`、`tooling`)。
- 一个提交只做一件事;**格式化 diff 与工具链配置分两个提交**,否则无法审阅。
- **push 由用户自行处理**,agent 只提交不推送。注意 `main` 会被内容同步 workflow 推送(§3),push 前先 `git pull --rebase`。
