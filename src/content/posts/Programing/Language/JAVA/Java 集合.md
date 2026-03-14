# Java 集合

> [!summary]
>
> - **`Collection`** 是所有集合的基础接口，提供了集合的基本操作。
> - **`List`** 维护有序的元素集合，允许重复，常见实现包括 `ArrayList` 和 `LinkedList`。
> - **`Map`** 是用于存储键值对的接口，常见实现包括 `HashMap` 和 `TreeMap`。
> - **`Set`** 表示无序且不允许重复的集合，常见实现包括 `HashSet` 和 `TreeSet`。
> - **`HashMap`** 提供基于哈希表的键值对存储。
> - **`LinkedHashMap`** 和 `LinkedHashSet` 都维护了插入顺序。
> - **`TreeMap`** 和 **`TreeSet`** 维护元素的自然顺序或自定义顺序，适合需要排序的场景。

## 1 `Collection` 接口

`Collection` 是 Java 集合框架中的根接口，提供了基本的集合操作方法，像 `add()`、`remove()`、`contains()` 等。常见的子接口包括 `List`、`Set` 和 `Queue`，它们在具体实现中有不同的特性。

`Collection` 的一些常用方法：

- **`add(E e)`**：向集合中添加元素。
- **`remove(Object o)`**：移除集合中的某个元素。
- **`contains(Object o)`**：检查集合中是否包含某个元素。
- **`size()`**：返回集合中的元素数量。
- **`isEmpty()`**：检查集合是否为空。
- **`Collections.emptyList()`**：返回空 `List`。
- **`Collections.emptySet()`**：返回空 `Set`。
- **`Collections.emptyMap()`**：返回空 `Map`。

## 2 `List` 接口

`List` 是 `Collection` 的子接口，表示一个有序的元素集合，允许重复元素。常见实现类包括 `ArrayList` 和 `LinkedList`。

`List` 的常用方法：

- **`get(int index)`**：根据索引获取元素。
- **`set(int index, E element)`**：替换指定索引处的元素。
- **`add(int index, E element)`**：在指定位置插入元素。
- **`remove(int index)`**：根据索引移除元素。

## 3 `ArrayList`

`ArrayList` 是 `List` 接口的一个实现类，基于动态数组来存储元素。它提供了可变大小的数组，允许存储重复的元素，并且提供了对元素的快速随机访问。

**特性：**

- **有序**：`ArrayList` 维护插入顺序。
- **允许重复**：可以存储重复的元素。
- **线程不安全**：不是线程安全的，多线程环境下需要手动同步。
- **性能**：随机访问性能较好（时间复杂度为 O(1)），但在中间插入或删除元素时，性能较差（时间复杂度为 O(n)）。

**示例：**

```java
import java.util.ArrayList;

public class ArrayListExample {
    public static void main(String[] args) {
        ArrayList<String> list = new ArrayList<>();
        list.add("Apple");
        list.add("Banana");
        list.add("Cherry");

        // 按索引访问元素
        System.out.println("Element at index 1: " + list.get(1));

        // 插入元素
        list.add(1, "Blueberry");

        // 删除元素
        list.remove("Cherry");

        // 遍历列表
        for (String fruit : list) {
            System.out.println(fruit);
        }
    }
}
```

## 4 `Vector`

`Vector` 是一种同步的动态数组实现，类似于 `ArrayList`，但它的所有方法都是线程安全的。由于同步的开销，`Vector` 的性能通常比 `ArrayList` 要差，在不需要线程安全的情况下，不推荐使用 `Vector`，而推荐使用 `ArrayList`。

**特性：**

- **同步**：`Vector` 是线程安全的，所有方法都被同步。
- **动态数组**：类似于 `ArrayList`，`Vector` 可以自动增长存储容量。
- **有序**：`Vector` 维护插入顺序。
- **允许重复**：`Vector` 允许存储重复元素。
- **性能**：由于同步机制，`Vector` 的性能较 `ArrayList` 差。

**示例：**

