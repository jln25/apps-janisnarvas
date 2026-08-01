/* ==========================================================================
   Landing page — tool grid
   Add a new tool here (path must match its deployed folder name) and it
   shows up automatically. No other file needs to change.
   ========================================================================== */

const TOOLS = [
  {
    name: 'Study Tracker',
    description: 'WIP. Track assignments and due dates with a calendar and list view.',
    path: 'study-tracker/',
    icon: '📅',
  },
  {
    name: 'Reading Notebook',
    description: 'Tag-based notes for academic reading, exportable to Obsidian.',
    path: 'reading-notebook/',
    icon: '📚',
  },
  {
    name: 'BAMS Planner',
    description: 'WIP. Track progress through the UPOU BAMS program.',
    path: 'bams-planner/',
    icon: '🎓',
  },
];

const grid = document.getElementById('tool-grid');

TOOLS.forEach((tool) => {
  const card = document.createElement('a');
  card.className = 'tool-card';
  card.href = tool.path;

  card.innerHTML = `
    <span class="tool-card-icon">${tool.icon}</span>
    <h2 class="tool-card-name">${tool.name}</h2>
    <p class="tool-card-desc">${tool.description}</p>
  `;

  grid.appendChild(card);
});
