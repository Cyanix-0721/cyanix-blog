---
tags: [package-management, python, uv]
title: Uv
date modified: 2026-03-27 07:11:07
aliases: Uv
date created: 2026-03-04 07:12:52
---

# Uv

> [!abstract] 概览  
> `uv` 是 Astral 开发的高性能 Python 工具链，可覆盖 `pip + venv + pip-tools` 主流程。

## 安装 / 启用

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv --version
```

## 常用命令

```bash
uv venv
uv pip install requests
uv pip install -r requirements.txt
uv add fastapi
uv sync
uv run main.py
```

## 进阶用法

```bash
uv pip compile pyproject.toml
uv pip sync requirements.txt
uv tool install ruff
uv python install 3.12
```

## 注意事项

> [!tip] 迁移建议  
> 旧项目可先用 `uv pip` 兼容模式，再逐步迁移到 `pyproject.toml`。
