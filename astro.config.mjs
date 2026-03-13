// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import remarkWikiLink from "remark-wiki-link";
import remarkCallout from "./src/plugins/remark-callout.ts";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// https://astro.build/config
export default defineConfig({
  site: "https://cyanix-blog.vercel.app",

  integrations: [mdx()],

  markdown: {
    // Shiki is Astro's built-in highlighter — no extra package needed
    syntaxHighlight: "shiki",
    shikiConfig: {
      // Use a dark theme that pairs well with a cyan accent palette
      theme: "one-dark-pro",
      // Also expose a light theme for users who prefer light mode
      themes: {
        light: "github-light",
        dark: "one-dark-pro",
      },
      // Wrap long lines instead of horizontal scrolling
      wrap: true,
    },

    remarkPlugins: [
      // Obsidian [[wikilink]] support
      [
        remarkWikiLink,
        {
          // Map [[Page Name]] → /posts/page-name
          pageResolver: (/** @type {string} */ name) => [
            name.toLowerCase().replace(/\s+/g, "-"),
          ],
          hrefTemplate: (/** @type {string} */ permalink) =>
            `/posts/${permalink}`,
          aliasDivider: "|",
        },
      ],
      // Obsidian > [!note] callout support (custom plugin)
      remarkCallout,
    ],

    rehypePlugins: [
      // Add `id` attributes to every heading
      rehypeSlug,
      // Wrap each heading in an anchor tag pointing to itself
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["anchor-link"],
            ariaLabel: "Link to section",
          },
        },
      ],
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});
