/* ==========================================================================
   Landing page — tool grid
   Add a new tool to the right group here (path must match its deployed folder
   name) and its card shows up automatically. The nav draws the same split from
   LINK_GROUPS in nav.js, so a new tool goes in both files.
   ========================================================================== */

const TOOL_GROUPS = [
  {
    label: 'For students',
    tools: [
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
    ],
  },
  {
    label: 'For content writers',
    tools: [
      {
        name: 'Copy Cat',
        description: 'Easy copy checker tool for UX and SEO writers',
        path: 'copy-cat/',
        icon: '🐈',
      },
      {
        name: 'Word Bank',
        description: 'Words and phrases for any brand mood, industry or page section.',
        path: 'word-bank/',
        icon: '🔤',
      },
    ],
  },
];

const groupsContainer = document.getElementById('tool-groups');

function buildCard(tool) {
  const card = document.createElement('a');
  card.className = 'tool-card';
  card.href = tool.path;

  // A card pointing somewhere off this site opens in its own tab, so the
  // visitor does not lose the page they were on.
  if (/^https?:/i.test(tool.path)) {
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
  }

  // The group heading above is the h2, so a card name is an h3. Skipping a
  // level would break the outline for anyone navigating by headings.
  card.innerHTML = `
    <span class="tool-card-icon">${tool.icon}</span>
    <h3 class="tool-card-name">${tool.name}</h3>
    <p class="tool-card-desc">${tool.description}</p>
  `;

  return card;
}

TOOL_GROUPS.forEach((group) => {
  const section = document.createElement('section');
  section.className = 'tool-group';

  const heading = document.createElement('h2');
  heading.className = 'tool-group-heading';
  heading.textContent = group.label;

  const grid = document.createElement('div');
  grid.className = 'tool-grid';
  group.tools.forEach((tool) => grid.appendChild(buildCard(tool)));

  section.append(heading, grid);
  groupsContainer.appendChild(section);
});