```java
import java.util.Vector;

public class VectorExample {
    public static void main(String[] args) {
        Vector<String> vector = new Vector<>();
        vector.add("Apple");
        vector.add("Banana");
        vector.add("Cherry");

        // 插入元素到指定位置
        vector.add(1, "Blueberry");

        // 获取元素
        System.out.println("Element at index 1: " + vector.get(1));

        // 移除元素
        vector.remove("Banana");

        // 遍历Vector
        for (String fruit : vector) {
            System.out.println(fruit);
        }
    }
}
```

**适用场景：**

- 当你需要线程安全的 `List` 时，可以选择使用 `Vector`，但更推荐使用 `Collections.synchronizedList()` 来包装一个 `ArrayList`，因为这种方式性能更好。
- 如果不需要线程安全的操作，推荐使用 `ArrayList` 代替 `Vector`。

## 5 `Stack`

`Stack` 是一种基于 **后进先出 (LIFO)** 原则的数据结构，继承自 `Vector`。虽然 `Stack` 提供了一些独有的方法，但由于它是同步的（继承自 `Vector`），性能较差，因此建议在不需要线程安全的情况下，使用 `Deque` 代替 `Stack`。

**特性：**

- **LIFO**：`Stack` 按照后进先出的原则操作元素。
- **同步**：`Stack` 是线程安全的，所有方法都被同步。
- **动态数组**：`Stack` 基于 `Vector`，可以动态扩展存储容量。
- **有序**：`Stack` 按照元素的入栈顺序保持顺序。
- **允许重复**：`Stack` 允许存储重复元素。
- **性能**：由于继承自 `Vector`，所有方法都是同步的，因此性能较 `Deque` 差。

**常用方法：**

- **`push(E item)`**：将元素压入栈顶。
- **`pop()`**：移除并返回栈顶元素。
- **`peek()`**：返回栈顶元素但不移除它。
- **`isEmpty()`**：判断栈是否为空。
- **`search(Object o)`**：返回元素在栈中的位置，基于 1 索引，若不存在则返回 -1。

**示例：**

```java
import java.util.Stack;

public class StackExample {
    public static void main(String[] args) {
        Stack<Integer> stack = new Stack<>();

        // 将元素压入栈
        stack.push(10);
        stack.push(20);
        stack.push(30);

        // 查看栈顶元素
        System.out.println("Peek: " + stack.peek());  // 输出 30

        // 移除栈顶元素
        System.out.println("Pop: " + stack.pop());    // 输出 30

        // 判断栈是否为空
        System.out.println("Is stack empty? " + stack.isEmpty());  // 输出 false

        // 搜索元素
        System.out.println("Position of 10: " + stack.search(10));  // 输出 2
    }
}
```

**适用场景：**

- 当你需要线程安全的栈操作时，可以使用 `Stack`，但推荐使用 `Collections.synchronizedList()` 来包装 `ArrayDeque`，以获得更好的性能和灵活性。
- 对于非线程安全的栈，建议使用 `Deque`（如 `ArrayDeque`）来代替 `Stack`。

## 6 `LinkedList`

`LinkedList` 是 `List` 和 `Deque` 接口的实现类，基于双向链表来存储元素。它可以用作列表、栈或队列。与 `ArrayList` 相比，`LinkedList` 在中间插入和删除元素时性能较好，但随机访问元素时性能较差。

**特性：**

- **有序**：`LinkedList` 维护插入顺序。
- **允许重复**：可以存储重复的元素。
- **线程不安全**：不是线程安全的，多线程环境下需要手动同步。
- **性能**：在插入和删除操作上性能较好（时间复杂度为 O(1)），但随机访问性能较差（时间复杂度为 O(n)）。

**示例：**

```java
import java.util.LinkedList;

public class LinkedListExample {
    public static void main(String[] args) {
        LinkedList<String> list = new LinkedList<>();
        list.add("Apple");
        list.add("Banana");
        list.add("Cherry");

        // 插入元素到开头
        list.addFirst("Blueberry");

        // 插入元素到末尾
        list.addLast("Dragonfruit");

        // 删除第一个元素
        list.removeFirst();

        // 获取第一个和最后一个元素
        System.out.println("First element: " + list.getFirst());
        System.out.println("Last element: " + list.getLast());

        // 遍历列表
        for (String fruit : list) {
            System.out.println(fruit);
        }
    }
}
```

