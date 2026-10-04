---
tags: [Spring, Bean, 循环依赖]
title: Spring 循环依赖
date created: 2026-10-04 00:30:00
date modified: 2026-10-04 01:10:00
---

# Spring 循环依赖

循环依赖是指两个或多个 Bean 之间相互依赖的情况。Spring 容器*不能解决***构造器注入**的循环依赖，但*可以解决***Setter 注入**（以及字段注入）的循环依赖。

## 1 无法解决构造器注入的循环依赖

构造器注入要求 Bean 在**实例化时**就拿到全部依赖。若 Bean A 与 Bean B 通过构造器互相注入，容器创建 A 时必须先创建 B，而创建 B 又必须先用 A，形成"先有鸡还是先有蛋"的死结。

此时容器无法提前暴露一个尚未实例化的对象，没有任何可用的中间态。Spring IoC 容器会在运行时检测到这个循环引用，并抛出 `BeanCurrentlyInCreationException`：

```text
Error creating bean with name 'beanA': Requested bean is currently in creation:
Is there an unresolvable circular reference?
```

## 2 解决 Setter 注入的循环依赖

Setter 注入（以及字段注入）先通过无参构造器完成**实例化**，再在**属性填充**阶段注入依赖。这让容器有机会在 Bean 尚未完成属性填充时，就把它的引用提前暴露出去，从而打破循环。

Spring 容器通过三级缓存来完成这件事。这三级缓存分别是：

1. **SingletonObjects**：缓存已经创建完成的单例 Bean。
2. **EarlySingletonObjects**：缓存提前曝光的单例 Bean，这些 Bean 已经实例化，但还未进行属性填充和初始化。
3. **SingletonFactories**：缓存用于创建 Bean 的工厂。

**解决过程如下（以 Bean A 与 Bean B 互相依赖为例）：**

1. 创建 Bean A：先完成实例化，此时 A 的属性尚未填充；容器把 A 对应的工厂放入 `SingletonFactories`。
2. 容器为 A 填充属性，发现 A 依赖 Bean B，于是转去创建 Bean B。
3. 创建 Bean B：同样先完成实例化，并把 B 对应的工厂放入 `SingletonFactories`。
4. 容器为 B 填充属性，发现 B 依赖 Bean A。此时从 `SingletonFactories` 中取出 A 的工厂，调用它取得 A 的早期引用，放入 `EarlySingletonObjects`，并把这个早期引用注入给 B。
5. Bean B 完成属性填充与初始化后，被放入 `SingletonObjects`。
6. Bean A 因此拿到了可用的 B，完成自身的属性填充与初始化；A 从 `EarlySingletonObjects` 与 `SingletonFactories` 中移除，放入 `SingletonObjects`。

通过这种方式，Spring 容器可以在 Bean A 完全创建完成之前，将其提前曝光给需要依赖它的 Bean，从而解决了 Setter 注入的循环依赖问题。

> [!warning] 提前曝光的是未完成初始化的对象
> 由于 A 在被完全初始化之前就注入给了 B，B 持有的是 A 的**早期引用**（必要时还会是一个提前生成的代理对象）。若 B 在此时调用 A，可能读到尚未就绪的状态。这也是循环依赖应当尽量避免的根本原因。

## 3 循环依赖的应对方法

1. **使用 `@Lazy` 注解：** 在依赖注入的字段、方法或**构造器参数**上添加 `@Lazy` 注解，容器会注入一个延迟初始化的代理，直到第一次使用时才真正创建目标 Bean，从而打破循环。
2. **调整依赖关系：** 重新设计 Bean 之间的依赖关系，从根源上避免出现循环依赖。
3. **使用接口：** 将 Bean 之间的依赖关系改为接口依赖，可以降低耦合度，便于抽取中间层来打破环。
4. **改用 Setter 或字段注入：** 把参与循环的一方从构造器注入改为 Setter 注入，让三级缓存有机会介入。这是 Spring 官方文档给出的可行方案，但会牺牲构造器注入"依赖不可变、必不为 `null`"的优势，**不推荐**作为长期方案。

## 4 Spring Boot 2.6 起默认禁止循环引用

从 Spring Boot 2.6 开始，容器**默认禁止** Bean 之间的循环引用，启动时直接报错。这是为了避免应用长期依赖难以察觉的循环结构。

在完成重构之前，可以临时放开：

```properties
spring.main.allow-circular-references=true
```

该属性默认为 `false`。放开后，Setter 与字段注入的循环依赖会重新走三级缓存流程；构造器注入的循环依赖仍然无法解决。

## 5 相关

* Bean 的生命周期与容器机制见 [[Spring IoC（控制反转）]]。
* 三种注入方式的选择见 [[Spring 依赖注入]]。
* 其他语言中的循环依赖处理（如 Kotlin `lateinit var`）见 [[Kotlin#2 循环依赖|Kotlin]]。
