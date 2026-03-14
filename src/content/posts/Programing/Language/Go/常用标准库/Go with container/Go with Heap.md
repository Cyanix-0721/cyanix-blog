---
tags:
  - Language
  - Go
---

# Go with Heap

在 Go 语言中，堆（Heap）是一种数据结构，通常用于实现优先队列。它的特点是每个节点的值都大于或小于其子节点的值，这使得我们可以快速找到最大或最小的元素。

## 1 堆的基本概念

- **定义**：堆是一种完全二叉树。通常有两种类型：
  - **最大堆**：父节点的值总是大于或等于其子节点的值。
  - **最小堆**：父节点的值总是小于或等于其子节点的值。
  
- **用途**：堆常用于实现优先队列，支持高效的插入和删除操作，通常时间复杂度为 O(log n)。

## 2 Go 的堆实现

Go 标准库提供了 `container/heap` 包，允许我们轻松地实现堆。要使用这个包，通常需要定义一个类型（如切片）并实现一些接口。

### 2.1 示例题目

座位预约管理系统

请你设计一个管理 `n` 个座位预约的系统，座位编号从 `1` 到 `n` 。

请你实现 `SeatManager` 类：

- `SeatManager(int n)` 初始化一个 `SeatManager` 对象，它管理从 `1` 到 `n` 编号的 `n` 个座位。所有座位初始都是可预约的。
- `int reserve()` 返回可以预约座位的 **最小编号** ，此座位变为不可预约。
- `void unreserve(int seatNumber)` 将给定编号 `seatNumber` 对应的座位变成可以预约。

**输入：**  

```go
["SeatManager", "reserve", "reserve", "unreserve", "reserve", "reserve", "reserve", "reserve", "unreserve"]  
[[5], [], [], [2], [], [], [], [], [5]]  
```

**输出：**  

```go
[null, 1, 2, null, 2, 3, 4, 5, null]
```

**解释：**  

```go
SeatManager seatManager = new SeatManager(5); // 初始化 SeatManager ，有 5 个座位。  
seatManager.reserve(); // 所有座位都可以预约，所以返回最小编号的座位，也就是 1 。  
seatManager.reserve(); // 可以预约的座位为 [2,3,4,5] ，返回最小编号的座位，也就是 2 。  
seatManager.unreserve(2); // 将座位 2 变为可以预约，现在可预约的座位为 [2,3,4,5] 。  
seatManager.reserve(); // 可以预约的座位为 [2,3,4,5] ，返回最小编号的座位，也就是 2 。  
seatManager.reserve(); // 可以预约的座位为 [3,4,5] ，返回最小编号的座位，也就是 3 。  
seatManager.reserve(); // 可以预约的座位为 [4,5] ，返回最小编号的座位，也就是 4 。  
seatManager.reserve(); // 唯一可以预约的是座位 5 ，所以返回 5 。  
seatManager.unreserve(5); // 将座位 5 变为可以预约，现在可预约的座位为 [5] 。
```

**提示：**

- `1 <= n <= 105`
- `1 <= seatNumber <= n`
- 每一次对 `reserve` 的调用，题目保证至少存在一个可以预约的座位。
- 每一次对 `unreserve` 的调用，题目保证 `seatNumber` 在调用函数前都是被预约状态。
- 对 `reserve` 和 `unreserve` 的调用 **总共** 不超过 10<sup>5</sup> 次。

### 2.2 示例解法

1. **定义堆**：使用一个切片来表示堆。
2. **实现接口**：实现 `heap.Interface` 接口，包括 `Len()`, `Less(i, j int)`, `Swap(i, j int)`, `Push(x interface{})`, `Pop() interface{}` 方法。

```go
package main

import (
	"container/heap"
)

// SeatManager 结构体，用于管理座位的预约
type SeatManager struct {
	availableSeats *MinHeap // 最小堆，存储可预约的座位编号
} 

// MinHeap 结构体，实现了一个最小堆，用于管理座位
type MinHeap []int

// Len 返回堆的长度
func (h MinHeap) Len() int { return len(h) }

// Less 定义比较规则，决定堆中元素的顺序
func (h MinHeap) Less(i, j int) bool { return h[i] < h[j] }

// Swap 交换堆中两个元素的位置
func (h MinHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }

// Push 将新元素添加到堆中
func (h *MinHeap) Push(x any) {
	*h = append(*h, x.(int)) // 将新元素添加到堆的末尾
} 

// Pop 从堆中移除并返回最小元素
func (h *MinHeap) Pop() interface{} {
	old := *h
	n := len(old) // 获取当前堆的长度
	x := old[n-1] // 取出最后一个元素
	*h = old[0 : n-1] // 更新堆，去掉最后一个元素
	return x // 返回被移除的元素
}

// Constructor 初始化 SeatManager 对象
func Constructor(n int) SeatManager {
	seats := &MinHeap{} // 创建一个新的最小堆
	for i := 1; i <= n; i++ { // 遍历所有座位编号
	heap.Push(seats, i) // 将座位编号添加到最小堆中
	}
	return SeatManager{availableSeats: seats} // 返回新的 SeatManager 实例
}

// Reserve 返回可以预约的最小编号座位，并将其标记为不可预约
func (this *SeatManager) Reserve() int {
	return heap.Pop(this.availableSeats).(int) // 从最小堆中取出并返回最小编号的座位
}

// Unreserve 将指定编号的座位变为可预约
func (this *SeatManager) Unreserve(seatNumber int) {
	heap.Push(this.availableSeats, seatNumber) // 将座位编号重新加入最小堆
}
```

## 3 堆的操作

- **初始化堆**：
  - 使用 `heap.Init(h)` 初始化堆。
  
- **插入元素**：
  - 使用 `heap.Push(h, x)` 将元素 `x` 插入堆中。

- **删除元素**：
  - 使用 `heap.Pop(h)` 从堆中删除并返回最小元素。

## 4 使用堆的场景

在座位预约管理系统的例子中，堆被用来管理可预约的座位：

- **初始化**：当创建 `SeatManager` 时，所有座位编号被推入堆中。
- **预约座位**：调用 `Reserve` 时，从堆中弹出最小的座位编号。
- **取消预约**：调用 `Unreserve` 时，将座位编号重新加入堆中。

## 5 总结

使用 Go 的堆实现优先队列是一种高效的方式，特别是在需要频繁插入和删除操作的场景下。通过实现 `heap.Interface` 接口，我们可以轻松地自定义堆的行为并满足特定需求。在座位预约管理系统中，堆的使用使得预约和取消操作都能够在对数时间复杂度内完成，从而提升系统的性能。
