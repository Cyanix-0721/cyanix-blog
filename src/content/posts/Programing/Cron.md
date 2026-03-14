---
tags:
  - Cron
---

# Cron 使用指南

## 1 简介

Cron 是类Unix系统的任务调度器，用于在预设时间间隔自动执行脚本或命令。它常用于系统维护、备份、数据处理等。

## 2 Cron 的基本概念

- **Cron Daemon**: `cron` 是一个后台进程，定期检查 `/etc/crontab` 和用户的 `crontab` 文件以执行相应任务。
- **Cron Table (crontab)**: 任务调度表，包含任务的时间安排和要执行的命令。

## 3 Cron 表达式语法

Cron 表达式由五个时间字段和一个命令字段组成。格式如下：

```
* * * * * command_to_execute
- - - - -
| | | | |
| | | | +---- 星期几 (0 - 7) (0 和 7 都表示星期天)
| | | +------ 月份 (1 - 12)
| | +-------- 日期 (1 - 31)
| +---------- 小时 (0 - 23)
+------------ 分钟 (0 - 59)
```

### 3.1 特殊字符

- `*` 代表所有可能的值。
- `,` 用于列出多个值。
- `-` 表示范围。
- `/` 用于指定步进。

### 3.2 示例

- `0 0 * * *` 每天午夜执行
- `*/15 * * * *` 每15分钟执行一次
- `0 9-17 * * 1-5` 在工作日的9点到17点，每小时执行一次

## 4 Cron 作业的管理

### 4.1 查看当前用户的cron作业

```sh
crontab -l
```

### 4.2 编辑当前用户的cron作业

```sh
crontab -e
```

### 4.3 删除当前用户的所有cron作业

```sh
crontab -r
```

### 4.4 编辑系统的cron作业

```sh
sudo vim /etc/crontab
```

## 5 示例

### 5.1 每天凌晨2点执行备份脚本

编辑用户的crontab文件并添加以下内容：

```sh
0 2 * * * /home/user/backup.sh
```

### 5.2 每周一早上8点发送提醒邮件

编辑用户的crontab文件并添加以下内容：

```sh
0 8 * * 1 /usr/bin/mail -s "Weekly Reminder" user@example.com < /home/user/reminder.txt
```

## 6 调试和日志

Cron作业的输出会通过邮件发送给用户，如果希望将输出重定向到文件，可以这样做：

```sh
0 2 * * * /home/user/backup.sh >> /home/user/backup.log 2>&1
```

查看cron日志以调试：

```sh
sudo grep CRON /var/log/syslog
```

## 7 常见问题

### 7.1 为什么我的cron作业没有执行？

1. **环境变量**: Cron作业运行在一个最小化的环境中。确保在脚本中设置必要的环境变量。
2. **路径问题**: 使用绝对路径来引用命令和文件。
3. **权限问题**: 确保脚本具有执行权限。

### 7.2 如何避免多次执行同一任务？

使用锁文件或类似机制来防止脚本的多次执行。例如：

```sh
#!/bin/bash
LOCKFILE=/tmp/backup.lock

if [ -e $LOCKFILE ]; then
    echo "Backup already running."
    exit 1
else
    touch $LOCKFILE
    /path/to/backup.sh
    rm $LOCKFILE
fi
```
