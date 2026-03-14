> [!info] [Kotlin Official Docs](https://kotlinlang.org/docs/home.html)

# Kotlin 学习笔记

## 1 作用域函数和扩展函数

Kotlin提供了一些强大的函数，可以使我们的代码更简洁、更易读。这些函数主要分为两类：作用域函数和扩展函数。

作用域函数允许我们在一个对象的上下文中执行代码块。这些函数可以使我们的代码更简洁、更易读。常用的作用域函数有`let`、`run`、`with`、`apply`和`also`。

扩展函数则允许我们为现有的类添加新的方法，而不需要修改它们的源代码。这可以使我们的代码更简洁、更易读。

### 1.1 作用域函数

- 在Kotlin的作用域函数中，`it`和`this`的使用取决于具体的函数：

	- `let`和`also`：在这两个函数的lambda表达式中，对象被`it`关键字引用。
		
	- `run`、`with`和`apply`：在这三个函数的lambda表达式中，可以直接访问对象的成员，就像在对象的内部一样。也就是说，你可以使用`this`关键字来引用对象，但通常我们会省略`this`。  

- 在Kotlin中，作用域函数的返回值取决于具体的函数：

	- `let`和`run`：这两个函数的返回值是lambda表达式的结果。
		
	- `apply`和`also`：这两个函数的返回值是对象本身。
		
	- `with`：这个函数的返回值是lambda表达式的结果。但请注意，`with`不是一个扩展函数，而是一个普通函数，它接受一个对象和一个lambda表达式作为参数。

#### 1.1.1 Let

`let`函数可以让我们在其lambda表达式中访问对象，并返回结果。它通常用于在一个对象不为null时执行代码。在`let`函数的lambda表达式中，对象被`it`关键字引用。

```kotlin
val list = mutableListOf("Apple", "Banana", "Cherry")

list.let {

    it.add("Durian")

    println(it)  // 输出：[Apple, Banana, Cherry, Durian]

}
```

#### 1.1.2 Run

`run` 函数和 `let` 类似，但它允许我们在 lambda 表达式中直接访问对象的成员，而不需要使用任何标识符。`run` 函数的 lambda 表达式返回一个结果，这个结果是 `run` 函数的结果。

```kotlin
val string = "Hello, World!"

string.run {

    println(length)  // 输出：13

}
```

#### 1.1.3 With

`with` 函数和 `run` 类似，但它不是被调用的对象的扩展函数，而是接受这个对象作为其第一个参数。`with` 函数的 lambda 表达式返回一个结果，这个结果是 `with` 函数的结果。

```kotlin
val list = mutableListOf("Apple", "Banana", "Cherry")

with(list) {

    add("Durian")

    println(this)  // 输出：[Apple, Banana, Cherry, Durian]

}
```

#### 1.1.4 Apply

`apply`函数允许我们在lambda表达式中直接访问对象的成员，并返回对象本身。这使得`apply`函数非常适合在初始化对象的时候设置其属性。

```kotlin
val list = mutableListOf("Apple", "Banana", "Cherry").apply {

    add("Durian")

    println(this)  // 输出：[Apple, Banana, Cherry, Durian]

}
```

#### 1.1.5 Also

`also`函数和`let`类似，但它返回对象本身。使得`also`函数非常适合在已有的表达式中执行额外的操作，例如在一个对象被返回之前记录日志。

```kotlin
val list = mutableListOf("Apple", "Banana", "Cherry").also {

    it.add("Durian")

    println(it)  // 输出：[Apple, Banana, Cherry, Durian]

}
```

### 1.2 扩展函数

扩展函数允许我们为现有的类添加新的方法，而不需要修改它们的源代码。以下是一些示例：

#### 1.2.1 printWithSmile

我们可以为`String`类添加一个`printWithSmile`方法，使其在打印字符串时添加一个笑脸。

```kotlin
// 为String类添加一个新的方法

fun String.printWithSmile() {

    println(this + " :)")

}

// 使用扩展函数

"Hello, World!".printWithSmile()  // 输出：Hello, World! :)
```

#### 1.2.2 Let

我们也可以为`String`类添加一个`let`方法，使其可以在不为null时执行某些操作。

```kotlin
// 为String类添加一个新的方法

fun String.let(action: (String) -> Unit) {

    if (this != null) action(this)

}

// 使用扩展函数

"Hello, World!".let { println(it.length) }  // 输出：13
```

请注意，这个 `let` 函数和 Kotlin 的内置 `let` 函数有所不同。内置的 `let` 函数可以用于任何对象，而我们定义的 `let` 函数只能用于 `String` 对象。此外，内置的 `let` 函数可以返回一个值，而我们定义的 `let` 函数没有返回值。

## 2 循环依赖

> [!note] [](杂七杂八.md#3.5%20循环依赖|循环依赖详细说明)

### 2.1 使用 Lateinit Var 延迟初始化

Kotlin 的 `lateinit var` 关键字允许您声明一个非空变量，但推迟其初始化。这在处理循环依赖时非常有用，因为您可以先声明依赖，然后在需要时再初始化。

```kotlin
@Component
class ClassA {
    @Autowired
    private lateinit var classB: ClassB
}

@Component
class ClassB {
    @Autowired
    private lateinit var classA: ClassA
}
```

### 2.2 使用 by Lazy 委托属性

`by lazy` 委托属性是 Kotlin 的另一个强大工具。它允许您在第一次访问属性时才计算其值，从而实现延迟初始化。

```kotlin
@Component
class ClassA {
    @Autowired
    private val classB: ClassB by lazy { classB }
}

@Component
class ClassB {
    @Autowired
    private val classA: ClassA by lazy { classA }
}
```

### 2.3 使用 @Lazy 注解

与 Java 一样，您也可以在 Kotlin 中使用 `@Lazy` 注解来延迟 Bean 的初始化。

```kotlin
@Component
class ClassA {
    @Autowired
    @Lazy
    private lateinit var classB: ClassB
}

@Component
class ClassB {
    @Autowired
    @Lazy
    private lateinit var classA: ClassA
}
```

### 2.4 构造器注入

在 Kotlin 中，优先使用构造器注入，因为它更符合 Kotlin 的语言习惯，并且可以利用 Spring 解决构造器注入循环依赖的机制。

```kotlin
@Component
class ClassA @Autowired constructor(private val classB: ClassB)

@Component
class ClassB @Autowired constructor(private val classA: ClassA)
```

### 2.5 重新设计依赖关系

如果可能，尽量重新设计 Bean 之间的依赖关系，避免出现循环依赖。例如，可以将共同的依赖提取到一个新的类中，或者使用接口来降低耦合度。

### 2.6 注意事项

- 避免在 `init` 代码块中访问循环依赖的 Bean，因为此时可能尚未初始化。
- 如果使用 Setter 注入，无法避免循环依赖，应尽量避免使用。
