# Uv

## 1 什么是 Uv

uv 是由 Astral 开发的下一代 Python 包管理工具。

特点：

- 极快（Rust 编写）
    
- 兼容 pip
    
- 内置虚拟环境管理
    
- 支持锁文件
    
- 可替代 pip + venv + pip-tools

适合追求极简与高性能的开发环境（尤其 Arch / Linux 用户）。

## 2 安装 Uv

### 2.1 官方安装方式

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

或使用 pip 安装：

```bash
pip install uv
```

验证：

```bash
uv --version
```

## 3 创建虚拟环境

创建环境：

```bash
uv venv
```

默认生成 `.venv` 目录。

指定 Python 版本：

```bash
uv venv --python 3.11
```

激活环境：

```bash
source .venv/bin/activate
```

fish 用户：

```fish
source .venv/bin/activate.fish
```

## 4 安装包

安装包（自动创建 venv 并安装）：

```bash
uv pip install requests
```

安装指定版本：

```bash
uv pip install flask==3.0.0
```

安装 requirements 文件：

```bash
uv pip install -r requirements.txt
```

## 5 锁定依赖（推荐用法）

生成锁文件：

```bash
uv pip compile pyproject.toml
```

或：

```bash
uv pip compile requirements.in
```

生成：

```
requirements.txt
```

同步环境（严格按锁文件安装）：

```bash
uv pip sync requirements.txt
```

优点：

- 可复现
    
- 适合生产环境
    
- 类似 pip-tools 但更快

## 6 使用 pyproject.toml（现代方式）

创建项目：

```bash
uv init
```

会生成：

```
pyproject.toml
```

添加依赖：

```bash
uv add fastapi
```

开发依赖：

```bash
uv add pytest --dev
```

安装依赖：

```bash
uv sync
```

## 7 运行 Python 程序

直接运行：

```bash
uv run main.py
```

等价于：

```
python main.py
```

但会自动管理虚拟环境。

## 8 删除环境

删除虚拟环境：

```bash
rm -rf .venv
```

uv 不会创建全局污染环境。

## 9 全局工具安装

类似 pipx：

```bash
uv tool install ruff
```

运行：

```bash
ruff --version
```

卸载：

```bash
uv tool uninstall ruff
```

## 10 Python 版本管理

uv 可自动下载 Python：

```bash
uv python install 3.12
```

查看已安装版本：

```bash
uv python list
```

设置本项目版本：

```bash
uv python pin 3.11
```

## 11 常用命令速查

|操作|命令|
|---|---|
|创建环境|`uv venv`|
|安装包|`uv pip install pkg`|
|同步锁文件|`uv pip sync requirements.txt`|
|添加依赖|`uv add pkg`|
|运行脚本|`uv run script.py`|
|安装全局工具|`uv tool install pkg`|
|安装 Python|`uv python install 3.x`|

## 12 Uv vs Pip + Venv

|对比|uv|pip + venv|
|---|---|---|
|速度|极快|慢|
|锁文件|原生支持|需 pip-tools|
|Python 管理|内置|需 pyenv|
|全局工具|内置|需 pipx|
|现代项目支持|强|一般|
