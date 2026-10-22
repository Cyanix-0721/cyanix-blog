---
tags: [mihomo, DNS, DoH, HTTP/3, 代理]
title: mihomo prefer-h3 导致 DNS 解析失败
aliases: [mihomo-prefer-h3-dns-failure]
date created: 2026-09-16 00:40:48
date modified: 2026-10-14 23:39:00
---

# mihomo prefer-h3 导致 DNS 解析失败

> [!abstract] 适用场景
> mihomo（Clash.Meta）配置了 `dns.prefer-h3: true`，DoH 上游走代理出口时，
> 所有经代理解析的境外域名返回 SERVFAIL 或超时，而国内直连域名解析正常。
> 这篇给出症状、定位证据、修复配置与验证方法。
> 读完可以把 `prefer-h3` 关掉、给受影响的 DoH 上游逐个加 `&h3=false`，并知道如何用 mihomo 日志区分"节点问题"与"h3 路径问题"。

## 1 背景与适用条件

mihomo 的 DNS 模块支持把 DoH 上游标记为优先使用 HTTP/3（QUIC over UDP）。
`prefer-h3` 是全局开关，单个上游也可以用 `&h3=true/false` 参数独立覆盖。

- 项目主页：<https://github.com/MetaCubeX/mihomo>
- DNS 配置文档：<https://wiki.metacubex.one/config/dns/>

**版本敏感性**：本文结论基于 Mihomo Meta v1.19.29 / v1.19.30，以下结论基于该版本，
更新版本可能变化。

**前置条件**：

- mihomo 以 TUN 或透明代理方式接管流量，且 DoH 上游需要经代理出口；
- 配置文件中的 `dns.nameserver` 使用 DoH（`https://` 形式）而非纯 IP；
- 能读取 mihomo 的 debug 日志（`/logs?level=debug` 或等价途径）。

**适用范围**：诊断"境外域名全灭但代理本身通"的 DNS 故障。
**不适用**：纯直连 DoH（不经代理）的场景；DNS 上游为 `udp://` 或 `tcp://` 的场景；
故障原因是节点本身不可用的场景。

## 2 结论

`prefer-h3: true` 时，走代理出口的 DoH 上游会优先用 HTTP/3（QUIC/UDP）。
经代理的 UDP 路径不可靠时，mihomo 会反复重建 HTTP 客户端并最终放弃，
所有经代理解析的境外域名返回 SERVFAIL 或超时。
改为 `prefer-h3: false` 并给这些上游加 `&h3=false` 后恢复。

## 3 症状

- 国内域名正常解析（走 `nameserver-policy` → 国内 DNS / 直连 DoH，直连 UDP）
- 境外域名全部失败：`www.google.com` SERVFAIL(rcode=2)、`www.youtube.com` 超时
- 同一时刻经代理端口 7890 用 CONNECT 访问这些站点**正常**（说明代理本身通）
- 用 fake-ip 时被掩盖：客户端拿到 198.18.x.x 假 IP，浏览器"能连"，实际解析已失败

## 4 定位证据

1. 逐跳测试：模块入口(53)、mihomo 核心(1053) 对境外域名均失败；国内域名均正常。
2. mihomo debug 日志（`/logs?level=debug`）关键行：

   ```text
   [UDP] mihomo --> 8.8.8.8:443 using DNS连接[<节点名>]
   [https://8.8.8.8:443/dns-query] using HTTP/3 for this upstream: QUIC was faster
   [UDP] dial DNS连接 mihomo --> 8.8.8.8:443 error: ... dial tcp <ip>:<port>: i/o timeout
   [DNS Server] Exchange ;www.google.com. IN A failed: all DNS requests failed
   ```

   即：DoH 选 HTTP/3 → 需要 UDP → UDP 出不去 → 全部上游失败。
3. UDP 中继实测（SOCKS5 UDP ASSOCIATE + 真实 DNS 报文）：
   握手返回 `0x00`（声称支持）。**该测试结果不稳定**：安全软件（火绒）退出前为 `TimeoutError`，
   退出后同一测试收到 42 字节（通过）。说明此链路受本机安全软件/网络状态影响，
   不能作为"节点不支持 UDP"的定论；但无论 UDP 通与不通，h3 路径都是失败的。
