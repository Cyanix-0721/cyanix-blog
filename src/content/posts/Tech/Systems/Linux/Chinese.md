---
tags: [Linux, Chinese, Font, Flatpak]
title: Chinese
date created: 2024-08-15 04:19:28
date modified: 2026-03-27 07:11:03
---

# Chinese

> [!info]  
> [Localization/Simplified Chinese - ArchWiki](https://wiki.archlinux.org/title/Localization/Simplified_Chinese)  
> [Fcitx5](https://wiki.archlinuxcn.org/wiki/Fcitx5)

## 1 Basic Chinese Support

### 1.1 Locale Settings

It is recommended to use UTF-8 locale. You need to modify `/etc/locale.gen` to set the locales that can be used in the system (erase the comment symbol "`#`" before the corresponding item):

```
en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8
```

After executing `locale-gen`, the selected locales can be used in the system. You may use `locale` to view the currently used locale(s), and `locale -a` to view the currently available locales.

### 1.2 Chinese Fonts

#### 1.2.1 Install Fonts

```bash
sudo pacman -S adobe-source-han-sans-cn-fonts adobe-source-han-serif-cn-fonts noto-fonts-cjk noto-fonts-emoji wqy-microhei wqy-microhei-lite wqy-bitmapfont wqy-zenhei ttf-arphic-ukai ttf-arphic-uming ttf-jetbrains-mono ttf-jetbrains-mono-nerd ttf-sarasa-gothic
```

#### 1.2.2 Fontconfig

modify or create `~/.config/fontconfig/fonts.conf`

```html
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>

    <match target="font">
        <edit name="rgba" mode="assign"><const>none</const></edit>
    </match>

    <alias>
        <family>sans-serif</family>
        <prefer>
            <family>JetBrainsMono Nerd Font</family>
            <family>Sarasa Gothic</family>
            <family>Source Han Sans CN</family>
            <family>Noto Sans CJK SC</family>
            <family>WenQuanYi Micro Hei</family>
            <family>Noto Color Emoji</family>
        </prefer>
    </alias>

    <alias>
        <family>serif</family>
        <prefer>
            <family>Source Han Serif CN</family>
            <family>Noto Serif CJK SC</family>
            <family>AR PL UMing CN</family>
            <family>Noto Color Emoji</family>
        </prefer>
    </alias>

    <alias>
        <family>monospace</family>
        <prefer>
            <family>JetBrainsMono Nerd Font</family>
            <family>Sarasa Gothic</family>
            <family>Noto Sans Mono CJK SC</family>
            <family>Noto Color Emoji</family>
        </prefer>
    </alias>

    <match>
        <test name="lang" compare="contains"><string>zh</string></test>
        <edit name="family" mode="prepend">
            <string>Sarasa Gothic</string>
            <string>Source Han Sans CN</string>
        </edit>
    </match>

    <match>
        <test name="lang" compare="contains"><string>en</string></test>
        <edit name="family" mode="prepend">
            <string>JetBrainsMono Nerd Font</string>
        </edit>
    </match>

    <selectfont>
        <rejectfont>
            <pattern>
                <patelt name="scalable"><bool>false</bool></patelt>
            </pattern>
        </rejectfont>
    </selectfont>

</fontconfig>
```

you have to update the font cache to take effect:

```sh
fc-cache -fv
```

## 2 Chinese Input Method

### 2.1 Install

```bash
sudo pacman -S fcitx5-im fcitx5-rime fcitx5-chinese-addons
```

要获取更好的体验，你可以根据需要安装以下模块。即使不安装，输入法在大部分的应用程序中仍可能正常工作，但你可能会遇到输入法挂起、预览窗口位置错误或没有预览的问题。

- 对于 [Qt](https://wiki.archlinuxcn.org/wiki/Qt "Qt") 程序，安装 [fcitx5-qt](https://archlinux.org/packages/?name=fcitx5-qt)<sup>包</sup>
- 对于 [GTK]( https://wiki.archlinuxcn.org/wiki/GTK "GTK") 程序，安装 [fcitx5-gtk](https://archlinux.org/packages/?name=fcitx5-gtk) <sup>包</sup>
- 对于 Qt4 程序，安装 [fcitx5-qt4-git](https://aur.archlinux.org/packages/fcitx5-qt4-git/)<sup>AUR</sup>
- 对于 Qt5 程序，安装 [fcitx5-qt5-git](https://aur.archlinux.org/packages/fcitx5-qt5-git/)<sup>AUR</sup>
- 对于 Qt6 程序，安装 [fcitx5-qt6-git](https://aur.archlinux.org/packages/fcitx5-qt6-git/)<sup>AUR</sup>
- 对于日期和时间支持，安装 [fcitx5-lua](https://archlinux.org/packages/?name=fcitx5-lua)<sup>包</sup>

**提示：通常，只需安装 [fcitx5-qt](https://archlinux.org/packages/?name=fcitx5-qt) 包和 [fcitx5-gtk](https://archlinux.org/packages/?name=fcitx5-gtk) 包就足够了。(Include in fcitx5-im)**

### 2.2 Usage

1. **创建配置目录**（如果不存在）：

   ```bash
   mkdir -p ~/.config/environment.d
   ```

2. **创建输入法环境变量配置文件**：  
   在 `~/.config/environment.d/fcitx.conf` 文件中添加以下内容：

	```conf
	# 基础输入法环境变量
	INPUT_METHOD=fcitx
	XMODIFIERS=@im=fcitx
	
	# 各框架输入法模块
	QT_IM_MODULE=fcitx
	GTK_IM_MODULE=fcitx
	SDL_IM_MODULE=fcitx
	GLFW_IM_MODULE=fcitx
	```

3. **重新登录系统**以使配置生效。

## 3 Configure

[fcitx5](https://archlinux.org/packages/?name=fcitx5) 包的配置文件位于 `~/.config/fcitx5`，尽管您可以使用文本编辑器编辑配置文件，但是使用 GUI 配置显然更方便。安装 [fcitx5-configtool](https://archlinux.org/packages/?name=fcitx5-configtool) <sup>包</sup> 软件包。**(Include in fcitx5-im)**

# 3 Fix Chinese under Flatpak

> [!info] [XDG_Desktop_Portal](https://wiki.archlinux.org/title/XDG_Desktop_Portal)  

1. **安装 `xdg-desktop-portal` 和 `xdg-desktop-portal-gtk`**  
   这些组件有助于改进 Flatpak 应用的字体渲染和整体显示效果：

   ```sh
   sudo pacman -S xdg-desktop-portal xdg-desktop-portal-gtk
   ```

2. **安装 Flatseal**  
   `Flatseal` 是一个管理 Flatpak 应用权限的工具，可以轻松调整应用的设置：

   ```sh
   flatpak install flathub com.github.tchx84.Flatseal
   ```

3. **配置 Flatpak 应用的字体访问权限**  
   使用 `Flatseal` 配置应用权限以访问系统字体：
   - 打开 `Flatseal`。
   - 在 `All Applications` 中选择你想要调整的应用。
   - 进入 `Filesystem` 选项。
   - 在 `Other files` 中添加以下路径：

	 ```
     xdg-config/fontconfig:ro
     ```

- 在 `Environment` 中添加以下变量：

	 ```
     export GDK_DPI_SCALE=1
     ```

1. **设置 DPI 环境变量**  
   在你的配置文件中添加 `GDK_DPI_SCALE` 环境变量以调整应用的 DPI 设置：
   - 编辑你的 `.profile` 或 `.bashrc` 文件，添加如下行：

	 ```bash
     export GDK_DPI_SCALE=1
     ```

   - 保存文件后，执行以下命令来应用更改：

	 ```bash
     source ~/.profile  # 或者 source ~/.bashrc
     ```
