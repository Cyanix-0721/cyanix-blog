---
tags:
  - Blog
---

# Blog_nolebase

个人博客网站，基于 markdown + obsidian + vitepress

- 使用 [nolebase-template](https://github.com/Jackiexiao/nolebase-template/) 作为模板
- 基于 [nolebase](https://github.com/nolebase/nolebase/)

网站：

- https://blog-nolebase.vercel.app/  
- https://blog-nolebase.pages.dev/

## 1 设置

1. Fork [Jackiexiao/nolebase-template](https://github.com/Jackiexiao/nolebase-template)

2. 安装 [Nodejs](https://nodejs.org/) / [pnpm](https://pnpm.io/) 后

	```shell
	pnpm install # 安装
	pnpm docs:dev # dev模式,本地查看文档
	pnpm docs:build # 构建网站发布所需要的资源, build之后在 .vitepress/dist 下, 保证在本地能构建成功后再发布比较好
	```

3. 修改配置
	- `index.md` & `metadata/index.ts` 配置首页
	- `.vitepress/creators.ts` 添加个人信息

## 2 部署

### 2.1 Vercel/CF Pages 部署

- 修改构建命令为 `pnpm docs:build`
- 修改构建的输出目录为 `.vitepress/dist`

### 2.2 Github Pages 部署

> [!warning]  
> Github Pages 部署有 BUG ，不推荐使用

由于 Github Pages 部署到 `https://<username>.github.io/<repo>/`，而 vitepress 默认构建路径是根目录 `/`，使用环境变量调整 base 以更换构建目录适配 domain

- `.vitepress/config.ts` 添加

	```ts
	// 设置基础路径，默认为根路径
	const base = process.env.BASE_PATH || '/'
	
	export default defineConfig({
	  base
	})
	```

- `.github/workflows/production-deployment-to-github-pages.yaml` 中添加(假设仓库名为 `Blog_nolebase`)

	```yaml
	jobs:
	  # 构建工作
	  build:
	    runs-on: ubuntu-latest
	    steps:
	# 设置环境变量，指定基础路径
	      - name: Set base path environment variable
	        run: echo "BASE_PATH=/Blog_nolebase/" >> $GITHUB_ENV
	```

	示例 workflow

	```yaml
	# 构建 VitePress 站点并将其部署到 GitHub Pages
	#
	name: Deploy VitePress site to Pages
	
	on:
	  # 在针对 `main` 分支的推送上运行。如果你
	  push:
	    branches: [main]
	
	  # 允许你从 Actions 选项卡手动运行此工作流程
	  workflow_dispatch:
	
	# 设置 GITHUB_TOKEN 的权限，以允许部署到 GitHub Pages
	permissions:
	  contents: read
	  pages: write
	  id-token: write
	
	# 只允许同时进行一次部署，跳过正在运行和最新队列之间的运行队列
	# 但是，不要取消正在进行的运行，因为我们希望允许这些生产部署完成
	concurrency:
	  group: pages
	  cancel-in-progress: false
	
	jobs:
	  # 构建工作
	  build:
	    runs-on: ubuntu-latest
	    steps:
	      - name: Checkout
	        uses: actions/checkout@v4
	        with:
	          fetch-depth: 0 # 如果未启用 lastUpdated，则不需要
	
	      # 安装 pnpm
	      - name: Setup pnpm
	        uses: pnpm/action-setup@v3
	        with:
	          version: 8.0.0 # 可以根据需要指定版本
	          run_install: true
	
	      # 配置 Node.js
	      - name: Setup Node
	        uses: actions/setup-node@v4
	        with:
	          node-version: 20
	          cache: pnpm # 使用 pnpm 缓存
	
	      # 设置环境变量，指定基础路径
	      - name: Set base path environment variable
	        run: echo "BASE_PATH=/Blog_nolebase/" >> $GITHUB_ENV
	
	      # 安装依赖
	      - name: Install dependencies
	        run: pnpm install --frozen-lockfile
	
	      # 构建 VitePress 站点
	      - name: Build with VitePress
	        run: pnpm docs:build
	
	      # 上传构建的站点文件作为工件
	      - name: Upload artifact
	        uses: actions/upload-pages-artifact@v3
	        with:
	          path: .vitepress/dist
	
	  # 部署工作
	  deploy:
	    environment:
	      name: github-pages
	      url: ${{ steps.deployment.outputs.page_url }}
	    needs: build
	    runs-on: ubuntu-latest
	    name: Deploy
	    steps:
	      - name: Deploy to GitHub Pages
	        id: deployment
	        uses: actions/deploy-pages@v4
	```

### 2.3 其他方式部署

其他部署方式见[原仓库](https://github.com/nolebase/nolebase/)的说明

## 3 Obsidian 的设置

### 3.1 关于图片链接问题

如果你的 markdown 中的图片链接没有在当前文件所在目录下，会解析出错，无法在 vitepress 中正确渲染。nolebase 支持双链，没问题可忽略。

解决方法： 推荐的 Obsidian Setting => Files and links 设置如下

- New link format => Relative path to file
- Use `[Wikilinks](Wikilinks)` => False
- Default location for new attachments => In subfolder under current folder
- Subfolder name => assets

这么做有几个好处

- 保持兼容性的 markdown: 可以让文档也能在 github 中被正确渲染（github 无法解析 `[双链](双链)`）
- 方便迁移文件和图片，你只需要把图片文件夹和 markdown 文件一起复制就行（如果是全部汇总在某个文件夹下，以后复制比较麻烦）

额外的 tips

- 对于已有的笔记和图片链接，你可以考虑使用 obsidian 插件 [obsidian-link-converter](https://github.com/ozntel/obsidian-link-converter) 来帮你做自动的转换 `[wikilink](wikilink)` 为 relative_path 的 markdown link
- 同时，我建议使用这个 [clear-unused-image](https://github.com/ozntel/oz-clear-unused-images-obsidian) 插件来帮助你清除无用的图片（但记得不要运行 clear attachment ，否则 vitepress 相关代码会被移除）

## 4 开启 Giscus 评论功能

giscus 利用 [GitHub Discussions](https://docs.github.com/en/discussions) 实现评论系统

1. 访问 [Giscus](https://giscus.app/zh-CN) 网站，参考网站上的说明，一步步操作，最后得到一个配置代码
2. 在 `./vitepress/theme/index.ts` 中修改 giscus 相关配置，在该文件中搜索 `giscusTalk`, 参考说明，修改配置即可

## 5 其他

通过 [[Action&Workflow|Github Actions]] 把博客仓库中的笔记同步到其他仓库，方便后续转移构建
