> [!info]  
> [Oracle 官方文档](https://docs.oracle.com/en/database/)  
> [Oracle Learning Library](https://www.oracle.com/learning-library/)

# Oracle 数据库

## 1 简介

- Oracle 数据库，又称 Oracle RDBMS (**R**elational **D**ata**b**ase **M**anagement **S**ystem)，是由甲骨文公司开发和维护的对象-关系数据库管理系统

- 基于 C/S 技术

- Oracle Internet 文件系统（iFS），以前称为 WebDB
	
	- 是一个基于 Java 的应用程序，可以使数据库成为基于Internet的开发平台
	- 与 Oracle InterMedia 集成，使客户端应用程序（如 Oracle InterMedia Audio、Image、Video）可以轻松访问和操作数据库中的多媒体数据

## 2 基本概念

### 2.1 Oracle 数据库组件

- 数据库由下列组件构成
	- 数据库文件
	- 控制文件
	- 恢复日志文件
	- 表空间
	- 段
	- 扩展区
	- 数据块

#### 2.1.1 物理组件

> 数据库文件包括下述三种文件

1. **数据文件（Data Files）**：
	- **功能**：物理操作系统文件，存储实际的用户数据和系统数据。
	- **组成**：一个或多个数据文件组成一个表空间，每个数据库至少一个数据文件。
	- **特性**：每个数据文件只能属于一个表空间，数据以数据块为单位存储。
2. **控制文件（Control Files）**：
	- **功能**：包含数据库的元数据，如结构信息、文件位置等。
	- **特性**：数据库启动和恢复所必需的，通常有多个以提高可靠性。
3. **恢复日志文件（Redo Log Files）**：
	- **功能**：记录所有事务的变化，用于故障恢复。
	- **特性**：循环使用，帮助在系统故障后恢复未提交的数据，数据库至少包含两组。

#### 2.1.2 逻辑组件

1. **表空间（Tablespace）**：
	- **功能**：逻辑存储单元，用于管理多个数据文件。保留相关数据库对象的组。
	- **特性**：允许数据库管理员管理不同的存储部分。
2. **段（Segment）**：
	- **功能**：表空间中的一部分，用于存储特定类型的数据对象。
	- **特性**：由一个或多个扩展区组成，段的大小可以动态增长。
3. **扩展区（Extent）**：
	- **功能**：段的一部分，包含一组连续的数据块。
	- **特性**：当段需要更多空间时，数据库会分配一个新的扩展区。
4. **数据块（Data Block）**：
	- **功能**：数据库中最小的存储单元。
	- **特性**：数据块是数据库读写数据的基本单位。

通过合理地使用表空间、段、扩展区和数据块，数据库管理员可以对存储空间进行更加细致的控制，从而优化数据库性能和存储管理。

##### 2.1.2.1 表空间

###### 2.1.2.1.1 典型表空间

1. **SYSTEM 表空间**：
   - 包含数据库的核心系统对象，如数据字典、系统表等。
   - 是数据库中最重要的表空间之一，用于存储 Oracle 数据库的内部元数据。
2. **DATA 表空间**：
   - 存储用户数据的主要表空间，包含用户表、索引和其他数据库对象。
   - 数据库管理员通常将用户数据存储在 DATA 表空间中，以便对其进行管理和维护。
3. **USER 表空间**：
   - 用于分配给数据库用户的默认表空间。
   - 每个用户可以有自己的 USER 表空间，用于存储其数据和对象。
4. **TOOLS 表空间**：
   - 用于存储数据库管理工具和实用程序所需的对象。
   - 包含了数据库管理和开发工具所需的表、索引等对象。
5. **TEMP 表空间**：
   - 临时表空间，用于存储临时数据和临时结果集。
   - 在排序、连接和其他需要临时存储空间的操作中使用。

###### 2.1.2.1.2 功能

- 控制对象的空间分配，包括表、索引等。
- 设置数据库用户的空间配额，限制用户在表空间中的存储空间使用。
- 作为备份和恢复数据的一部分，保护数据库免受数据丢失的影响。

### 2.2 Oracle 数据库预定义角色

> [!note] `USER`  
> 在Oracle数据库中，`USER` 不是一个预定义角色，而是一个关键字，用于指代当前数据库会话所使用的用户名。用户可以创建名为 `USER` 的角色，但 `USER` 本身并不是一个Oracle预定义的角色（=> 可能的预定义角色）。

#### 2.2.1 CONNECT

- **描述**: 允许用户连接到数据库并创建基本的数据库对象。
- **权限**: 创建会话、表、视图等基本对象。

#### 2.2.2 RESOURCE

- **描述**: 允许用户创建和管理特定类型的数据库对象。
- **权限**: 创建表、索引、过程等对象。

#### 2.2.3 DBA

- **描述**: 拥有数据库的完全控制权限。
- **权限**: 所有系统权限，包括创建用户、删除数据库等管理权限。

#### 2.2.4 EXP_FULL_DATABASE

- **描述**: 允许用户导出整个数据库。
- **权限**: 使用 `exp` 工具导出数据库中的所有对象和数据。

#### 2.2.5 IMP_FULL_DATABASE

- **描述**: 允许用户导入整个数据库。
- **权限**: 使用 `imp` 工具导入数据库中的所有对象和数据。

#### 2.2.6 SELECT_CATALOG_ROLE

- **描述**: 允许用户查询数据字典视图和动态性能视图。
- **权限**: 访问所有数据字典视图（如 `DBA_*` 视图）。

#### 2.2.7 EXECUTE_CATALOG_ROLE

- **描述**: 允许用户执行数据库字典中的包和过程。
- **权限**: 执行数据字典中定义的包和过程。

### 2.3 Oracle 数据库对象

- 同义词是数据库对象的替换名称
- 同义词隐藏了对象的名称和所有者
- 序列生成唯一、连续的整数
- Nextval 和 Currval 用于访问序列
- 视图是一种经过定制的表示方式，用于显示来自一个或多个表的数据
- 索引加快了 SQL 语句的执行速度
- 在表的多个列上创建的索引称为“组合索引”
- 在索引组织表中，数据访问基于主键值

#### 2.3.1 同义词

同义词是数据库对象的替换名称，用作表、视图、序列、过程、存储函数、程序包、实体化视图或其他同义词的别名或替换名称。

**优点：**
- 简化 SQL 语句
- 隐藏对象的名称和所有者
- 提供对对象的公共访问

**同义词类型：**
- 私有同义词：由普通用户创建，只有创建该同义词的用户才能使用。
- 公用同义词：由DBA创建，任何数据库用户都可以使用，用于隐藏基表的身份，并降低SQL语句的复杂性。

**创建和删除同义词的命令：**
- `CREATE SYNONYM` 命令用于创建同义词。
- `DROP SYNONYM` 命令用于删除同义词。

**示例：**

```sql
CREATE SYNONYM emp_syn FOR hr.employees;
DROP SYNONYM emp_syn;
```

**注意：**
- 当公用对象和本地对象具有相同的名称时，本地对象优先，但在删除本地对象之后，可以像平常一样使用公用同义词。
- `USER_SYNONYMS` 包含有关同义词的信息。

#### 2.3.2 序列

序列用于生成唯一、连续的整数，通常用于生成主键值。序列可以是升序排序，也可以是降序排序。

**创建序列的语法：**

```sql
CREATE SEQUENCE <sequencename>
INCREMENT BY n
START WITH n
[MAXVALUE n] [MINVALUE n]
[CYCLE|NOCYCLE]
[CACHE n|NOCACHE];
```

**参数说明：**
- `INCREMENT BY n`: 指定序列数字之间的整数间隔。
- `START WITH n`: 指定要生成的第一个序列号。
- `MINVALUE n`: 指定序列的最小值。
- `MAXVALUE n`: 指定序列可以生成的最大值。
- `CYCLE`: 指定序列即使达到了最大值，还应继续生成值，通常是循环从头开始产生序列值。
- `CACHE`: 允许更快地生成序列号，Oracle分配序列号，并将其保存在内存中以便更快地访问。

**示例：**

```sql
CREATE SEQUENCE venseq
INCREMENT BY 1
START WITH 1
MAXVALUE 10
MINVALUE 1
CYCLE
CACHE 4;
```

**访问序列：**
- `NEXTVAL`: 第一次使用 `NEXTVAL` 时，将返回该序列的初始值。
- `CURRVAL`: 返回序列的当前值，即最后一次引用 `NEXTVAL` 时返回的值。

**示例：**

```sql
SELECT venseq.NEXTVAL FROM dual;
SELECT venseq.CURRVAL FROM dual;
INSERT INTO vendor_master(vencode, venname) VALUES ('V' || venseq.NEXTVAL, 'vijay');
```

#### 2.3.3 视图

视图是一种经过定制的表示方式，用于显示来自一个或多个表的数据，也称为“虚拟表”或“已存储的查询”。

**基表：**  
创建视图所依据的表。

**视图的优点：**
- 提供了另外一种级别的表安全性（根据个人权限只允许查看表的某几个字段）。
- 隐藏数据的复杂性（所有字段都显示太复杂，同时也可能是无用数据）。
- 简化用户的 SQL 命令。
- 将应用程序与基表定义的修改隔离开来。
- 从另一个角度提供数据。

**视图中的函数：**  
在视图中可以使用函数和表达式。

**示例：**

```sql
CREATE VIEW itemsold AS
SELECT itemcode, SUM(qty_ord) AS sold_qty
FROM order_detail
GROUP BY itemcode;
```

**注意事项：**
- 不能选择伪列，如 `CURRVAL` 和 `NEXTVAL`。
- 如果视图包括联接、集合操作符、分组函数、DISTINCT子句，就不能执行删除、更新、插入操作，只能查询。
- 在视图中所作的修改将影响基表，反之亦然。
- 分组函数和 `GROUP BY` 子句也可以包含在视图中。
- 使用函数时，应为列指定一个别名。

**删除视图：**  
使用 `DROP VIEW` 语句从数据库中删除视图。

**示例：**

```sql
DROP VIEW empview;
```

**有关视图的信息：**  
可以通过查询 `USER_VIEWS` 获取。

#### 2.3.4 索引

索引用于加快 SQL 语句的执行速度，是与表关联的可选结构。索引通过减少磁盘 I/O 提高查询性能。

**创建索引的语法：**

```sql
CREATE INDEX index_name ON table_name(column_name);
```

**索引的特点：**
- 索引在逻辑上和物理上独立于表中的数据。
- Oracle 自动维护索引。

**索引类型：**

1. **唯一索引：**  
确保在定义索引的列中没有重复的值。Oracle 自动为主键和唯一键列创建唯一索引。

**创建唯一索引的语法：**

```sql
CREATE UNIQUE INDEX index_name ON table_name(column_name);
```

2. **组合索引：**  
在表的多个列上创建的索引，也称为“连接索引”。组合索引中的列可以按任意顺序排列。对于在 `WHERE` 子句中包含多个列的查询，可以提高数据访问速度。

**创建组合索引的语法：**

```sql
CREATE INDEX index_name ON table_name(column1, column2);
```

3. **索引组织表：**  
表的数据存储在与其关联的索引中，对表数据的增删改只会导致对索引的更新。

## 3 SQL

### 3.1 Oracle 的结构化查询语言

#### 3.1.1 SQL*Plus*

- **功能**：用于输入、编辑、存储、检索和运行SQL命令及PL/SQL块。
- **优点**：提供命令行界面，直接执行SQL语句，进行数据库管理和查询。
- **使用场景**：数据库管理、数据查询、脚本执行等。

#### 3.1.2 iSQL*Plus*

- **功能**：类似SQL*Plus*，提供基于Web的界面，通过浏览器访问。
- **优点**：无需客户端软件，方便远程数据库操作。
- **使用场景**：远程数据库访问，无SQL*Plus*环境下的数据库操作。

#### 3.1.3 PL/SQL

- **定义**：Oracle对标准SQL的扩展，过程化SQL语言。
- **特点**：结合SQL数据操纵能力和编程语言处理能力，支持变量、条件语句、循环等。
- **使用场景**：编写复杂数据库应用程序，如存储过程、函数、触发器和包。

### 3.2 SQL特点

- **非过程性**：不支持循环和分支结构，主要用于数据查询和操作。
- **集合性**：一次性对多条记录进行操作，而非单个记录。

### 3.3 Oracle 数据库主要数据类型

#### 3.3.1 字符类型

- **CHAR**
	- 定长字符类型，最大长度为2000字节。
- **VARCHAR2**
	- 变长字符类型，最大长度为4000字节。
- **NCHAR**
	- 定长国家字符集数据类型，最大长度为1000字符。
- **NVARCHAR2**
	- 变长国家字符集数据类型，最大长度为2000字符。
- **LONG**
	- 可变长字符数据类型，最大长度为2GB。适用于不需要字符串搜索的长文本数据（不能在 `LONG` 列上建立索引），一个表中只能有一个 `LONG` 列，`LONG` 列不能定义为唯一或主C键约束，过程或存储过程不能接受 ` LONG ` 数据类型作为参数，建议改用 ` CLOB `

#### 3.3.2 数值类型

- **NUMBER(p,s)**
	- 其中 `p` 是*精度*，表示数字中的*总位数*，范围可以是1到38
	- `s` 是*小数位数*，表示小数点右边的位数，范围是-84到127
- **存储能力**
	- 可以存储正数、负数、0、定点数以及精度为38的浮点数
- **示例**
	- `PhoneNo NUMBER`: 默认情况下，如果没有指定 `p` 和 `s`，则 `p` 为38，`s` 为0，即 `PhoneNo NUMBER` 等同于 `PhoneNo NUMBER(38, 0)`
	- `Age NUMBER(3)`: 表示一个定点数，有3位整数，没有小数位，等同于 `Age NUMBER(3, 0)`
	- `Salary NUMBER(7, 2)`: 表示一个数值，其中整数部分有5位，小数部分有2位

#### 3.3.3 日期类型

- **Date**
	- **存储结构**
		- 使用7个字节分别存储世纪、年、月、日、小时、分钟和秒。
	- **范围**
		- 从公元前4712年1月1日到公元4712年12月31日。
	- **默认格式**
		- `dd-mon-yy`
	- **SYSDATE()函数**
		- 用于获取当前日期和时间
- **Timestamp**
	- 存储日期和时间，包括小数秒。
- **Interval day to second**
	- 存储时间间隔，以天、小时、分钟和秒为单位，包括小数秒。
- **Interval year to month**
	- 存储时间间隔，以年和月为单位。
- **Timestamp with time zone
	- 存储日期和时间值，包括时区信息。
- **Timestamp with local time zone**
	- 存储日期和时间值，自动转换为数据库服务器所在时区的本地时间。检索数据时，数据将被调整为与客户机的时区相匹配。

#### 3.3.4 二进制类型

- **RAW**: 面向字节的数据类型，用于存储二进制数据。
	- **大小限制**: 可以存储1到2000字节的数据。应指定大小
	- **特点**: RAW类型在网络中传输或使用Oracle实用程序移动数据时，不会进行字符集转换，保持数据的原始二进制格式
- **LONG RAW**: 用于存储可变长度的二进制数据
	- **大小限制**: 可以存储1到2GB的数据
	- **特点**: 类似于`LONG`数据类型，`LONG RAW`*不可被索引*，且有与`LONG`类型相同的限制。Oracle推荐使用`BLOB`数据类型来代替`LONG RAW`，以便于更好地处理大量的二进制数据

#### 3.3.5 大型对象类型

- **LOB**
	- **大小范围**：从1字节到4GB，用于存储非结构化信息，如声音剪辑、视频文件。
	- **访问方式**：允许有效、随机、分段地访问数据。
	- **存储位置**：LOB数据既可以是外部的，也可以是内部的，这取决于它们相对于数据库的位置。
	- **LOB 数据类型**：
		- **CLOB**（Character Large Object）：用于存储大量的**字符数据**，如非结构化的**XML**文档。
		- **BLOB**（Binary Large Object）：用于存储无结构的二进制数据，如图形、视频剪辑、声音文件。
		- **BFILE**：用于在数据库之外的操作系统文件中存储二进制文件。
			- **特点**：数据库表中存储的是指向操作系统文件的指针，因此BFILE类型的数据是只读的。
		- **多列支持**：数据库表中可以有多个LOB列，不同列可以为不同的LOB类型。
		- **索引**：LOB可以被索引，但不能删除和重建在LOB列上建立的索引。

### 3.4 SQL 命令类别

- **DDL（数据定义语言）**
	- 定义和修改数据库结构。如创建、修改、截断。
- **DML（数据操纵语言）**
	- 对数据库中的数据进行增加、删除和修改。
- **DCL（数据控制语言）**
	- 控制数据的访问权限。如授权grant、撤销revoke。
- **TCL（事务控制语言）**
	- 管理数据库事务，保证数据一致性和完整性。如回滚rollback、提交commit。

#### 3.4.1 DDL（数据定义语言）

`schema` 通常代表数据库中的一个命名空间，它包含了一组数据库对象，如表、视图、存储过程等，通过对象所有者指定。

- **CREATE**: 用于创建新的数据库对象，如表、索引、视图等。
	- 表名**必须以字母开头**，不能以下划线或数字开头，但可以包含中文字段名。
	- **不能使用Oracle保留字**作为表名。
	- 表名的**最大长度应小于等于30个字符**。
	- 在同一数据库模式（schema）中，**不允许出现相同的表名**。
	- 表名可以包含字母、数字和下划线，但**不能包含空格和单引号**。
	- 如果使用双引号命名表名，如`"inf"`，则表名将**区分大小写**。例如，`"inf"`和`"INF"`会被视为不同的表名。

	```sql
    CREATE TABLE [schema.]table_name (
        column1 datatype [DEFAULT expr],
        [...]
    );
    ```

- **ALTER**: 用于修改现有数据库对象的结构。
	- 允许用户**添加新的列**到现有表。
	- 可以**修改列的数据类型**或其宽度。
	- 允许**新增或删除完整性约束**，如主键、外键、唯一约束等。
	- 当表的列不为空时，**不能减小其长度**。

	```sql
    ALTER TABLE table_name
    ADD (column_name datatype);
    ```

	```sql
	ALTER TABLE table_name
	MODIFY (column_name new_datatype);
	```

	```sql
	ALTER TABLE table_name
	ADD CONSTRAINT constraint_name constraint_type(column_name);
	```

	```sql
	ALTER TABLE table_name
	DROP CONSTRAINT constraint_name;
	```

- **DROP**: 用于删除数据库中的对象。

	```sql
    DROP TABLE table_name;
    ```

- **–DELETE [FROM] table_name

  [WHERE condition];**: 用于删除表中的数据，但不删除表本身。  
	- `REUSE STORAGE` 保留被删除的行所使用的空间

	```sql
    TRUNCATE TABLE table_name [REUSE STORAGE];
    ```

- **DESC**: 用于查看表结构。

	```sql
	DESC TABLE table_name;
    ```

- **COMMENT**: 用于向数据字典添加注释。

	```sql
    COMMENT ON TABLE table_name IS 'comment_text';
    ```

- **RENAME**: 用于重命名数据库中的对象。

	```sql
    RENAME TABLE old_table_name TO new_table_name;
    ```

#### 3.4.2 DML（数据操纵语言）

> [!note] `SCOTT`  
> 在 Oracle 数据库中，`SCOTT` 是一个常用的示例用户，用于演示和测试目的。通常情况下，`SCOTT` 用户具有一些预定义的示例表和数据，可以用来展示 SQL 查询、数据操作和其他数据库功能。
> - `SCOTT` 用户常包含一些示例表，如 `EMP`（员工信息）、`DEPT`（部门信息）等。这些表中包含一些模拟的数据，用于演示 SQL 查询和操作。
> - `SCOTT` 用户也被用于演示各种 SQL 语句的使用，包括查询、插入、更新、删除等操作。这有助于学习者加深对 SQL 语言的理解。
> - 由于 `SCOTT` 用户权限较少且包含模拟数据，因此它也常被用于进行一些简单的测试和验证操作，以确保 SQL 语句的语法和逻辑正确。
> - 在 Oracle 数据库的学习和培训过程中，`SCOTT` 用户经常被用作演示和练习的对象，帮助学生和培训者学习 SQL 语言和数据库操作。

> [!note] `DUAL`  
> 在 Oracle 数据库中，`DUAL` 是一个特殊的单行单列表，主要用于需要返回单行结果的查询或测试简单表达式的情况下。  
> - `DUAL` 表只包含一行数据，列名为 `DUMMY`，其值为 `X`。
> - `DUAL` 表常用于 `SELECT` 语句中以返回常量、计算表达式、调用函数等。

- **SELECT**: 用于从数据库中检索数据。
	- 创建现有表的副本
	- 插入来自其他表的记录
	- 使用别名让列显示其他名称

	```sql
	SELECT * |{[DISTINCT] column | expression [alias],…}
	FROM table_name
	WHERE conditions
	ORDER BY column_name;
	
	- 创建现有表的副本
	CREATE TABLE new_table_name[(column1, ...)] AS
	SELECT * | [(column1, ...)] FROM existing_table_name;
	
	- 插入来自其他表的记录
	INSERT INTO target_table_name (column1, column2, …)
	SELECT column1, column2, …
	FROM source_table_name
	WHERE conditions;
	
	- 使用别名让列显示其他名称
	SELECT column_name [AS] alias_name
	FROM table_name;
	```

- **INSERT INTO**: 用于向表中添加新数据。

	```sql
    INSERT INTO table_name [(column1[, column...])]
    VALUES (value1[, value...]);
    ```

- **UPDATE**: 用于修改表中的现有数据。
	- `WHERE` 子句和 `SET` 子句还可以包含子查询

	```sql
    UPDATE table_name
    SET column = value[, column = value, …]
    [WHERE condition];
    ```

- **DELETE**: 用于从表中删除数据。
	- 只删除表记录，表结构保持不变。

	```sql
    DELETE [FROM] table_name
    [WHERE condition];
    ```

> - **TRUNCATE**
> 	- 是DDL操作，执行后立即提交，无法回滚。
> 	- 快速删除所有行，不触发触发器，释放空间。
> - **DELETE**
> 	- 是DML操作，可以回滚，可以指定条件。
> 	- 删除速度较慢，触发触发器，不释放空间。

#### 3.4.3 DCL（数据控制语言）

- **GRANT**: 用于授予用户或角色权限。

	```sql
    GRANT privilege_name ON object_name TO {user_name | PUBLIC | role_name}
    ```

- **REVOKE**: 用于撤销用户或角色的权限。

	```sql
    REVOKE privilege_name ON object_name FROM {user_name | PUBLIC | role_name}
    ```

#### 3.4.4 TCL（事务控制语言）

- **COMMIT**: 用于提交当前事务，使所有更改成为永久性的。

	```sql
    COMMIT;
    ```

- **ROLLBACK**: 用于回滚当前事务，取消所有未提交的更改。

	```sql
    ROLLBACK [TO SAVEPOINT savepoint_name];
    ```

- **SAVEPOINT**: 用于在事务中创建一个保存点，可以回滚到该点。

	```sql
    SAVEPOINT savepoint_name;
    ```

- **SET TRANSACTION**: 用于设置事务的特性。

	```sql
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
    ```

#### 3.4.5 数据导入导出操作

导入和导出数据是数据库管理中的重要操作，虽然它们不属于标准的SQL命令类别，但在数据库维护和数据迁移中发挥着关键作用。

##### 3.4.5.1 导入数据

导入数据通常用于将外部数据文件中的数据加载到数据库表中。

- 使用 `LOAD DATA` 语句导入数据：

  ```sql
  LOAD DATA
  INFILE 'datafile.txt'
  INTO TABLE tablename
  FIELDS TERMINATED BY ',' (column1, column2, …);
  ```

- 使用 `INSERT INTO … SELECT` 语句从另一个表中导入数据：

  ```sql
  INSERT INTO target_table (column1, column2, …)
  SELECT column1, column2, …
  FROM source_table;
  ```

- 使用 `imp` 命令导入数据库：

  ```shell
  imp username/password@database FILE=exportfile.dmp
  ```

##### 3.4.5.2 导出数据

导出数据用于将数据库中的数据写入到外部文件中，常用于备份和数据迁移。

- 使用 `SPOOL` 命令导出查询结果：

  ```sql
  SPOOL outputfile.txt
  SELECT column1, column2, …
  FROM tablename;
  SPOOL OFF;
  ```

- 使用 `exp` 工具导出数据：

  ```shell
  exp username/password@database TABLES=tablename FILE=exportfile.dmp
  ```

这些导入和导出操作虽然不直接属于DDL、DML、DCL或TCL，但在数据库管理中不可或缺。

### 3.5 SQL*Plus*

- 用于操纵数据
- 接受一个或多个参数并返回一个值

#### 3.5.1 SQL*Plus*中的运算符

##### 3.5.1.1 算术运算符

算术运算符用于对数值数据进行数学运算。

- `+`：加法运算
- `-`：减法运算
- `*`：乘法运算
- `/`：除法运算

示例：

```sql
SELECT salary, salary + 500 AS new_salary
FROM employees;
```

##### 3.5.1.2 比较运算符

比较运算符用于比较两个表达式的值。

- `=`：等于
- `!=` 或 `<>`：不等于
- `>`：大于
- `<`：小于
- `>=`：大于或等于
- `<=`：小于或等于
- `IN`：检查值是否在一组值中
- `LIKE`：匹配字符串中的模式
- `IS NULL`：检查值是否为 NULL
- `IS NOT NULL`：检查值是否不为 NULL
- `BETWEEN`：检查值是否在指定范围内
- `NOT BETWEEN`：检查值是否不在指定范围内

示例：

```sql
SELECT first_name, last_name
FROM employees
WHERE salary > 5000;

SELECT first_name, last_name
FROM employees
WHERE department_id IN (10, 20, 30);

SELECT first_name, last_name
FROM employees
WHERE last_name LIKE 'S%';

SELECT first_name, last_name
FROM employees
WHERE manager_id IS NULL;

SELECT first_name, last_name
FROM employees
WHERE manager_id IS NOT NULL;

SELECT first_name, last_name
FROM employees
WHERE salary BETWEEN 3000 AND 5000;
```

##### 3.5.1.3 逻辑运算符

逻辑运算符用于组合多个条件。

- `AND`：且
- `OR`：或
- `NOT`：非

示例：

```sql
SELECT first_name, last_name
FROM employees
WHERE salary > 5000 AND department_id = 10;
```

##### 3.5.1.4 连接运算符

连接运算符用于连接两个或多个字符串，或者将一个字符串与一个数据值合并。

> 用于合并各列为一个字符串的查询。  
> 注意符号的左右两边必须留空格。

- `||`：连接符

示例：

```sql
SELECT first_name || ' ' || last_name AS full_name
FROM employees;
```

##### 3.5.1.5 操作符的优先级

优先级*从高到低*

- 算术操作符
- 连接操作符
- 比较操作符
- `NOT` 逻辑操作符
- `AND` 逻辑操作符
- `OR` 逻辑操作符

#### 3.5.2 SQL*Plus*函数的类别

##### 3.5.2.1 单行函数

单行函数对每一行数据进行操作并返回一个结果。

###### 3.5.2.1.1 日期函数

用于处理和操作日期值的函数。

- `SYSDATE`：返回当前日期和时间
- `ADD_MONTHS(date, n)`：在指定日期上加上 `n` 个月
- `MONTHS_BETWEEN(date1, date2)`：返回 `date1` 和 `date2` 之间的月份数
- `LAST_DAY(date)`：返回月末最后一天相应的日期
- `NEXT_DAY(date, weekday)`：返回在指定日期之后的下一个指定星期几的日期
- `ROUND(date,[format])`：返回日期，舍入到格式模型所指定的单位，默认情况下日期舍入到最接近的日期
	- `format => year`
		- `date >= year.07.1`：舍入下一年的 1 月 1 日
	- `format => month`
		- `month > 15`：舍入下个月 1 日，否则当月 1 日
	- `format => day`：舍入到最接近的日期日

###### 3.5.2.1.2 字符函数

用于处理和操作字符数据的函数。

- `UPPER(string)`：将字符串转换为大写
- `LOWER(string)`：将字符串转换为小写
- `SUBSTR(string, start, length)`：从字符串的指定位置开始提取子字符串
- `INSTR(string, substring)`：返回子字符串在字符串中首次出现的位置
- `LENGTH(string)`：返回字符串的长度
- `CHR(ascii_code)`：将ASCII码转换为字符
- `ASCII(character)`：将字符转换为ASCII码
- `INITCAP(string)`：将字符串的每个单词的首字母转换为大写
- `LPAD(string, length, pad_string)`：用指定的字符串在左边填充到指定长度
- `RPAD(string, length, pad_string)`：用指定的字符串在右边填充到指定长度
- `LTRIM(string, trim_string)`：去除字符串左边的所有指定字符
- `RTRIM(string, trim_string)`：去除字符串右边的所有指定字符
- `TRIM`：
	- `TRIM(s)`：合并了 `LTRIM` 和 `RTRIM` 的功能，删除字符串两端的空格或其他指定字符
	- `TRIM(leading s1 from s)`：返回删除前导与 `s1` 相同的字符串后所余下的字符串
	- `TRIM(trailing s1 from s)`：返回删除结尾与 `s1` 相同的字符串后所余下的字符串
	- `TRIM(s1 from s)`：删除字符串 `s` 两端含有的 `s1`
	- `TRIM(s)`：删除字符串 `s` 两端的空格
- `DECODE(expression, search, result, default)`：对表达式进行条件查询，类似于 `CASE` 表达式
- `TRANSLATE(string, from_string, to_string)`：将字符串中的字符从 `from_string` 转换为 `to_string` 中的字符
- `REPLACE(string, search_string, replace_string)`：用指定的字符串替换字符串中的子字符串
- `CONCAT(string1, string2)`：连接两个字符串

示例：

```sql
SELECT UPPER(first_name) FROM employees;
SELECT SUBSTR(last_name, 1, 3) FROM employees;
SELECT LENGTH('Oracle') FROM dual;
SELECT CHR(65) FROM dual;
SELECT ASCII('A') FROM dual;
SELECT INITCAP('oracle database') FROM dual;
SELECT LPAD('Oracle', 10, '*') FROM dual;
SELECT RPAD('Oracle', 10, '*') FROM dual;
SELECT LTRIM('***Oracle***', '*') FROM dual;
SELECT RTRIM('***Oracle***', '*') FROM dual;
SELECT TRIM('*' FROM '***Oracle***') FROM dual;
SELECT DECODE(department_id, 10, 'Sales', 20, 'Marketing', 'Other') FROM employees;
SELECT TRANSLATE('12345', '123', 'abc') FROM dual;
SELECT REPLACE('Hello World', 'World', 'Oracle') FROM dual;
SELECT CONCAT('Hello', ' World') FROM dual;
```

###### 3.5.2.1.3 数字函数

用于处理和操作数字数据的函数。

- `ROUND(number, decimals)`：将数字**四舍五入**到指定的小数位
- `TRUNC(number, decimals)`：将数字**截断**到指定的小数位
- `MOD(number, divisor)`：返回数字被除数**整除**后的**余数**
- `ABS(number)`：返回数字绝对值
- `CEIL(number)`：对 `n` 按**四舍五入**取整
- `FLOOR(number)`：对 `n` 使用**截取**法取整

示例：

```sql
SELECT ROUND(salary, 0) FROM employees;
SELECT MOD(salary, 10) FROM employees;
```

###### 3.5.2.1.4 转换函数

用于在不同的数据类型之间进行转换的函数。

- `TO_CHAR(value, format)`：将数字或日期转换为字符串
- `TO_DATE(string, format)`：将字符串转换为日期
- `TO_NUMBER(string)`：将包含数字的字符串转换为可以执行算术操作的 `number` 类型

示例：

```sql
SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD') FROM dual;
SELECT TO_DATE('2023-12-25', 'YYYY-MM-DD') FROM dual;
```

###### 3.5.2.1.5 其他函数

###### 3.5.2.1.6 常规函数

- `NVL(exp1, exp2)`：如果 `exp1` 为 `NULL`，返回 `exp2`，否则返回 `exp1`
- `NVL2(exp1, exp2, exp3)`：如果 `exp1` 不为 `NULL`，返回 `exp2`，否则返回 `exp3`
- `NULLIF(exp1, exp2)`：如果 `exp1` 等于 `exp2`，返回 `NULL`，否则返回 `exp1`
- `COALESCE(exp1, exp2, …, expn)`：返回列表中第一个非 `NULL` 的表达式

示例：

```sql
SELECT NVL(commission_pct, 0) FROM employees;
SELECT NVL2(commission_pct, salary * commission_pct, salary) FROM employees;
SELECT NULLIF(salary, 0) FROM employees;
SELECT COALESCE(commission_pct, salary, 0) FROM employees;
```

##### 3.5.2.2 分组函数

分组函数对一组行进行计算并返回一个结果。

- `SUM(column)`：返回列的总和
- `AVG(column)`：返回列的平均值
- `MAX(column)`：返回列的最大值
- `MIN(column)`：返回列的最小值
- `COUNT()`
	- `COUNT(*)`：返回行数
	- `COUNT(column)`：返回指定列列中非 `NULL` 行数
	- `COUNT(DINTINCT column)`：返回指定列不为空行和重复行的行数

###### 3.5.2.2.1 `GROUP BY` 子句

用于将信息划分为较小的组，每一组行返回针对每组的单个结果行。

示例：

```sql
SELECT department_id, AVG(salary) FROM employees GROUP BY department_id;
```

###### 3.5.2.2.2 `HAVING` 子句

用于指定针对行的某些条件，对分组后的结果按条件进行筛选。它限定组中的行，与 `GROUP BY` 配套使用。与 `WHERE` 的区别：`WHERE` 先按条件查询再按 `GROUP BY` 分组；`HAVING` 先分组再按条件过滤。

示例：

```sql
SELECT department_id, AVG(salary)
FROM employees
GROUP BY department_id
HAVING AVG(salary) > 5000;
```

###### 3.5.2.2.3 `ORDER BY` 子句

在使用 `GROUP BY` 子句进行分组时，可以在后续的 `ORDER BY` 子句中指定升序或降序排序。默认情况下，排序是按升序排列的。

示例：

```sql
SELECT department_id, AVG(salary)
FROM employees
GROUP BY department_id
HAVING AVG(salary) > 5000;
ORDER BY AVG(salary) DESC
```

### 3.6 高级 SQL

#### 3.6.1 子查询

子查询是嵌套在其它查询中的查询。

```sql
SELECT column1
FROM table_name
WHERE column2 = (SELECT column2 FROM another_table WHERE condition);
```

#### 3.6.2 联接

联接用于根据相关列将来自两个或多个表的数据结合起来。

```sql
SELECT a.column1, b.column2
FROM table1 a
JOIN table2 b ON a.common_column = b.common_column;
```

#### 3.6.3 聚合函数

聚合函数用于执行计算并返回单个值，如 `SUM`, `AVG`, `COUNT` 等。

```sql
SELECT COUNT(*), SUM(column1), AVG(column2)
FROM table_name
WHERE condition;
```

## 4 PL/SQL (Procedural Language/SQL)

```sql
DECLARE
	--declarations
BEGIN       
	--executable statements
EXCEPTION
	--handlers
END;
```

### 4.1 存储过程

存储过程是一组预编译的 SQL 语句，可通过名称调用。

```sql
CREATE PROCEDURE procedure_name
AS
BEGIN
    -- SQL statements
END;
```

### 4.2 函数

函数类似于存储过程，但有一个返回值。

```sql
CREATE FUNCTION function_name
RETURN return_datatype
AS
BEGIN
    -- SQL statements
    RETURN value;
END;
```

### 4.3 触发器

触发器是自动执行的程序块，当特定事件发生时触发执行。

```sql
CREATE TRIGGER trigger_name
BEFORE INSERT ON table_name
FOR EACH ROW
BEGIN
    -- SQL statements
END;
```

### 4.4 类型标记

1. `%TYPE`：
	- **描述**：`%TYPE` 用于声明变量或参数的数据类型，该类型与指定数据库表中的*列或变量*的*数据类型*相同。
	- **用法**：`variable_name table_name.column_name%TYPE;`
	- **示例**：`emp_salary employees.salary%TYPE;`
	- **作用**：可以根据数据库表的结构定义变量，保持与表中列的数据类型同步，从而提高代码的可维护性和可读性。
2. `%ROWTYPE`：
	- **描述**：`%ROWTYPE` 用于声明变量或参数的数据类型，该类型与指定数据库表的*整行数据结构*相同。
	- **用法**：`variable_name table_name%ROWTYPE;`
	- **示例**：`emp_record employees%ROWTYPE;`
	- **作用**：可以根据数据库表的结构定义变量，保持与表的整行数据结构同步，从而方便地处理整行数据的操作，如插入、更新、删除等。

### 4.5 控制流语句

#### 4.5.1 条件控制

1. **IF 语句**：
   - **描述**：根据条件执行不同的代码块。
   - **语法**：

	 ```sql
     IF condition THEN
         -- statements
     END IF;
     ```

   - **示例**：

	 ```sql
     IF emp_salary > 5000 THEN
         bonus := 500;
     END IF;
     ```

2. **IF-THEN-ELSE 语句**：
   - **描述**：根据条件执行不同的代码块。
   - **语法**：

	 ```sql
     IF condition THEN
         -- statements
     ELSE
         -- statements
     END IF;
     ```

   - **示例**：

	 ```sql
     IF emp_salary > 5000 THEN
         bonus := 500;
     ELSE
         bonus := 200;
     END IF;
     ```

3. **IF-THEN-ELSIF 语句**：
   - **描述**：根据多个条件依次执行不同的代码块。
   - **语法**：

	 ```sql
     IF condition1 THEN
         -- statements
     ELSIF condition2 THEN
         -- statements
     ELSE
         -- statements
     END IF;
     ```

   - **示例**：

	 ```sql
     IF emp_salary > 5000 THEN
         bonus := 500;
     ELSIF emp_salary > 3000 THEN
         bonus := 300;
     ELSE
         bonus := 200;
     END IF;
     ```

#### 4.5.2 迭代控制

1. **简单循环**：
   - **描述**：无限循环执行代码块。
   - **语法**：

	 ```sql
     LOOP
         -- statements
		[EXIT [CONDITION]]  
	 END LOOP;
	 ```

   - **示例**：

	 ```sql
     LOOP
         total := total + 1;
         EXIT WHEN total > 10;
     END LOOP;
     ```

2. **WHILE 循环**：
   - **描述**：当条件为真时重复执行代码块。
   - **语法**：

	 ```sql
     WHILE condition LOOP
         -- statements
     END LOOP;
     ```

   - **示例**：

	 ```sql
     WHILE total <= 10 LOOP
         total := total + 1;
     END LOOP;
     ```

3. **FOR 循环**：
   - **描述**：按照指定次数重复执行代码块。
   - **语法**：

	 ```sql
     FOR counter IN range LOOP
         -- statements
     END LOOP;
     ```

   - **示例**：

	 ```sql
     FOR i IN 1. LOOP
         total := total + 1;
     END LOOP;
     ```

#### 4.5.3 顺序控制

1. **GOTO 语句**：
   - **描述**：将控制转移到指定标签处。
   - **语法**：

	 ```sql
     <<label_name>>
     GOTO label_name;
     ```

   - **示例**：

	 ```sql
     <<end_loop>>
     LOOP
         EXIT WHEN total > 10;
         total := total + 1;
         IF total = 5 THEN
             GOTO end_loop;
         END IF;
     END LOOP end_loop;
     ```

2. **NULL 语句**：
   - **描述**：什么也不做，用于占位或注释。
   - **语法**：

	 ```sql
     NULL;
     ```

   - **示例**：

	 ```sql
     IF emp_salary > 5000 THEN
         bonus := 500;
     ELSE
         NULL; -- do nothing
     END IF;
     ```

## 5 性能调优

性能调优是指通过各种技术和方法提升数据库的运行效率，包括但不限于索引优化、查询优化和数据库配置优化。

## 6 备份与恢复

Oracle 提供了多种备份和恢复工具，如 RMAN 和 Data Pump，确保数据的安全性和完整性。
