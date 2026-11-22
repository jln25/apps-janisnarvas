/* ==========================================================================
   Landing page — tool grid
   Add a new tool here (path must match its deployed folder name) and it
   shows up automatically. No other file needs to change.
   ========================================================================== */

const TOOLS = [
  {
    name: 'Study Tracker',
    description: 'Track assignments and due dates. Calendar and list views.',
    path: 'study-tracker/',
    icon: '📅',
  },
  {
    name: 'Reading Notebook',
    description: 'Tag-based note-taking tool for academic readings.',
    path: 'reading-notebook/',
    icon: '📚',
  },
  {
    name: 'BAMS Planner',
    description: 'WIP. Track progress through the UPOU BAMS program.',
    path: 'bams-planner/',
    icon: '🎓',
  },
  {
    name: 'Copy Cat',
    description: 'Easy copy checker tool for UX and SEO writers',
    path: 'copy-cat/',
    icon: '🐈',
  },
];

const grid = document.getElementById('tool-grid');

TOOLS.forEach((tool) => {
  const card = document.createElement('a');
  card.className = 'tool-card';
  card.href = tool.path;

  // A card pointing somewhere off this site opens in its own tab, so the
  // visitor does not lose the page they were on.
  if (/^https?:/i.test(tool.path)) {
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
  }

  card.innerHTML = `
    <span class="tool-card-icon">${tool.icon}</span>
    <h2 class="tool-card-name">${tool.name}</h2>
    <p class="tool-card-desc">${tool.description}</p>
  `;

  grid.appendChild(card);
});
