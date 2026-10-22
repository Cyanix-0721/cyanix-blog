---
tags: [DSH, TUI, 终端界面, 插件]
title: DSH TUI 的引入与移除
aliases: [dsh-tui-status]
date created: 2026-09-25 14:04:37
date modified: 2026-10-14 23:39:00
---

# DSH TUI 的引入与移除

> [!abstract] 适用场景
> 回答「DSH 官方还会不会出 TUI / 能不能用 TUI 替代 Web 界面」这一问题。
> 适用于在终端里工作、希望摆脱浏览器界面，或打算选一个第三方终端前端插件的读者。
> 读完能知道官方 TUI 的真实状态、官方保留的入口有哪些，以及社区替代方案的现状与未验证项。

## 1 背景与适用条件

- **TUI**（Terminal User Interface）指在终端内绘制的全屏交互界面，
  区别于逐行输出的 CLI，也区别于浏览器里的 Web GUI。
- **DSH**（DeepSeek Harness，`@deepseek-ai/dsh`）的交互界面由 profile 决定；
  官方内置模板为 `web`、`headless`、`sdk`、`sdk-minimal`、`acp`。
- 本文结论基于 CLI `@deepseek-ai/dsh@0.1.7-alpha.2` 与官方仓库 master
  （最新 push 2026-09-24T14:10:21Z）。**版本敏感**：官方入口表与内置 bundle 白名单
  随版本变化，升级后请重新核对 `apps/cli/README.md`。
- 前置条件：需要能访问官方仓库与 npm registry 以复核证据；
  安装第三方 TUI 插件需要可用的 Node 与 pnpm（插件经 `dsh plugin` 转发 pnpm 安装）。
- **适用范围**：判断官方路线与选型第三方终端前端。
  **不适用**：终端转义序列 / PTY 的底层实现细节。

## 2 结论

**官方 TUI 不是「还没做」，而是「做过、然后被完整删除」。** 等官方 TUI 替代 Web 等不到。

- 全屏 TUI 入口 `@deepseek-ai/dsh-tui` 于 2026-07-17 引入
- 2026-08-03 删除产品入口（应用层）
- 2026-08-04 连可复用包本身一并删除
- 当前仓库中 **live TUI 代码为 0**，`packages/ui/` 目录不存在
- npm 上 `@deepseek-ai/dsh-tui` 查不到（HTTP 200 但 body 为空 / JSON 解析失败）

## 3 时间线与一手证据

### 3.1 2026-07-17 引入：独立的全屏 TUI 入口

`.agents/notes/archived/feature/2026-07-17-dedicated-full-screen-tui-front-door.zh.md`

- Status: implemented / **Archived: 2026-08-04**
- 原文：「DeepSeek Harness 将 `@deepseek-ai/dsh-tui` 作为独立的 Cordis 插件交付。该插件只负责终端
  输入与呈现；agent 生命周期、会话持久化、工具执行以及模型可见的提问工具仍由不同组合项负责。
  插件要求 stdin 和 stdout 均为 TTY；条件不满足时会失败，不会静默切换为逐行输出。」
- 该 Note 开头已自述：「可复用的 TUI 包（package）仍然保留实现，但 `dsh` 不再将其作为应用入口交付」

### 3.2 2026-08-03 删除产品入口

`.agents/notes/archived/simplification/2026-08-03-explicit-config-dsh-entrypoint.zh.md`

- Status: implemented / **Archived: 2026-08-08**
- 原文：「CLI 不再交付 TUI 应用。TUI overlay、启动器、首次运行 onboarding 资产、应用级 TUI fixture、
  PTY harness、终端流程和快照均已删除。」
- 同时删除：`meta` 与 `upgrade` 子命令、实验功能门禁、默认 surface 恢复入口、`--config-replace` 路径
- 「安装器不再提供界面选择器，只构建并启动 Web。」
- 原因：裸 `dsh` 隐式选 TUI，使一条命令同时负责终端生命周期、会话身份与恢复移交、onboarding、
  workspace 快捷入口、升级会话、个人配置监听，以及整套 PTY 与 transcript 快照测试

### 3.3 2026-08-04 全包移除

`.agents/notes/archived/simplification/2026-08-04-remove-tui-package.zh.md`

- 英文版原文：「DeepSeek Harness has no terminal UI package. Existing imports and `cordis.yml` rows
  that depend on the package fail instead of being translated. Web remains the shipped interactive
  surface; ACP, JSON-RPC, and one-shot CLI remain the non-Web entry points.」
- 中文版原文：「DeepSeek Harness 不再提供终端 UI 包。现有 import 和依赖该包的 `cordis.yml` 条目会
  直接失败，不会得到兼容转换。」
- **重新引入的门槛（关键）**：「重新引入终端前端时，必须为其提供具名产品或部署、显式包边界、
  具体交互提供方，以及组装后的生命周期与 transcript（文本记录）验收。」
- 保留的能力（可供其他宿主使用）：提供方无关的命令、用户交互、审批、工具呈现、PTY、会话投影

## 4 穷举验证（官方仓库 master）

对 `git/trees/master?recursive=1`（15778 项，truncated=False）做字符串 `"tui"`（不区分大小写）匹配：

- 命中 **120** 个路径
- 其中位于 `/archived/` 下的：**120**（100%）
- **非归档（live）路径：0**
- `packages/ui/` 前缀：**不存在**
- `apps/` 下只剩四个：`cli`、`desktop`、`desktop-host`、`web`

即仓库里所有 TUI 相关内容都是历史决策记录，没有一行 live 代码。

