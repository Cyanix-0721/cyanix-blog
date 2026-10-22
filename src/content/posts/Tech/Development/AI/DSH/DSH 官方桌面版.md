---
tags: [DSH, 桌面版, Electron, 分发渠道]
title: DSH 官方桌面版
aliases: [dsh-desktop-official]
date created: 2026-09-25 10:42:10
date modified: 2026-10-14 23:39:00
---

# DSH 官方桌面版

> [!abstract] 适用场景
> 核实 DeepSeek Harness（DSH）是否已有官方桌面版、从哪下载、有哪些已知限制。适用于想用 GUI 桌面应用而非 `npx dsh web`、或想确认某个本地 Electron 目录到底是不是官方桌面版的场景。读完能定位官方 CDN 的 feed 与安装包地址，并判断桌面版当前的成熟度。

## 1 背景与适用条件

**DSH 官方桌面版**是一个 Electron 壳 + 内置 dsh runtime 的桌面应用，包名 `@deepseek-ai/dsh-desktop`，随 CLI 同版本发布。它与 CLI/Web 模式**共享** `$DSH_HOME` 下的 sessions/settings/credentials/workspaces/storage，但可执行包、插件激活状态、lockfile 相互独立。

版本敏感性：以下结论基于 **`@deepseek-ai/dsh@0.1.7-alpha.2`** 与桌面版 **`0.1.7-rc.2`**（2026-09-24），更新版本可能变化。

前置条件：无需安装即可下载；但**账号登录尚未接通**（Sign in 按钮 disabled），因此对使用第三方 provider 的场景是否可用仍未验证（见 §6）。

适用范围：判断「官方桌面版是否存在、去哪下载、有哪些限制」。**不适用**于把本地已有的裸 Electron 运行时误认为官方桌面版（见 §7）。

## 2 结论

**有官方桌面版，而且已经能下载安装。** 它是 Electron 壳 + 内置 dsh runtime，包名 `@deepseek-ai/dsh-desktop`，当前随 CLI 同版本发布：**0.1.7-rc.2**（2026-09-24）。

但它**不在 GitHub Releases、不在 npm、官网也没有入口** —— 官方走自有 CDN 静默分发，目前处于「已发布但未公开宣传」状态。所以「出没出桌面版」和「官网能不能找到」是两个答案：前者是 yes，后者是 no。

## 3 下载地址

来源：生产更新 feed

```text
https://download.deepseek.com/dsh-desk/feeds/<target>/nightly.yml       (win)
https://download.deepseek.com/dsh-desk/feeds/<target>/nightly-mac.yml   (mac)
```

| 平台 | URL | 大小 | 最后修改 |
|---|---|---|---|
| macOS arm64 | `https://download.deepseek.com/dsh-desk/bin/mac-arm64/deepseek-harness-0.1.7-rc.2-mac-arm64.zip` | 372,794,444 B (~355 MiB) | 2026-09-24 14:20 UTC |
| Windows x64 | `https://download.deepseek.com/dsh-desk/bin/win-x64/deepseek-harness-0.1.7-rc.2-win-x64.exe` | 288,245,480 B (~275 MiB) | 2026-09-24 14:12 UTC |

SHA-512（取自 feed，供校验）：

- mac-arm64: `aOfxtRvFqTRRp3zqu6nXNgILgVdHDPyfslhUVNnU1wMYw1dY1vTelptJeAmUDt7G822SCqHzxtPwMmvCGekveA==`
- win-x64: `AY7f45dYO7BFrfgaLmzXNWP0pavlxkSbsehPo/WF6PXcFdDK3fF1oHUPs/4f2bzROgQvm6wSgawZ/g7UzbPRmw==`

feed 里 `version: 0.1.7-rc.2`，`releaseDate: 2026-09-24T14:10:00.562Z`(mac) / `14:11:01.715Z`(win)。

> [!warning] 平台覆盖不全
> **mac-x64（Intel Mac）没有产物**：`feeds/mac-x64/nightly-mac.yml` 返回 404。虽在打包配置的 targets 列表里，但生产上只发布了 mac-arm64 和 win-x64。**无 Linux 版。**

## 4 一手证据

### 4.1 本地 CLI 自己承认桌面版存在

