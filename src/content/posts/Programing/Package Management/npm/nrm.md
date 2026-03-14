# Nrm

`nrm` 是一个用于快速切换 NPM 源的小工具，方便开发者在不同的 npm 镜像源之间切换，例如官方源、淘宝源等。以下是 `nrm` 的功能及使用方法。

---

## 1 特性

- 支持快速查看和切换常见的 npm 源
- 支持添加和删除自定义源
- 简单易用，方便开发者在网络受限的情况下切换到更快的镜像

---

## 2 安装

使用 npm 或 yarn 安装 `nrm`：

```bash
npm install -g nrm
# 或使用 yarn
yarn global add nrm
```

---

## 3 常用命令

### 3.1 查看所有源

运行以下命令查看所有可用的 npm 源：

```bash
nrm ls
```

输出示例：

```plaintext
* npm -------- https://registry.npmjs.org/
  yarn ------- https://registry.yarnpkg.com/
  taobao ----- https://registry.npmmirror.com/
  custom ----- https://your-custom-registry.com/
```

`*` 表示当前正在使用的源。

---

### 3.2 切换源

使用以下命令切换到指定的 npm 源：

```bash
nrm use <registry>
```

示例：

```bash
nrm use taobao
```

切换成功后会提示当前源。

---

### 3.3 测试源速度

测试所有源的响应速度，方便选择最快的源：

```bash
nrm test
```

输出示例：

```plaintext
* npm ----- 270ms
  yarn ---- 350ms
  taobao -- 50ms
```

---

### 3.4 添加自定义源

如果需要添加一个新的 npm 源：

```bash
nrm add <name> <url>
```

示例：

```bash
nrm add myregistry https://my-registry.com/
```

---

### 3.5 删除自定义源

删除不再使用的自定义源：

```bash
nrm del <name>
```

示例：

```bash
nrm del myregistry
```

---

### 3.6 恢复默认 Npm 源

恢复到官方 npm 源（默认）：

```bash
nrm use npm
```

---

## 4 常见问题

### 4.1 为什么切换源后无法下载依赖？

1. 确保使用 `nrm ls` 验证当前源是否正确。
2. 如果网络不稳定，可以使用 `nrm test` 测试各源的速度，选择最快的源。

### 4.2 `nrm` 支持哪些 Node.js 版本？

`nrm` 通常支持当前 LTS 版本的 Node.js，请确保 Node.js 环境正常。

---

## 5 总结

`nrm` 是一个高效、实用的工具，特别适合需要频繁切换 npm 源的开发者。通过上述命令，你可以快速管理和切换不同的 npm 源，提高开发效率。
