---
tags: 
title: Java中的default
aliases: Java中的default
date created: 2024-11-19 01:06:09
date modified: 2026-03-14 09:35:20
date: 2026-03-15 02:52:39
---

# Java中的default

## 1 默认访问权限(default)

### 1.1 什么是default访问权限？

default访问权限也称为包访问权限（package-private），是Java中的默认访问级别。当一个类、方法或字段没有被explicit声明访问修饰符时，就会采用default访问权限。

### 1.2 特点

- 不需要使用任何关键字声明
- 只能在同一个包内访问
- 对包外的类完全不可见

### 1.3 示例代码

```java
// 在 com.example 包中
package com.example;

// 使用default访问权限的类
class DefaultClass {
    // default访问权限的字段
    int number = 10;
    
    // default访问权限的方法
    void display() {
        System.out.println("Number: " + number);
    }
}

// 同包中的其他类可以访问
class AnotherClass {
    void accessDefault() {
        DefaultClass obj = new DefaultClass(); // 允许访问
        obj.display();                        // 允许访问
        System.out.println(obj.number);       // 允许访问
    }
}
```

### 1.4 不同包的访问示例

```java
// 在 com.another 包中
package com.another;

import com.example.DefaultClass; // 这行会编译错误

public class OtherPackageClass {
    void tryAccess() {
        DefaultClass obj = new DefaultClass(); // 编译错误
        // 不能访问其他包中的default访问权限的类
    }
}
```

### 1.5 访问权限对比

| 访问修饰符 | 同类 | 同包 | 子类 | 其他包 |
|-----------|------|------|------|--------|
| private   | ✓    | ✗    | ✗    | ✗      |
| default   | ✓    | ✓    | ✗    | ✗      |
| protected | ✓    | ✓    | ✓    | ✗      |
| public    | ✓    | ✓    | ✓    | ✓      |

## 2 接口默认方法(default method)

### 2.1 什么是default方法?

Java 8引入的新特性,允许在接口中定义带有具体实现的方法,使用default关键字修饰。这种方法称为"默认方法"或"defender方法"。

### 2.2 特点

- 必须使用default关键字声明
- 必须提供方法体
- 实现类可以直接使用,无需重写
- 实现类也可以选择重写default方法
- 只能在接口中定义，普通类和抽象类中不能使用default修饰方法

### 2.3 示例代码

```java
public interface Vehicle {
    // 抽象方法
    void start();
    
    // default方法带有默认实现
    default void horn() {
        System.out.println("Beep beep!");
    }
    
    default void stop() {
        System.out.println("Vehicle stopping…");
        performSafetyChecks();
    }
    
    // 可以调用接口中的私有方法
    private void performSafetyChecks() {
        System.out.println("Performing safety checks");
    }
}

// 实现类可以直接使用default方法
class Car implements Vehicle {
    @Override
    public void start() {
        System.out.println("Car starting");
    }
    // 无需实现horn()和stop(),可以直接使用默认实现
}

// 实现类也可以选择重写default方法
class SportsCar implements Vehicle {
    @Override
    public void start() {
        System.out.println("SportsCar starting");
    }
    
    @Override
    public void horn() {
        System.out.println("HONK HONK!"); // 重写默认实现
    }
}
```

### 2.4 多重继承问题

当一个类实现多个接口,且这些接口有相同的default方法时:

```java
interface A {
    default void show() {
        System.out.println("A");
    }
}

interface B {
    default void show() {
        System.out.println("B");
    }
}

class C implements A, B {
    // 必须重写show()方法解决冲突
    @Override
    public void show() {
        // 可以选择调用某个接口的默认实现
        A.super.show(); // 调用接口A的默认实现
        // 或
        B.super.show(); // 调用接口B的默认实现
    }
}
```

### 2.5 接口default方法与抽象类的区别

1. **接口default方法**
   - 只能在接口中定义
   - 不能访问实例字段(接口没有实例字段)
   - 主要用于向后兼容性
   - 可以有多个接口的default方法(多重继承)

2. **抽象类方法**
   - 可以有具体实现的普通方法
   - 可以访问实例字段
   - 更适合定义类的基本行为
   - 只能单继承

## 3 最佳实践

### 3.1 默认访问权限(default)最佳实践

- 当类仅在包内使用时，优先使用default访问权限
- 避免过度使用public，合理利用default实现封装
- 将相关的类放在同一个包中，充分利用default访问权限的特性

### 3.2 接口默认方法(default method)最佳实践

- 谨慎使用default方法,不要过度依赖
- 优先考虑向后兼容性
- 为default方法提供清晰的文档说明
- 在添加default方法时考虑对现有实现的影响
- 处理好多重继承可能带来的冲突

## 4 注意事项

1. default访问权限和default方法是两个不同的概念
2. default方法不能重写Object类的方法
3. 接口中的default方法必须是public的(可以省略public修饰符)
4. 如果实现多个接口时有方法冲突,必须在实现类中重写该方法
5. default方法可以调用接口中的其他方法(包括抽象方法)
6. 普通类和抽象类中不能使用default关键字定义方法
