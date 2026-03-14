# Docker 数据卷命名

在 Docker Compose 文件中定义数据卷时，如果未显式声明数据卷名称，Docker 会根据项目名称和卷名自动生成一个名称，通常形式为 `<project_name>_<volume_name>`。为了更好的理解和管理数据卷，有以下几种方式：

1. **未显式声明数据卷名称**：
   * 如果未显式声明数据卷名称，Docker 会自动使用模板的标题（项目名称）和卷名组合生成数据卷名称。
   * 例如，项目名称为 `rustdesk`，卷名为 `rustdesk_data`，则生成的数据卷名称为 `rustdesk_rustdesk_data`。

2. **显式声明外部卷**：
   * 使用 `external: true` 标记数据卷为外部卷，可以避免使用自动生成的数据卷名称。
   * 但是，外部卷不会通过 Docker Compose 自动创建，需要手动创建该数据卷。
   * 示例：

	 ```yaml
     volumes:
       rustdesk_data:
         external: true
     ```

   * 手动创建数据卷：

	 ```sh
     docker volume create rustdesk_data
     ```

3. **使用 `name` 指定数据卷名称**：
   * 可以在 `volumes` 部分使用 `name` 指定数据卷名称，这样数据卷会自动创建且名称为指定的名称。
   * 示例：

	 ```yaml
     volumes:
       rustdesk_data:
         name: rustdesk_data
     ```

> [!example]
>
> 以下是一个完整的 Docker Compose 文件示例，展示了如何显式声明数据卷名称以确保自动创建数据卷且名称符合预期：
>
> ```yaml
> services:
>   hbbs:
>     container_name: hbbs
>     image: rustdesk/rustdesk-server:latest
>     command: hbbs
>     volumes:
>       - rustdesk_data:/root
>     network_mode: "host"
>     depends_on:
>       - hbbr
>     restart: unless-stopped
> 
>   hbbr:
>     container_name: hbbr
>     image: rustdesk/rustdesk-server:latest
>     command: hbbr
>     volumes:
>       - rustdesk_data:/root
>     network_mode: "host"
>     restart: unless-stopped
> 
> volumes:
>   rustdesk_data:
>     name: rustdesk_data
> ```
