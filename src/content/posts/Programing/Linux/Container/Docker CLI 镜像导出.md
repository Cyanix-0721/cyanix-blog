# Docker CLI 镜像导出

下面是通过 CLI 将 Docker 已拉取的镜像导出并上传到服务器，然后在服务器上使用该镜像运行容器的详细步骤：

**本地操作：**

1. **查找镜像 ID：** 使用以下命令列出本地已有的镜像：

   ```bash
   docker images
   ```

   找到你要导出的镜像，并记下它的 ID 或 REPOSITORY:TAG。

2. **导出镜像：** 使用 `docker save` 命令将镜像保存为 tar 文件：

   ```bash
   docker save -o <镜像文件名>.tar <镜像 ID 或 REPOSITORY:TAG>
   ```

   例如：

   ```bash
   docker save -o myimage.tar nginx:latest 
   ```

3. **上传镜像文件：** 将导出的 `.tar` 文件上传到服务器。你可以使用 SCP、FTP 或其他文件传输工具。

**服务器操作：**

1. **下载镜像文件：** 确保导出的 `.tar` 文件已成功下载到服务器上。

2. **导入镜像：** 使用 `docker load` 命令从 `.tar` 文件导入镜像：

   ```bash
   docker load -i <镜像文件名>.tar
   ```

   例如：

   ```bash
   docker load -i myimage.tar
   ```

3. **验证镜像：** 再次运行 `docker images` 命令，确认镜像已成功导入。

4. **运行容器：** 使用 `docker run` 命令基于导入的镜像创建并运行容器：

   ```bash
   docker run [OPTIONS] <镜像 ID 或 REPOSITORY:TAG>
   ```

   根据你的镜像和应用需求，替换 `[OPTIONS]` 部分。例如：

   ```bash
   docker run -d -p 80:80 nginx:latest
   ```

**注意事项：**

* **镜像大小：** 导出的镜像文件可能比较大，上传和下载时请注意网络带宽和磁盘空间。
* **安全性：** 如果镜像包含敏感信息，请考虑在传输过程中加密。
* **docker save vs. docker export：**
	* `docker save` 保存整个镜像（包括所有层和历史记录）。
	* `docker export` 导出容器的文件系统快照（不包含历史记录），文件更小，但导入后只能创建新镜像，不能启动为容器。

希望这些步骤能帮助你在服务器上成功运行 Docker 容器！  

# 导出所有镜像

要导出本地所有的 Docker 镜像，你可以结合使用 `docker images` 和 `docker save` 命令，并配合一些 shell 脚本技巧。以下是几种方法：

**方法一：使用 for 循环**

```bash
for IMAGE in $(docker images --format "{{.Repository}}:{{.Tag}}"); do
  docker save -o "$IMAGE.tar" "$IMAGE"
done
```

这个脚本会遍历所有镜像，并为每个镜像创建一个以其名称和标签命名的 `.tar` 文件。

**方法二：使用 xargs**

```bash
docker images --format "{{.Repository}}:{{.Tag}}" | xargs -I {} docker save -o {}.tar {}
```

这个脚本使用 `xargs` 将镜像名称和标签传递给 `docker save` 命令。

**方法三：使用 bash 数组**

```bash
images=($(docker images --format "{{.Repository}}:{{.Tag}}"))
for image in "${images[@]}"; do
  docker save -o "$image.tar" "$image"
done
```

这个脚本将镜像名称和标签存储在 bash 数组中，然后遍历数组进行导出。

**注意事项：**

* **磁盘空间：** 确保你有足够的磁盘空间来存储所有导出的镜像文件。
* **时间：** 导出大量镜像可能需要一些时间，请耐心等待。

**上传到服务器：**

导出所有镜像后，你可以使用之前提到的方法（SCP、FTP 等）将这些 `.tar` 文件上传到服务器。

**在服务器上导入：**

在服务器上，你可以使用以下命令一次性导入所有镜像：

```bash
for TARFILE in *.tar; do
  docker load -i "$TARFILE"
done
```

这个脚本会遍历当前目录下的所有 `.tar` 文件，并使用 `docker load` 命令导入它们。
