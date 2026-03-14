---
tags:
  - Vue
---

# Vue 3 组合式API基本语法

Vue.js 是一个用于构建用户界面的渐进式框架。Vue 3 引入了组合式 API (Composition API)，使代码更加灵活和可组合。本文将介绍 Vue 3 组合式 API 的基本语法。

## 1 创建 Vue 实例

在 Vue 3 中，使用 `createApp` 函数来创建 Vue 应用实例：

```javascript
import { createApp } from 'vue';

const app = createApp({
  // 组件选项
});

app.mount('#app');
```

## 2 组合式 API 基础

组合式 API 的核心是 `setup` 函数，它是一个新的组件选项，用于定义组件的逻辑。

### 2.1 使用 `ref` 定义响应式数据

`ref` 函数用于创建一个响应式数据对象：

```javascript
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);

    function increment() {
      count.value++;
    }

    return {
      count,
      increment
    };
  }
};
```

### 2.2 使用 `reactive` 定义响应式对象

`reactive` 函数用于创建一个深层响应式的对象：

```javascript
import { reactive } from 'vue';

export default {
  setup() {
    const state = reactive({
      count: 0,
      message: 'Hello Vue 3!'
    });

    function increment() {
      state.count++;
    }

    return {
      state,
      increment
    };
  }
};
```

## 3 计算属性

`computed` 函数用于创建计算属性：

```javascript
import { ref, computed } from 'vue';

export default {
  setup() {
    const count = ref(0);

    const doubleCount = computed(() => count.value * 2);

    return {
      count,
      doubleCount
    };
  }
};
```

## 4 侦听器

`watch` 函数用于监听响应式数据的变化：

```javascript
import { ref, watch } from 'vue';

export default {
  setup() {
    const count = ref(0);

    watch(count, (newCount, oldCount) => {
      console.log(`Count changed from ${oldCount} to ${newCount}`);
    });

    function increment() {
      count.value++;
    }

    return {
      count,
      increment
    };
  }
};
```

## 5 生命周期钩子

组合式 API 通过 `onMounted` 等函数提供生命周期钩子：

```javascript
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  setup() {
    const count = ref(0);

    onMounted(() => {
      console.log('Component mounted');
    });

    onUnmounted(() => {
      console.log('Component unmounted');
    });

    function increment() {
      count.value++;
    }

    return {
      count,
      increment
    };
  }
};
```

## 6 使用模板

```html
<template>
  <div>
    <p>{{ count }}</p>
    <button @click="increment">Increment</button>
    <p>Double count: {{ doubleCount }}</p>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  setup() {
    const count = ref(0);

    const doubleCount = computed(() => count.value * 2);

    function increment() {
      count.value++;
    }

    return {
      count,
      doubleCount,
      increment
    };
  }
};
</script>
```

## 7 模板绑定

### 7.1 绑定属性

使用 `v-bind` 绑定属性：

```html
<template>
  <div>
    <img v-bind:src="imageUrl" alt="Example Image">
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const imageUrl = ref('https://example.com/image.jpg');

    return {
      imageUrl
    };
  }
};
</script>
```

### 7.2 条件渲染

使用 `v-if` 和 `v-else` 条件渲染：

```html
<template>
  <div>
    <p v-if="isVisible">This is visible</p>
    <p v-else>This is hidden</p>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const isVisible = ref(true);

    return {
      isVisible
    };
  }
};
</script>
```

### 7.3 列表渲染

使用 `v-for` 渲染列表：

```html
<template>
  <div>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const items = ref([
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ]);

    return {
      items
    };
  }
};
</script>
```

### 7.4 事件处理

使用 `v-on` 绑定事件处理器：

```html
<template>
  <div>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);

    function handleClick() {
      count.value++;
      console.log(`Button clicked ${count.value} times`);
    }

    return {
      handleClick
    };
  }
};
</script>
```

### 7.5 表单输入绑定

使用 `v-model` 双向绑定表单输入：

```html
<template>
  <div>
    <input v-model="text" placeholder="Enter some text">
    <p>{{ text }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const text = ref('');

    return {
      text
    };
  }
};
</script>
```
