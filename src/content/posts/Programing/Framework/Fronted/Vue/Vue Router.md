---
tags: [Vue, VueRouter]
title: Vue Router
date created: 2024-08-15 04:19:28
date modified: 2026-03-14 09:35:36
date: 2026-03-15 02:52:39
---

# Vue Router

[Vue Router](https://router.vuejs.org/zh/) 是 [Vue.js](https://cn.vuejs.org/) 的官方路由管理工具，帮助开发者轻松构建单页应用（SPA）。它深度集成了 Vue. js 核心特性，使页面导航更加便捷和灵活。

## 1 功能概述

- **嵌套路由映射**：支持在路由中嵌套子路由，方便构建复杂的页面布局。
- **动态路由选择**：支持基于路径参数或查询参数的动态路由匹配。
- **模块化路由配置**：路由基于组件配置，灵活而可扩展。
- **路由参数、查询和通配符支持**：可以通过 URL 参数和查询来传递数据。
- **过渡效果**：与 Vue. js 的过渡系统结合，路由切换时可以使用动画效果。
- **导航守卫**：通过守卫控制导航过程，执行权限验证、异步数据加载等操作。
- **自动激活 CSS 类**：为匹配当前路由的链接自动添加 CSS 类，方便做样式标识。
- **多种路由模式**：支持 HTML 5 history 模式或 hash 模式。
- **滚动行为定制**：可以自定义页面滚动条的行为，提升用户体验。
- **URL 编码**：对 URL 进行正确的编码和解析，确保特殊字符处理得当。

## 2 安装

首先，确保你已经安装了 `pnpm`，然后在项目中安装 `vue-router`：

```bash
pnpm add vue-router@next
```

## 3 创建路由器

在 `src` 目录下创建 `router` 文件夹，并在其中创建 `index.js` 文件：

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
```

在 `src/main.js` 中引入并使用这个路由器：

```javascript
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App)
  .use(router)
  .mount('#app')
```

## 4 动态路由匹配

动态路由匹配允许你匹配带参数的路径，例如用户 ID 等：

```javascript
// src/router/index.js
const routes = [
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('../views/User.vue')
  }
]
```

在组件中，可以通过 `this.$route.params.id` 访问参数：

```vue
// src/views/User.vue
<template>
  <div>User ID: {{ $route.params.id }}</div>
</template>

<script>
export default {
  name: 'User'
}
</script>
```

## 5 组件传参

有时候你可能希望通过路由传递更多的参数，这可以通过 `props` 选项实现：

```javascript
const routes = [
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('../views/User.vue'),
    props: true
  }
]
```

在组件中，参数将作为 `props` 传递：

```vue
// src/views/User.vue
<template>
  <div>User ID: {{ id }}</div>
</template>

