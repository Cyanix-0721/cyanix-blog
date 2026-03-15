---
tags: 
title: 高效命令行工具集：fzf、zoxide、ripgrep、fd、eza、bat
date created: 2025-10-08 17:02:35
date modified: 2026-03-14 09:35:24
date: 2026-03-15 02:52:39
---

# 高效命令行工具集：fzf、zoxide、ripgrep、fd、eza、bat

## 1 工具简介与安装

### 1.1 安装命令

```bash
sudo pacman -S fzf zoxide ripgrep fd eza bat
```

## 2 Fzf - 模糊查找器

> [fzf](https://github.com/junegunn/fzf) 是一个通用的命令行模糊查找器，可以用于文件、历史命令、进程等的交互式筛选。

### 2.1 Shell 集成配置

#### 2.1.1 Fish Shell

```fish
# ~/.config/fish/config.fish
fzf --fish | source
```

#### 2.1.2 Bash

```bash
# ~/.bashrc
source /usr/share/fzf/key-bindings.bash
source /usr/share/fzf/completion.bash
```

#### 2.1.3 Zsh

```zsh
# ~/.zshrc
source /usr/share/fzf/key-bindings.zsh
source /usr/share/fzf/completion.zsh
```

### 2.2 基本使用

```bash
# 查找文件
fzf

# 查找包含特定内容的文件
fzf --query "main"

# 预览文件内容
fzf --preview 'bat --color=always {}'
```

## 3 Zoxide - 智能目录跳转

> [zoxide](https://github.com/ajeetdsouza/zoxide) 是一个更快的 `cd` 命令替代品，它会学习你的使用习惯。

### 3.1 Shell 集成配置

#### 3.1.1 Fish Shell

```fish
# ~/.config/fish/config.fish
zoxide init fish | source
```

#### 3.1.2 Bash

```bash
# ~/.bashrc
eval "$(zoxide init bash)"
```

#### 3.1.3 Zsh

```zsh
# ~/.zshrc
eval "$(zoxide init zsh)"
```

### 3.2 详细使用指南

1. **基本跳转**

    ```bash
    # 跳转到包含 "project" 的目录
    z project
    
    # 跳转到精确匹配的目录（当有多个相似目录时）
    z foo bar    # 跳转到同时包含 "foo" 和 "bar" 的目录
    ```

2. **交互式查询**

    ```bash
    # 当有多个匹配项时，使用交互式选择
    zi project
    ```

## 4 Ripgrep - 更快的代码搜索

> [ripgrep (rg)](https://github.com/BurntSushi/ripgrep ) 是一个递归式的行搜索工具，比 grep 更快更友好。

### 4.1 核心特性与基本使用

```bash
# 在当前目录递归搜索
rg "搜索模式"

# 在指定文件中搜索
rg "模式" --type md

# 忽略大小写
rg -i "pattern"

# 显示上下文行
rg "模式" -A 3 -B 2  # 显示后3行和前2行

# 只显示匹配的文件名
rg -l "模式"
```

### 4.2 高级搜索技巧

1. **文件类型过滤**

    ```bash
    rg "function" -t js    # 只在 JavaScript 文件中搜索
    rg "class" -t py       # 只在 Python 文件中搜索
    rg "TODO" -T md        # 在除了 Markdown 之外的文件中搜索
    ```

2. **智能大小写匹配**

    ```bash
    rg -S "hello"    # 智能大小写（如果模式有小写就大小写敏感，否则不敏感）
    ```

3. **搜索并替换**

    ```bash
    # 查找要替换的内容
    rg "旧模式"
    # 替换（结合sed）
    rg "旧模式" -l | xargs sed -i 's/旧模式/新模式/g'
    ```

4. **与 fzf 集成的高级预览**

    ```bash
    # 正确的方式：处理 ripgrep 的输出格式
    rg --line-number "搜索词" | fzf --delimiter ":" --preview 'bat --color=always --highlight-line {2} {1}'
    ```

## 5 Fd - 简单的文件查找

> [fd](https://github.com/sharkdp/fd) 是 `find` 命令的简单、快速、用户友好的替代品。

### 5.1 基本使用

```bash
# 查找文件
fd "pattern"

# 查找特定扩展名的文件
fd -e md

# 忽略大小写
fd -i "readme"

# 查找目录
fd -t d "src"

# 查找空文件/目录
fd -t e  # 空文件
fd -t d -e  # 空目录
```

### 5.2 详细用法指南

1. **搜索控制**

    ```bash
    fd -d 3 "pattern"      # 最大深度为3
    fd -d -1 "pattern"     # 只在当前目录搜索
    fd -s "pattern"        # 大小写敏感（默认智能大小写）
    ```

2. **执行命令**

    ```bash
    # 对找到的文件执行命令
    fd -e txt -x rm        # 删除所有txt文件
    fd -e bak -X mv {} {}.old  # 重命名文件
    ```

3. **排除模式**

    ```bash
    fd -E "node_modules" "pattern"    # 排除 node_modules 目录
    fd -H "pattern"                   # 包括隐藏文件
    fd -I "pattern"                   # 不忽略.gitignore中的文件
    ```

## 6 Eza - 现代化的 Ls 替代品

> [eza](https://github.com/eza-community/eza) 是 `ls` 命令的现代化替代品，提供更好的默认值和更多功能。

### 6.1 实用别名配置

#### 6.1.1 Fish Shell

```fish
# ~/.config/fish/config.fish
alias ls="eza"
alias ll="eza -l --git"
alias la="eza -la --git"
alias lt="eza -T --git-ignore"
alias lta="eza -Ta --git-ignore"
```

#### 6.1.2 Bash

```bash
# ~/.bashrc
alias ls="eza"
alias ll="eza -l --git"
alias la="eza -la --git"
alias lt="eza -T --git-ignore"
alias lta="eza -Ta --git-ignore"
```

#### 6.1.3 Zsh

```zsh
# ~/.zshrc
alias ls="eza"
alias ll="eza -l --git"
alias la="eza -la --git"
alias lt="eza -T --git-ignore"
alias lta="eza -Ta --git-ignore"
```

### 6.2 功能详解

1. **图标支持**

    ```bash
    eza --icons          # 显示文件类型图标
    eza --icons=always   # 总是显示图标
    ```

2. **Git 集成**

    ```bash
    eza -l --git        # 显示 Git 状态
    eza -la --git       # 显示所有文件及 Git 状态
    ```

3. **树状视图**

    ```bash
    eza -T              # 树状显示
    eza -T -L 2         # 最大深度为2的树状显示
    eza --tree --git-ignore  # 忽略 .gitignore 中的文件
    ```

4. **排序和过滤**

    ```bash
    eza -s modified     # 按修改时间排序
    eza -s size         # 按文件大小排序
    eza -s name         # 按文件名排序
    eza -r              # 反向排序
    ```

## 7 Bat - 带语法高亮的 Cat

> [bat](https://github.com/sharkdp/bat ) 是 `cat` 命令的替代品，支持语法高亮、Git 集成等。

### 7.1 基本配置

#### 7.1.1 Fish Shell

```fish
# ~/.config/fish/config.fish
alias cat="bat"
```

#### 7.1.2 Bash

```bash
# ~/.bashrc
alias cat="bat"
```

#### 7.1.3 Zsh

```zsh
# ~/.zshrc
alias cat="bat"
```

### 7.2 详细使用指南

1. **主题配置**

    ```bash
    bat --list-themes           # 列出所有可用主题
    bat --theme="TwoDark" 文件  # 使用特定主题
    ```

2. **分页控制**

    ```bash
    bat --paging=always 文件    # 总是使用分页器
    bat --paging=never 文件     # 从不使用分页器（像 cat 一样）
    bat --paging=auto 文件      # 自动决定（默认）
    ```

3. **高级功能**

    ```bash
    bat -n 文件                 # 显示行号
    bat -A 文件                 # 显示所有字符（包括非打印字符）
    bat -H 42 文件              # 高亮特定行
    bat --diff 文件             # 显示 Git 差异（需要 Git）
    bat -r 10:20 文件           # 只显示特定行范围
    ```

4. **与 fzf 集成预览**

    ```bash
    # 在 fzf 预览中使用 bat
    fd -t f | fzf --preview 'bat --color=always --style=numbers {}'
    
    # 从 rg 结果预览
    rg "function" --line-number | fzf --delimiter ":" --preview 'bat --color=always --highlight-line {2} {1}'
    ```
