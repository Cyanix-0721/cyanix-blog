---
tags:
  - Java
  - Language
---

# Java Iterator

> [!summary] Iterator
>
> `Iterator` 是一种遍历 Java 集合元素的标准方式，它提供了统一的接口来处理不同类型的集合。虽然随着 `for-each` 循环的引入，显式使用 `Iterator` 的场景减少了，但在需要更复杂的遍历操作时，`Iterator` 依然是一个非常重要的工具。

在 Java 中，`Iterator` 是一个接口，它用于遍历集合（如 `List`、`Set` 等）中的元素。`Iterator` 提供了一种通用的方式，不需要知道底层集合的实现细节。常见的集合框架（如 `ArrayList`、`HashSet` 等）都实现了 `Iterator` 接口。

## 1 `Iterator` 的常用方法

`Iterator` 接口主要有以下三个常用方法：

1. **`hasNext()`**：检查集合中是否还有元素。如果有元素可供遍历，则返回 `true`，否则返回 `false`。

   ```java
   boolean hasNext();
   ```

2. **`next()`**：返回下一个元素。如果调用时没有更多的元素，将抛出 `NoSuchElementException`。

   ```java
   E next();
   ```

3. **`remove()`**：从集合中移除通过 `next()` 返回的最后一个元素（可选操作）。注意，并不是所有的集合都支持该操作，比如 `HashSet`。如果集合不支持，调用时会抛出 `UnsupportedOperationException`。

   ```java
   void remove();
   ```

## 2 `Iterator` 的使用示例

假设有一个 `ArrayList`，我们使用 `Iterator` 来遍历其中的元素：

```java
import java.util.ArrayList;
import java.util.Iterator;

public class IteratorExample {
    public static void main(String[] args) {
        // 创建一个 ArrayList
        ArrayList<String> list = new ArrayList<>();
        list.add("Apple");
        list.add("Banana");
        list.add("Cherry");

        // 获取 Iterator
        Iterator<String> iterator = list.iterator();

        // 使用 Iterator 进行遍历
        while (iterator.hasNext()) {
            String fruit = iterator.next();
            System.out.println(fruit);
        }
    }
}
```

## 3 `Iterator` 的优点

- **解耦合**：使用 `Iterator` 时，不需要了解集合的具体实现方式，例如不必知道 `ArrayList` 是通过索引访问的，`HashSet` 是无序的。
- **一致性**：可以以同样的方式遍历不同类型的集合。
- **安全性**：`Iterator` 可以在遍历的过程中安全地删除集合中的元素。

## 4 注意事项

1. **`remove()` 方法的局限性**：并不是所有的集合都支持 `remove()` 方法，调用之前需要检查文档或者实现。
2. **快速失败机制**：大多数集合的 `Iterator` 实现都有快速失败（fail-fast）机制，即在遍历过程中如果集合结构被修改（非通过 `Iterator.remove()` 修改），`Iterator` 会抛出 `ConcurrentModificationException`。

## 5 `for-each` 与 `Iterator`

虽然 `Iterator` 是一种遍历集合的经典方式，但 `Java` 从 5 开始引入了 `for-each` 循环，这是一种更加简洁的遍历方式。它实际上在内部使用了 `Iterator`：

```java
for (String fruit : list) {
    System.out.println(fruit);
}
```

在这个 `for-each` 循环中，编译器会在幕后使用 `Iterator` 来获取每个元素。
