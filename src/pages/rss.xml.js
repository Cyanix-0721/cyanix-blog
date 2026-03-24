import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  
  return rss({
    title: "Cyanix Blog",
    description: "Personal blog by Cyanix — notes, thoughts, and technical writings.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.dateCreated,
      description: post.data.description,
      link: `/posts/${post.id}/`,
    })),
    customData: `<language>zh-CN</language>`,
  });
}
