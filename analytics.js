/* ==========================================================================
   analytics.js — shared Google Analytics (GA4) loader for every page
   Loaded by each page with a single <script> tag, so the measurement ID
   lives in exactly one place rather than being pasted into four files.
   ========================================================================== */

(() => {
  // Local previews are testing, not visitors: counting them skews the numbers.
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;

  const MEASUREMENT_ID = 'G-N0F0PZ1EQ7';

  // gtag.js is injected rather than hardcoded as a second <script> tag, which
  // is what lets all four pages share this one file.
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(tag);

  window.dataLayer = window.dataLayer || [];
  // Must push the `arguments` object itself — gtag.js reads it positionally,
  // so spreading it into an array would break event reporting.
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag; // exposed for custom events later

  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID);
})();
