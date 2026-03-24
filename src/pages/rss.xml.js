import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export const prerender = true;

export async function GET(context) {
  const posts = await getCollection("posts", ({ data }) => !data.draft);

  // Ensure site ends with a slash for proper link formation
  const site = context.site.toString();
  const siteWithSlash = site.endsWith("/") ? site : `${site}/`;

  return rss({
    // Add Atom namespace for the self-link recommendation
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
    },
    title: "Cyanix Blog",
    description:
      "Personal blog by Cyanix — notes, thoughts, and technical writings.",
    site: siteWithSlash,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.dateCreated,
      // Compatibility: use fallback description if missing
      description: post.data.description || post.data.title,
      link: `/posts/${post.id}/`,
    })),
    // Include the atom:link rel="self" as suggested by W3C validator
    customData: `
      <language>zh-CN</language>
      <atom:link href="${siteWithSlash}rss.xml" rel="self" type="application/rss+xml" />
    `,
  });
}
