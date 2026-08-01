/* ==========================================================================
   BAMS Planner — application logic
   No frameworks, no build step. Curriculum seed lives in courses.js;
   this file handles persistence, dashboard math, and rendering.
   ========================================================================== */

const STORAGE_KEY = 'bamsPlanner.courses';

const GROUP_ORDER = ['GE', 'Common', 'Mandated', 'Major', 'Production', 'Capstone'];
const GROUP_SLUG = {
  GE: 'ge', Common: 'common', Mandated: 'mandated',
  Major: 'major', Production: 'production', Capstone: 'capstone',
};
const STATUS_LABELS = { '': '—', planned: 'Planned', 'in-progress': 'In progress', completed: 'Completed' };

/* ---------- State ---------- */

let courses = loadCourses();

/* ---------- Persistence ---------- */

function loadCourses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load courses from localStorage', err);
  }
  // First run: seed from the hardcoded curriculum.
  return JSON.parse(JSON.stringify(DEFAULT_COURSES));
}

function saveCourses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

/* ---------- DOM references ---------- */

const els = {
  dashboardGroups: document.getElementById('dashboard-groups'),
  dashboardTotalText: document.getElementById('dashboard-total-text'),
  dashboardTotalPct: document.getElementById('dashboard-total-pct'),
  dashboardTotalBar: document.getElementById('dashboard-total-bar'),
  dashboardNongwaList: document.getElementById('dashboard-nongwa-list'),

  categoryFilter: document.getElementById('category-filter'),
  statusFilter: document.getElementById('status-filter'),
  courseList: document.getElementById('course-list'),

  exportCsvBtn: document.getElementById('export-csv-btn'),
  exportPdfBtn: document.getElementById('export-pdf-btn'),
  printHeader: document.getElementById('print-header'),
};

/* ---------- Dashboard math ---------- */

function computeDashboard() {
  const groupRequired = {};
  const groupCompleted = {};
  const poolGroup = {};
  const poolCompletedSum = {};

  courses.forEach((c) => {
    if (c.excludeFromTotal) return;
    groupRequired[c.group] = groupRequired[c.group] || 0;
    groupCompleted[c.group] = groupCompleted[c.group] || 0;

    if (c.poolKey) {
      poolGroup[c.poolKey] = c.group;
      poolCompletedSum[c.poolKey] = (poolCompletedSum[c.poolKey] || 0) + (c.status === 'completed' ? c.units : 0);
    } else {
      groupRequired[c.group] += c.units;
      if (c.status === 'completed') groupCompleted[c.group] += c.units;
    }
  });

  Object.keys(POOL_CAPS).forEach((poolKey) => {
    const group = poolGroup[poolKey];
    if (!group) return;
    groupRequired[group] += POOL_CAPS[poolKey];
    groupCompleted[group] += Math.min(poolCompletedSum[poolKey] || 0, POOL_CAPS[poolKey]);
  });

  const totalCompleted = Object.values(groupCompleted).reduce((a, b) => a + b, 0);

  // The dashboard summarises PE and NSTP as one bar each; the course list
  // below still shows every individual PE/NSTP course.
  const nonGwaTotals = new Map();
  courses.filter((c) => c.excludeFromTotal).forEach((c) => {
    const key = c.nonGwaGroup || c.code;
    const entry = nonGwaTotals.get(key) || { code: key, units: 0, completed: 0 };
    entry.units += c.units;
    if (c.status === 'completed') entry.completed += c.units;
    nonGwaTotals.set(key, entry);
  });
  const nonGwa = [...nonGwaTotals.values()];

  return { groupRequired, groupCompleted, totalCompleted, nonGwa };
}

/* ---------- Rendering: dashboard ---------- */