`@deepseek-ai/dsh/lib/bin.js:38`：

```js
if (profile.toLowerCase() === "desktop") program.error("error: profile \"desktop\" is managed exclusively by the Electron application")
```

同包 `README.md:20`：「The `desktop` name is reserved for the Electron-owned profile, so the CLI rejects boot, config-dump, and plugin-management requests for it.」

即 CLI 把 `desktop` profile 名留给 Electron 应用独占。若 `~/.dsh/profiles/` 下只有 `node_modules` 和 `web`，**没有 desktop**，说明装的是 Web 模式，不是桌面版。

### 4.2 源码树里有完整桌面工程

https://github.com/deepseek-ai/deepseek-harness （default_branch `master`）

- `apps/desktop/` → `@deepseek-ai/dsh-desktop` v0.1.7-rc.2，description: "Electron desktop shell for a bundled dsh runtime and external plugins"
- `apps/desktop-host/` → `@deepseek-ai/dsh-desktop-host` v0.1.7-rc.2，**`"private": true`**，description: "Private Node-mode host process for the Electron desktop application"
- `apps/desktop/README.md`（455 行，含 Package / Upload updates / Updates / Known limitations）
- `.agents/notes/` 下 20+ 篇桌面决策记录，日期 2026-08-25 → 2026-09-23，例如 `implemented/architecture/2026-08-25-electron-desktop-packaging-and-updates.zh.md`、`2026-09-08-desktop-bundled-runtime-and-external-plugins.zh.md`、`2026-09-10-desktop-web-wrapper.zh.md`、`2026-09-11-desktop-electron-node-runtime.zh.md`、`feature/2026-09-11-desktop-mandatory-update-client.zh.md`、`2026-09-16-desktop-onboarding.zh.md`、`process/2026-09-16-desktop-release-version-derivation.md`

### 4.3 分发渠道 = 自有 CDN（关键发现）

`apps/desktop/README.md` 的 "Upload updates" 章节：

- `DSH_DESKTOP_AUTO_UPDATE_ENV` 选 `test`/`production`，缺省为 `test`
- production origin = `https://download.deepseek.com`（bucket 由 `DOWNLOAD_PROD_COS_BUCKET` 提供）
- 路径约定：元数据 `dsh-desk/feeds/<target>/`，二进制 `dsh-desk/bin/<target>/`
- targets: `mac-arm64`, `mac-x64`, `win-x64`
- 固定 Nightly channel；稳定版额外发 `latest.yml`/`latest-mac.yml`
- 底层是腾讯 COS（响应头 `server: tencent-cos`、`x-cos-request-id`、`x-cos-storage-class: MAZ_STANDARD`）

`apps/desktop/scripts/electron-builder-config.mjs:247` 印证：

```js
publish: update === undefined ? null : [{ provider: 'generic', url: update.publicUrl, channel: 'nightly' }]
```

### 4.4 首次公开提及在 0.1.7-rc.2 的 release notes

扫描全部 22 个 release（`dsh-v0.1.0-rc.7` 2026-08-17 → `dsh-v0.1.7-rc.2` 2026-09-24，**全部 prerelease=true**，**assets 全部为 0**）。桌面端条目最早出现在最新的 `dsh-v0.1.7-rc.2`：

- 「桌面端新增首次使用引导，介绍可用额度，并帮助选择用途和工作过程的展示方式」
- 「Web 和桌面端支持查看、搜索、自定义及恢复快捷键」
- 「关闭桌面窗口后，任务继续在后台运行；退出应用前会提示对任务的影响」
- 「修复部分桌面安装包启动失败的问题」
- 「桌面端聊天中的本地 Markdown 图片可正常预览和放大」
- 「桌面端会记住当前账号在内嵌 Platform 页面中已确认的提示」
- 「Web 和桌面端默认关闭定时任务与时间上下文」

release body 里正则扫描 `https?://…` 并过滤 download/dsh-desk/release/desktop：**零命中**，即 release notes 不给下载链接，全部靠 CDN 静默分发。

### 4.5 官网/文档确实没有入口（这个「没有」也已核实）

