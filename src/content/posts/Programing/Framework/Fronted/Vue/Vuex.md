---
tags:
  - Vue
  - Vuex
---

# Vuex 使用文档

[Vuex](https://vuex.vuejs.org/) 是一个专为 Vue.js 应用程序开发的状态管理模式。它以一个集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

## 1 安装

首先，确保你已经安装了 `pnpm`，然后在项目中安装 `vuex`：

```bash
pnpm add vuex@next
```

## 2 创建 Store

在 `src` 目录下创建 `store` 文件夹，并在其中创建 `index.js` 文件：

```javascript
// src/store/index.js
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      count: 0
    }
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    increment(context) {
      context.commit('increment')
    }
  },
  getters: {
    doubleCount(state) {
      return state.count * 2
    }
  }
})

export default store
```

## 3 在 Vue 应用中使用 Store

在 `src/main.js` 中引入并使用这个 store：

```javascript
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

createApp(App)
  .use(store)
  .mount('#app')
```

## 4 使用 State

在组件中访问 Vuex state，可以使用 `this.$store.state`：

```vue
<template>
  <div>
    {{ count }}
  </div>
</template>

<script>
export default {
  computed: {
    count() {
      return this.$store.state.count
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
export default {
  computed: {
    doubleCount() {
      return this.$store.getters.doubleCount
    }
  }
}
</script>
```

## 6 提交 Mutations

Mutations 是更改 Vuex 的 store 中的状态的唯一方法，可以使用 `this.$store.commit` 提交 mutation：

```vue
<template>
  <div>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  methods: {
    increment() {
      this.$store.commit('increment')
    }
  }
}
</script>
```

## 7 分发 Actions

Actions 类似于 mutations，不同在于：

1. Action 提交的是 mutation，而不是直接变更状态。
2. Action 可以包含任意异步操作。

可以使用 `this.$store.dispatch` 分发 action：

```vue
<template>
  <div>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  methods: {
    increment() {
      this.$store.dispatch('increment')
    }
  }
}
</script>
```

## 8 模块化 Store

对于大型应用，可以将 store 分割成模块（module）。每个模块拥有自己的 state、mutation、action 和 getter，甚至是嵌套子模块。

### 8.1 创建模块

```javascript
// src/store/modules/counter.js
const counter = {
  state() {
    return {
      count: 0
    }
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    increment(context) {
      context.commit('increment')
    }
  },
  getters: {
    doubleCount(state) {
      return state.count * 2
    }
  }
}

export default counter
```

### 8.2 使用模块

```javascript
// src/store/index.js
import { createStore } from 'vuex'
import counter from './modules/counter'

const store = createStore({
  modules: {
    counter
  }
})

export default store
```

在组件中使用模块状态、getters、mutations 和 actions 时，需要根据模块名进行访问：

```vue
<template>
  <div>
    {{ count }}
    Double Count: {{ doubleCount }}
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  computed: {
    count() {
      return this.$store.state.counter.count
    },
    doubleCount() {
      return this.$store.getters['counter/doubleCount']
    }
  },
  methods: {
    increment() {
      this.$store.dispatch('counter/increment')
    }
  }
}
</script>
```
