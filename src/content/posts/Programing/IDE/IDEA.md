# IDEA

## 1 VM Options

  `Help > Edit Custom VM Options...`

```
# 初始堆大小为128MB  
-Xms128m  
# 最大堆大小为5120MB  
-Xmx5120m  
# 用于字节码编译的最大内存大小（以字节为单位）  
-XX:ReservedCodeCacheSize=1024m  
# 忽略不被识别的选项  
-XX:+IgnoreUnrecognizedVMOptions  
# 使用Garbage-First（G1）收集器  
-XX:+UseG1GC  
# 软引用对象平均保留时间（以毫秒为单位）  
-XX:SoftRefLRUPolicyMSPerMB=50  
# 并行运行的编译器线程数  
-XX:CICompilerCount=2  
# 当抛出java.lang.OutOfMemoryError时，将堆转储到文件  
-XX:+HeapDumpOnOutOfMemoryError  
# 不在快速抛出中省略堆栈跟踪  
-XX:-OmitStackTraceInFastThrow  
# 启用断言  
-ea  
# 禁用文件路径规范化的缓存使用  
-Dsun.io.useCanonCaches=false  
# 禁用HTTP认证的隧道  
-Djdk.http.auth.tunneling.disabledSchemes=""  
# 允许自我附加  
-Djdk.attach.allowAttachSelf=true  
# 允许非法访问  
-Djdk.module.illegalAccess.silent=true  
# 关闭Kotlin协程的调试模式  
-Dkotlinx.coroutines.debug=off  
# 错误文件的位置  
-XX:ErrorFile=$USER_HOME/java_error_in_idea_%p.log  
# 堆转储文件的位置  
-XX:HeapDumpPath=$USER_HOME/java_error_in_idea.hprof
# 启用代码缓存刷新，避免代码缓存溢出  
-XX:+UseCodeCacheFlushing  
# 强制使用 IPv4，避免 IPv6 相关问题  
-Djava.net.preferIPv4Stack=true  
# 明确设置文件编码为 UTF-8，防止因系统默认编码问题导致的乱码  
-Dfile.encoding=UTF8
```
