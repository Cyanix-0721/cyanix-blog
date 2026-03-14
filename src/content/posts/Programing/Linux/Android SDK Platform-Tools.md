# Android SDK Platform-Tools 的基础应用

> [!info]  
> [Android SDK Platform-Tools](https://developer.android.com/tools/releases/platform-tools)  
> Set system env variable `ANDROID_HOME`  
> [ADB Doc](https://developer.android.com/tools/adb?hl=zh-cn)  
> [Fastboot Doc](https://android.googlesource.com/platform/system/core/+/master/fastboot/#fastboot)  

> [!tip]  
> Fastboot: Volumn Down + Volumn Up + Power  
> Recovery: Volumn Down + Power  
> 9008 (EDL): Shutdown + Both Volumn + Connect to pc  
> SafeMode: Long Press Shutdown

## 1 ADB

### 1.1 查看设备信息

```
adb devices
```

- `adb -s <$ANDROID_SERIAL> ` 用于指定设备

### 1.2 连接设备

#### 1.2.1 `adb connect` 适用于 Android 10 及以下版本

```
adb connect <ipaddr:port>
```

#### 1.2.2 `adb pair` 仅适用于Android 11 及更高版本

- `adb pair` 使用配对码连接，安全性较高
- 配对成功后，可直接使用 `adb connect` 连接，无需再次输入配对码

```
adb pair <ipaddr:port>
```

### 1.3 断开连接

#### 1.3.1 断开当前连接

```
adb disconnect
```

#### 1.3.2 断开服务器连接

```
adb kill-server
```

- 断开后再次使用需要再次打开服务

```
adb start-server
```

### 1.4 安装应用

```
adb install <apk_file>
```

### 1.5 卸载应用

```
adb uninstall <package_name>
```

### 1.6 从设备拉取文件

```
adb pull <remote_file> <local_file>
```

### 1.7 推送文件到设备

```
adb push <local_file> <remote_file>
```

### 1.8 查看设备日志

```
adb logcat [-v tag]
```

### 1.9 启动shell

```
adb shell
```

#### 1.9.1 查看窗口信息

```
adb shell dumpsys window
```

#### 1.9.2 模拟按键事件

```
adb shell input keyevent <key_code>
```

#### 1.9.3 启动Activity

```
adb shell am start -n <activity_name>
```

#### 1.9.4 获取root权限

```
adb shell su
```

## 2 Fastboot

### 2.1 查看设备信息

```
fastboot devices
```

### 2.2 重启设备

```
fastboot reboot
```

### 2.3 刷写系统镜像

```
fastboot flash <partition> <image>
```

- 常见分区：
	- `boot`：引导镜像
	- `system`：系统镜像
	- `recovery`：恢复镜像
	- `userdata`：用户数据
	- `cache`：缓存
- 镜像文件命名规则：
	- `<partition>.img`：例如 `boot.img`、`system.img`
	- `<partition>-<target>.img`：针对特定设备的镜像，例如 `system-aosp.img`

### 2.4 刷写 Recovery 镜像

```
fastboot flash recovery <recovery_image>
```

### 2.5 进入 Recovery 模式

```
fastboot reboot recovery
```

### 2.6 锁定引导加载程序

```
fastboot oem lock
```

### 2.7 解锁引导加载程序

```
fastboot oem unlock
```

Or

```
fastboot flashing unlock
```
