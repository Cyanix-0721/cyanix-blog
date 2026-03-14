---
tags:
  - Apache
  - ApacheECharts
---

# Apache ECharts 使用指南

## 1 简介

[Apache ECharts](https://echarts.apache.org/zh/index.html) 是一个由百度开源的强大可视化库，基于 JavaScript，能够轻松创建数据丰富的图表和交互式图形。ECharts 适用于多种场景，包括商业报告、数据分析、仪表盘等。

## 2 安装

### 2.1 [引入 ECharts](https://echarts.apache.org/handbook/zh/basics/download)

### 2.2 从 Npm 获取

```
npm install echarts
```

详见[在项目中引入 Apache ECharts](https://echarts.apache.org/handbook/zh/basics/import)。

### 2.3 从 CDN 获取

可以从以下免费 CDN 中获取和引用 ECharts。

- [jsDelivr](https://www.jsdelivr.com/package/npm/echarts)
- [unpkg](https://unpkg.com/browse/echarts/)
- [cdnjs](https://cdnjs.com/libraries/echarts)

### 2.4 从 GitHub 获取

[apache/echarts](https://github.com/apache/echarts) 项目的 [release](https://github.com/apache/echarts/releases) 页面可以找到各个版本的链接。点击下载页面下方 Assets 中的 Source code，解压后 `dist` 目录下的 `echarts.js` 即为包含完整 ECharts 功能的文件。

### 2.5 在线定制

如果只想引入部分模块以减少包体积，可以使用 [ECharts 在线定制](https://echarts.apache.org/builder.html)功能。

## 3 基本用法

### 3.1 初始化

在 HTML 文件中创建一个容器元素，用于渲染图表。

```html
<div id="main" style="width: 600px;height:400px;"></div>
```

在 JavaScript 文件中初始化 ECharts 实例并设置配置项：

```javascript
// 初始化echarts实例
var myChart = echarts.init(document.getElementById('main'));

// 指定图表的配置项和数据
var option = {
    title: {
        text: 'ECharts 示例'
    },
    tooltip: {},
    xAxis: {
        data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
    },
    yAxis: {},
    series: [{
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
    }]
};

// 使用刚指定的配置项和数据显示图表。
myChart.setOption(option);
```

## 4 常用图表类型

ECharts 支持多种图表类型，包括但不限于：

### 4.1 折线图

```javascript
var option = {
    xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
        type: 'value'
    },
    series: [{
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line'
    }]
};
```

### 4.2 柱状图

```javascript
var option = {
    xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
        type: 'value'
    },
    series: [{
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar'
    }]
};
```

### 4.3 饼图

```javascript
var option = {
    series: [{
        name: '访问来源',
        type: 'pie',
        radius: '50%',
        data: [
            {value: 1048, name: '搜索引擎'},
            {value: 735, name: '直接访问'},
            {value: 580, name: '邮件营销'},
            {value: 484, name: '联盟广告'},
            {value: 300, name: '视频广告'}
        ]
    }]
};
```

## 5 配置项

ECharts 的配置项非常丰富，以下是一些常用的配置项：

### 5.1 标题（title）

```javascript
title: {
    text: '主标题',
    subtext: '副标题',
    left: 'center'
}
```

### 5.2 工具提示（tooltip）

```javascript
tooltip: {
    trigger: 'axis',
    axisPointer: {
        type: 'shadow'
    }
}
```

### 5.3 图例（legend）

```javascript
legend: {
    data: ['销量']
}
```

### 5.4 轴（xAxis, yAxis）

```javascript
xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
},
yAxis: {
    type: 'value'
}
```

### 5.5 数据（series）

```javascript
series: [{
    name: '销量',
    type: 'bar',
    data: [5, 20, 36, 10, 10, 20]
}]
```

## 6 交互与事件

ECharts 支持多种交互方式和事件处理，例如：

### 6.1 事件监听

```javascript
myChart.on('click', function (params) {
    console.log(params);
});
```

### 6.2 数据缩放和漫游

```javascript
dataZoom: [{
    type: 'inside'
}, {
    type: 'slider'
}]
```

## 7 示例

### 7.1 动态数据更新

```javascript
setInterval(function () {
    var newData = [Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100];
    myChart.setOption({
        series: [{
            data: newData
        }]
    });
}, 2000);
```

### 7.2 带有地图的可视化

```javascript
var option = {
    title: {
        text: '全国主要城市空气质量',
        left: 'center'
    },
    tooltip: {
        trigger: 'item'
    },
    visualMap: {
        min: 0,
        max: 300,
        left: 'left',
        top: 'bottom',
        text: ['高','低'],
        inRange: {
            color: ['#e0ffff', '#006edd']
        },
        calculable: true
    },
    series: [{
        type: 'map',
        mapType: 'china',
        roam: true,
        label: {
            show: true
        },
        data: [
            {name: '北京', value: Math.round(Math.random()*1000)},
            {name: '上海', value: Math.round(Math.random()*1000)},
            // 其他城市数据
        ]
    }]
};
```

## 8 常见问题

### 8.1 为什么图表没有渲染出来？

1. **检查容器元素的尺寸**: 确保容器元素有宽度和高度。
2. **检查数据格式**: 确保数据格式正确，无语法错误。
3. **查看控制台错误信息**: 检查浏览器控制台的错误信息，排查问题。

### 8.2 如何响应窗口大小变化？

在窗口大小变化时，可以调用`resize`方法使图表自适应：

```javascript
window.addEventListener ('resize', function () {
    myChart.resize ();
});
```
