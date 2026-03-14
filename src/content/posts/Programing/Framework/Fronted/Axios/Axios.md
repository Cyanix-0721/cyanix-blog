---
tags:
  - Axios
  - Vue
---

# Axios

## 1 介绍

[Axios](https://axios-http.com) 是一个基于 Promise 的 HTTP 客户端，用于浏览器和 Node. js。本文将介绍如何在 Vue 3 组合式 API 中使用 Axios 进行 HTTP 请求，并包含如何处理跨域问题及常用 API 的使用示例。

## 2 安装

首先，需要使用 pnpm 安装 Axios：

```bash
pnpm add axios
```

## 3 在组件中使用 Axios

### 3.1 创建一个 Axios 实例

可以创建一个 Axios 实例，以便在整个应用程序中使用。

```javascript
// src/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://api.example.com', // 配置基础URL
  timeout: 1000, // 设置超时时间
  headers: {'X-Custom-Header': 'foobar'}
});

export default axiosInstance;
```

### 3.2 在 Vue 组件中使用 Axios

在 Vue 3 组合式 API 中，你可以在 `setup` 函数中使用 Axios。

```javascript
// src/components/MyComponent.vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axiosInstance from '../axios';

export default {
  name: 'MyComponent',
  setup() {
    const title = ref('My API Data');
    const items = ref([]);

    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/items');
        items.value = response.data;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    onMounted(() => {
      fetchData();
    });

    return {
      title,
      items
    };
  }
};
</script>
```

### 3.3 处理错误

可以使用 `try...catch` 块来处理 Axios 请求中的错误。

```javascript
const fetchData = async () => {
  try {
    const response = await axiosInstance.get('/items');
    items.value = response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    // 你可以在这里显示错误信息或进行其他错误处理
  }
};
```

### 3.4 使用拦截器

Axios 提供了请求和响应拦截器，以便在请求或响应被处理之前进行操作。

```javascript
// 添加请求拦截器
axiosInstance.interceptors.request.use(config => {
  // 在发送请求之前做些什么
  console.log('Request Interceptor:', config);
  return config;
}, error => {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
axiosInstance.interceptors.response.use(response => {
  // 对响应数据做些什么
  console.log('Response Interceptor:', response);
  return response;
}, error => {
  // 对响应错误做些什么
  return Promise.reject(error);
});
```

## 4 处理跨域问题

### 4.1 配置开发服务器代理

在 Vue CLI 项目的 `vue.config.js` 文件中配置代理：

```javascript
// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
};
```

这样，在开发环境中，所有以 `/api` 开头的请求都会被代理到 `https://api.example.com`。

## 5 常用 API 示例

### 5.1 GET 请求

```javascript
const fetchData = async () => {
  try {
    const response = await axiosInstance.get('/items');
    items.value = response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
```

### 5.2 POST 请求

```javascript
const postData = async (newItem) => {
  try {
    const response = await axiosInstance.post('/items', newItem);
    console.log('Data posted successfully:', response.data);
  } catch (error) {
    console.error('Error posting data:', error);
  }
};
```

### 5.3 PUT 请求

```javascript
const updateData = async (itemId, updatedItem) => {
  try {
    const response = await axiosInstance.put(`/items/${itemId}`, updatedItem);
    console.log('Data updated successfully:', response.data);
  } catch (error) {
    console.error('Error updating data:', error);
  }
};
```

### 5.4 DELETE 请求

```javascript
const deleteData = async (itemId) => {
  try {
    const response = await axiosInstance.delete(`/items/${itemId}`);
    console.log('Data deleted successfully:', response.data);
  } catch (error) {
    console.error('Error deleting data:', error);
  }
};
```

### 5.5 PATCH 请求

```javascript
const patchData = async (itemId, partialUpdate) => {
  try {
    const response = await axiosInstance.patch(`/items/${itemId}`, partialUpdate);
    console.log('Data patched successfully:', response.data);
  } catch (error) {
    console.error('Error patching data:', error);
  }
};
```

### 5.6 HEAD 请求

```javascript
const fetchHead = async () => {
  try {
    const response = await axiosInstance.head('/items');
    console.log('Head fetched successfully:', response.headers);
  } catch (error) {
    console.error('Error fetching head:', error);
  }
};
```

### 5.7 OPTIONS 请求

```javascript
const fetchOptions = async () => {
  try {
    const response = await axiosInstance.options('/items');
    console.log('Options fetched successfully:', response.data);
  } catch (error) {
    console.error('Error fetching options:', error);
  }
};
```

### 5.8 统一发送请求的写法

```js
axios({
      url: '/api/admin/employee/login',
      method:'post',
      data: {
        username:'admin',
        password: '123456'
      }
    }).then((res) => {
      console.log(res.data.data.token)
      axios({
        url: '/api/admin/shop/status',
        method: 'get',
        params: {id: 100},
        headers: {
          token: res.data.data.token
        }
      })
    }).catch((error) => {
      console.log(error)
    })
```
