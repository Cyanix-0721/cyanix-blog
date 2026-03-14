# Windows 环境变量备份和恢复

## 1 注册表

1. `Win + R` + `regedit` 打开注册表编辑器
2. 变量
	- 系统变量  
		- 1.`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment`
	- 用户变量  
		- 1.`HKEY_CURRENT_USER\Environment`
3. 右键 `Environment` 导出 `.reg`

## 2 Shell

首先，你可以使用以下命令来列出所有的环境变量：

```
set
```

然后，你可以将输出重定向到一个文件中，以此来备份你的环境变量：

```
set > backup.txt
```

这将会创建一个名为`backup.txt`的文件，其中包含了所有的环境变量及其值。

如果你想恢复你的环境变量，你可以打开`backup.txt`文件，然后手动设置每一个环境变量。例如，如果你的`backup.txt`文件中有一行是`PATH=C:\Windows\System32`，你可以使用以下命令来设置`PATH`环境变量：

```
set PATH=C:\Windows\System32
```

如果你想从备份文件中快速恢复环境变量，你可以创建一个批处理文件（.bat或.cmd）来实现。以下是一个简单的方法：

首先，确保你的备份文件（例如`backup.txt`）的格式是这样的：

```
VAR1=value1

VAR2=value2

…
```

然后，创建一个批处理文件（例如`restore.bat`），并在其中添加以下代码：

```
@echo off

for /F "tokens=1,2 delims==" %%a in (backup.txt) do set %%a=%%b
```

这段代码会读取`backup.txt`文件中的每一行，并使用`set`命令来设置环境变量。

最后，运行`restore.bat`文件来恢复环境变量：

```
restore.bat
```

请注意，这只能恢复当前命令行会话的环境变量。如果你关闭了命令行窗口，你设置的环境变量就会丢失。如果你想永久地设置环境变量，你需要在系统的环境变量设置中进行操作。
