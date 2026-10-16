---
tags: [Android, Magisk, mihomo, IPv6, 透明代理]
title: Box for Magisk 的 IPv6 与配置覆写
aliases: [box-ipv6-and-config-overwrite]
date created: 2026-09-16 00:52:47
date modified: 2026-10-14 23:39:00
---

# Box for Magisk 的 IPv6 与配置覆写

> [!abstract] 适用场景
> 在已 Root 的 Android 设备上用 Box for Magisk 模块运行 mihomo（Clash.Meta）TUN 透明代理，并把网络经热点共享给其他设备时，判断 `settings.ini` 的 `ipv6` 该不该打开。
> 同时说明 Box 的「自动覆写」与订阅更新会怎样**就地改写** `config.yaml`，以及为什么 fake-ip 模式下应用黑名单会失效。
> 读完可以对照检查自己的 Box 配置，避免自定义改动被模块悄悄覆盖，也避免为了消掉 IPv6 地址而误开 `ipv6=true` 造成流量泄漏。

## 1 背景与适用条件

Box for Magisk 是把 mihomo / sing-box 等代理内核以 Magisk 模块形式跑在 Android 上的封装，
配置集中在 `/data/adb/box/settings.ini`，内核配置默认位于 `/data/adb/box/clash/config.yaml`。

- 项目主页：<https://github.com/taamarin/box_for_magisk>
- 中文文档：<https://github.com/taamarin/box_for_magisk/blob/master/docs/index_zh.md>
- mihomo 内核：<https://github.com/MetaCubeX/mihomo>

**版本敏感性**：本文对 Box 脚本行为的结论基于 mihomo v1.19.x 及对应版本的 `box.service` /
`box.iptables` / `box.tool` 脚本。Box 的脚本内容随上游提交变化，升级模块后应重新核对本文引用的
代码片段是否仍然存在；以下结论基于该版本，更新版本可能变化。

**前置条件**：

- Android 设备已 Root 并安装 Magisk，Box 模块已安装且服务正常运行；
- 使用 mihomo（Clash.Meta）内核 —— sing-box 内核的配置键名与路径不同，本文结论不适用；
- `network_mode=tun`，并开启了热点共享给其他设备。

**适用范围**：判断 `ipv6` 开关是否应关闭、Box 启动时会怎样改写 `config.yaml`、订阅更新会不会冲掉自定义配置。
**不适用**：非 Root 环境、不使用 TUN 模式、或不经 Box 直接运行 mihomo 的场景。

## 2 IPv6 应该关掉吗：是，而且必须关

**结论：`settings.ini` 的 `ipv6` 保持 `false`（官方默认值就是 `false`）。**

### 2.1 决定性理由：TUN 接口根本没有 IPv6 地址

在实测环境中，mihomo 生效配置如下（见 §7）：

```text
tun.inet4-address = ['198.18.0.1/30']
tun.inet6-address = (不存在)
ipv6              = false
```

TUN 只有 IPv4 地址 → **mihomo 在架构上无法代理任何 IPv6 流量**。
因此 Box 的 `ipv6=true` 不可能把 IPv6 纳入代理，只可能开出一条**绕过代理的直连通道**
（真实 IP 泄漏 + 触发分流排除策略），有百害而无一利。

### 2.2 两层开关是独立的，别混淆

| 层 | 位置 | 作用 |
|---|---|---|
| 系统层 | `/data/adb/box/settings.ini` 的 `ipv6` | sysctl 关 IPv6 + `ip6tables` 规则 |
| 内核层 | `config.yaml` 的 `ipv6:` | mihomo 自身的 AAAA / TUN inet6 行为 |

**Box 不会把 `settings.ini` 的 `ipv6` 同步到 `config.yaml`** —— `box.service` 里负责同步的
两行是注释掉的：

