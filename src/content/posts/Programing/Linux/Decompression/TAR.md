# Linux Tar命令

`tar`是Linux和Unix系统中的一个命令行工具，用于创建、管理和提取tar归档文件。tar归档文件是一种将多个文件和目录打包成一个文件的方式，常用于备份和分发。

## 1 Tar命令选项

以下是`tar`命令的一些常用选项及其详细说明：

- `-c`：创建新的归档文件。
	- 例如：`tar -cf archive.tar file1 file2`将`file1`和`file2`打包成`archive.tar`。
- `-x`：从归档文件中提取文件。
	- 例如：`tar -xf archive.tar`将`archive.tar`解压到当前目录。
- `-f`：指定归档文件的名称。这个选项必须紧跟归档文件的名称。
	- 例如：`tar -cf archive.tar file1 file2` 中，`-f` 后面的 `archive.tar` 就是紧跟的归档文件的名称。
- `-v`：详细模式，显示正在处理的文件名。
	- 例如：`tar -cvf archive.tar file1 file2`将在打包过程中显示`file1`和`file2`的文件名。
- `-z`：通过gzip对归档进行压缩或解压缩。
	- 例如：`tar -czf archive.tar.gz file1 file2`将`file1`和`file2`打包并压缩成`archive.tar.gz`。
- `-j`：通过bzip2对归档进行压缩或解压缩。
	- 例如：`tar -cjf archive.tar.bz2 file1 file2`将`file1`和`file2`打包并压缩成`archive.tar.bz2`。
- `-J`：通过xz对归档进行压缩或解压缩。
	- 例如：`tar -cJf archive.tar.xz file1 file2`将`file1`和`file2`打包并压缩成`archive.tar.xz`。
- `-t`：列出归档文件的内容。
	- 例如：`tar -tf archive.tar`将显示`archive.tar`中的所有文件和目录。
- `-r`：将文件追加到归档文件的末尾。
	- 例如：`tar -rf archive.tar file3`将`file3`添加到已存在的`archive.tar`归档文件中。
- `-u`：更新归档文件中的文件。
	- 例如：`tar -uf archive.tar file1`将在`archive.tar`中用新的`file1`替换旧的`file1`。
- `-d`：比较归档文件和文件系统中的文件。
	- 例如：`tar -df archive.tar file1`将比较`archive.tar`中的`file1`和文件系统中的`file1`。
- `-C`：在操作文件之前更改目录。
	- 例如，`tar -xf archive.tar -C /path/to/directory`将`archive.tar`解压到`/path/to/directory`目录。如果目录不存在，`tar`命令将尝试创建它。请注意，`-C`选项必须在归档文件名之后，否则它可能不会按照你期望的方式工作。

## 2 P.S.

### 2.1 解压缩选项可省略

在许多现代的 Linux 发行版中，`tar` 命令确实可以自动识别 `.tar.gz`、`.tar.bz2`、`.tar.xz` 等压缩格式，并进行相应的解压操作。在这些系统中，你可以省略 `-z`、`-j`、`-J` 等选项，但是在一些较旧或者较小的系统中，`tar`命令可能不支持这种功能，你需要显式指定`-z`、`-j`、`-J`等选项来解压不同的压缩格式。

### 2.2 解压缩选项放在 `-f` 前

### 2.3 同时使用多个选项应该组合起来

### 2.4 一般顺序：`tar` -> 主选项（如`-c`或`-x`） -> 压缩选项（如`-z`、`-j`、`-J`） -> `-f` -> 归档文件名 -> 其他选项和参数