- https://www.deepseek.com/harness 只有 `npx @deepseek-ai/dsh web` 和 git clone 源码两种方式
- https://www.deepseek.com/harness/desktop → 404；`/download` → 404
- https://deepseek-harness.github.io/deepseek-harness/guide/desktop → 404；`sitemap.xml` 为空
- `docs/user/guide/` 只有 github-review / index / mcp-memory / network-proxy / providers / python-sdk / schedule，无 desktop 章节
- npm registry：`@deepseek-ai/dsh-desktop` → `{"error":"Not found"}`；`@deepseek-ai/dsh-desktop-host` → 同样 404

## 5 已知限制

来源：`apps/desktop/README.md` 的 "Known limitations" 章节。

- **账号登录未接通**：「Account sign-in is not connected; the Sign in button is disabled.」
- 「Windows material rendering still requires platform QA.」
- 「Release signing, notarization, update hosting, and previous-version installed-artifact qualification require the production release environment.」
- 桌面壳与 CLI dsh **共享** `$DSH_HOME` 下的 sessions/settings/credentials/workspaces/storage，但可执行包、插件激活状态、lockfile 相互独立
- 未打包的 win32-arm64 主机能启动但 payload 仍是 x64，`packages/skill/tool-workspace-dependencies/src/index.ts` 按 `process.arch` 比对可能拒绝 primary runtime

Windows 安装器（NSIS）：仅当前用户安装（`perMachine:false`、`allowElevation:false`）、可改安装目录、`installerLanguages:['en_US','zh_CN']`、支持 `/THEME=light|dark|auto`、差分包 `differentialPackage:true`。macOS 需 Developer ID 签名 + 公证（打包侧流程，非用户侧）。

## 6 待澄清 / 未验证

- 桌面版要求账号登录，对当前用第三方 provider 的场景是否可用，未验证。
- CDN 产物未做签名/公证状态的独立验证（README 称生产发布环境负责，未下载校验）。
- `feeds/mac-x64/` 404 是「暂未发布」还是「已放弃 Intel Mac」，需看后续 release。

## 7 与本地裸 Electron 运行时的区分

`~/.dsh/electron/`（约 313 MB，version 43.3.0）**不是**官方桌面版，只是**裸 Electron 运行时**（只有 `resources/default_app.asar`，没有打包的 `app.asar`）。来源可定位到 `~/.dsh/profiles/web/node_modules/dsh-pet/scripts/ensure-electron.mjs`，该脚本注释明写「自动下载 Electron 到 `$DSH_HOME/electron`，供 dsh-pet 桌面 Helper（透明置顶窗口）使用」，走 `@electron/get`、镜像 `https://npmmirror.com/mirrors/electron/`。

即它是 **dsh-pet 插件的宠物悬浮窗运行时**，与官方桌面端无关。

> [!tip] 判别口径
> 官方桌面版是**打包好的应用**（有 `app.asar`、有安装器），而 dsh-pet 拉下来的只是裸 Electron 运行时（只有 `default_app.asar`）。看有没有 `app.asar` 即可一眼区分。

## 8 本机实测环境与数值

> 以下为**单机单次**实测记录，仅作复现参考；路径中的用户名已占位化。

| 项 | 值 |
| --- | --- |
| 实测日期 | 2026-09-25 |
| 本地 DSH | npx 安装 `@deepseek-ai/dsh@0.1.7-alpha.2`，profile 为 `web` |
| 桌面版版本 | `0.1.7-rc.2`（2026-09-24 发布） |
| `~/.dsh/electron/` | 约 313 MB，Electron `43.3.0`，时间戳 2026-09-12 19:59（dsh-pet 拉取，非官方桌面版） |
| `~/.dsh/profiles/` | 只有 `node_modules` 和 `web`，**无 `desktop`** |

实测数值：

- mac-arm64 包 372,794,444 B (~355 MiB)，最后修改 2026-09-24 14:20 UTC。
- win-x64 包 288,245,480 B (~275 MiB)，最后修改 2026-09-24 14:12 UTC。
- 下载地址实测 HTTP 200（两个平台均可达）。
- release 总数 22，全部 `prerelease=true` 且 `assets` 为 0。

## 9 相关

- [[DSH 浏览器能力与 PDF 处理]]
- [[DSH Agent Teams 与 AGENTS.md 纪律]]
- [[DSH TUI 的引入与移除]]
