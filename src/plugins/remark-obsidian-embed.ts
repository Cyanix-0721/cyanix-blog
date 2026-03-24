import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import type { Plugin } from "unified";

export interface ObsidianEmbedOptions {
  wikilinkMap: Map<string, string>;
}

/**
 * Remark plugin to handle Obsidian-style embeds (![[...]]) by:
 * 1. Finding text nodes containing ![[...]] and parsing them.
 * 2. Creating a proper wikiLink node with the "obsidian-embed" class.
 */
const remarkObsidianEmbed: Plugin<[ObsidianEmbedOptions], Root> = (options) => {
  const wikilinkMap = options?.wikilinkMap;

  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || index === undefined) return;
      if (!node.value || !node.value.includes("![[")) return;

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
            type: "text",
            value: node.value.slice(lastIndex, matchIndex),
          });
        }

        const linkText = match[1];
        let alias = linkText;
        let target = linkText;

        if (linkText.includes("|")) {
          const parts = linkText.split("|");
          target = parts[0];
          alias = parts[1];
        }

        // Resolve link target using wikilinkMap
        const key = target.toLowerCase();
        let permalink = target.toLowerCase().replace(/\s+/g, "-");
        if (wikilinkMap?.has(key)) {
          permalink = wikilinkMap.get(key)!;
        }

        const isInternal = wikilinkMap?.has(key) ?? false;
        const className = isInternal ? "internal obsidian-embed" : "internal new obsidian-embed";

        // Create wikiLink node
        newChildren.push({
          type: "wikiLink",
          value: target,
          data: {
            alias: alias,
            permalink: permalink,
            exists: isInternal,
            hName: "a",
            hProperties: {
              className,
              href: `/posts/${permalink}`,
            },
            hChildren: [
              {
                type: "text",
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
          type: "text",
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