**适用场景：**
- 频繁在列表中间插入或删除元素时，`LinkedList` 比 `ArrayList` 表现更好。
- 需要用作栈或队列时，`LinkedList` 提供了相关操作，如 `push()`、`pop()`、`offer()` 等方法。

## 7 `Map` 接口

`Map` 并不是 `Collection` 的子接口，它表示一种键值对的数据结构。`Map` 中的键是唯一的，而值可以重复。常见实现类包括 `HashMap`、`LinkedHashMap` 和 `TreeMap`。

`Map` 的常用方法：

- **`put(K key, V value)`**：向映射中插入键值对。
- **`get(Object key)`**：根据键获取值。
- **`remove(Object key)`**：移除键值对。
- **`containsKey(Object key)`**：检查映射中是否包含指定键。
- **`size()`**：返回映射中键值对的数量。

### 7.1 `HashMap`

`HashMap` 是基于哈希表实现的键值对存储容器，具有快速查询、插入和删除的能力。键可以是任何对象，但需要实现 `hashCode()` 和 `equals()` 方法，以确保在哈希表中的正确存储和比较。

**特性：**

- **无序**：`HashMap` 中的键值对不保证按照插入顺序存储。
- **允许 `null`**：最多允许一个 `null` 键，并允许多个 `null` 值。
- **非线程安全**：在多线程环境中使用 `HashMap` 需要额外的同步机制。如果需要线程安全的 `Map`，可以使用 `ConcurrentHashMap` 或 `Collections.synchronizedMap()`。
- **查询效率**：在最优情况下，`HashMap` 的查找、插入和删除操作时间复杂度为 O(1)，但在哈希冲突严重的情况下效率可能退化。

#### 7.1.1 红黑树的引入

在 JDK 1.8 之前，`HashMap` 采用 **数组 + 链表** 结构处理哈希冲突，当链表过长时，查找效率会从 O(1) 退化为 O(n)。为了解决这个问题，JDK 1.8 引入了 **红黑树** 机制。当链表长度超过 8 时，链表自动转换为红黑树，使最坏情况下的查找时间复杂度提升为 **O(log n)**。因此，JDK 1.8 之后的 `HashMap` 结构变为 **数组 + 链表 + 红黑树**，有效优化了大规模哈希冲突下的性能。

##### 7.1.1.1 红黑树特性

- **平衡二叉树**：红黑树是一种自平衡的二叉查找树，保证在最坏情况下，树的高度不会超过 O(log n)。
- **时间复杂度**：在红黑树中，插入、删除、查找的时间复杂度均为 O(log n)，远远优于链表的 O(n)。

##### 7.1.1.2 红黑树的转换条件

- **树化条件**：当某个桶中的链表长度大于 8 时，链表将转换为红黑树，以提高查找效率。
- **退化条件**：如果经过扩容后，链表长度减少到 6 以下，红黑树会重新退化为链表，以节省红黑树的维护开销。

##### 7.1.1.3 相关源码

`HashMap` 的 `put` 操作中包含了红黑树转换逻辑：

```java
if (binCount >= TREEIFY_THRESHOLD - 1) // TREEIFY_THRESHOLD 默认为 8
    treeifyBin(tab, hash);
```

`treeifyBin` 方法用于将链表转换为红黑树：

```java
final void treeifyBin(Node<K,V>[] tab, int hash) {
    int n, index; Node<K,V> e;
    if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
        resize();
    else if ((e = tab[index = (n - 1) & hash]) != null) {
        TreeNode<K,V> hd = null, tl = null;
        do {
            TreeNode<K,V> p = replacementTreeNode(e, null);
            if (tl == null)
                hd = p;
            else {
                p.prev = tl;
                tl.next = p;
            }
            tl = p;
        } while ((e = e.next) != null);
        if ((tab[index] = hd) != null)
            hd.treeify(tab);
    }
}
```

