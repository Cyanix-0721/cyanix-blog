# Java Reflector

> [!summary]
>
> - **Class** 对象是反射的入口，提供了类的元数据。
> - 反射允许动态地创建对象、调用方法和操作字段，即使这些对象、方法和字段在编译时是未知的。
> - 尽管反射提供了强大的灵活性，但应慎用，特别是在性能敏感的场景中。

Java 反射（Java Reflection）是一种强大的机制，允许在运行时检查和操作类、接口、字段和方法等。它使得程序能够动态地获取类的详细信息、创建对象、调用方法等，哪怕这些类或方法在编译时是未知的。

## 1 反射的主要用途

- **动态加载类**：在运行时根据类名加载类，而不是在编译时确定。
- **动态调用方法**：通过反射可以在运行时调用类中的方法，而不是通过硬编码的方法调用。
- **操作字段**：可以获取或修改对象的字段值，包括私有字段。
- **检查类信息**：获取类的构造方法、字段、方法、注解等元数据。

## 2 获取类的 `Class` 对象

在反射机制中，`Class` 类是反射的核心入口。可以通过以下几种方式获取类的 `Class` 对象：

```java
// 通过类的静态属性 .class 获取
Class<?> clazz1 = String.class;

// 通过对象的 getClass() 方法获取
String str = "Hello";
Class<?> clazz2 = str.getClass();

// 通过 Class.forName() 获取
Class<?> clazz3 = Class.forName("java.lang.String");
```

## 3 创建对象

可以通过反射动态创建类的实例：

```java
Class<?> clazz = Class.forName("java.util.ArrayList");

// 调用无参构造函数
Object obj = clazz.getDeclaredConstructor().newInstance();

// 强转为目标类型
ArrayList<String> list = (ArrayList<String>) obj;
```

### 3.1 使用指定构造方法创建对象

```java
Class<?> clazz = Class.forName("java.lang.String");

// 获取带一个字符串参数的构造方法
Constructor<?> constructor = clazz.getConstructor(String.class);

// 通过构造方法创建实例
String str = (String) constructor.newInstance("Hello Reflector");

System.out.println(str);  // 输出 "Hello Reflector"
```

## 4 获取类的字段

通过反射可以访问类的字段，包括私有字段。

### 4.1 获取所有字段

```java
Class<?> clazz = Class.forName("java.lang.String");

// 获取所有声明的字段（包括私有字段）
Field[] fields = clazz.getDeclaredFields();

for (Field field : fields) {
    System.out.println(field.getName());
}
```

### 4.2 访问和修改字段值

```java
Class<?> clazz = Class.forName("MyClass");
Object obj = clazz.getDeclaredConstructor().newInstance();

// 获取字段
Field field = clazz.getDeclaredField("myField");

// 如果是私有字段，需要设置为可访问
field.setAccessible(true);

// 获取字段的值
Object value = field.get(obj);
System.out.println("Field value: " + value);

// 修改字段的值
field.set(obj, "New Value");
System.out.println("Updated field value: " + field.get(obj));
```

## 5 获取和调用方法

通过反射可以获取类中的方法，并在运行时动态调用它们。

### 5.1 获取所有方法

```java
Class<?> clazz = Class.forName("java.lang.String");

// 获取所有声明的方法
Method[] methods = clazz.getDeclaredMethods();

for (Method method : methods) {
    System.out.println(method.getName());
}
```

### 5.2 调用方法

```java
Class<?> clazz = Class.forName("java.lang.String");
Object obj = clazz.getDeclaredConstructor(String.class).newInstance("Hello");

// 获取指定方法
Method method = clazz.getMethod("substring", int.class, int.class);

// 调用方法
String result = (String) method.invoke(obj, 0, 3);
System.out.println(result);  // 输出 "Hel"
```

## 6 访问私有方法和字段

如果要访问类的私有成员，需要将 `setAccessible(true)` 调用设置为允许访问私有属性。

```java
Class<?> clazz = Class.forName("MyClass");
Method privateMethod = clazz.getDeclaredMethod("privateMethod");
privateMethod.setAccessible(true);

// 调用私有方法
privateMethod.invoke(obj);
```

## 7 反射的性能问题

反射的性能比直接调用方法或访问字段要慢，因为它需要绕过 Java 的访问控制机制和做更多的检查。因此，在性能关键的代码中不建议频繁使用反射。

## 8 反射与注解

反射常与注解结合使用，动态分析类或方法的注解，并根据注解执行相应的逻辑。

```java
Class<?> clazz = MyClass.class;

// 获取类上的注解
Annotation[] annotations = clazz.getAnnotations();

for (Annotation annotation : annotations) {
    System.out.println(annotation);
}
```

## 9 反射常见用途

- **动态代理**：反射与动态代理机制结合，用于实现动态方法拦截等功能。
- **框架开发**：如 Spring、Hibernate 等框架大量使用反射来实现 IoC（控制反转）、AOP（面向切面编程）等功能。
- **序列化与反序列化**：反射可以用于读取对象的字段值，从而实现序列化和反序列化。

> [!example] 动态调用类方法
>
> ```java
> import java.lang.reflect.Method;
> 
> public class ReflectorExample {
>     public static void main(String[] args) throws Exception {
>         // 获取类的Class对象
>         Class<?> clazz = Class.forName("java.lang.Math");
> 		
>         // 获取静态方法 sqrt
>         Method method = clazz.getMethod("sqrt", double.class);
> 		
>         // 调用 sqrt 方法
>         double result = (double) method.invoke(null, 16);
>         System.out.println(result);  // 输出 4.0
>     }
> }
> ```
