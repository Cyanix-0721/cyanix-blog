---
tags:
  - CI/CD
  - Jenkins
---

# Jenkins

Jenkins 是一个开源的自动化服务器，主要用于持续集成和持续交付（CI/CD）。它能够自动化构建、测试和部署代码，从而提高软件开发的效率和质量。

## 1 核心功能

- **自动化构建**：通过配置 Jenkins，自动触发代码构建任务。
- **自动化测试**：构建后运行单元测试、集成测试等，确保代码质量。
- **自动化部署**：配置部署流程，自动将构建后的代码部署到服务器上。
- **插件支持**：支持多种插件，扩展功能以适应不同开发需求。

## 2 Jenkins 的安装

### 2.1 前置要求

- **Java 版本要求**：需要 JDK 11 或更高版本。
- **服务器需求**：支持 Linux、Windows、macOS 等操作系统，或以 Docker 容器形式运行。

### 2.2 安装步骤（以 Debian 为例）

1. **安装 Java**：

	```bash
    sudo apt update
    sudo apt install openjdk-11-jdk -y
    ```

2. **添加 Jenkins 仓库和密钥**：

	```bash
    curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
    echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
    sudo apt update
    ```

3. **安装 Jenkins**：

	```bash
    sudo apt install jenkins -y
    ```

4. **启动 Jenkins 服务**：

	```bash
    sudo systemctl start jenkins
    sudo systemctl enable jenkins
    ```

5. **访问 Jenkins**：
	- 在浏览器中访问 `http://<your_server_ip>:8080`。
	- 第一次使用时，需要输入管理员密码，该密码位于 `/var/lib/jenkins/secrets/initialAdminPassword` 文件中。

## 3 Jenkins 的基础使用

### 3.1 创建任务

1. **新建任务**：
	- 在 Jenkins 主页面中点击 `新建任务`，选择任务类型，如自由风格项目、流水线项目等。
  
2. **配置项目**：
	- 在项目配置页面设置代码仓库（如 Git）、构建触发条件（如定时构建、Webhook 触发等）、构建脚本（如 Maven、Gradle 指令）。

3. **构建和查看结果**：
	- 配置完成后，点击“立即构建”按钮开始构建项目。构建完成后，在“控制台输出”中查看日志。

### 3.2 持续集成示例（与 GitHub 集成）

1. **配置 GitHub 仓库**：
	- 在项目配置页面找到“源码管理”部分，选择 `Git`，填写 GitHub 仓库的 URL 和凭据。

2. **设置构建触发器**：
	- 在“构建触发器”部分选择“GitHub hook 触发”。

3. **配置 Webhook**：
	- 在 GitHub 仓库的“设置”页面，找到“Webhooks”，添加 Jenkins 的 Webhook URL，如 `http://<jenkins_server_ip>:8080/github-webhook/`。

## 4 Jenkins 插件

Jenkins 拥有丰富的插件生态，以下是一些常用插件：

- **Git 插件**：支持与 Git 仓库的集成，自动获取代码。
- **Pipeline 插件**：支持编写流水线脚本，实现复杂的 CI/CD 流程。
- **Blue Ocean**：简化 Jenkins 操作体验的用户界面插件。
- **SonarQube 插件**：集成代码质量检测工具 SonarQube。

## 5 Jenkins 流水线

Jenkins 的流水线功能（Pipeline）是其核心功能之一，允许通过代码定义自动化的构建、测试和部署流程。以下是一个简单的流水线示例：

```groovy
pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/example/repo.git'
            }
        }
        stage('Build') {
            steps {
                sh './build.sh'
            }
        }
        stage('Test') {
            steps {
                sh './test.sh'
            }
        }
        stage('Deploy') {
            steps {
                sh './deploy.sh'
            }
        }
    }
}
```

### 5.1 流水线概念

- **agent**：定义在哪个节点上运行任务，可以指定具体节点或使用 `any`。
- **stages**：流水线中的不同阶段，每个阶段包含多个步骤（steps）。
- **steps**：具体的操作，如执行 shell 命令、调用其他 Jenkins 插件等。

## 6 Jenkins 高级功能

### 6.1 分布式构建

Jenkins 支持主从架构，主节点负责协调工作，从节点执行具体的构建任务，提高构建效率。

### 6.2 高可用和备份

通过在多个服务器上配置 Jenkins 实现高可用，避免单点故障。也可以通过 Jenkins 的“备份插件”进行定期备份。

## 7 安全设置

为了提高系统安全性，建议配置：

1. **用户管理**：设置用户角色和权限，确保只有特定用户可以执行敏感操作。
2. **API Token**：使用 API Token 进行系统集成，而不是明文密码。
3. **启用 HTTPS**：通过反向代理（如 Nginx）或直接在 Jenkins 中配置 SSL 证书启用 HTTPS。
