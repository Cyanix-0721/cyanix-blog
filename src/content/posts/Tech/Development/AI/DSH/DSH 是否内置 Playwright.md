---
tags: [DSH, Playwright, 浏览器自动化, MCP]
title: DSH 是否内置 Playwright
aliases: [dsh-playwright-builtin]
date created: 2026-09-15 19:49:35
date modified: 2026-10-14 23:39:00
---

# DSH 是否内置 Playwright

> [!abstract] 适用场景
> 回答「DeepSeek Harness（DSH）是否自带浏览器自动化能力」这一问题，并区分两条完全不同的路线：
> 官方 experimental 的 browser-use provider 与自行挂载的通用 MCP 客户端 + `@playwright/mcp`。
> 适用于准备给 DSH 加浏览器工具、或困惑于会话里出现的 `mcp__playwright__*` 工具从何而来的读者。

## 1 背景与适用条件

- **DSH**（DeepSeek Harness，`@deepseek-ai/dsh`）是 Cordis 插件框架之上的 agent 平台，
  其能力由 profile 里挂载的 bundle / 插件组合决定，核心 CLI 与三个官方 bundle
  （`dsh-base`、`dsh-web-app`、`dsh-headless`）**都不依赖任何浏览器包**。
- **Playwright** 是微软的浏览器自动化框架；`@playwright/mcp` 是官方提供的 MCP server，
  把浏览器操作以 MCP 工具形式暴露给宿主。
- 本文结论基于 `@deepseek-ai/dsh@0.1.5-rc.1` 与 npm 上同期发布的 `0.1.6-alpha.1`。
  **版本敏感**：官方包名、dist-tag 与 provider 注册机制都可能随版本变化，
  升级后请重新核对本文的「版本事实」一节。
- 前置条件：能访问 npm registry 以查询 dist-tags；若要实际启用浏览器能力，
  需要 DSH ≥ `0.1.6-alpha.1`（或自行用通用 MCP 客户端挂载上游 `@playwright/mcp`）。
- **适用范围**：判断「该不该装浏览器工具、走哪条路线」。
  **不适用**：Playwright 自身的 API 用法、MCP 协议规范细节。

## 2 结论

**没有内置，但 `0.1.6-alpha.1` 起提供「官方实验性、显式挂载」的 browser-use provider。**

- DSH 核心（`dsh-base` / `dsh-web-app` / `dsh-headless`）**不依赖任何浏览器包**。
- master 分支新增 `packages/browser-use`（只做 provider 名额注册）
  与 `packages/experimental/browser-use-*`（三个浏览器后端 + 一个共享 runtime）。
- 这些包以 **`0.1.6-alpha.1`** 发布到 npm，但**默认不启用**，
  必须在 profile / preset 里显式 mount 才生效。
- 若目标环境跑的是 `0.1.5-rc.1`（当时 npm `latest` 仍指向它），则**没有**这些包。
- 会话里能看到的 `mcp__playwright__*` 工具**不是 DSH 内置**，而是用户自己在
  `~/.dsh/profiles/web/cordis.patch.yml` 里用 `dsh-mcp-client` 挂的
  `@playwright/mcp@latest`。

## 3 版本事实（npm registry 查询）

| 包 | dist-tags | 发布时间 |
|---|---|---|
| `@deepseek-ai/dsh` | latest=0.1.5-rc.1, next=0.1.5-rc.2, alpha=0.1.6-alpha.1 | 0.1.6-alpha.1 @ 2026-09-15T03:23:13Z |
| `@deepseek-ai/dsh-browser-use` | latest=alpha=0.1.6-alpha.1 | 2026-09-15T03:23:21Z |
| `@deepseek-ai/dsh-experimental-browser-use-playwright-mcp` | 0.1.6-alpha.1 | 同上 |
| `@deepseek-ai/dsh-experimental-browser-use-chrome-devtools-mcp` | 0.1.6-alpha.1 | 同上 |
| `@deepseek-ai/dsh-experimental-browser-use-runtime` | 0.1.6-alpha.1 | 同上 |

`0.1.6-alpha.1` 相对 `0.1.5-rc.1` 的依赖差异（`@deepseek-ai/dsh` 顶层）：
新增 `dsh-mcp-resources`、`dsh-workflow-ptc`；移除 `dsh-workflow-worker-thread`。
浏览器相关包**不在** `dsh` CLI 的依赖里，也不在三个 bundle 的依赖里。

