import path from 'node:path';
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

export interface ObsidianEmbedOptions {
  wikilinkMap: Map<string, string>;
  /** Map of lowercase image basename -> absolute path on disk. */
  assetMap?: Map<string, string>;
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

/**
 * Remark plugin to handle Obsidian-style embeds (![[...]]):
 * - Image embeds (`![[photo.png]]`) become real <img> nodes so the asset is
 *   emitted by Astro and shows up in the build output.
 * - Everything else (note embeds) keeps the previous behaviour of becoming a
 *   cross-post link.
 */
const remarkObsidianEmbed: Plugin<[ObsidianEmbedOptions], Root> = (options) => {
  const wikilinkMap = options?.wikilinkMap;
  const assetMap = options?.assetMap;

  return (tree, file) => {
    const mdDir = file?.path ? path.dirname(file.path) : null;

    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined) return;
      if (!node.value || !node.value.includes('![[')) return;

      const regex = /!\[\[([^\]]+)\]\]/g;
      const matches = [...node.value.matchAll(regex)];
      if (matches.length === 0) return;

      const newChildren: any[] = [];
      let lastIndex = 0;

      for (const match of matches) {
        const matchIndex = match.index!;
        // Text before the embed
        if (matchIndex > lastIndex) {
          newChildren.push({
            type: 'text',
            value: node.value.slice(lastIndex, matchIndex),
          });
        }

        const linkText = match[1];
        let alias = linkText;
        let target = linkText;

        if (linkText.includes('|')) {
          const parts = linkText.split('|');
          target = parts[0];
          alias = parts[1];
        }

        // --- Image embed: emit a real <img> with a relative URL ---
        if (IMAGE_EXT.test(target.trim()) && assetMap && mdDir) {
          const abs = assetMap.get(path.basename(target.trim()).toLowerCase());
          if (abs) {
            const rel = path.relative(mdDir, abs).split(path.sep).join('/');
            const url = rel.startsWith('.') ? rel : `./${rel}`;
            // Only use the embed label as alt text when it is a real caption
            // (i.e. not just the filename). Bare body images are decorative,
            // so empty alt is the correct accessibility choice.
            const altText =
              alias && alias !== path.basename(target.trim()) ? alias : '';
            newChildren.push({
              type: 'image',
              url,
              alt: altText,
              title: null,
              data: {
                hProperties: {
                  loading: 'lazy',
                  decoding: 'async',
                },
              },
            });
            lastIndex = matchIndex + match[0].length;
            continue;
          }
        }

        // --- Note / non-image embed: keep the cross-post link behaviour ---
        // Resolve link target using wikilinkMap
        const key = target.toLowerCase();
        let permalink = target.toLowerCase().replace(/\s+/g, '-');
        if (wikilinkMap?.has(key)) {
          permalink = wikilinkMap.get(key)!;
        }

        const isInternal = wikilinkMap?.has(key) ?? false;
        const className = isInternal
          ? 'internal obsidian-embed'
          : 'internal new obsidian-embed';

        newChildren.push({
          type: 'wikiLink',
          value: target,
          data: {
            alias: alias,
            permalink: permalink,
            exists: isInternal,
            hName: 'a',
            hProperties: {
              className,
              href: `/posts/${permalink}`,
            },
            hChildren: [
              {
                type: 'text',
                value: alias,
              },
            ],
          },
        });

        lastIndex = matchIndex + match[0].length;
      }

      // Text after the last embed
      if (lastIndex < node.value.length) {
        newChildren.push({
          type: 'text',
          value: node.value.slice(lastIndex),
        });
      }

      // Replace the current text node with the new children
      parent.children.splice(index, 1, ...newChildren);

      // Skip examining the newly inserted children to avoid infinite loops
      return index + newChildren.length;
    });
  };
};

export default remarkObsidianEmbed;
