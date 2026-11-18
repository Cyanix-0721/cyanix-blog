---
tags: [DSH, TUI, 终端界面, 插件]
title: DSH TUI 的引入与移除
aliases: [dsh-tui-status]
date created: 2026-09-25 14:04:37
date modified: 2026-11-16 13:50:00
---

# DSH TUI 的引入与移除

> [!abstract] 适用场景
> 回答「DSH 官方还会不会出 TUI / 能不能用 TUI 替代 Web」。结论：官方做过又删，别等；想要终端界面只能用第三方插件。适用于在终端里工作、想摆脱浏览器界面的人。

## 1 背景与适用条件

- DSH 的交互界面由 profile 决定；官方内置模板：`web`、`headless`、`sdk`、`sdk-minimal`、`acp`，**没有 tui**。
- 结论基于 `@deepseek-ai/dsh@0.1.7-alpha.2` 与官方仓库 master（2026-09-24）。版本敏感，升级后复核 `apps/cli/README.md`。
- 适用范围：判断官方路线、选型第三方终端前端。不适用：终端转义序列 / PTY 底层实现。

## 2 结论

**官方 TUI 不是「还没做」，而是「做过、然后被完整删除」。等官方 TUI 替代 Web 等不到。**

- 2026-07-17 引入全屏 TUI 入口 `@deepseek-ai/dsh-tui`
- 2026-08-03 删除产品入口（应用层）
- 2026-08-04 连可复用包一起删
- 当前仓库 **live TUI 代码为 0**，`packages/ui/` 不存在；npm 上查不到 `@deepseek-ai/dsh-tui`
- 官方方向：Web 是唯一交付的交互界面，Desktop 是 Electron 壳，终端侧只留 headless（一次性）+ ACP/SDK（自动化协议）

## 3 当前官方实际入口

`apps/cli/README.md` 的 Entry modes：`dsh <profile>` / `--from-default-profile` / `acp` / `headless` / `sdk` / `sdk-minimal` / `dsh web` / `dsh plugin`。内置模板 `web`、`headless`、`sdk`、`sdk-minimal`、`acp`，**无 tui**。

`dsh --profile tui` 这个名留给第三方插件，不在内置模板内（CLI README 的示例也注明「assuming the tui profile is installed」）。

> 引入 / 删除的原始决策记录已归档在官方仓库 `.agents/notes/archived/`（100% 的 TUI 相关路径都在 `/archived/` 下，无 live 代码）。此处不复制原文。

## 4 第三方替代

官方删掉后由社区填补；均为第三方代码，**未审计**：

| 插件 | Stars | 说明 |
| --- | --- | --- |
| `dsh-tui` | ★32 | Claude Code / Codex 风格终端 UI，compose over 官方 `@deepseek-ai/dsh-base` 不 fork |
| `dshline` | ★18 | 主打真实 scrollback 的终端原生前端 |
| `deepseek-harness-tui` | ★11 | 用 Ink（React for terminals）构建的终端 TUI |

`dsh-tui`（最成熟）安装：

```sh
dsh plugin --profile tui add @dsh-tui/dsh-tui
dsh --profile tui
dsh --profile tui --resume <session-id>
```

若 pnpm 拦 `prepare` 构建脚本导致 `add` 失败，把其打印的 key 追加到 `~/.dsh/profiles/tui/pnpm-workspace.yaml` 的 `allowBuilds` 后重跑。

## 5 相关

- [[DSH Web 插件聚合包]]
- [[DSH 第三方插件安全审计]]
- [[DSH Agent Teams 与 AGENTS.md 纪律]]
