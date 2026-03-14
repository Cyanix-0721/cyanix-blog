# Windows Installer

## 1 报错 2755

### 1.1 `win + R`

```shell
msiexec /unreg
```

```shell
msiexec /regserver
```

### 1.2 `%System_disk%/Windows`

新建文件夹 `Installer`

### 1.3 Troubleshooter

- 使用 BCUninstaller 等软件卸载并清除残留  
- 使用 [troubleshooter](https://support.microsoft.com/en-us/topic/fix-problems-that-block-programs-from-being-installed-or-removed-cca7d1b6-65a9-3d98-426b-e9f927e1eb4d) 卸载残留

### 1.4 文件加密

右键属性中高级属性取消加密

### 1.5 `SYSTEM` 权限

右键属性中安全中给予 `SYSTEM` 完全控制权限

### 1.6 `services.msc`

启用 `Windowns Installer`
