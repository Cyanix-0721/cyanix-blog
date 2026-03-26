import { getRssString } from "@astrojs/rss";
import { getCollection } from "astro:content";

export const prerender = true;

function toPlainText(markdown = "") {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/>\s*\[![^\]]+\]\s*/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeXmlEntities(text = "") {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function toCdataContent(xml = "") {
  return xml.replace(
    /<content:encoded>([\s\S]*?)<\/content:encoded>/g,
    (_, encoded) =>
      `<content:encoded><![CDATA[${decodeXmlEntities(encoded)}]]></content:encoded>`,
  );
}

function stripHeadingSelfLinks(html = "") {
  // Remove heading self-links injected by rehype-autolink-headings (class="anchor-link")
  return html.replace(
    /<(h[1-6])([^>]*)>\s*<a[^>]*class="[^"]*\banchor-link\b[^"]*"[^>]*>([\s\S]*?)<\/a>\s*<\/\1>/gi,
    "<$1$2>$3</$1>",
  );
}

function getSummaryFromFirstHeadingFirstParagraph(html = "", fallback = "") {
  if (!html) return fallback;

  const firstHeadingMatch = html.match(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/i);
  if (!firstHeadingMatch || firstHeadingMatch.index == null) return fallback;

  const rest = html.slice(firstHeadingMatch.index + firstHeadingMatch[0].length);
  const firstParagraphMatch = rest.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  if (!firstParagraphMatch) return fallback;

  const paragraphText = toPlainText(firstParagraphMatch[1]);
  return paragraphText || fallback;
}

export async function GET(context) {
  const posts = await getCollection("posts", ({ data }) => !data.draft);

  // Ensure site ends with a slash for proper link formation
  const site = context.site.toString();
  const siteWithSlash = site.endsWith("/") ? site : `${site}/`;

  const rssXml = await getRssString({
    // Add Atom namespace for the self-link recommendation
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
    },
    title: "Cyanix Blog",
    description:
      "Personal blog by Cyanix — notes, thoughts, and technical writings.",
    site: siteWithSlash,
    items: posts
      .sort(
        (a, b) => b.data.dateCreated.getTime() - a.data.dateCreated.getTime(),
      )
      .map((post) => {
        const rawHtml = post.rendered?.html || "";
        const summaryFromHtml = getSummaryFromFirstHeadingFirstParagraph(
          rawHtml,
          post.data.title,
        );
        const summary = post.data.description || summaryFromHtml || post.data.title;
        const fullHtml = stripHeadingSelfLinks(rawHtml);

        return {
          title: post.data.title,
          pubDate: post.data.dateCreated,
          description: summary,
          content: fullHtml || `<p>${escapeHtml(summary)}</p>`,
          link: `/posts/${post.id}/`,
        };
      }),
    // Include the atom:link rel="self" as suggested by W3C validator
    customData: `
      <language>zh-CN</language>
      <atom:link href="${siteWithSlash}rss.xml" rel="self" type="application/rss+xml" />
    `,
  });

  return new Response(toCdataContent(rssXml), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
