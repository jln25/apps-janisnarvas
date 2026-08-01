/* ==========================================================================
   sitebar.js — shared footer bar for every page on this site
   Renders into <footer class="site-bar" data-app-version="1.0.0"></footer>.

   The year is generated at load rather than hardcoded, so the copyright
   stays correct without anyone remembering to edit it each January.
   ========================================================================== */

(() => {
  function render() {
    document.querySelectorAll('.site-bar').forEach((bar) => {
      if (bar.dataset.rendered) return; // guard against double-invocation
      bar.dataset.rendered = 'true';

      const version = bar.dataset.appVersion;

      if (version) {
        const v = document.createElement('span');
        v.className = 'site-bar-version';
        v.textContent = `v${version}`;
        bar.appendChild(v);
      }

      const copy = document.createElement('span');
      copy.append(`© ${new Date().getFullYear()}. `);

      const link = document.createElement('a');
      link.href = 'https://janisnarvas.com';
      link.textContent = 'Janis Narvas';
      copy.appendChild(link);

      bar.appendChild(copy);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