## 5 当前官方实际提供的入口

`apps/cli/README.md`（`apps/cli/package.json` version = `0.1.7-rc.2`）的 Entry modes 表：

| Command | Purpose |
|---|---|
| `dsh <name>` / `dsh --profile <name>` | 启动 `$DSH_HOME/profiles/<name>` 下的 profile |
| `dsh --profile <name> --from-default-profile <template>` | 从内置模板建自定义 profile 并启动 |
| `dsh --profile acp` | ACP stdio 自动化服务 |
| `dsh --profile headless "job"` | 跑一次持久会话，打印最终答案后退出 |
| `dsh --profile sdk` | JSON-RPC stdio SDK 服务 |
| `dsh --profile sdk-minimal` | 独立最小 agent 树的 SDK 服务 |
| `dsh web` | 启动 Web profile |
| `dsh plugin --profile <name> <pnpm args>` | 管理 profile 插件（转发 pnpm） |

自动初始化的内置 profile 模板：`web`、`headless`、`sdk`、`sdk-minimal`、`acp`。**没有 tui。**

CLI README 中仍有示例 `dsh --profile tui --resume <id>`，但行内注释明确写
「example, **assuming the tui profile is installed**; --resume belongs to the terminal app」——
该 profile 名留给第三方插件，不在内置模板内。

内置 bundle 白名单：`@deepseek-ai/dsh-base`、`@deepseek-ai/dsh-web-app`、`@deepseek-ai/dsh-headless`、
`@deepseek-ai/dsh-sdk-app`、`@deepseek-ai/dsh-sdk-minimal`、`@deepseek-ai/dsh-acp-app`。

## 6 方向判断

官方布局已明确：**Web 是唯一交付的交互界面，Desktop 是 Electron 壳，终端侧只保留
headless（一次性）与 ACP/SDK（自动化协议）**。用户设想的「用 TUI 代替 Web」与官方方向相反——
官方是用 Web/Desktop 代替了 TUI。

## 7 第三方替代（官方删掉后由社区填补）

来源：DSH 插件市场按 star 排序检索（topic `dsh-plugin`）。均为第三方代码，未经审计。

| 插件 | Stars | 说明 |
|---|---|---|
| `dsh-tui` | ★32 | Claude Code / Codex 风格终端 UI，基于 `@earendil-works/pi-tui`，作为 out-of-tree dsh plugin bundle |
| `dshline` | ★18 | 主打真实 scrollback 的终端原生前端，进程内直接消费 Harness 能力 |
| `deepseek-harness-tui` | ★11 | 用 Ink（React for terminals）构建的终端交互 TUI |

### 7.1 dsh-tui 细节（最成熟的一个）

- npm 包 `@dsh-tui/dsh-tui`，dist-tags: `latest = 0.1.2`
- engines: `node: ^22.19 || >=24`
- 关键设计：**compose over 官方 `@deepseek-ai/dsh-base` 而不 fork**，因此工具、skills、子代理、
  工作流、沙箱审批与官方 Web surface 是同一套
- 功能：流式输出与推理（Markdown 渲染）、工具调用卡片（terminal / diff / generic，Ctrl+O 循环
  折叠 → 展开 → 隐藏）、审批与 `ask_user_question` 对话（含 plan-mode review）、`@file` 路径补全、
  `@session` 引用卡片、斜杠命令（`/model` 含 reasoning-effort 选择、`/resume`、`/compact`、
  `/details`、`/help`，以及其它插件注册的命令）、todo 面板、token 用量与上下文压力状态栏、
  会话标题、可配置主题、从 `COLORTERM` 检测 truecolor
- 安装：

  ```sh
  dsh plugin --profile tui add @dsh-tui/dsh-tui
  dsh --profile tui
  dsh --profile tui --resume <session-id>
  ```

- 若 pnpm 拦截 `prepare` 构建脚本导致 `add` 失败，把其打印的 key 追加到
  `~/.dsh/profiles/tui/pnpm-workspace.yaml` 的 `allowBuilds` 后重跑：

  ```yaml
  allowBuilds:
    "@dsh-tui/dsh-tui": true
  ```

- 跟踪仓库而非 npm 发布：`add github:dsh-tui/dsh-tui`

## 8 未验证

- 三个第三方插件的源码均**未审计**（安全性、依赖树、权限范围）
- `dshline` 与 `deepseek-harness-tui` 未获取 README 细节，仅凭市场描述
- 未实际安装运行任一插件，兼容性未实测
- `@deepseek-ai/dsh-tui` npm 查询返回空 body 而非明确 404，原因未深究（可能为 unpublish 后残留）

## 9 本机实测环境与数值

> 以下为单机单次实测结果，仅用于说明结论的取证来源；换机器 / 换版本后需重新核对。

| 项 | 值 |
| --- | --- |
| OS / 运行环境 | WSL2 Linux |
| DSH CLI | `@deepseek-ai/dsh@0.1.7-alpha.2` |
| Node | `v26.9.0`（满足 `@dsh-tui/dsh-tui` 的 `^22.19 \|\| >=24`） |
| 官方仓库 master 快照 | 最新 push 2026-09-24T14:10:21Z，tree 项数 15778 |
| `"tui"` 匹配路径数 | 120（其中 `/archived/` 下 120，live 0） |
| `apps/cli/package.json` version | `0.1.7-rc.2` |

## 10 相关

- [[DSH 官方桌面版]]
- [[DSH Web 插件聚合包]]
- [[DSH 第三方插件安全审计]]
- [[DSH Agent Teams 与 AGENTS.md 纪律]]