<script>
export default {
  name: 'User',
  props: ['id']
}
</script>
```

## 6 嵌套路由

嵌套路由允许你在组件中嵌套子组件：

```js
const routes = [
  {
    path: '/user/:id',
    component: () => import('../views/User.vue'),
    children: [
      {
        path: 'profile',
        component: () => import('../views/UserProfile.vue')
      },
      {
        path: 'posts',
        component: () => import('../views/UserPosts.vue')
      }
    ]
  }
]
```

在 `User.vue` 中使用 `<router-view>` 以渲染嵌套路由：

```vue
<template>
  <div>
    <h2>User</h2>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'User'
}
</script>
```

## 7 重定向和别名

重定向可以让你将一个路径重定向到另一个路径：

```javascript
const routes = [
  {
    path: '/home',
    redirect: '/'
  }
]
```

别名允许你为现有路由提供一个或多个替代路径：

```javascript
const routes = [
  {
    path: '/user/:id',
    component: () => import('../views/User.vue'),
    alias: '/u/:id'
  }
]
```

## 8 导航守卫

### 8.1 什么是导航守卫？

导航守卫（Navigation Guards）是 Vue Router 提供的一种拦截功能，允许你在路由切换前或切换后执行特定逻辑操作。通过导航守卫，可以实现权限控制、数据预加载等功能。

### 8.2 导航守卫分类

- **全局守卫**：影响所有路由导航。
  - `beforeEach`：全局前置守卫，路由切换前触发。
  - `afterEach`：全局后置守卫，路由切换后触发。
- **路由独享守卫**：仅影响单个路由。
  - `beforeEnter`：路由进入前触发。
- **组件内守卫**：仅影响单个组件。
  - `beforeRouteEnter`：进入路由前触发，不能访问 `this`，可通过 `next` 函数执行操作。
  - `beforeRouteUpdate`：在当前路由发生变化时（复用组件时）触发。
  - `beforeRouteLeave`：在导航离开组件前触发，可以用来阻止离开。

### 8.3 导航守卫示例

#### 8.3.1 权限验证

在路由跳转前，检查用户是否具有访问权限。如果没有权限，则跳转至登录页面。

```javascript
router.beforeEach((to, from, next) => {
  const isAuthenticated = false; // 假设用户未登录
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});
```

#### 8.3.2 数据预加载

在进入某个路由前，先加载必要的数据，确保数据加载完成后再进行路由跳转。

```javascript
router.beforeEach((to, from, next) => {
  if (to.name === 'UserProfile') {
    store.dispatch('fetchUserProfile').then(() => {
      next();
    }).catch(() => {
      next(false);
    });
  } else {
    next();
  }
});
```

#### 8.3.3 离开页面时保存状态

当用户有未保存的表单内容时，提醒用户是否要离开当前页面。

```javascript
beforeRouteLeave (to, from, next) {
  const answer = window.confirm('You have unsaved changes. Do you really want to leave?');
  if (answer) {
    next();
  } else {
    next(false);
  }
}
```

## 9 示例：左侧导航栏，点击右侧显示对应内容

```
src/
├── assets/
├── components/
│   ├── Navbar.vue
├── views/
│   ├── Home.vue
│   ├── About.vue
│   ├── User.vue
│   ├── UserProfile.vue
│   ├── UserPosts.vue
│   ├── NotFound.vue
├── router/
│   ├── index.js
├── App.vue
├── main.js
```

### 9.1 `src/router/index.js`

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import User from '../views/User.vue'
import UserProfile from '../views/UserProfile.vue'
import UserPosts from '../views/UserPosts.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User,
    props: true,
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: UserProfile
      },
      {
        path: 'posts',
        name: 'UserPosts',
        component: UserPosts
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
```

### 9.2 `src/components/Navbar.vue`

```vue
<template>
  <nav>
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="/about">About</router-link></li>
      <li><router-link to="/user/123">User 123</router-link></li>
    </ul>
  </nav>
</template>

<style>
nav {
  width: 200px;
  background-color: #f8f9fa;
  padding: 1em;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 0.5em 0;
}
</style>
```

### 9.3 `src/views/Home.vue`

```vue
<template>
  <div>
    <h1>Home</h1>
  </div>
</template>
```

### 9.4 `src/views/About.vue`

```vue
<template>
  <div>
    <h1>About</h1>
  </div>
</template>
```

### 9.5 `src/views/User.vue`

```vue
<template>
  <div>
    <h2>User {{ id }}</h2>
    <nav>
      <router-link :to="{ name: 'UserProfile', params: { id } }">Profile</router-link>
      <router-link :to="{ name: 'UserPosts', params: { id } }">Posts</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  props: ['id']
}
</script>
```

### 9.6 `src/views/UserProfile.vue`

```vue
<template>
  <div>
    <h3>User Profile</h3>
  </div>
</template>
```

### 9.7 `src/views/UserPosts.vue`

```vue
<template>
  <div>
    <h3>User Posts</h3>
  </div>
</template>
```

### 9.8 `src/views/NotFound.vue`

```vue
<template>
  <div>
    <h1>404 Not Found</h1>
    <router-link to="/">Go to Home</router-link>
  </div>
</template>
```

### 9.9 `src/App.vue`

```vue
<template>
  <div id="app">
    <Navbar />
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'

export default {
  components: {
    Navbar
  }
}
</script>

<style>
#app {
  display: flex;
}

.content {
  flex: 1;
  padding: 1em;
}
</style>
```

### 9.10 `src/main.js`

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App)
  .use(router)
  .mount('#app')
```

### 9.11 项目样式

添加一些基本的样式，使得左侧导航栏和右侧内容区域布局合理：

```css
/* src/assets/styles.css */
#app {
  display: flex;
}

nav {
  width: 200px;
  background-color: #f8f9fa;
  padding: 1em;
}

.content {
  flex: 1;
  padding: 1em;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 0.5em 0;
}

.router-link-active {
  font-weight: bold;
  color: red;
}
```
