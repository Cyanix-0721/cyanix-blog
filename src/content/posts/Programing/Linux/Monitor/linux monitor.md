# Linux Monitor

在 Arch Linux 上，有几款软件可以方便地查看 CPU/GPU 的温度、频率、风扇转速等信息，并进行调整。以下是一些常用的工具：

## 1 **`lm_sensors`**

   - **功能**：`lm_sensors` 是一个命令行工具，用于检测并显示系统的温度、风扇转速和电压等传感器数据。
   - **安装**：可以通过 Pacman 包管理器安装：

	 ```bash
     sudo pacman -S lm_sensors
     ```

   - **使用**：安装后，运行以下命令检测传感器：

	 ```bash
     sudo sensors-detect
     ```

	 然后运行：

	 ```bash
     sensors
     ```

	 以查看系统传感器的信息。

## 2 **`fancontrol`**

   - **功能**：`fancontrol` 是一个用于管理和调整风扇转速的工具。它可以与 `lm_sensors` 配合使用。
   - **安装**：同样通过 Pacman 安装：

	 ```bash
     sudo pacman -S fancontrol
     ```

   - **使用**：首先使用 `pwmconfig` 进行配置：

	 ```bash
     sudo pwmconfig
     ```

	 之后可以通过 `fancontrol` 启动风扇控制。

## 3 **`nvtop`**

   - **功能**：`nvtop` 是一个监控 NVIDIA GPU 的工具，可以显示 GPU 使用情况、温度、风扇转速和频率等信息。
   - **安装**：

	 ```bash
     sudo pacman -S nvtop
     ```

   - **使用**：安装后，直接运行 `nvtop` 查看 NVIDIA GPU 的详细信息。

## 4 **`psensor`**

   - **功能**：`psensor` 是一个图形化工具，可以监控 CPU/GPU 的温度、风扇转速等信息。
   - **安装**：

	 ```bash
     sudo pacman -S psensor
     ```

   - **使用**：安装后，在桌面环境中启动 `psensor` 即可。

## 5 **`CoreCtrl`**

   - **功能**：`CoreCtrl` 是一个强大的图形化工具，支持 AMD 和 NVIDIA GPU 的调整和监控，包括频率调整、风扇控制等。
   - **安装**：

	 ```bash
     sudo pacman -S corectrl
     ```

   - **使用**：安装后，运行 `corectrl`，在 GUI 中配置并监控硬件。

## 6 **`GWE` (Green With Envy)**

   - **功能**：`GWE` 是一个 NVIDIA GPU 的图形化工具，支持温度监控、风扇调速、频率调整等功能。
   - **安装**：

	 ```bash
     sudo pacman -S gwe
     ```

   - **使用**：安装后，通过运行 `gwe` 启动界面。

## 7 **`Ryzen Controller`**

   - **功能**：专为 AMD Ryzen 处理器设计的工具，允许用户调整 CPU 的功耗、温度限制等参数。
   - **安装**：需要从 AUR 安装：

	 ```bash
     yay -S ryzen-controller
     ```

   - **使用**：安装后，通过 `ryzen-controller` 启动图形界面进行调整。

## 8 总结

- 如果你想通过命令行监控，可以使用 `lm_sensors`、`nvtop`。
- 如果你偏好图形化界面，`psensor`、`CoreCtrl`、`GWE` 是很好的选择。
- 对于风扇控制和更高级的调整，`fancontrol` 和 `Ryzen Controller` 是不错的工具。
