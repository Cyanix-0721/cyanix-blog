import { visit } from 'unist-util-visit';

/**
 * Marks the first <img> in a post body as the likely LCP candidate:
 * `loading="eager"` + `fetchpriority="high"`. Every later image keeps the
 * lazy/async defaults set by the remark plugin, so we do not eagerly fetch a
 * whole gallery.
 */
export default function rehypeFirstImageEager() {
  return (tree: any) => {
    let done = false;
    visit(tree, 'element', (node: any) => {
      if (done || node.tagName !== 'img') return;
      node.properties = node.properties || {};
      node.properties.loading = 'eager';
      node.properties.fetchpriority = 'high';
      done = true;
    });
  };
}
