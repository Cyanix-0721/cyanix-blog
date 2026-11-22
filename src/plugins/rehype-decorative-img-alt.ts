import { visit } from 'unist-util-visit';

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

/**
 * Markdown body images rendered from Obsidian embeds (`![[image.png]]`) have
 * no real caption, so their alt should be empty (decorative). Depending on the
 * pipeline the alt can arrive as the raw filename; normalise every body <img>
 * whose alt is missing or looks like a filename to alt="".
 *
 * Images with a real caption (e.g. `![[image.png|caption]]`) keep their text.
 *
 * `tree`/`node` are typed loosely because only `unified` is a direct
 * dependency; the plugin operates on hast nodes whose types ship transitively.
 */
export default function rehypeDecorativeImgAlt() {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName !== 'img') return;
      const props = (node.properties ??= {});
      const alt = typeof props.alt === 'string' ? props.alt : '';
      if (!alt || IMAGE_EXT.test(alt.trim())) {
        props.alt = '';
      }
    });
  };
}
