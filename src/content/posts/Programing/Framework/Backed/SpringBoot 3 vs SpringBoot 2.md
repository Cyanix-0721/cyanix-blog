# SpringBoot 3 Vs SpringBoot 2

Spring Boot 3 相较于 Spring Boot 2，引入了许多新特性和改进，主要体现在框架的现代化、兼容性、性能优化等方面。以下是Spring Boot 3的主要新特性：

## 1 **Java 17+ 支持**

Spring Boot 3 不再支持 Java 8 和 11，最低需要 Java 17。这使得框架可以利用 Java 17 中的新特性，如更高效的垃圾回收机制、文本块、多级嵌套模式匹配等。

## 2 **Jakarta EE 9+**

Spring Boot 3 迁移到了 Jakarta EE 9，它将命名空间从 `javax` 迁移到 `jakarta`。因此，很多依赖于 Java EE 规范的类库和接口都必须进行修改（例如 `javax.servlet` 变为 `jakarta.servlet`）。

## 3 **AOT（Ahead-Of-Time）编译支持**

Spring Boot 3 提供了 AOT 编译支持，主要是为了与 GraalVM 原生镜像（Native Image）集成。通过 AOT 编译，可以在编译时优化代码，减少启动时间并降低内存使用，这是针对云原生应用的优化之一。

## 4 **GraalVM 原生镜像支持**

Spring Boot 3 完全支持通过 GraalVM 编译为原生镜像，使得应用程序的启动速度更快，并显著减少了内存占用。与传统 JVM 相比，这为微服务和云原生应用提供了显著的优势。

## 5 **改进的观察性（Observability）支持**

Spring Boot 3 引入了 Micrometer 1.10 及其对 OpenTelemetry 的支持，以提供更好的追踪（tracing）和度量（metrics）功能。通过 Micrometer 和 OpenTelemetry 的集成，开发者可以更轻松地监控、跟踪和分析应用的性能和行为。

## 6 **安全性改进**

- **Spring Security 6**：Spring Boot 3 使用了 Spring Security 6，提供了更多安全性改进。该版本在 API 设计上更现代化，并提高了与 JWT 等认证方案的集成。
- **基于 OpenID Connect 和 OAuth 2.1 的改进**：简化了与 OAuth 2.1 标准的集成。

## 7 **性能改进**

Spring Boot 3 的性能在多个方面进行了优化，包括启动时间、内存占用和整体运行效率。通过 AOT 编译、GraalVM 支持以及对底层组件的优化，使得应用的响应速度和稳定性得到了提升。

## 8 **内置的测试工具改进**

Spring Boot 3 在测试方面增加了一些新的功能和工具，如增强的对并发测试的支持、更简便的 Mocking 框架集成等，帮助开发者更轻松地进行单元测试、集成测试和性能测试。

## 9 **构建镜像工具的更新**

Spring Boot 3 提供了增强的构建镜像支持，特别是与 Buildpacks 的集成，使得开发者能够更方便地将应用程序打包为容器镜像。这对于微服务架构和云原生应用来说，构建与部署变得更加简便和高效。

## 10 **Kubernetes 支持改进**

在 Spring Boot 3 中，Kubernetes 的集成得到了进一步优化，尤其是对 Kubernetes 中 ConfigMaps、Secrets 的管理以及与 Service Mesh 的更深度集成。这使得在 Kubernetes 环境中部署 Spring Boot 应用变得更加容易。

## 11 **Hibernate 6 支持**

Spring Boot 3 支持 Hibernate ORM 6，这是 Hibernate 的一个重大更新，带来了更好的性能和对新数据库功能的支持。Spring Data JPA 在此版本中得到了相应的增强。

## 12 **弃用和移除旧特性**

Spring Boot 3 移除了许多在 Spring Boot 2 中已弃用的功能和类库，例如旧的 Reactive WebSocket 支持、一些不推荐的第三方库等，简化了框架的维护和使用。

## 13 总结

Spring Boot 3 通过支持更现代的 Java 版本、Jakarta EE 9 迁移、GraalVM 原生镜像支持、增强的观察性和性能优化，使得它更适合构建云原生应用。同时，安全性和测试工具的改进也提高了开发效率和应用的安全性。