当链表长度超过阈值时，`HashMap` 会通过 `treeifyBin` 方法将链表节点转换为 `TreeNode`，并以红黑树的结构进行存储。

## 8 `LinkedHashMap`

`LinkedHashMap` 是 `HashMap` 的子类，它维护了键值对的插入顺序或访问顺序。

**特性：**

- **有序**：按插入顺序（默认）或最近访问的顺序存储键值对。
- **性能稍慢**：因为需要维护顺序。

示例：

```java
import java.util.LinkedHashMap;

public class LinkedHashMapExample {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> map = new LinkedHashMap<>();
        map.put("Apple", 3);
        map.put("Banana", 5);
        map.put("Cherry", 2);

        for (String key : map.keySet()) {
            System.out.println(key + ": " + map.get(key));
        }
    }
}
```

## 9 `TreeMap`

`TreeMap` 是基于红黑树实现的 `Map`，键值对按键的自然顺序或自定义顺序排序。

**特性：**

- **有序性**：键按自然顺序或自定义顺序排列。
- **不允许 null 键**。
- **非线程安全**。

示例：

```java
import java.util.TreeMap;

public class TreeMapExample {
    public static void main(String[] args) {
        TreeMap<String, Integer> map = new TreeMap<>();
        map.put("Banana", 5);
        map.put("Apple", 3);
        map.put("Cherry", 2);

        for (String key : map.keySet()) {
            System.out.println(key + ": " + map.get(key));
        }
    }
}
```

## 10 `Set` 接口

`Set` 是 `Collection` 的子接口，它表示一个不允许重复元素的集合。常见实现类包括 `HashSet`、`LinkedHashSet` 和 `TreeSet`。

## 11 `HashSet`

`HashSet` 是基于哈希表实现的 `Set`，不允许重复元素。

**特性：**

- **无序**：元素的顺序无法保证。
- **允许 null 元素**：最多只能有一个 `null` 元素。

示例：

```java
import java.util.HashSet;

public class HashSetExample {
    public static void main(String[] args) {
        HashSet<String> set = new HashSet<>();
        set.add("Apple");
        set.add("Banana");
        set.add("Cherry");

        System.out.println(set);
    }
}
```

## 12 `LinkedHashSet`

`LinkedHashSet` 继承自 `HashSet`，它维护了元素的插入顺序。

**特性：**

- **有序**：元素按插入顺序存储。
- **性能稍慢**：维护顺序带来性能开销。

示例：

```java
import java.util.LinkedHashSet;

public class LinkedHashSetExample {
    public static void main(String[] args) {
        LinkedHashSet<String> set = new LinkedHashSet<>();
        set.add("Apple");
        set.add("Banana");
        set.add("Cherry");

        for (String fruit : set) {
            System.out.println(fruit);
        }
    }
}
```

## 13 `TreeSet`

`TreeSet` 是基于红黑树实现的 `Set`，它保证元素的顺序。

**特性：**

- **有序性**：按自然顺序或自定义顺序存储元素。
- **不允许 null 元素**。
- **不允许重复元素**。

示例：

```java
import java.util.TreeSet;

public class TreeSetExample {
    public static void main(String[] args) {
        TreeSet<String> set = new TreeSet<>();
        set.add("Banana");
        set.add("Apple");
        set.add("Cherry");

        for (String fruit : set) {
            System.out.println(fruit);
        }
    }
}
```

> [!info] **应用场景**
>
> - 使用 `TreeMap` 和 `TreeSet` 时，如果需要对元素进行排序，或者需要范围查询（例如获取某个区间的元素），可以利用它们的有序性和红黑树结构的高效操作。

## 14 扩容机制

> [!summary]
>
> - **`ArrayList` 扩容机制**：每次扩容为当前容量的 1.5 倍，利用数组的复制操作完成扩容。
> - **`HashMap` 扩容机制**：每次扩容为当前容量的 2 倍，通过重新计算元素哈希值进行重新分布，并在链表较长时将其树化。

