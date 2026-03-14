## 1 `firewalld`

```bash
# 查看当前防火墙规则
firewall-cmd --list-all

# 允许ICMP ping
firewall-cmd --zone=public --add-icmp-block=echo-request --permanent

# 添加SSH服务
firewall-cmd --zone=public --add-port=22/tcp --permanent
firewall-cmd --zone=public --add-service=ssh --permanent

# 重新加载防火墙规则使更改生效
firewall-cmd --reload
```

## 2 关闭防火墙

```bash
systemctl stop firewalld
```

## 3 开启防火墙

```bash
systemctl start firewalld
```

## 4 禁用防火墙服务

```bash  
systemctl disable firewalld
```

## 5 启用防火墙服务

```bash
systemctl enable firewalld
systemctl start firewalld
```
