type Theme = "light" | "dark" | "auto";

const STORAGE_KEY = "cyanix-theme";

/**
 * Gets the current saved theme from localStorage, defaulting to 'auto'.
 */
export function getSavedTheme(): Theme {
  if (typeof localStorage !== "undefined") {
    return (localStorage.getItem(STORAGE_KEY) as Theme) || "auto";
  }
  return "auto";
}

/**
 * Applies the theme to the document element.
 */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "auto") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

/**
 * Cycles through auto -> light -> dark.
 */
export function cycleTheme(): Theme {
  const current = getSavedTheme();
  const themes: Theme[] = ["auto", "light", "dark"];
  const currentIndex = themes.indexOf(current);
  const next = themes[(currentIndex + 1) % themes.length];

  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
  updateSwitcherUI(next);
  return next;
}

/**
 * Updates the visual state of the switcher button.
 */
export function updateSwitcherUI(theme: Theme) {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const iconContainer = btn.querySelector(".theme-icon-container");
  if (!iconContainer) return;

  // Icons: Sun (light), Moon (dark), Settings/Monitor (auto)
  const icons = {
    auto: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    light: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    dark: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  };

  iconContainer.innerHTML = icons[theme];
  btn.setAttribute("aria-label", `Switch theme (current: ${theme})`);
}

/**
 * Initializes the theme toggle button's click listener.
 */
export function initThemeSwitcher() {
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    // Avoid double-binding if called multiple times (e.g. view transitions)
    btn.onclick = () => cycleTheme();
    updateSwitcherUI(getSavedTheme());
  }
}