```sh
  # ipv6=$(busybox awk '/ipv6:/ { print $2; found=1; exit } END{ if(!found) print "false" }' "${clash_config}")
  # sed -i "s/ipv6:.*/ipv6: ${ipv6}/g" "${clash_config}"
```

即：改一个不会带动另一个，两处都要各自确认为 `false`。

### 2.3 `ipv6=false` 时 Box 具体做了什么

`box.iptables` 的 `disable_ipv6()`：

```sh
sysctl -w net.ipv6.conf.all.forwarding=0
sysctl -w net.ipv6.conf.all.accept_ra=0
sysctl -w net.ipv6.conf.all.disable_ipv6=1
sysctl -w net.ipv6.conf.default.disable_ipv6=1
ip -6 rule add unreachable pref "${pref}"   # 关键：让 IPv6 快速失败而非黑洞
```

对比 `ipv6=true` 的 `ipv6_enable()`：打开 forwarding / accept_ra，并尝试建立
`ip6tables` 透明代理规则；**若规则建立失败，日志只记 Error，IPv6 流量照样直出**。

### 2.4 实测：IPv6 处于「可下发但不可用」的安全状态

| 观测项 | 结果 |
|---|---|
| 客户端 IPv6 地址 | 仍能通过 RA 拿到公网地址 |
| IPv6 实际建连 | 全部失败，**160ms 快速失败**（非黑洞） |
| IPv4 对照 | 8ms 成功 |
| WSL 侧 IPv6 邻居 | `fe80::... dev eth0 router FAILED` |
| 手机 DNS 的 AAAA 查询 | 返回空（已阻断）✅ |

即：客户端**能拿到** IPv6 地址，但**用不了**。因为 `ip -6 rule add unreachable`
使其快速失败，不会造成长超时拖慢应用。这是期望状态。

> [!warning] 地址仍被下发，不等于配置有误
> 地址仍被下发，说明热点侧 RA 未被完全抑制（`disable_ipv6` 只硬编码了 `wlan0`，
> 而热点接口通常是 `ap0`/`wlan1`/`swlan0`）。由于 `all`/`default` 也被置位，
> 影响有限。**不要**为了"消掉这个地址"去开 `ipv6=true`，那会直接造成泄漏。

## 3 「自动覆写」会改写 config.yaml（已用代码复刻验证）

`box.service` 在每次服务启动时**原地改写** `${clash_config}`（即 `config.yaml`）。
按 `network_mode=tun` + `proxy_mode=blacklist` 复刻其逻辑，对实测配置的**全部差异**为：

```diff
  tun:
+   exclude-package: ["<黑名单包名>", ...]
```

其余（`enhanced-mode`、`tun.stack`、各端口）均未被动过。改写后配置经真内核
`-t` 校验仍 `test is successful` ✅

### 3.1 为什么不会把 redir-host 改回 fake-ip

```sh
clash_enhanced_mode=$(busybox awk '!/^ *#/ && /enhanced-mode: / { print $2 }' "${clash_config}")
if [ -z "${clash_enhanced_mode}" ]; then
  sed -i "/^dns:/a \  enhanced-mode: fake-ip" "$clash_config"   # 仅在「缺失」时才插入
fi
```

只在 `enhanced-mode` **为空**时才插入 `fake-ip`。若实际值是 `redir-host`（非空）
→ 不触发。✅ 但这也意味着：**一旦这行被删掉，下次启动会被自动写成 fake-ip。**

### 3.2 需要警惕的两个改写细节

1. 包名注入用的是**全局无行范围**的 sed：

   ```sh
   sed -i "s/exclude-package:.*/exclude-package: []/g" "${clash_config}"
   sed -i "s/include-package:.*/include-package: []/g" "${clash_config}"
   ```

   若这两个键只出现在 `tun` 段，则无害；但若将来在别处出现同名键会被误伤。
   注意 `exclude-uid`（名字不同）**不受影响**。
2. `sed -i "/tun:/,/enable:/ { /enable: false/ s/enable: false/enable: true/ }"` ——
   在 `tun` 段内强制把 `enable: false` 改成 `true`。即**关不掉 TUN**。

