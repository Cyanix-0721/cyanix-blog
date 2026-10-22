---
tags: [SSH, GitHub, 网络排查, Security]
title: GitHub SSH 22 端口被封改用 443
aliases: [github-ssh-port22-blocked-use-443]
date created: 2026-09-16 01:31:25
date modified: 2026-10-14 23:39:00
---

# GitHub SSH 22 端口被封改用 443

> [!abstract] 适用场景
> 当 `git push` 或 `ssh -T git@github.com` 报 `kex_exchange_identification: Connection closed by remote host` 时，这篇帮你判断它到底是网络、认证还是服务器拒绝，并给出改用 GitHub 官方备用端点 `ssh.github.com:443` 的修法与限制。读完你能在几分钟内区分三类 SSH 报错，并知道换代理节点为什么「看起来有效」却治不了根。

## 1 背景与适用条件

- **`ssh.github.com:443`** 是 GitHub 官方提供的备用 SSH 端点：把 SSH 流量承载在 443 端口上，用于绕过对 22 端口的封锁。官方文档：[Using SSH over the HTTPS port](https://docs.github.com/en/authentication/troubleshooting-ssh/using-ssh-over-the-https-port)。
- **为什么会被封**：GitHub 对机房 / 代理 IP 段的 22 端口有选择性封锁。封锁发生在 **SSH banner 交换之前**，表现为 TCP 能建连但服务器立刻断开。
- **版本敏感**：以下结论基于 Windows OpenSSH 10.x、WezTerm `nightly-20260327`、mihomo `v1.19.30` 的实测环境；OpenSSH 与各终端模拟器对 agent 变量的处理可能随版本变化。
- **前置条件**：能访问 `ssh.github.com:443` 的出网环境；本地 SSH 客户端；`~/.ssh/config` 可写。
- **适用范围**：普通 `github.com` 仓库。
- **不适用（官方明确声明）**：
  - **GitHub Enterprise Server** 不支持经 HTTPS 端口走 SSH；
  - **GitHub Enterprise Cloud with data residency** 同样不支持。

## 2 结论

`git push` / `ssh -T git@github.com` 报 `kex_exchange_identification: Connection closed by remote host`，**不是**认证、密钥或代理问题，而是 GitHub 拒绝了该**出口 IP 的 22 端口**。

改用 GitHub 官方备用端点 `ssh.github.com:443` 后，与出口 IP 无关，问题消失。

## 3 症状与关键判据

```text
debug1: Connecting to github.com [20.205.243.166] port 22.
debug1: Connection established.                              ← TCP 已建立
kex_exchange_identification: Connection closed by remote host ← 服务器主动断开
Connection closed by 20.205.243.166 port 22
```

**判据：`Connection established` 之后才断** → 网络与代理均正常，是服务器在发送 SSH banner 之前主动关闭连接。

对比三种错误的含义，避免误判方向：

| 报错 | 含义 |
| --- | --- |
| `Connection established` + `kex_exchange_identification` | **服务器拒绝该 IP 的 22 端口**（本案例） |
| `Permission denied (publickey)` | 网络通、SSH 协议通，**只是密钥不被接受** |
| `Connection timed out` / `Connection refused` | 网络或代理不通 |

## 4 决定性对照

同一出口 IP、同一密钥，只换端点：

| 端点 | 结果 |
| --- | --- |
| `github.com:22` | ❌ `kex_exchange_identification: Connection closed by remote host` |
| `ssh.github.com:443` | ✅ `Hi <github-user>! You've successfully authenticated` |

同一 IP 下 443 成功而 22 失败 → 排除密钥、agent、透明代理、防火墙。

## 5 为什么「换节点」看起来有效

长期使用中常有一种经验是「SSH 到 GitHub 经常需要换节点」。真实机制是：

- GitHub 对**机房 / 代理 IP 段**的 22 端口有选择性封锁；
- 换节点 = 换出口 IP → 碰巧换到未被封的 IP → 于是「成功」；
- 走 443 后与出口 IP 无关，**所有节点都能用**（在实测环境中确认：改用 443 后此前不可用的节点也可用）。

即：**换节点从来不是解决办法，只是绕开被封的 IP。**

## 6 修复

改 `~/.ssh/config`（chezmoi 管理的源文件为 `private_dot_ssh/config.tmpl`）：

```sshconfig
Host github.com
    User git
    HostName ssh.github.com
    Port 443
```

**不需要改 remote URL**（仍是 `git@github.com:...`），ssh 会自动改写目标。
GitHub 官方文档确认 `ssh.github.com:443` 是标准备用端点，并给出同一写法。

### 6.1 known_hosts 注意

`ssh.github.com` 需已在 `known_hosts` 中，否则 `StrictHostKeyChecking=yes` 会失败。若缺失，可显式固定主机名：

```sshconfig
Host github.com
    User git
    HostName ssh.github.com
    Port 443
    HostKeyAlias github.com
```

## 7 前置障碍：终端模拟器遮蔽 Windows SSH agent

排查 22 端口前可能先遇到一个独立问题，容易被误认为「密钥丢失」：

```text
ssh-add -l → Error connecting to agent: No such file or directory
```

**根因**：WezTerm 的 mux 功能会注入 `SSH_AUTH_SOCK`，指向一个不存在的 unix socket：

```text
SSH_AUTH_SOCK = C:\Users\<user>\.local\share\wezterm\agent.16836
```

该文件**不存在**（目录里只有 `gui-sock-*`）。Windows OpenSSH 的逻辑是**一旦 `SSH_AUTH_SOCK` 被设置就优先使用，不再回退到命名管道** `\\.\pipe\openssh-ssh-agent`，于是真实 agent 被完全遮蔽。

### 7.1 验证

| 实验 | 结果 |
| --- | --- |
| `SSH_AUTH_SOCK` 指向 wezterm 路径 | ❌ `Error connecting to agent` |
| `SSH_AUTH_SOCK='\\.\pipe\openssh-ssh-agent'` | ❌ 仍失败（Windows OpenSSH **不接受命名管道作为该变量值**） |
| 移除该变量 | ✅ `256 SHA256:<fingerprint> (ED25519)` |
| `wezterm cli list-clients` | `SSH_AUTH_SOCK` 列为**空**（mux 内无可用 agent） |

### 7.2 修复（`dot_wezterm.lua`）

```lua
local is_windows = wezterm.target_triple:find('windows') ~= nil

-- Windows: WezTerm 注入的 SSH_AUTH_SOCK 指向不存在的 unix socket，
-- 反而遮蔽真实的 Windows agent（走命名管道 \\.\pipe\openssh-ssh-agent），
-- 导致 ssh-add / ssh 报 "No such file or directory"。仅 Windows 关闭；
-- Linux/macOS 保留该功能（mux 可跨端转发 agent）。
if is_windows then
    config.mux_enable_ssh_agent = false
end
```

要点：

1. **正确选项名是 `mux_enable_ssh_agent`**（不是 `ssh_auth_sock`，后者不存在——写错会报 `is not a valid Config field`）。文档：[mux_enable_ssh_agent](https://wezterm.org/config/lua/config/mux_enable_ssh_agent.html)，相关讨论见 [wezterm#5541](https://github.com/wezterm/wezterm/discussions/5541)。
2. **加 `is_windows` 限定**：该功能在 Linux/macOS 上正常且有用（mux 可跨端转发 agent），只在 Windows 上因 agent 机制不同而有害。
3. **必须完全退出终端再启动**：常驻 mux server 的环境变量在启动时固定，新开窗口只连旧 server，不重读配置。验证：`Get-Process wezterm-gui` 应无输出。

## 8 排查纪律

1. **必须在真实路径上验证**。若本机是「手机透明代理 + 热点共享」这类场景，直连代理端口（如 `7890`）属于**旁路**，可能走不同出口，结论不可信。正确做法是在真实链路上跑 `ssh -vv`，观察端到端行为。
2. **`-vv` 的分阶段输出是定位关键**：`Connection established` 与 `kex_exchange_identification` 的先后顺序，直接区分了「网络问题」与「服务器拒绝」。
3. **安全软件会污染测量**：某些杀软 / 防火墙会拦截 UDP，导致早期「UDP 完全不通」的错误结论。诊断网络时应确认安全软件状态，或将其排除在变量之外。
4. **不要凭一次超时就下结论**：曾据「22 端口拿不到 banner」误判为「节点不支持 22」，后被真实的 `Permission denied (publickey)` 推翻——那时 22 其实是通的。

## 9 验证清单

```bash
# 在真实链路上执行
ssh -vv -T git@github.com          # 应显示 Hi <github-user>! successfully authenticated
git push                            # 应成功
```

## 10 本机实测环境与数值

> [!warning] 单机单次结果
> 以下为一次实测环境中的观察值，仅用于复现排查思路；出口 IP、节点与网络路径因人而异。

| 项 | 值 |
| --- | --- |
| 客户端 | Windows OpenSSH `10.x` |
| 终端模拟器 | WezTerm `nightly-20260327` |
| 代理 | mihomo `v1.19.30` |
| 出口 IP（代理节点） | `<ip>` |
| 被拒端点 | `github.com:22` → `kex_exchange_identification: Connection closed by remote host` |
| 可用端点 | `ssh.github.com:443` → 认证成功 |
| `known_hosts` | 已含 `ssh.github.com`，`StrictHostKeyChecking=yes` 可非交互通过 |
| 配置文件 | `~/.ssh/config`（chezmoi 源：`private_dot_ssh/config.tmpl`） |

## 11 相关

- [[SSH 密钥管理与配置指南]]
- [[Git]]
- [[HTTP & HTTPS]]
- [[chezmoi]]
- [[Betterleaks 与 chezmoi 跨平台部署]]
