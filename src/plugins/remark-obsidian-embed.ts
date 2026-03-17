import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import type { Plugin } from "unified";

/**
 * Remark plugin to handle Obsidian-style embeds (![[...]]) by:
 * 1. Removing the leading '!'
 * 2. Prepending a "supplementary" indicator text to the link.
 */
const remarkObsidianEmbed: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) return;

      const nextNode = parent.children[index + 1] as any;
      if (
        node.type === "text" &&
        node.value.endsWith("!") &&
        nextNode?.type === "wikiLink"
      ) {
        // 1. Remove the '!' from the text node
        node.value = node.value.slice(0, -1);

        // 2. Customize the wikilink node
        if (nextNode.data && nextNode.data.hProperties) {
          nextNode.data.hProperties.className =
            (nextNode.data.hProperties.className || "") + " obsidian-embed";
        }
      }
    });
  };
};

export default remarkObsidianEmbed;
