# VirtualBox

## 1 Error in Supr3

* 报错 `Error relaunching VirtualBox VM process:5`  
* 解决方法
	* 安装目录下 `drivers\vboxsup\VBoxSup.inf` 右键安装
	* `regedit` 打开注册表
	* `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\VBoxSup ` 的 ` Start ` 值改为 ` 2 `
	* 关闭 `Hyper-V` `bcdedit /set hypervisorlaunchtype off`
