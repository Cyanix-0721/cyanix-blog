# Cloudflare Access

## 1 通过 Access 设置邮箱二次验证

1. Access 中创建目标 `Application` 并添加 `Policy`
	- 如使用 cf 部署可直接在设置中的 `Access Policies` 启用，默认对预览部署开启验证 (如果要对生产环境也启用验证，需要在 `Application` 的 `Overview` 中添加无子域名的 `Application domain`)
2. `Action` 使用 `Allow`
3. `Include` 选择邮箱实现仅允许目标邮箱
4. `Require` 选择登陆方法使用 One-time PIN 实现邮箱验证码形式的二次验证
	1. 设置里的 `Authorization` 可以添加更多验证方式