### 14.1 `ArrayList` 扩容机制

`ArrayList` 是基于数组实现的动态数组，当向 `ArrayList` 添加元素时，如果数组空间不足，会自动进行扩容。

#### 14.1.1 扩容逻辑

- 初始容量（默认 10）：`ArrayList` 初始化时，如果没有指定容量，默认容量为 10。
- 扩容方式：每次扩容时，`ArrayList` 将当前容量扩展为原来的 **1.5 倍**（即 `newCapacity = oldCapacity + (oldCapacity >> 1)`）。
- 扩容触发：当插入新元素且当前容量不足时，触发扩容操作。

#### 14.1.2 源码解析

在 `ArrayList` 的 `add` 方法中，当需要扩容时，会调用 `ensureCapacityInternal()` 方法：

```java
public boolean add(E e) {
    // 确保当前数组有足够的容量来添加新元素
    ensureCapacityInternal(size + 1);  // size + 1 表示添加元素后的所需容量
    // 将新元素放入数组，并将 size 值加一
    elementData[size++] = e;
    return true;
}

private void ensureCapacityInternal(int minCapacity) {
    // 如果当前数组为默认的空数组（即尚未分配实际存储空间）
    if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        // 取默认容量与需要的最小容量中较大的一个，避免扩容过小
        minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity);
    }
    // 确保数组具备指定的最小容量
    ensureExplicitCapacity(minCapacity);
}

private void ensureExplicitCapacity(int minCapacity) {
    // 修改次数加一，用于记录 `Vector` 的结构性修改，保证在多线程环境中的并发正确性
    modCount++;

    // 如果需要的最小容量大于当前数组的长度，则进行扩容
    if (minCapacity - elementData.length > 0)
        grow(minCapacity);
}

private void grow(int minCapacity) {
    // 当前数组的容量（即数组的长度）
    int oldCapacity = elementData.length;
    // 扩容为原容量的 1.5 倍，右移 1 位相当于 oldCapacity / 2
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    // 如果扩容后的容量仍然不足以满足最小需求，则使用最小容量
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    // 检查新容量是否超过数组的最大允许大小，防止内存溢出
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    // 将原数组的内容复制到新的扩容数组中，并分配给 `elementData`
    elementData = Arrays.copyOf(elementData, newCapacity);
}

private int hugeCapacity(int minCapacity) {
    // 如果需要的容量大于最大数组大小，则使用 Integer.MAX_VALUE 作为上限
    if (minCapacity < 0) // overflow
        throw new OutOfMemoryError();
    return (minCapacity > MAX_ARRAY_SIZE) ? Integer.MAX_VALUE : MAX_ARRAY_SIZE;
}
```

#### 14.1.3 解释

- `ensureCapacityInternal(size + 1)`：在插入元素之前，`ArrayList` 会检查容量是否足够，不足时调用 `grow()` 方法进行扩容。
- `grow()` 方法中，`oldCapacity >> 1` 相当于将原容量除以 2，表示扩容为 1.5 倍。
- 如果 `newCapacity` 小于 `minCapacity`，即扩容后的容量仍不足以容纳当前所有元素，则直接将容量扩展为 `minCapacity`。

#### 14.1.4 总结

`ArrayList` 每次扩容时，按照 1.5 倍的规则进行扩展，确保能够容纳新增元素，同时避免频繁扩容带来的性能开销。

### 14.2 `Vector` 扩容机制

`Vector` 是一种线程安全的动态数组，它的扩容机制类似于 `ArrayList`，但由于其线程安全的特性，性能通常较差。`Vector` 的扩容方式比较特殊，它采用 **1.5 倍扩容**，即每次扩容时，数组的容量增加到原来容量的 1.5 倍。

#### 14.2.1 扩容逻辑