function renderDashboard() {
  const { groupRequired, groupCompleted, totalCompleted, nonGwa } = computeDashboard();

  const pct = TOTAL_UNITS_REQUIRED ? Math.min(100, Math.round((totalCompleted / TOTAL_UNITS_REQUIRED) * 100)) : 0;
  els.dashboardTotalText.textContent = `${totalCompleted} / ${TOTAL_UNITS_REQUIRED} units`;
  els.dashboardTotalPct.textContent = `${pct}%`;
  els.dashboardTotalBar.style.width = `${pct}%`;

  els.dashboardGroups.innerHTML = '';
  GROUP_ORDER.forEach((group) => {
    const required = groupRequired[group] || 0;
    if (required === 0) return;
    const completed = groupCompleted[group] || 0;
    const groupPct = Math.min(100, Math.round((completed / required) * 100));

    const card = document.createElement('div');
    card.className = 'dashboard-group-card';
    card.style.setProperty('--group-color', `var(--color-${GROUP_SLUG[group]})`);

    card.innerHTML = `
      <div class="dashboard-group-name">${group}</div>
      <div class="dashboard-group-units">${completed} / ${required} units</div>
      <div class="progress-bar"><div class="progress-bar-fill" style="width:${groupPct}%; background: var(--color-${GROUP_SLUG[group]})"></div></div>
    `;
    els.dashboardGroups.appendChild(card);
  });

  els.dashboardNongwaList.innerHTML = '';
  nonGwa.forEach((item) => {
    const pctItem = Math.min(100, Math.round((item.completed / item.units) * 100));
    const div = document.createElement('div');
    div.className = 'dashboard-nongwa-item';
    div.innerHTML = `
      <div class="dashboard-group-name">${item.code}</div>
      <div class="dashboard-group-units">${item.completed} / ${item.units} units</div>
      <div class="progress-bar"><div class="progress-bar-fill" style="width:${pctItem}%"></div></div>
    `;
    els.dashboardNongwaList.appendChild(div);
  });
}

/* ---------- Elective pool limits ---------- */

/** Units in a pool that are counted as "claimed" — anything not left blank. */
function poolClaimedUnits(poolKey) {
  return courses
    .filter((c) => c.poolKey === poolKey && c.status)
    .reduce((sum, c) => sum + c.units, 0);
}

/**
 * Returns a warning string if `course`'s current status pushes its elective
 * pool past the cap, or null when the selection is still valid.
 */
function poolOverflowMessage(course) {
  if (!course.poolKey || !course.status) return null;
  const cap = POOL_CAPS[course.poolKey];
  const claimed = poolClaimedUnits(course.poolKey);
  if (claimed <= cap) return null;
  return `${course.category} allows only ${cap} units (${cap / 3} courses). `
    + `Clear another course in this group first.`;
}

/* ---------- Category filter options (derived from data, in curriculum order) ---------- */

function populateCategoryFilter() {
  const seen = new Set();
  courses.forEach((c) => {
    if (!seen.has(c.category)) {
      seen.add(c.category);
      const opt = document.createElement('option');
      opt.value = c.category;
      opt.textContent = c.category;
      els.categoryFilter.appendChild(opt);
    }
  });
}

/* ---------- Rendering: course list ---------- */

function renderCourseList() {
  const categoryValue = els.categoryFilter.value;
  const statusValue = els.statusFilter.value;

  const filtered = courses.filter((c) => {
    if (categoryValue !== 'all' && c.category !== categoryValue) return false;
    if (statusValue === 'none' && c.status) return false;
    if (statusValue !== 'all' && statusValue !== 'none' && c.status !== statusValue) return false;
    return true;
  });

  els.courseList.innerHTML = '';

  let lastCategory = null;
  filtered.forEach((course) => {
    if (course.category !== lastCategory) {
      els.courseList.appendChild(buildCategoryHeading(course.category));
      lastCategory = course.category;
    }
    els.courseList.appendChild(buildCourseRow(course));
  });
}

