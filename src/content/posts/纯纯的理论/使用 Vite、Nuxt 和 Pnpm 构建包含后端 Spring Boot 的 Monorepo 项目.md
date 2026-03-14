# 使用 Vite、Nuxt 和 Pnpm 构建包含后端 Spring Boot 的 Monorepo 项目

## 1 简介

本指南将介绍如何在同一个代码库（Monorepo）中管理前端（Vite、Nuxt）和后端（Spring Boot）项目。我们将使用 pnpm 作为前端项目的包管理工具，后端项目则使用 Maven 或 Gradle 进行管理。这样可以保持前后端项目的独立性，同时方便共享代码和统一管理。

## 2 目录结构

首先，定义项目的目录结构：

```
monorepo-project/
├── backend/            # 后端 Spring Boot 项目
│   └── pom.xml         # Maven 或 Gradle 构建文件
├── frontend/           # 前端项目
│   ├── package.json    # pnpm 配置文件
│   ├── pnpm-workspace.yaml
│   └── packages/
│       ├── frontend-user/    # 用户端项目
│       ├── frontend-admin/   # 管理员端项目
│       └── shared/           # 前端共享代码
└── README.md
```

## 3 步骤

### 3.1 初始化项目目录

在工作空间中创建项目根目录并进入：

```sh
mkdir monorepo-project
cd monorepo-project
```

### 3.2 创建后端 Spring Boot 项目

在 `backend` 目录中创建 Spring Boot 项目：

```sh
mkdir backend
cd backend
```

使用 Spring Initializr 或 IDE（如 IntelliJ IDEA）创建一个新的 Spring Boot 项目。确保项目的构建工具为 Maven 或 Gradle，并选择合适的依赖。

### 3.3 创建前端项目

#### 3.3.1 初始化 Pnpm 工作区

回到项目根目录，创建 `frontend` 目录并进入：

```sh
cd ..
mkdir frontend
cd frontend
```

初始化 pnpm 工作区：

```sh
pnpm init
```

修改 `package.json`，添加工作空间配置：

```json
{
  "name": "frontend",
  "private": true,
  "version": "1.0.0",
  "workspaces": [
    "packages/*"
  ]
}
```

创建 `pnpm-workspace.yaml` 文件：

```yaml
packages:
  - 'packages/*'
```

#### 3.3.2 创建前端子项目

在 `packages` 目录下创建用户端、管理员端和共享代码库：

```sh
mkdir -p packages/frontend-user
mkdir -p packages/frontend-admin
mkdir -p packages/shared
```

##### 3.3.2.1 初始化用户端项目

进入 `frontend-user` 目录并使用 Nuxt CLI 初始化项目：

```sh
cd packages/frontend-user
npx nuxi init .
pnpm install
```

##### 3.3.2.2 初始化管理员端项目

进入 `frontend-admin` 目录并初始化项目：

```sh
cd ../frontend-admin
npx nuxi init .
pnpm install
```

##### 3.3.2.3 创建共享代码库

进入 `shared` 目录并初始化共享包：

```sh
cd ../shared
pnpm init
```

修改 `package.json`：

```json
{
  "name": "@monorepo/shared",
  "version": "1.0.0",
  "main": "index.js"
}
```

添加示例代码：

```js
// packages/shared/index.js
export function greet(name) {
  return `Hello, ${name}!`;
}
```

### 3.4 配置项目依赖

在前端用户端和管理员端的 `package.json` 中添加对共享包的依赖：

```json
// packages/frontend-user/package.json
{
  "dependencies": {
    "@monorepo/shared": "*"
  }
}

// packages/frontend-admin/package.json
{
  "dependencies": {
    "@monorepo/shared": "*"
  }
}
```

### 3.5 配置 Vite 和 Nuxt

修改前端项目的 `nuxt.config.js`，添加别名以正确解析共享包。

在 `frontend-user` 项目中：

```js
// packages/frontend-user/nuxt.config.js
export default {
  vite: {
    resolve: {
      alias: {
        '@monorepo/shared': '../../shared'
      }
    }
  }
}
```

在 `frontend-admin` 项目中进行类似的配置。

### 3.6 使用共享代码

在前端项目中，可以使用共享代码。例如，在用户端项目的页面中：

```vue
<!-- packages/frontend-user/pages/index.vue -->
<template>
  <div>{{ message }}</div>
</template>

<script setup>
import { ref } from 'vue';
import { greet } from '@monorepo/shared';

const message = ref(greet('User'));
</script>
```

### 3.7 分别管理前后端依赖

#### 3.7.1 安装前端依赖

在 `frontend` 目录下，执行以下命令安装所有前端依赖：

```sh
cd ../../frontend
pnpm install
```

#### 3.7.2 管理后端依赖

在 `backend` 目录下，使用 Maven 或 Gradle 管理后端依赖：

```sh
cd ../backend
# 如果使用 Maven
mvn clean install

# 或者使用 Gradle
./gradlew build
```

### 3.8 共享代码与后端的整合

如果需要在后端项目中使用共享代码，可以考虑以下方法：

- **使用 Git 子模块或子树：** 将 `shared` 目录作为子模块引入后端项目。
- **独立发布共享库：** 将共享代码打包为独立的库，发布到 Maven 私有仓库，后端项目通过依赖管理引入。
- **直接复制代码（不推荐）：** 将需要的共享代码手动复制到后端项目中。

### 3.9 运行项目

#### 3.9.1 运行前端项目

进入 `frontend` 目录，分别启动用户端和管理员端项目：

```sh
# 启动用户端
cd ../frontend/packages/frontend-user
pnpm run dev

# 启动管理员端
cd ../frontend-admin
pnpm run dev
```

#### 3.9.2 运行后端项目

在 `backend` 目录下，使用以下命令启动 Spring Boot 项目：

```sh
cd ../../backend
# 使用 Maven
mvn spring-boot:run

# 或使用 Gradle
./gradlew bootRun
```

## 4 注意事项

- **独立构建和部署：** 前端和后端项目应各自独立构建和部署，避免相互干扰。
- **版本控制：** 使用 Git 管理整个 Monorepo 的代码版本，使团队能够方便地协作开发。
- **持续集成/持续交付（CI/CD）：** 为前后端项目分别设置 CI/CD 流水线，确保代码质量和自动化部署。

## 5 总结

通过上述步骤，您已经成功构建了一个包含后端 Spring Boot 的 Monorepo 项目。前端的用户端和管理员端项目通过 pnpm 进行依赖管理，共享了 `shared` 包中的代码。后端项目保持独立，使用 Maven 或 Gradle 进行管理。这样的结构既方便了代码的统一管理，又保持了前后端项目的独立性，适用于大型项目的开发。
