import { getRssString } from "@astrojs/rss";
import { getCollection } from "astro:content";

export const prerender = true;

function toPlainText(markdown = "") {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/^>\s*/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~]/g, " ")
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

function shortenText(text = "", maxLength = 180) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function getSummaryFromFirstHeadingFirstParagraph(
  markdown = "",
  fallback = "",
) {
  if (!markdown) return fallback;

  const withoutCodeFences = markdown.replace(/```[\s\S]*?```/g, "\n");
  const lines = withoutCodeFences.split(/\r?\n/);
  const headingIndexes = lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => /^#{1,6}\s+/.test(line))
    .map(({ line, index }) => ({ index, level: line.match(/^#+/)[0].length }));
  if (headingIndexes.length === 0) return fallback;

  // Skip duplicated document H1 and use the first real section heading.
  const targetHeadingIndex =
    headingIndexes[0].level === 1 && headingIndexes.length > 1
      ? headingIndexes[1].index
      : headingIndexes[0].index;

  const paragraphLines = [];

  for (const rawLine of lines.slice(targetHeadingIndex + 1)) {
    const line = rawLine.trim();

    // Limit extraction to the first heading section only.
    if (/^#{1,6}\s+/.test(line)) break;

    if (!line) {
      if (paragraphLines.length > 0) break;
      continue;
    }

    // Stop when hitting structural blocks. If paragraph hasn't started yet,
    // we don't scan into later blocks to avoid pulling unrelated sections.
    if (
      /^([-*+]|\d+\.)\s+/.test(line) ||
      /^\|.*\|$/.test(line) ||
      /^[|:\-\s]+$/.test(line) ||
      /^>\s*/.test(line) ||
      /^```/.test(line)
    ) {
      if (paragraphLines.length > 0) break;
      continue;
    }

    paragraphLines.push(line);
  }

  if (paragraphLines.length === 0) return fallback;
  const paragraphText = toPlainText(paragraphLines.join(" "));
  if (!paragraphText) return fallback;
  return shortenText(paragraphText, 180);
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
        const summaryFromMarkdown = getSummaryFromFirstHeadingFirstParagraph(
          post.body || "",
          post.data.title,
        );
        const normalizedDescription =
          typeof post.data.description === "string"
            ? post.data.description.trim()
            : "";
        const hasExplicitDescription =
          normalizedDescription && normalizedDescription !== post.data.title;
        const summary = hasExplicitDescription
          ? normalizedDescription
          : summaryFromMarkdown || post.data.title;
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
