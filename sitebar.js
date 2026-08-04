/* ==========================================================================
   sitebar.js — shared footer bar for every page on this site
   Renders into <footer class="site-bar"></footer>.

   Holds the licensing line, so it appears on every page without the text
   being pasted into each one. `prefix` lets pages inside a subfolder point
   back up at the licence page.
   ========================================================================== */

(() => {
  const CC_DEED = 'https://creativecommons.org/licenses/by/4.0/deed.en';

  function render() {
    document.querySelectorAll('.site-bar').forEach((bar) => {
      if (bar.dataset.rendered) return; // guard against double-invocation
      bar.dataset.rendered = 'true';

      // Pages one level down (the apps) need "../" to reach license.html.
      const prefix = bar.dataset.rootPrefix || '';

      const line = document.createElement('span');
      line.className = 'site-bar-license';

      const mit = document.createElement('a');
      mit.href = `${prefix}license.html`;
      mit.textContent = 'MIT License';

      const cc = document.createElement('a');
      cc.href = CC_DEED;
      cc.target = '_blank';
      cc.rel = 'noopener';
      cc.textContent = 'CC BY 4.0';

      line.append('Open source. Code under the ', mit, '; the writing and design under ', cc,
                  '. Free to share and adapt.');
      bar.appendChild(line);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
