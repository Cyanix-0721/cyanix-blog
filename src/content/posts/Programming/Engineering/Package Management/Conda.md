---
tags: [package-management, python, conda, environment]
title: Conda
date modified: 2026-03-27 07:11:07
date created: 2026-03-04 06:57:26
---

# Conda

> [!abstract] 概览  
> Conda 同时负责 Python 环境管理与包管理，适合数据科学与多版本 Python 场景。

## 安装 / 启用

```bash
bash Miniforge3-Linux-x86_64.sh
source ~/.bashrc
conda --version
conda init bash
```

## 常用命令

```bash
conda create -n myenv python=3.11
conda activate myenv
conda install numpy
conda update --all
conda env list
conda deactivate
conda remove -n myenv --all
```

## 进阶用法

```bash
conda config --add channels conda-forge
conda config --set channel_priority strict
conda env export > environment.yml
conda env create -f environment.yml
```

## 注意事项

> [!warning] 混用提示
> - 优先 `conda install`，缺包时再 `pip install`。
> - pip 操作放在最后，降低解算冲突风险。