### 3.3 真正的风险：订阅更新会整体替换 config.yaml

`box.tool` 的 `upsubs()`：当 `renew="true"` 时，下载的订阅**直接写入**
`${clash_config}`（即 `config.yaml`），不做合并：

```sh
if [ "${renew}" = "true" ]; then
  urls=("${subscription_url_clash[0]}")
  cfgs=("${name_provide_clash_config[0]}")
fi
...
update_file_name="${clash_config}"     # renew=true 时直写主配置
```

若同时开了 `update_subscription=true` + `renew=true`，**每次订阅更新都会冲掉
`enhanced-mode: redir-host`、`prefer-h3: false`、`DST-PORT,22` 等所有自定义改动**。

## 4 附带发现：应用黑名单在 fake-ip 下本来就不生效

Box 官方文档明确写着：

> ⚠️ 若使用 CLASH，黑白名单在 fake-ip 模式下无效

机制：被 `exclude-package` 排除的应用流量不进入 TUN，但其 DNS 仍可能被
`dns-hijack: any:53` 接管并拿到 `198.18.x.x` 假 IP —— 假 IP 在 TUN 之外不可路由，
被排除的应用反而连不上。

**切到 `redir-host` 后 DNS 返回真实 IP，被排除的应用可正常直连，
黑名单因此才真正可用。** 即这次改动顺带修好了应用黑名单。

## 5 建议核对项

```sh
su -c 'grep -E "^(ipv6|network_mode|renew|update_subscription|update_geo)" /data/adb/box/settings.ini'
su -c 'cat /data/adb/box/package.list.cfg'
su -c 'grep -nE "exclude-package|enhanced-mode|prefer-h3" /data/adb/box/clash/config.yaml'
```

- `ipv6="false"` ✅ 保持
- `renew="false"` —— 若为 true，改配置前先备份，或改用 `custom_rules_subs`
- `config.yaml` 中 `enhanced-mode: redir-host`、`prefer-h3: false` 是否还在

## 6 来源

- Box 代码：`box/scripts/box.service`、`box/scripts/box.iptables`、`box/scripts/box.tool`、`box/settings.ini`
  <https://github.com/taamarin/box_for_magisk>
- 文档：<https://github.com/taamarin/box_for_magisk/blob/master/docs/index_zh.md>
- 实测数据来自 mihomo 控制接口 `/configs`（见 §7）

## 7 本机实测环境与数值

> 以下为**单机单次**观测结果，仅用于说明量级与判定依据，换机器/换版本可能不同。

| 项 | 值 |
|---|---|
| 系统 | Android（已 Root，Magisk） |
| 模块 | Box for Magisk，配置根 `/data/adb/box/` |
| 代理内核 | mihomo v1.19.30 |
| 关键配置 | `/data/adb/box/settings.ini`、`/data/adb/box/clash/config.yaml` |
| 网络模式 | `network_mode=tun`、`proxy_mode=blacklist`、`enhanced-mode=redir-host` |
| 热点网关 | `192.168.x.1`（占位，实际以本机热点网段为准） |
| 控制接口 | `http://192.168.x.1:9090/configs` |
| TUN 地址 | `inet4-address = ['198.18.0.1/30']`，**无 inet6-address** |
| IPv6 建连耗时 | 全部失败，160ms 快速失败 |
| IPv4 建连耗时 | 8ms 成功 |
| 客户端 IPv6 | RA 仍下发公网前缀（`2408:...` 形式），但实际不可用 |
| WSL 侧邻居 | `fe80::... dev eth0 router FAILED` |

## 8 相关

- [[mihomo prefer-h3 导致 DNS 解析失败]] —— 同属 Box + mihomo 场景；该文中的 `prefer-h3` 自定义改动正是本文 §3.3 所说「会被订阅更新冲掉」的字段之一
