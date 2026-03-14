# Java `Lambda` & `Optional` & `Stream`

> [!summary] 总结
>
> - Lambda 表达式：用于简化函数式接口的实现，提升代码简洁性。
> - Optional 类：用于安全处理可能为空的对象，避免 `NullPointerException`。
> - Stream API：用于声明式处理集合，支持链式操作、并行处理、过滤和聚合。

## 1 Lambda 表达式

Lambda 表达式是 Java 8 引入的一种简化匿名内部类的语法，主要用于实现函数式接口（即只有一个抽象方法的接口）。它可以简化代码结构，减少样板代码。

### 1.1 基本语法

```java
(parameters) -> expression
或
(parameters) -> { statements; }
```

> [!example]
>
> ```java
> // 使用 Lambda 表达式实现 Runnable 接口
> Runnable r = () -> System.out.println("Hello Lambda");
> r.run();
> ```
>
> - `() -> System.out.println("Hello Lambda")` 是 Lambda 表达式，它表示无参数的函数。
> - `Runnable` 是一个函数式接口，Lambda 表达式被用来替换其匿名内部类的实现。

### 1.2 更复杂的 Lambda 示例

```java
// 使用 Lambda 表达式进行列表排序
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.sort((String a, String b) -> a.compareTo(b));

// Lambda 简化写法（类型可以推断）
names.sort((a, b) -> a.compareTo(b));
```

### 1.3 Lambda 表达式和函数式接口

Lambda 表达式只能用于实现具有单个抽象方法的接口，例如：

```java
@FunctionalInterface
interface MyFunction {
    void apply(String value);
}
```

你可以用 Lambda 表达式来实现这个接口：

```java
MyFunction myFunction = (value) -> System.out.println(value);
myFunction.apply("Lambda Test");
```

## 2 Optional 类

`Optional` 是 Java 8 引入的一个容器类，旨在解决 `null` 引发的 `NullPointerException` 问题。通过 `Optional`，你可以更好地处理可能为空的对象。

### 2.1 创建 Optional 对象

```java
Optional<String> optional = Optional.of("Hello");
Optional<String> emptyOptional = Optional.empty();
Optional<String> nullableOptional = Optional.ofNullable(null);
```

- `Optional.of(T value)`：传入的值不能为 `null`，否则抛出 `NullPointerException`。
- `Optional.ofNullable(T value)`：传入的值可以为 `null`，如果为 `null` 则返回一个空的 `Optional` 对象。

### 2.2 使用 Optional 的方法

```java
Optional<String> optional = Optional.ofNullable("Hello");

// 如果值存在，则执行 lambda 表达式
optional.ifPresent(value -> System.out.println(value));  // 输出 "Hello"

// 如果值不存在，则返回默认值
String result = optional.orElse("Default");
System.out.println(result);  // 输出 "Hello"

// 如果值不存在，则执行 lambda 表达式返回默认值
String result2 = optional.orElseGet(() -> "Generated Default");
System.out.println(result2);  // 输出 "Hello"

// 如果值不存在，抛出异常
String result3 = optional.orElseThrow(() -> new IllegalArgumentException("No value present"));
System.out.println(result3);  // 输出 "Hello"
```

### 2.3 Optional 的链式操作

```java
Optional<String> name = Optional.of("John");
String upperCaseName = name.map(String::toUpperCase)
                           .orElse("default");
System.out.println(upperCaseName);  // 输出 "JOHN"
```

## 3 Stream API

`Stream` API 是 Java 8 引入的一个用于处理集合数据的强大工具。它允许你以声明式的方式处理集合，支持链式操作并行处理、过滤、映射和聚合。

### 3.1 创建 Stream

```java
List<String> list = Arrays.asList("a", "b", "c");
Stream<String> stream = list.stream();
```

### 3.2 基本操作

- `map`：对元素进行映射操作，将一种类型转换为另一种类型。
- `filter`：过滤元素，保留满足条件的元素。
- `forEach`：遍历每个元素并执行操作。
- `collect`：将流转换回集合或其他形式。

> [!example]
>
> ```java
> List<String> strings = Arrays.asList("apple", "banana", "orange", "pear", "grape");
> 
> // 将每个字符串转换为大写，并过滤掉长度小于 5 的字符串
> List<String> result = strings.stream()
>                              .map(String::toUpperCase)
>                              .filter(s -> s.length() >= 5)
>                              .collect(Collectors.toList());
> 
> System.out.println(result);  // 输出 [APPLE, BANANA, ORANGE, GRAPE]
> ```

### 3.3 常见的 Stream 操作：

1. **`map` 转换**：

   ```java
   List<Integer> numbers = Arrays.asList(1, 2, 3, 4);
   List<Integer> squaredNumbers = numbers.stream()
                                         .map(n -> n * n)
                                         .collect(Collectors.toList());
   System.out.println(squaredNumbers);  // 输出 [1, 4, 9, 16]
   ```

2. **`filter` 过滤**：

   ```java
   List<String> words = Arrays.asList("hello", "world", "java", "stream");
   List<String> filteredWords = words.stream()
                                     .filter(word -> word.length() > 4)
                                     .collect(Collectors.toList());
   System.out.println(filteredWords);  // 输出 [hello, world, stream]
   ```

3. **`reduce` 聚合**：

   ```java
   List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
   int sum = numbers.stream()
                    .reduce(0, (a, b) -> a + b);
   System.out.println(sum);  // 输出 15
   ```

4. **`sorted` 排序**：

   ```java
   List<String> words = Arrays.asList("banana", "apple", "pear", "orange");
   List<String> sortedWords = words.stream()
                                   .sorted()
                                   .collect(Collectors.toList());
   System.out.println(sortedWords);  // 输出 [apple, banana, orange, pear]
   ```

5. **`collect` 收集结果**：

   ```java
   List<String> strings = Arrays.asList("a", "b", "c");
   String concatenated = strings.stream()
                                .collect(Collectors.joining(", "));
   System.out.println(concatenated);  // 输出 "a, b, c"
   ```
