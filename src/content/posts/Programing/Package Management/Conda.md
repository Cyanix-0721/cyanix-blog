# Conda

## 1 什么是 Conda

Conda 是一个跨平台的 **包管理 + 环境管理工具**，常用于 Python、数据科学与机器学习场景。

常见发行版：

- Anaconda（完整科学计算套装，体积大）
    
- Miniconda（精简版，只包含 Conda）
    
- Miniforge（默认使用 conda-forge，推荐）

Arch 用户通常建议使用 **Miniforge** 或 **Miniconda**。

## 2 安装 Conda（以 Miniforge 为例）

下载并安装：

```bash
bash Miniforge3-Linux-x86_64.sh
```

安装完成后重新打开终端，或执行：

```bash
source ~/.bashrc
```

验证安装：

```bash
conda --version
```

## 3 初始化 Shell

如果 conda 命令不可用：

```bash
conda init bash
```

```zsh
conda init zsh
```

```fish
conda init fish
```

重新登录生效。

## 4 创建环境

创建 Python 3.11 环境：

```bash
conda create -n myenv python=3.11
```

创建并同时安装包：

```bash
conda create -n dataenv python=3.11 numpy pandas
```

## 5 激活与退出环境

激活环境：

```bash
conda activate myenv
```

退出环境：

```bash
conda deactivate
```

查看所有环境：

```bash
conda env list
```

或：

```bash
conda info --envs
```

## 6 删除环境

```bash
conda remove -n myenv --all
```

## 7 安装与管理软件包

安装包：

```bash
conda install numpy
```

指定版本：

```bash
conda install python=3.10
```

卸载包：

```bash
conda remove numpy
```

更新包：

```bash
conda update numpy
```

更新所有包：

```bash
conda update --all
```

## 8 使用 Conda-forge 源（推荐）

conda-forge 是社区维护的高质量源。

添加 channel：

```bash
conda config --add channels conda-forge
```

设置优先级：

```bash
conda config --set channel_priority strict
```

查看当前源：

```bash
conda config --show channels
```

## 9 导出与恢复环境

导出环境：

```bash
conda env export > environment.yml
```

根据文件创建环境：

```bash
conda env create -f environment.yml
```

更新环境：

```bash
conda env update -f environment.yml --prune
```

## 10 清理缓存

查看缓存大小：

```bash
conda info
```

清理无用缓存：

```bash
conda clean --all
```

仅清理包缓存：

```bash
conda clean --packages
```

## 11 Pip 与 Conda 混用建议

原则：

- 优先使用 `conda install`
    
- conda 没有的包再用 `pip install`
    
- pip 安装建议放在最后执行

查看 pip 安装包：

```bash
pip list
```

## 12 环境路径说明

默认环境路径：

```bash
~/miniforge3/envs/
```

base 环境：

```bash
~/miniforge3/
```

不建议在 base 环境中开发项目。

## 13 常用命令速查

|操作|命令|
|---|---|
|创建环境|`conda create -n name python=3.x`|
|激活环境|`conda activate name`|
|删除环境|`conda remove -n name --all`|
|安装包|`conda install pkg`|
|更新全部|`conda update --all`|
|导出环境|`conda env export > env.yml`|
|清理缓存|`conda clean --all`|

## 14 进阶建议（Arch 用户）

如果你偏向：

- 极简系统：使用 Miniforge
    
- 科学计算一体化：使用 Anaconda
    
- 更快解析速度：可以考虑 mamba

mamba 安装：

```bash
conda install mamba -n base -c conda-forge
```

使用方式与 conda 相同：

```bash
mamba install numpy
```