function buildCategoryHeading(category) {
  const heading = document.createElement('div');
  heading.className = 'course-category-heading';

  const name = document.createElement('span');
  name.textContent = category;
  heading.appendChild(name);

  const req = CATEGORY_REQUIREMENTS[category];
  if (req) {
    const claimed = courses.filter((c) => c.category === category && c.status).length;
    const detail = document.createElement('span');
    detail.className = 'course-category-req';
    // A category may carry a note instead of a unit requirement (Mandated),
    // in which case the note replaces the "N units required" segment.
    const parts = [`${claimed}/${req.courses} courses`];
    if (req.units) parts.push(`${req.units} units required`);
    if (req.note) parts.push(req.note);
    detail.textContent = parts.join(' · ');
    heading.appendChild(detail);
  }

  return heading;
}

function buildCourseRow(course) {
  const row = document.createElement('div');
  row.className = 'course-row';
  row.style.setProperty('--group-color', `var(--color-${GROUP_SLUG[course.group]})`);

  const main = document.createElement('div');
  main.className = 'course-row-main';

  const codeLine = document.createElement('div');
  const codeSpan = document.createElement('span');
  codeSpan.className = 'course-code';
  codeSpan.textContent = course.code;
  codeLine.appendChild(codeSpan);

  const titleLine = document.createElement('div');
  titleLine.className = 'course-title';
  titleLine.textContent = course.title;

  main.append(codeLine, titleLine);

  if (course.note) {
    const noteLine = document.createElement('div');
    noteLine.className = 'course-note';
    noteLine.textContent = course.note;
    main.appendChild(noteLine);
  }

  const units = document.createElement('div');
  units.className = 'course-units';
  units.innerHTML = `${course.units}u${course.unverifiedUnits ? ' <span class="unverified-flag" title="Unit count not published; assumed">(unverified)</span>' : ''}`;

  const statusSelect = document.createElement('select');
  ['', 'planned', 'in-progress', 'completed'].forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = STATUS_LABELS[s];
    if (s === course.status) opt.selected = true;
    statusSelect.appendChild(opt);
  });
  statusSelect.className = `status-${course.status || 'none'}`;
  statusSelect.addEventListener('change', () => {
    const previous = course.status;
    course.status = statusSelect.value;

    // Elective pools allow only a fixed number of units toward the degree,
    // so refuse a change that would push the pool past its cap.
    const overflow = poolOverflowMessage(course);
    if (overflow) {
      alert(overflow);
      course.status = previous;
      statusSelect.value = previous;
    }

    statusSelect.className = `status-${course.status || 'none'}`;
    saveCourses();
    renderDashboard();
    renderCourseList();
  });

  const termInput = document.createElement('input');
  termInput.type = 'text';
  termInput.placeholder = 'e.g. 2027 Term 1';
  termInput.value = course.term;
  termInput.addEventListener('change', () => {
    course.term = termInput.value.trim();
    saveCourses();
  });

  row.append(main, units, statusSelect, termInput);
  return row;
}

[els.categoryFilter, els.statusFilter].forEach((el) => el.addEventListener('change', renderCourseList));

/* ---------- CSV export ---------- */

els.exportCsvBtn.addEventListener('click', () => {
  const headers = ['Course Code', 'Title', 'Category', 'Units', 'Status', 'Term'];
  const rows = courses.map((c) => [c.code, c.title, c.category, c.units, STATUS_LABELS[c.status], c.term]);
  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
  downloadBlob(new Blob([csv], { type: 'text/csv' }), `bams-plan-of-study-${todayISO()}.csv`);
});

function csvEscape(value) {
  const str = String(value ?? '');
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/* ---------- PDF export (browser print → "Save as PDF") ---------- */

els.exportPdfBtn.addEventListener('click', () => {
  const { totalCompleted } = computeDashboard();
  els.printHeader.innerHTML = `
    <h1>BAMS Plan of Study</h1>
    <p>${totalCompleted} / ${TOTAL_UNITS_REQUIRED} units completed — generated ${new Date().toLocaleDateString()}</p>
  `;
  window.print();
});

/* ---------- Helpers ---------- */

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------- Init ---------- */

populateCategoryFilter();
renderDashboard();
renderCourseList();
