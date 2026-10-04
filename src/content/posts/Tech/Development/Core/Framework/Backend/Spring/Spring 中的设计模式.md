---
tags: [Spring, 设计模式]
title: Spring 中的设计模式
date created: 2026-10-04 00:30:00
date modified: 2026-10-04 00:50:00
---

# Spring 中的设计模式

Spring 框架大量使用了经典设计模式，理解这些模式有助于读懂框架源码与扩展点。

1. **工厂模式 (Factory Pattern)**：Spring 使用工厂模式来创建 Bean 对象。`BeanFactory` 和 `ApplicationContext` 是 Spring 中的两个核心工厂接口，它们负责 Bean 的实例化、配置和管理。

2. **单例模式 (Singleton Pattern)**：Spring 中的 Bean 默认是单例的。单例模式确保一个类只有一个实例，并提供全局访问点。这在 Spring 中可以节省资源，提高性能。

3. **代理模式 (Proxy Pattern)**：Spring AOP 的实现依赖于代理模式。Spring 使用 JDK 动态代理或 CGLIB 动态代理来创建代理对象，从而在不修改原始类的情况下，实现对方法调用的拦截和增强。

4. **模板方法模式 (Template Method Pattern)**：Spring 中的 `JdbcTemplate`、`RestTemplate` 等模板类使用了模板方法模式。模板方法模式定义了一个算法的骨架，将一些步骤延迟到子类中实现。这使得子类可以在不改变算法结构的情况下，重新定义算法的某些步骤。

5. **观察者模式 (Observer Pattern)**：Spring 的事件驱动模型基于观察者模式。当一个事件发生时，所有注册的监听器都会收到通知并作出相应的响应。

6. **适配器模式 (Adapter Pattern)**：Spring AOP 中的 `AdvisorAdapter` 使用了适配器模式。适配器模式将一个类的接口转换成客户端所期望的另一个接口，从而使原本不兼容的类能够一起工作。

7. **策略模式 (Strategy Pattern)**：Spring 中的 `PlatformTransactionManager` 使用了策略模式。策略模式定义了一组算法，将每个算法封装起来，并使它们可以互换。这使得算法的变化独立于使用算法的客户端。

8. **装饰器模式 (Decorator Pattern)**：Spring 中的 `BeanWrapper` 使用了装饰器模式。装饰器模式动态地给一个对象添加一些额外的职责，而无需修改其结构。

## 相关

* 代理模式在 AOP 中的落地见 [[Spring AOP]]。
* 事务管理器的策略实现见 [[事务管理]]。
* 面向对象与领域建模见 [[面向对象]]、[[领域驱动设计（DDD）模式概述]]。
