# Npm

`npm` 是 Node.js 的包管理工具，用于管理 JavaScript 项目的依赖库、脚本命令等功能。以下内容详细介绍了常用的 npm 命令。

---

## 1 基本命令

### 1.1 初始化项目

```bash
npm init
npm init -y
```

- `npm init`：引导式初始化，会逐步询问项目名称、版本、描述等信息，生成 `package.json` 文件。
- `npm init -y`：快速初始化，跳过询问，使用默认配置生成 `package.json`。

### 1.2 安装依赖

```bash
npm install <package>
npm install <package>@<version>
npm install <package> --save
npm install <package> --save-dev
npm install
```

- `npm install <package>`：安装指定依赖到当前项目（默认安装最新版本）。
- `npm install <package>@<version>`：安装指定版本。
- `npm install <package> --save`：保存为生产依赖（`dependencies`）。
- `npm install <package> --save-dev`：保存为开发依赖（`devDependencies`）。
- `npm install`：安装 `package.json` 中定义的所有依赖。

### 1.3 卸载依赖

```bash
npm uninstall <package>
npm uninstall <package> --save
npm uninstall <package> --save-dev
```

- `npm uninstall <package>`：卸载指定依赖。
- `--save` 和 `--save-dev`：从 `dependencies` 或 `devDependencies` 中删除对应记录。

### 1.4 更新依赖

```bash
npm update <package>
```

- 更新指定依赖包到最新的小版本（`^` 范围内）。

### 1.5 全局安装和卸载

```bash
npm install -g <package>
npm uninstall -g <package>
```

- `-g` 选项：安装/卸载为全局依赖，可以在命令行中直接调用。

---

## 2 包管理相关命令

### 2.1 列出已安装的依赖

```bash
npm list
npm list -g
```

- `npm list`：列出当前项目中已安装的依赖包。
- `npm list -g`：列出全局安装的依赖包。

### 2.2 检查过时依赖

```bash
npm outdated
```

- 显示当前项目中过时的依赖包，包括当前版本、最新版本、可接受的版本范围等信息。

### 2.3 检查包信息

```bash
npm view <package>
```

- 查看指定包的详细信息，如版本、依赖关系等。

### 2.4 清除缓存

```bash
npm cache clean --force
npm cache verify
```

- `npm cache clean --force`：强制清除缓存。
- `npm cache verify`：验证缓存的完整性。

---

## 3 项目脚本命令

### 3.1 运行脚本

```bash
npm run <script>
```

- `npm run <script>`：运行 `package.json` 中 `scripts` 定义的命令。
- 常见脚本如：
    - `npm run start`：启动项目。
    - `npm run build`：构建项目。
    - `npm run test`：运行测试。

### 3.2 列出脚本

```bash
npm run
```

- 显示 `package.json` 中定义的所有脚本命令。

---

## 4 发布与版本管理

### 4.1 发布包

```bash
npm publish
```

- 将当前项目发布到 npm 注册表（需已登录 `npm`）。

### 4.2 登录与登出

```bash
npm login
npm logout
```

- `npm login`：登录 npm。
- `npm logout`：登出 npm。

### 4.3 修改版本号

```bash
npm version <update_type>
```

- `update_type` 可以是：
    - `patch`：补丁更新（如 `1.0.0` → `1.0.1`）。
    - `minor`：次版本更新（如 `1.0.0` → `1.1.0`）。
    - `major`：主版本更新（如 `1.0.0` → `2.0.0`）。

### 4.4 撤销发布

```bash
npm unpublish <package> --force
```

- 撤销已发布的包，需谨慎操作。

---

## 5 版本锁定与切换

### 5.1 生成或更新 `package-lock.json`

```bash
npm install
```

- `package-lock.json` 锁定依赖树，确保跨环境的安装一致性。

### 5.2 还原依赖

```bash
npm ci
```

- 基于 `package-lock.json` 文件安装，常用于 CI/CD 环境。

---

## 6 配置管理

### 6.1 查看配置

```bash
npm config list
```

- 列出当前的 npm 配置。

### 6.2 设置与删除配置

```bash
npm config set <key> <value>
npm config delete <key>
```

- `npm config set <key> <value>`：设置指定配置项。
- `npm config delete <key>`：删除指定配置项。

---

## 7 Npx 命令（npm >= 5.2.0）

### 7.1 直接运行包

```bash
npx <package>
```

- 临时下载并执行包，无需全局安装。例如：

    ```bash
    npx create-react-app my-app
    ```
