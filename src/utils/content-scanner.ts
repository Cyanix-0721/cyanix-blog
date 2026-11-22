import fs from 'node:fs';
import path from 'node:path';

/**
 * Builds a map of "Short Name" -> "Full ID" for Obsidian wikilinks.
 */
export function buildWikilinkMap(contentDir: string) {
  const wikilinkMap = new Map<string, string>();

  function scanDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const res = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(res);
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        // Calculate ID relative to the content directory and slugify to match Astro 6 routing
        const relativePath = path.relative(contentDir, res);
        const id = relativePath
          .replace(/\\/g, '/')
          .replace(/\.mdx?$/, '')
          .toLowerCase()
          .replace(/\s+/g, '-');
        const fileName = path.parse(entry.name).name;

        // Map the base filename to the full ID
        wikilinkMap.set(fileName.toLowerCase(), id);
        // Also map with spaces replaced by hyphens
        wikilinkMap.set(fileName.toLowerCase().replace(/\s+/g, '-'), id);
        // Also map the ID itself
        wikilinkMap.set(id, id);
      }
    }
  }

  scanDirectory(contentDir);
  return wikilinkMap;
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

/**
 * Builds a map of "lowercase image basename" -> "absolute path on disk" for
 * every image file under the content directory. Used to turn Obsidian image
 * embeds (`![[photo.png]]`) back into resolvable <img> sources.
 */
export function buildAssetMap(contentDir: string) {
  const assetMap = new Map<string, string>();

  function scanDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const res = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(res);
      } else if (IMAGE_EXT.test(entry.name)) {
        const base = entry.name.toLowerCase();
        // First hit wins; posts normally use unique image names.
        if (!assetMap.has(base)) assetMap.set(base, res);
      }
    }
  }

  scanDirectory(contentDir);
  return assetMap;
}

/**
 * Builds a map of "/posts/<id>" (decoded, no trailing slash) -> ISO lastmod,
 * preferring `date modified` and falling back to `date created`. Consumed by
 * the sitemap integration to emit <lastmod> so crawlers know what changed.
 */
export function buildLastmodMap(contentDir: string) {
  const lastmodMap = new Map<string, string>();

  function scanDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const res = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(res);
      } else if (/\.mdx?$/.test(entry.name)) {
        const raw = fs.readFileSync(res, 'utf8');
        const rel = path
          .relative(contentDir, res)
          .replace(/\\/g, '/')
          .replace(/\.mdx?$/, '')
          .toLowerCase()
          .replace(/\s+/g, '-');
        const match =
          raw.match(/^date modified:\s*(.+)$/im) ||
          raw.match(/^date created:\s*(.+)$/im);
        if (match) {
          const value = match[1].trim().replace(/^['"]|['"]$/g, '');
          const date = new Date(value);
          if (!Number.isNaN(date.valueOf())) {
            lastmodMap.set(`/posts/${rel}`, date.toISOString());
          }
        }
      }
    }
  }

  scanDirectory(contentDir);
  return lastmodMap;
}
