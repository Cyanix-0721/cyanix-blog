---
tags:
  - Vue
---

# 1 修改 Vue 开发服务器端口

## 1 修改 `vue.config.js`

1. 打开项目根目录下的 `vue.config.js` 文件。如果没有这个文件，可以在项目根目录创建一个。

2. 添加或修改以下配置：

	```javascript
    module.exports = {
      devServer: {
        port: 你的端口号
      }
    }
    ```

## 2 使用命令行参数

你可以在启动开发服务器时，通过命令行参数指定端口号。

```sh
pnpm run serve -- --port 8081
```

## 3 设置环境变量

你也可以通过设置环境变量来指定端口号。

1. 在项目根目录创建一个 `.env` 文件（如果没有的话）。

2. 在 `.env` 文件中添加以下内容：

	```env
    VUE_APP_PORT=8081
    ```

3. 在 `vue.config.js` 中，使用 `process.env.VUE_APP_PORT`：

	```javascript
    module.exports = {
      devServer: {
        port: process.env.VUE_APP_PORT
      }
    }
    ```
