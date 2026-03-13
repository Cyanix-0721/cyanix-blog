import type { Root, Blockquote, Paragraph, Text } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

export type CalloutType =
  | 'note'
  | 'tip'
  | 'important'
  | 'warning'
  | 'caution'
  | 'info'
  | 'success'
  | 'question'
  | 'failure'
  | 'danger'
  | 'bug'
  | 'example'
  | 'quote'
  | 'abstract'
  | 'todo';

const CALLOUT_REGEX = /^\[!(\w+)\]([+-]?)\s*(.*)?$/i;

const CALLOUT_ICONS: Record<CalloutType | string, string> = {
  note: '📝',
  tip: '💡',
  important: '❗',
  warning: '⚠️',
  caution: '🔥',
  info: 'ℹ️',
  success: '✅',
  question: '❓',
  failure: '❌',
  danger: '💥',
  bug: '🐛',
  example: '📌',
  quote: '💬',
  abstract: '📋',
  todo: '☑️',
};

/**
 * Remark plugin to transform Obsidian-style callouts into HTML elements.
 *
 * Supports the following syntax:
 * > [!note] Optional title
 * > Content here
 *
 * The fold modifier (+/-) after the type is parsed but left as a data
 * attribute for CSS/JS to handle collapsible behaviour.
 */
const remarkCallout: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote, index, parent) => {
      if (!parent || index === undefined) return;

      // The first child must be a paragraph whose first child is text
      const firstChild = node.children[0];
      if (!firstChild || firstChild.type !== 'paragraph') return;

      const firstInline = firstChild.children[0];
      if (!firstInline || firstInline.type !== 'text') return;

      // Extract the first line of text (before any newline)
      const rawText: string = (firstInline as Text).value;
      const firstLine = rawText.split('\n')[0].trim();
      const match = firstLine.match(CALLOUT_REGEX);
      if (!match) return;

      const [, rawType, fold, inlineTitle] = match;
      const type = rawType.toLowerCase() as CalloutType;
      const icon = CALLOUT_ICONS[type] ?? '📄';
      const title = inlineTitle?.trim() || rawType.charAt(0).toUpperCase() + rawType.slice(1);

      // Remove the [!type] marker from the AST
      const remainingText = rawText.split('\n').slice(1).join('\n');
      if (remainingText.trim()) {
        (firstInline as Text).value = remainingText;
      } else {
        // Drop the first paragraph entirely if it only had the marker line
        firstChild.children = firstChild.children.slice(1);
        if (firstChild.children.length === 0) {
          node.children = node.children.slice(1);
        }
      }

      // Rebuild as an HTML node so Astro renders it verbatim
      const bodyNodes = node.children;

      // Serialise inner content back to markdown-ish HTML by converting
      // remaining paragraph text nodes into <p> tags.
      // We use a hast-compatible data approach instead: attach custom data
      // to the blockquote so a rehype plugin or the MDX renderer can pick it up.
      // For pure remark-only usage we emit raw HTML.

      // Build the title bar HTML
      const titleHtml = `<div class="callout-title"><span class="callout-icon" aria-hidden="true">${icon}</span><span class="callout-title-text">${escapeHtml(title)}</span></div>`;

      // Collect body HTML from remaining children
      const bodyHtml = nodeToHtml(bodyNodes);

      const foldAttr = fold ? ` data-fold="${fold}"` : '';

      const html = [
        `<div class="callout callout-${type}" data-callout="${type}"${foldAttr} role="note">`,
        titleHtml,
        `<div class="callout-body">`,
        bodyHtml,
        `</div>`,
        `</div>`,
      ].join('\n');

      // Replace the blockquote node with a raw HTML node
      const htmlNode = {
        type: 'html',
        value: html,
      };

      parent.children.splice(index, 1, htmlNode as any);
    });
  };
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Very small mdast-to-HTML serialiser (handles the subset we care about). */
function nodeToHtml(nodes: any[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'paragraph':
          return `<p>${inlineToHtml(node.children)}</p>`;
        case 'list':
          return listToHtml(node);
        case 'code':
          return `<pre><code class="language-${node.lang ?? ''}">${escapeHtml(node.value)}</code></pre>`;
        case 'blockquote':
          return `<blockquote>${nodeToHtml(node.children)}</blockquote>`;
        case 'html':
          return node.value;
        default:
          return '';
      }
    })
    .join('\n');
}

function listToHtml(node: any): string {
  const tag = node.ordered ? 'ol' : 'ul';
  const items = node.children
    .map((item: any) => `<li>${nodeToHtml(item.children)}</li>`)
    .join('');
  return `<${tag}>${items}</${tag}>`;
}

function inlineToHtml(nodes: any[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
          return escapeHtml(node.value);
        case 'strong':
          return `<strong>${inlineToHtml(node.children)}</strong>`;
        case 'emphasis':
          return `<em>${inlineToHtml(node.children)}</em>`;
        case 'inlineCode':
          return `<code>${escapeHtml(node.value)}</code>`;
        case 'link':
          return `<a href="${escapeHtml(node.url)}">${inlineToHtml(node.children)}</a>`;
        case 'html':
          return node.value;
        default:
          return '';
      }
    })
    .join('');
}

export default remarkCallout;
