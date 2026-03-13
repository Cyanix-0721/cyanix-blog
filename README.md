# cyanix-blog

Personal blog built with **Astro 6**, **MDX**, **Tailwind CSS v4**, and deployed on **Vercel**.  
Written in Obsidian, synced via Git, built statically — zero runtime overhead.

## ✨ Features

- 📝 **Obsidian-first** — write Markdown in Obsidian, push, done
- 🔗 **Wiki-links** — `[[双链]]` syntax via `remark-wiki-link`
- 📦 **Callout blocks** — all 15 Obsidian callout types (`> [!note]`, `> [!warning]`, …)
- 🎨 **Syntax highlighting** — Shiki with `one-dark-pro` (dark) / `github-light` (light)
- 🏷️ **Tag system** — `/tags` index + per-tag filtered pages
- 🔍 **Client-side search** — instant title/tag filtering, Pagefind-ready
- ⚓ **Heading anchors** — `rehype-slug` + `rehype-autolink-headings`
- 📱 **Responsive** — mobile-first Tailwind layout
- ♿ **Accessible** — semantic HTML, ARIA labels, focus rings
- ⚡ **Static output** — pre-rendered at build time, hosted on Vercel CDN

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Astro 6](https://astro.build) |
| Content | Markdown / [MDX](https://mdxjs.com) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Highlighting | [Shiki](https://shiki.style) (built-in) |
| Wiki-links | [remark-wiki-link](https://github.com/landakram/remark-wiki-link) |
| Callouts | Custom remark plugin (`src/plugins/remark-callout.ts`) |
| Headings | rehype-slug + rehype-autolink-headings |
| Adapter | [@astrojs/vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/) |
| Package manager | [pnpm](https://pnpm.io) |

## 📁 Project Structure

```text
cyanix-blog/
├── src/
│   ├── content/
│   │   └── posts/          ← Drop your Markdown files here
│   │       └── hello-world.md
│   ├── content.config.ts   ← Astro content collections schema
│   ├── layouts/
│   │   ├── Layout.astro    ← Base layout (nav, footer, SEO)
│   │   └── PostLayout.astro← Blog post layout (header, prose, tags)
│   ├── pages/
│   │   ├── index.astro     ← Home — timeline + search + tag filter
│   │   ├── about.astro     ← About page
│   │   ├── posts/
│   │   │   └── [...slug].astro ← Dynamic post renderer
│   │   └── tags/
│   │       ├── index.astro ← All tags overview
│   │       └── [tag].astro ← Posts filtered by tag
│   ├── plugins/
│   │   └── remark-callout.ts ← Obsidian callout → HTML transformer
│   └── styles/
│       └── global.css      ← Tailwind + prose + callout styles
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 22.12
- pnpm ≥ 9

### Install

```bash
pnpm install
```

### Dev server

```bash
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321).

### Build

```bash
pnpm build
```

### Preview production build

```bash
pnpm preview
```

## ✍️ Writing Posts

Add a Markdown (`.md`) or MDX (`.mdx`) file to `src/content/posts/`.

### Required frontmatter

```yaml
---
title: My Post Title
date: 2025-01-21
description: A short summary shown on the home page and in meta tags.
tags: [astro, obsidian]
draft: false
---
```

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | ✅ | Post title |
| `date` | date | ✅ | Publication date (`YYYY-MM-DD`) |
| `description` | string | — | Used in meta tags and post header |
| `tags` | string[] | — | Defaults to `[]` |
| `draft` | boolean | — | Defaults to `false`. Draft posts are excluded from build |
| `cover` | string | — | Path or URL to a cover image |

### Obsidian syntax support

#### Wiki-links

```md
[[Another Post]]          → /posts/another-post
[[Another Post|Alias]]    → /posts/another-post (displayed as "Alias")
```

#### Callout blocks

```md
> [!note] Optional custom title
> Callout body content here.
```

Supported types: `note` `tip` `info` `important` `warning` `caution` `success`
`question` `failure` `danger` `bug` `example` `quote` `abstract` `todo`

The fold modifier (`+` / `-`) is parsed but collapsible behaviour requires additional JS.

#### Images

Use standard Markdown image syntax and keep images alongside posts or in `public/`:

```md
![Alt text](./images/screenshot.png)
![Alt text](/images/screenshot.png)
```

## 🌐 Deployment (Vercel)

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `cyanix-blog`.
3. Vercel auto-detects Astro. Leave defaults and click **Deploy**.
4. (Optional) Bind a custom domain in **Project Settings → Domains**.
5. Update `site` in `astro.config.mjs` to match your domain:

```js
export default defineConfig({
  site: "https://your-domain.com",
  // ...
});
```

Every push to `main` triggers an automatic redeploy.

## 🔄 Obsidian Sync Workflow

The recommended workflow uses a GitHub Action to copy posts from your Obsidian vault into this repo:

```
Obsidian vault (private repo)
        │  GitHub Action on push
        ▼
src/content/posts/   ← synced Markdown
        │  Vercel auto-deploy on push
        ▼
    cyanix-blog.vercel.app
```

You can also sync manually:

```bash
cp ~/obsidian-vault/Blog/*.md src/content/posts/
git add src/content/posts/
git commit -m "chore: sync posts"
git push
```

## 🔍 Search (Pagefind)

The search box is Pagefind-ready. To enable full-text search:

```bash
pnpm add -D pagefind
```

Add to `package.json`:

```json
"scripts": {
  "postbuild": "pagefind --site dist"
}
```

Then replace the native search `<input>` in `index.astro` with the Pagefind UI widget.

## 📜 License

MIT — feel free to fork and make it your own.

---

Built with [Astro](https://astro.build) · Deployed on [Vercel](https://vercel.com)