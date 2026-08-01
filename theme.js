/* ==========================================================================
   theme.js — shared light/dark theme handling for every app on this site
   Loaded by each app's index.html before its own script.

   Behaviour: follow the OS setting by default; a manual choice overrides it
   and is remembered. Stored under one key so switching apps keeps the theme.
   ========================================================================== */

(() => {
  const STORAGE_KEY = 'appsJanisNarvas.theme'; // 'light' | 'dark' | absent = follow system
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function stored() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === 'light' || v === 'dark' ? v : null;
    } catch {
      return null; // private browsing with storage disabled
    }
  }

  function activeTheme() {
    return stored() || (media.matches ? 'dark' : 'light');
  }

  function apply(theme) {
    root.dataset.theme = theme;
    // Lets the browser style form controls and scrollbars to match.
    root.style.colorScheme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      const dark = theme === 'dark';
      btn.textContent = dark ? '☀' : '☾';
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-pressed', String(dark));
    });
  }

  // Applied immediately (script is loaded in <head>) so there is no light flash.
  apply(activeTheme());

  // Track the OS while the user has not made an explicit choice.
  media.addEventListener('change', () => {
    if (!stored()) apply(activeTheme());
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    const next = activeTheme() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* storage unavailable; theme still applies for this page */ }
    apply(next);
  });

  // Toggle buttons may be created after this script runs.
  document.addEventListener('DOMContentLoaded', () => apply(activeTheme()));
})();