- **初始容量**：`Vector` 的默认初始容量为 10，当然也可以通过构造函数进行自定义。
- **扩容方式**：当元素数量超过当前容量时，`Vector` 会将容量扩展为 **原容量的 1.5 倍**。
- **线程安全**：`Vector` 的所有方法都使用了 `synchronized` 关键字，确保线程安全。
- **自定义增长量**：除了默认的 1.5 倍增长，`Vector` 还允许开发者自定义增长量，每次扩容时可以通过设置 `capacityIncrement` 来决定增加的容量大小。

#### 14.2.2 源码解析

`Vector` 的 `add` 方法会调用 `ensureCapacityHelper`，来确保足够的存储空间：

```java
public synchronized boolean add(E e) {
    modCount++;
    ensureCapacityHelper(elementCount + 1);
    elementData[elementCount++] = e;
    return true;
}

private void ensureCapacityHelper(int minCapacity) {
    // 如果最小容量超过当前数组的容量，则需要扩容
    if (minCapacity - elementData.length > 0)
        grow(minCapacity);
}

private void grow(int minCapacity) {
    // 获取当前数组的容量
    int oldCapacity = elementData.length;
    // 扩容为原容量的 1.5 倍
    int newCapacity = oldCapacity + ((capacityIncrement > 0) ? capacityIncrement : oldCapacity >> 1);
    // 如果新容量仍然不足，则取最小容量作为新的容量
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    // 防止扩容过大
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    // 将原数组内容复制到新数组中
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

#### 14.2.3 解释

- `ensureCapacityHelper`：在添加新元素前，会调用此方法确保数组容量足够。当新容量不足时，触发扩容。
- **扩容倍数**：默认情况下，`Vector` 每次扩容会将容量增加到原来的 1.5 倍，具体实现是通过位移操作 `(oldCapacity >> 1)` 实现的。
- **自定义扩容**：如果构造 `Vector` 时指定了 `capacityIncrement`，则每次扩容增加的容量是该值，而不是 1.5 倍增长。

#### 14.2.4 重要源码分析

`Vector` 的扩容是通过 `grow` 方法实现的，其核心逻辑如下：

```java
int newCapacity = oldCapacity + ((capacityIncrement > 0) ? capacityIncrement : oldCapacity >> 1);
```

- 当 `capacityIncrement` 为正数时，使用自定义的增量进行扩容。
- 如果没有设置 `capacityIncrement`，则按照默认的 1.5 倍扩容。

#### 14.2.5 总结

- `Vector` 的扩容机制类似于 `ArrayList`，默认情况下扩容为 **1.5 倍**，以确保数组容量的动态调整。
- 如果提供了 `capacityIncrement` 参数，可以自定义每次扩容时的增量大小。
- 由于 `Vector` 是线程安全的，因此其性能通常较 `ArrayList` 差，建议在不需要线程安全时优先使用 `ArrayList`。

### 14.3 `HashMap` 扩容机制

`HashMap` 是基于哈希表实现的键值对集合，当装载因子（`load factor`）超过一定阈值时，会触发扩容。

#### 14.3.1 扩容逻辑

- 初始容量（默认 16）：`HashMap` 的默认容量为 16。
- 装载因子：默认装载因子为 0.75。当哈希表中的元素数量超过 `capacity * load factor` 时，触发扩容。
- 扩容方式：每次扩容时，`HashMap` 的容量变为当前容量的 **2 倍**。
- 扩容触发：在插入新元素时，如果元素数量超过阈值（`threshold`），即 `size >= capacity * load factor`，触发扩容。

#### 14.3.2 源码解析

在 `HashMap` 的 `putVal` 方法中，插入元素时会检查是否需要扩容：

```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent, boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    // 如果当前 table 为空，调用 resize() 进行初始化或扩容
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length;
    // 计算插入位置
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    else {
        Node<K,V> e; K k;
        // 遍历链表处理冲突
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
            e = p;
        else if (p instanceof TreeNode)
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        else {
            for (int binCount = 0; ; ++binCount) {
                if ((e = p.next) == null) {
                    p.next = newNode(hash, key, value, null);
                    if (binCount >= TREEIFY_THRESHOLD - 1) // 树化
                        treeifyBin(tab, hash);
                    break;
                }
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                p = e;
            }
        }
        if (e != null) { // 覆盖旧值
            V oldValue = e.value;
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;
            afterNodeAccess(e);
            return oldValue;
        }
    }
    ++modCount;
    // 插入后检查是否超过阈值，超过则进行扩容
    if (++size > threshold)
        resize();
    afterNodeInsertion(evict);
    return null;
}

