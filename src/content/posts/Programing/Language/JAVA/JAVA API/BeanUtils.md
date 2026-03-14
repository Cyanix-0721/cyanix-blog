# BeanUtils

`BeanUtils` 是 Apache Commons 提供的一个实用工具类库，用于简化 JavaBean 的操作，特别是在属性复制、属性设置等方面。`BeanUtils` 常用于 Java 项目中来处理对象属性间的转换与拷贝，大大提高了开发效率。

## 1 核心功能

- **属性复制**：在两个 JavaBean 对象之间进行属性复制。
- **属性获取和设置**：通过反射机制获取或设置 JavaBean 的属性。
- **集合和数组处理**：支持对集合类型属性进行复制与操作。
- **属性类型转换**：自动处理基本数据类型与字符串之间的转换。

## 2 BeanUtils 常用方法

### 2.1 `copyProperties`

`copyProperties` 是 BeanUtils 中最常用的方法之一，它可以将一个 JavaBean 对象的属性复制到另一个 JavaBean 中，前提是两个对象的属性名和类型必须一致。典型使用场景是 DTO 和 Entity 之间的数据传递。

**方法签名：**

```java
public static void copyProperties(Object dest, Object orig) throws IllegalAccessException, InvocationTargetException;
```

**示例：**

```java
import org.apache.commons.beanutils.BeanUtils;

public class Main {
    public static void main(String[] args) throws Exception {
        UserDTO userDTO = new UserDTO();
        userDTO.setName("Alice");
        userDTO.setAge(25);

        UserEntity userEntity = new UserEntity();
        BeanUtils.copyProperties(userEntity, userDTO);

        System.out.println(userEntity.getName()); // 输出: Alice
        System.out.println(userEntity.getAge());  // 输出: 25
    }
}

class UserDTO {
    private String name;
    private int age;
    // getter and setter
}

class UserEntity {
    private String name;
    private int age;
    // getter and setter
}
```

### 2.2 `getProperty` 和 `setProperty`

`getProperty` 和 `setProperty` 用于动态获取或设置对象的属性。即便属性是私有的，BeanUtils 也可以通过反射访问它们。

- `getProperty(Object bean, String name)`：获取指定属性的值。
- `setProperty(Object bean, String name, Object value)`：设置指定属性的值。

**示例：**

```java
import org.apache.commons.beanutils.BeanUtils;

public class Main {
    public static void main(String[] args) throws Exception {
        UserDTO user = new UserDTO();
        BeanUtils.setProperty(user, "name", "Bob");
        BeanUtils.setProperty(user, "age", "30");

        String name = BeanUtils.getProperty(user, "name");
        String age = BeanUtils.getProperty(user, "age");

        System.out.println("Name: " + name); // 输出: Name: Bob
        System.out.println("Age: " + age);   // 输出: Age: 30
    }
}

class UserDTO {
    private String name;
    private int age;
    // getter and setter
}
```

### 2.3 `describe`

`describe` 方法将一个 JavaBean 对象转换为一个 `Map<String, String>`，其中键是属性名，值是对应属性的字符串表示。

**方法签名：**

```java
public static Map<String, String> describe(Object bean) throws IllegalAccessException, InvocationTargetException, NoSuchMethodException;
```

**示例：**

```java
import org.apache.commons.beanutils.BeanUtils;

import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        UserDTO user = new UserDTO();
        user.setName("Charlie");
        user.setAge(40);

        Map<String, String> userMap = BeanUtils.describe(user);

        System.out.println(userMap); // 输出: {name=Charlie, age=40, class=class UserDTO}
    }
}

class UserDTO {
    private String name;
    private int age;
    // getter and setter
}
```

## 3 常见问题与注意事项

### 3.1 数据类型转换

`BeanUtils` 在属性复制时会进行自动的数据类型转换，例如将字符串类型的 `age` 自动转换为 `int` 类型。但是，如果源属性类型和目标属性类型不兼容，可能会抛出 `ConversionException` 或 `ClassCastException`。

### 3.2 不支持嵌套对象复制

`BeanUtils.copyProperties` 对于复杂对象（如对象包含嵌套的其他对象）的深度复制不太友好，只能进行浅拷贝。如果需要深拷贝，建议使用其他工具如 `Dozer` 或 `ModelMapper`。

### 3.3 静态字段不支持复制

`BeanUtils.copyProperties` 只会复制对象的实例字段，静态字段不会被复制。
