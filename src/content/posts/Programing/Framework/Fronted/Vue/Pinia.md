---
tags:
  - Vue
  - Pinia
---

# Pinia 使用文档

[Pinia](https://pinia.vuejs.org/zh/) 是 Vue.js 的一种状态管理库，提供了比 Vuex 更简洁、更直观的 API。它在 Vue 3 中得到了广泛应用，并且与 Vue DevTools 完美集成。

## 1 安装

首先，确保你已经安装了 `pnpm`，然后在项目中安装 `pinia`：

```bash
pnpm add pinia
```

## 2 创建 Store

在 `src` 目录下创建 `stores` 文件夹，并在其中创建一个 store，例如 `counter.js` 文件：

```javascript
// src/stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  getters: {
    doubleCount: (state) => state.count * 2
  },
  actions: {
    increment() {
      this.count++
    }
  }
})
```

## 3 在 Vue 应用中使用 Store

在 `src/main.js` 中引入并使用这个 store：

```javascript
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
```

## 4 使用 State

在组件中访问 Pinia store 的状态，可以使用 `useCounterStore`：

```vue
<template>
  <div>
    {{ count }}
  </div>
</template>

<script>
import { useCounterStore } from '../stores/counter'

export default {
  setup() {
    const counterStore = useCounterStore()
    return {
      count: counterStore.count
    }
  }
}
</script>
```

## 5 使用 Getters

Getters 可以认为是 store 的计算属性，在组件中使用 getters：

```vue
<template>
  <div>
    Double Count: {{ doubleCount }}
  </div>
</template>

<script>
import { useCounterStore } from '../stores/counter'

export default {
  setup() {
    const counterStore = useCounterStore()
    return {
      doubleCount: counterStore.doubleCount
    }
  }
}
</script>
```

## 6 调用 Actions

Actions 是改变 store 状态的唯一方法，可以在组件中调用 actions：

```vue
<template>
  <div>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
import { useCounterStore } from '../stores/counter'

export default {
  setup() {
    const counterStore = useCounterStore()
    return {
      increment: counterStore.increment
    }
  }
}
</script>
```

## 7 组合式 API

Pinia 与 Vue 3 的组合式 API 紧密集成，可以更灵活地管理状态：

```vue
<template>
  <div>
    {{ count }}
    Double Count: {{ doubleCount }}
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
import { useCounterStore } from '../stores/counter'

export default {
  setup() {
    const counterStore = useCounterStore()

    return {
      count: counterStore.count,
      doubleCount: counterStore.doubleCount,
      increment: counterStore.increment
    }
  }
}
</script>
```

## 8 模块化 Store

对于大型应用，可以将 store 分割成多个模块。Pinia 中，每个模块就是一个独立的 store。

### 8.1 创建模块

```javascript
// src/stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: 'John Doe'
  }),
  actions: {
    setName(newName) {
      this.name = newName
    }
  }
})
```

### 8.2 使用模块

```vue
<template>
  <div>
    User Name: {{ name }}
    <button @click="setName('Jane Doe')">Change Name</button>
  </div>
</template>

<script>
import { useUserStore } from '../stores/user'

export default {
  setup() {
    const userStore = useUserStore()

    return {
      name: userStore.name,
      setName: userStore.setName
    }
  }
}
</script>
```

## 9 持久化状态

Pinia 没有内置持久化插件，但你可以使用第三方插件，例如 `pinia-plugin-persistedstate`，以便在刷新页面后保留状态。

### 9.1 安装插件

```bash
pnpm add pinia-plugin-persistedstate
```

### 9.2 配置插件

```javascript
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.mount('#app')
```

### 9.3 使用持久化状态

```javascript
// src/stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  persist: true
})
```
