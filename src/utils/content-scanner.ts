import fs from "node:fs";
import path from "node:path";

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
      } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        // Calculate ID relative to the content directory
        const relativePath = path.relative(contentDir, res);
        const id = relativePath.replace(/\\/g, "/").replace(/\.mdx?$/, "");
        const fileName = path.parse(entry.name).name;

        // Map the base filename to the full ID
        wikilinkMap.set(fileName.toLowerCase(), id);
        // Also map with spaces replaced by hyphens
        wikilinkMap.set(fileName.toLowerCase().replace(/\s+/g, "-"), id);
      }
    }
  }

  scanDirectory(contentDir);
  return wikilinkMap;
}