final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;
    // 初始化或扩容
    if (oldCap > 0) {
        // 如果旧容量达到最大容量，不能再扩容
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        // 扩容为两倍
        newCap = oldCap << 1;
        if (newCap < MAXIMUM_CAPACITY && oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // 阈值也扩展为原来的两倍
    }
    else if (oldThr > 0) // 初始化容量为阈值
        newCap = oldThr;
    else {               // 使用默认值进行初始化
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    // 计算新的阈值
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                  (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr;
    @SuppressWarnings({"rawtypes","unchecked"})
    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    // 将旧表的内容复制到新表中
    if (oldTab != null) {
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;
                if (e.next == null)
                    newTab[e.hash & (newCap - 1)] = e;
                else if (e instanceof TreeNode)
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                else { // 处理链表
                    Node<K,V> loHead = null, loTail = null;
                    Node<K,V> hiHead = null, hiTail = null;
                    Node<K,V> next;
                    do {
                        next = e.next;
                        if ((e.hash & oldCap) == 0) {
                            if (loTail == null)
                                loHead = e;
                            else
                                loTail.next = e;
                            loTail = e;
                        }
                        else {
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);
                    if (loTail != null)
                        loTail.next = null;
                    newTab[j] = loHead;
                    if (hiTail != null)
                        hiTail.next = null;
                    newTab[j + oldCap] = hiHead;
                }
            }
        }
    }
    return newTab;
}
```

#### 14.3.3 解释

- `resize()`：当 `HashMap` 需要扩容时，`resize()` 方法会被调用，它主要完成以下任务：

1. **判断是否需要扩容：**
   - 通过检查当前容量 `oldCap` 来决定是否扩容。
   - 如果 `oldCap` 达到最大容量 `MAXIMUM_CAPACITY`，则不再扩容，直接返回当前的哈希表。
   - 如果当前容量小于最大容量，则容量扩展为原来的 **2 倍**。

2. **扩容后重新分配：**
   - 创建一个新的哈希表 `newTab`，其容量为旧哈希表的两倍。
   - 重新计算每个键值对在新哈希表中的位置，并进行迁移。

3. **重新分布节点：**
   - 对于每个节点，根据新的容量重新计算其存储位置，避免哈希冲突。
   - 链表节点分为两类：`loHead` 对应的节点保持原索引位置，`hiHead` 对应的节点移到新的索引位置 `j + oldCap`。
   - 如果该位置上的链表长度超过一定值（默认 8），会转换为红黑树存储，称为“树化”过程，优化查找性能。

#### 14.3.4 重要源码分析

扩容是 `resize()` 的核心步骤，旧节点的重新分布是通过以下逻辑实现的：

```java
if ((e.hash & oldCap) == 0) {
    if (loTail == null)
        loHead = e;
    else
        loTail.next = e;
    loTail = e;
} else {
    if (hiTail == null)
        hiHead = e;
    else
        hiTail.next = e;
    hiTail = e;
}
```

- `e.hash & oldCap == 0`：通过这种位运算，可以判断节点是否可以保留在原位置，还是需要移动到新位置。
- 对于保留在原位置的节点，链接到 `loHead` 链表中；对于需要移动的节点，链接到 `hiHead` 链表中。

#### 14.3.5 总结

- `HashMap` 在 JDK 1.8 中的扩容机制以 **2 倍扩容**为核心，每次容量扩展时会重新计算元素的存储位置，并在链表长度较长时将其树化，以提高查询效率。
- 当 `HashMap` 的元素数量达到当前容量的 `75%` 时（即默认装载因子 0.75），扩容操作会被触发。
