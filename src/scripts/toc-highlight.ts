/**
 * Lightweight client‑side script that uses IntersectionObserver
 * to highlight the currently visible section in the floating TOC.
 */
export function initTocHighlight(): void {
  const toc = document.getElementById("toc");
  if (!toc) return;

  const links = toc.querySelectorAll<HTMLAnchorElement>(".toc-link");
  if (links.length === 0) return;

  // Collect all heading elements referenced by the TOC
  const headingElements: HTMLElement[] = [];
  links.forEach((link) => {
    const slug = link.dataset.heading;
    if (slug) {
      const el = document.getElementById(slug);
      if (el) headingElements.push(el);
    }
  });

  if (headingElements.length === 0) return;

  let activeSlug: string | null = null;

  function setActive(slug: string | null) {
    if (slug === activeSlug) return;
    activeSlug = slug;
    
    let activeLink: HTMLAnchorElement | null = null;
    
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const isMatch = link.dataset.heading === slug;
      link.classList.toggle("active", isMatch);
      if (isMatch) activeLink = link;
    }

    // Auto-scroll the TOC so the active link is visible
    if (activeLink && toc) {
      // Offset by 20px so we aren't perfectly flush against the top/bottom edges
      const offset = 20; 
      const linkTop = activeLink.offsetTop;
      const linkBottom = linkTop + activeLink.offsetHeight;
      const tocTop = toc.scrollTop;
      const tocBottom = tocTop + toc.clientHeight;

      if (linkTop < tocTop + offset) {
        // Scroll up
        toc.scrollTo({ top: linkTop - offset, behavior: "smooth" });
      } else if (linkBottom > tocBottom - offset) {
        // Scroll down
        toc.scrollTo({
          top: linkBottom - toc.clientHeight + offset,
          behavior: "smooth",
        });
      }
    }
  }

  // Track which headings are in the viewport
  // rootMargin: top offset accounts for the sticky header (~64px)
  const observer = new IntersectionObserver(
    (entries) => {
      // Find the first heading that is intersecting (topmost in the viewport)
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
          return;
        }
      }
    },
    {
      rootMargin: "-80px 0px -65% 0px",
      threshold: 0,
    },
  );

  headingElements.forEach((el) => observer.observe(el));

  // Store cleanup function for View Transitions
  (window as any).__tocCleanup?.();
  (window as any).__tocCleanup = () => {
    observer.disconnect();
  };
}