## 4 新架构（provider 注册制）

- `@deepseek-ai/dsh-browser-use` 独占 `ctx.browserUse`，只注册**一个** provider 名字，
  返回 disposer；服务本身不含浏览器对象、公共操作类型或 selector。
- 三个 provider（都是 experimental，需显式 mount）：
  - `dsh-experimental-browser-use-playwright-mcp` — 依赖固定版 `@playwright/mcp@0.0.80`
  - `dsh-experimental-browser-use-chrome-devtools-mcp`
  - `dsh-experimental-browser-use-stagehand-native` — 依赖 `@browserbasehq/stagehand`、
    `@puppeteer/browsers`，用独立 Worker + CDP 跑 SDK
- `dsh-experimental-browser-use-runtime` 负责 per-Session 资源生命周期、attachment 独占、
  以及在 `agent/created` 内 await MCP 连接与工具发现。
- 工具名形如 `mcp__playwright-mcp__<tool>`；Session 级隔离，reload / fork 不继承浏览器状态；
  attach 模式保留外部浏览器登录态，但同一 provider 实例内独占。
- 限制：仅 Chromium；启动失败会拒绝 Session 创建 / resume 并回滚；不自动重连。

## 5 挂载示例（来自官方 README）

```yaml
- name: '@deepseek-ai/dsh-browser-use'
- name: '@deepseek-ai/dsh-experimental-browser-use-playwright-mcp'
  config:
    mode: launch      # 或 attach
    headless: true
    # executablePath: ...
    # endpoint: ...   # attach 模式必填
```

注意：官方提示配置 system prompt 的 `toolOrder` 时，浏览器工具应留在
`<unlisted-tools>`，显式列出会让无浏览器连接的 Session 组装 prompt 失败。

## 6 与通用 MCP 客户端方案的关系

在 `0.1.5-rc.1` 这类尚无 browser-use provider 的版本上，可用
**通用 MCP 客户端 + 上游 `@playwright/mcp`** 达到相同目标，但机制不同：

| | `dsh-mcp-client` 挂 `@playwright/mcp` | 0.1.6 的 browser-use provider |
|---|---|---|
| 归属 | profile patch 手工挂载 | 官方 experimental 包 |
| Session 隔离 / 独占 | MCP 客户端通用行为 | 专门的 per-Session 资源与 attachment 独占 |
| 版本 | `@playwright/mcp@latest`（不锁版本） | 固定 pin `0.0.80` |
| 稳定性承诺 | 无 | 无（experimental） |

两者可并存，但同一进程里浏览器工具会重复；升级到 `0.1.6-alpha.1` 后若启用 provider，
建议择一。

## 7 一手来源

- https://registry.npmjs.org/@deepseek-ai%2Fdsh
- https://registry.npmjs.org/@deepseek-ai%2Fdsh-browser-use
- https://registry.npmjs.org/@deepseek-ai%2Fdsh-experimental-browser-use-playwright-mcp
- https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/subsystems/browser-use.md
- https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/packages/browser-use/README.md
- https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/packages/experimental/browser-use-playwright-mcp/README.md
- https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/packages/experimental/browser-use-runtime/README.md
- https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/.agents/notes/implemented/architecture/2026-09-12-browser-use-provider-registration.md

## 8 本机实测环境与数值

> 以下为单机单次实测结果，仅用于说明结论的取证来源；换机器 / 换版本后需重新核对。

| 项 | 值 |
| --- | --- |
| OS / 运行环境 | WSL2 Linux |
| DSH CLI | `@deepseek-ai/dsh@0.1.5-rc.1` |
| npx 缓存路径 | `/home/<user>/.npm/_npx/<hash>/` |
| 本地包目录 | `/home/<user>/.npm/_npx/<hash>/node_modules/@deepseek-ai/` |
| 浏览器工具实际来源 | `~/.dsh/profiles/web/cordis.patch.yml` 经 `dsh-mcp-client` 挂载 `@playwright/mcp@latest` |
| npx 缓存命中的 `@playwright/mcp` 版本 | `0.0.81` |

## 9 相关

- [[DSH 浏览器能力与 PDF 处理]]
- [[DSH Web 插件聚合包]]
- [[DSH 第三方插件安全审计]]
