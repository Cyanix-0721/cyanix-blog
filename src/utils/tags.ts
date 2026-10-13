import type { CollectionEntry } from 'astro:content';

/**
 * Convert a tag label into its URL segment.
 *
 * This is the single source of truth for tag URLs. Every place that links to a
 * tag page must use it, otherwise links and generated routes drift apart —
 * e.g. a `/` in "CI/CD" must become `ci-cd`, not `ci/cd`.
 *
 * Obsidian treats tags case-insensitively, but the raw frontmatter strings are
 * not normalized, so "Linux" and "linux" are two distinct strings that must
 * resolve to the same page.
 */
export function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/[\s\/]+/g, '-');
}

export interface TagGroup {
  /** URL segment, also the unique key. */
  slug: string;
  /** Label shown in headings and chips. */
  label: string;
  /** Every raw spelling that maps to this slug ("linux" and "Linux"). */
  aliases: string[];
  /** All posts carrying any of the aliases. */
  posts: CollectionEntry<'posts'>[];
}

/**
 * Group posts by tag, merging spellings that share a slug.
 *
 * Without this, `getStaticPaths()` emits duplicate params for "Linux"/"linux"
 * and all but one page is silently discarded.
 *
 * The label prefers an already-lowercase spelling (matching the URL and
 * Obsidian's own display), then the most common spelling, then alphabetical.
 */
export function groupPostsByTag(posts: CollectionEntry<'posts'>[]): TagGroup[] {
  const groups = new Map<
    string,
    { variants: Map<string, number>; posts: CollectionEntry<'posts'>[] }
  >();

  for (const post of posts) {
    for (const tag of post.data.tags || []) {
      const slug = tagSlug(tag);
      let group = groups.get(slug);
      if (!group) {
        group = { variants: new Map(), posts: [] };
        groups.set(slug, group);
      }
      group.variants.set(tag, (group.variants.get(tag) ?? 0) + 1);
      // A post may list both spellings; only add it once.
      if (!group.posts.includes(post)) group.posts.push(post);
    }
  }

  return [...groups.entries()]
    .map(([slug, { variants, posts: groupPosts }]) => {
      const aliases = [...variants.keys()];
      const label = [...variants.entries()].sort(
        ([aLabel, aCount], [bLabel, bCount]) => {
          const aIsLower = aLabel === aLabel.toLowerCase() ? 0 : 1;
          const bIsLower = bLabel === bLabel.toLowerCase() ? 0 : 1;
          if (aIsLower !== bIsLower) return aIsLower - bIsLower;
          if (aCount !== bCount) return bCount - aCount;
          return aLabel.localeCompare(bLabel);
        }
      )[0][0];

      return {
        slug,
        label,
        aliases,
        posts: groupPosts.sort(
          (a, b) => b.data.dateCreated.valueOf() - a.data.dateCreated.valueOf()
        ),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}
