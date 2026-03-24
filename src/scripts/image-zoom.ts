import mediumZoom from "medium-zoom";

export function initImageZoom() {
  // Select all images inside the .prose container, excluding those that might be linked
  const images = document.querySelectorAll(".prose img:not(a img)");

  if (images.length === 0) return;

  mediumZoom(images, {
    margin: 24,
    background: "var(--surface-1)",
    scrollOffset: 0,
  });
}