4. A/B 对照（同一节点，仅改 `prefer-h3`，安全软件退出后复测仍一致）：

   | prefer-h3 | google | youtube | twitter |
   |---|---|---|---|
   | `true` | rcode=2 | rcode=2 | rcode=0 |
   | `false` | rcode=0 | rcode=0 | rcode=0 |

5. `h3=true` 日志中的真实失败点（安全软件退出后）：

   ```text
   [UDP] dial P mihomo --> 8.8.8.8:443 error: 192.168.x.1:7890 connect error: dial tcp 192.168.x.1:7890: i/o timeout
   ```

   注意是 **TCP 连代理端口本身** 超时（UDP ASSOCIATE 需要先建 TCP 控制连接）。
   h3 路径对连接建立时序更敏感，失败后 mihomo 回退 HTTP/2 但已耗尽该轮查询的
   超时预算，于是整轮报 `all DNS requests failed`。
   而 `h3=false` 全程 HTTP/2，一次成功，无回退开销。
   `twitter` 在 `h3=true` 下也成功，说明并非"全灭"，而是**成功率骤降 + 超时预算耗尽**。

## 5 修复

```yaml
dns:
  prefer-h3: false
  nameserver:
    - https://8.8.8.8:443/dns-query#DNS连接&h3=false
    - https://8.8.4.4:443/dns-query#DNS连接&h3=false
    - https://1.1.1.1:443/dns-query#DNS连接&h3=false
    - https://1.0.0.1:443/dns-query#DNS连接&h3=false
```

`h3=` 是每个上游的独立覆盖参数，**优先级高于全局 `prefer-h3`**，必须一并改。
国内直连上游（`h3=true` 的 223.5.5.5 等）走直连 UDP，不受影响，可保留。

## 6 验证

用真内核 `Mihomo Meta v1.19.29` 加载修复后配置，查询 8 个域名：8/8 成功
（google / youtube / twitter / cloudflare / wikipedia / github / baidu / qq）。
复测条件：安全软件已退出（见 §8）。

## 7 安全软件影响（重要）

排查期间本机安全软件曾拦截流量，导致早期"UDP 完全不通"的判断不可靠。
安全软件退出后 UDP 中继转为可用，但 `prefer-h3: true` 的失败**依然稳定复现**，
故结论不依赖安全软件状态。若后续再出现解析异常，应首先确认安全软件是否放行
`verge-mihomo.exe` / `wslrelay.exe` / `wslhost.exe` 的 UDP 出入站。

## 8 备注

- 该问题与 `fake-ip` vs `redir-host` **无关**。fake-ip 下假 IP 让客户端以为解析成功，
  掩盖了故障；切到 `redir-host` 后真实 IP 必须由 mihomo 解析出来，故障才暴露。
- 排查时注意 WSL 存在 host 级 DNS 劫持（`dnsTunneling=true`），
  直接查 `8.8.8.8` 之类会被 WSL 拦截，**不能**用来判断 mihomo 的解析行为，
  须用可区分的对照池或直接看 mihomo 日志。

## 9 本机实测环境与数值

> 以下为**单机单次**观测结果，仅用于说明量级与判定依据，换机器/换版本可能不同。

| 项 | 值 |
|---|---|
| 客户端系统 | Windows + WSL2（`dnsTunneling=true`） |
| 代理内核 | mihomo（Mihomo Meta）v1.19.29 / v1.19.30 |
| 部署形态 | Android Box 模块 TUN + 热点共享，或 Windows 侧 verge-mihomo |
| 代理端口 | `192.168.x.1:7890` |
| DNS 上游 | `8.8.8.8` / `8.8.4.4` / `1.1.1.1` / `1.0.0.1`（经代理），223.5.5.5 等（直连） |
| 安全软件 | 火绒（曾拦截 UDP，退出后复测） |
| 验证结果 | 8 个域名 8/8 成功 |

## 10 相关

- [[Box for Magisk 的 IPv6 与配置覆写]] —— 同属 Box + mihomo 场景；该文 §3.3 说明 `prefer-h3: false` 这类自定义改动会在 `renew=true` 的订阅更新中被整体冲掉
