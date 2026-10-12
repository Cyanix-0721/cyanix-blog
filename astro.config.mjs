// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';

import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import remarkWikiLink from 'remark-wiki-link';
import remarkCallout from './src/plugins/remark-callout.ts';
import remarkObsidianEmbed from './src/plugins/remark-obsidian-embed.ts';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStripLeadingH1 from './src/plugins/rehype-strip-leading-h1.ts';
import path from 'node:path';
import { buildWikilinkMap } from './src/utils/content-scanner.ts';

/**
 * Build a map of "Short Name" -> "Full ID" for Obsidian wikilinks.
 */
const postsDir = path.resolve('./src/content/posts');
const wikilinkMap = buildWikilinkMap(postsDir);

// https://astro.build/config
export default defineConfig({
  site: 'https://cyanix-blog.vercel.app',
  output: 'static',

  // Astro 7 changed the default from `true` (HTML-aware) to `'jsx'` (JSX
  // whitespace rules), which strips the space between inline elements:
  // `<span>195 篇文章</span> <span>134 个标签</span>` renders as
  // "195 篇文章134 个标签". Verified by rendering all 330 pages in a browser
  // against the Astro 6 output: `true` keeps all 330 identical (body.innerText),
  // `'jsx'` changes all 330.
  compressHTML: true,

  integrations: [mdx(), pagefind(), sitemap()],

  markdown: {
    // Astro 7 defaults to the Sätteri pipeline, which does not run remark/rehype
    // plugins. This project depends on six of them, so pin the unified() pipeline.
    // Astro 7 also deprecated `markdown.remarkPlugins` / `markdown.rehypePlugins`:
    // they must be passed to unified() instead.
    processor: unified({
      remarkPlugins: [
        // Obsidian [[wikilink]] support
        [
          remarkWikiLink,
          {
            // Map [[Page Name]] → /posts/page-name
            // If the page name exists in our map (shortest path), use the full ID.
            // Otherwise, fall back to the default slugification.
            pageResolver: (/** @type {string} */ name) => {
              const key = name.toLowerCase();
              if (wikilinkMap.has(key)) {
                return [wikilinkMap.get(key)];
              }
              return [name.toLowerCase().replace(/\s+/g, '-')];
            },
            hrefTemplate: (/** @type {string} */ permalink) =>
              `/posts/${permalink}`,
            aliasDivider: '|',
          },
        ],
        // Obsidian > [!note] callout support (custom plugin)
        remarkCallout,
        // Customize ![[link]] to not show '!' and add a prefix
        [remarkObsidianEmbed, { wikilinkMap }],
      ],

      rehypePlugins: [
        // Add `id` attributes to every heading
        rehypeSlug,
        // Remove leading H1 from post body at generation time (title is rendered by layout)
        rehypeStripLeadingH1,
        // Wrap each heading in an anchor tag pointing to itself
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'wrap',
            properties: {
              className: ['anchor-link'],
              ariaLabel: 'Link to section',
            },
          },
        ],
      ],
    }),

    // Shiki is Astro's built-in highlighter — no extra package needed
    syntaxHighlight: 'shiki',
    shikiConfig: {
      // Use a dark theme that pairs well with a cyan accent palette
      theme: 'tokyo-night',
      // Also expose a light theme for users who prefer light mode
      themes: {
        light: 'github-light',
        dark: 'tokyo-night',
      },
      // Wrap long lines instead of horizontal scrolling
      wrap: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});
