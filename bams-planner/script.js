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

const GROUP_BY_KEY = 'bamsPlanner.groupBy';

let courses = loadCourses();
// 'category' (curriculum order) or 'term' (the plan as it is scheduled).
let groupBy = localStorage.getItem(GROUP_BY_KEY) === 'term' ? 'term' : 'category';

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
  groupBtns: document.querySelectorAll('.group-btn'),
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

/* ---------- Prerequisites ----------
   Formal prerequisites come from the FICS course pages. Where the official
   curriculum flowchart (bams.mcco.ph, Curriculum 1.2.0) shows an ordering
   that FICS does not formally require, it is carried as `sequenceAfter` and
   shown as a suggestion — so it informs the plan without wrongly implying a
   course is closed to you. */

/** Course codes marked completed, for prerequisite checks. */
function completedCodes() {
  return new Set(courses.filter((c) => c.status === 'completed').map((c) => c.code));
}

/** All units earned, PE and NSTP included — "units earned" on a transcript
    counts everything, even what is excluded from the 142 toward the degree. */
function unitsEarned() {
  return courses.filter((c) => c.status === 'completed').reduce((sum, c) => sum + c.units, 0);
}

/**
 * Works out whether a course's prerequisites are satisfied.
 * Returns the missing pieces so the row can say what is actually outstanding.
 */
function prereqStatus(course) {
  const done = completedCodes();
  const missingCourses = (course.prereqs || []).filter((code) => !done.has(code));
  const earned = unitsEarned();
  const unitsShort = course.prereqUnits ? Math.max(0, course.prereqUnits - earned) : 0;
  const pendingSequence = (course.sequenceAfter || []).filter((code) => !done.has(code));

  return {
    missingCourses,
    unitsShort,
    earned,
    pendingSequence,
    // A free-text note (e.g. "Senior standing") cannot be checked mechanically,
    // so it never counts against met.
    met: missingCourses.length === 0 && unitsShort === 0,
  };
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

  if (groupBy === 'term') {
    renderByTerm(filtered);
    return;
  }

  let lastCategory = null;
  filtered.forEach((course) => {
    if (course.category !== lastCategory) {
      els.courseList.appendChild(buildCategoryHeading(course.category));
      lastCategory = course.category;
    }
    els.courseList.appendChild(buildCourseRow(course));
  });
}

/* ---------- Grouping by term ----------
   Terms are free text ("2027 Term 1"), so they are grouped by exact label and
   ordered naturally — digit runs compare as numbers, which keeps
   "2026 Term 2" before "2027 Term 1" instead of sorting as plain strings. */

/** Natural-order comparison so embedded numbers sort numerically. */
function compareNatural(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function renderByTerm(list) {
  const byTerm = new Map();
  list.forEach((course) => {
    const key = course.term.trim() || '';
    if (!byTerm.has(key)) byTerm.set(key, []);
    byTerm.get(key).push(course);
  });

  // Unassigned courses sort last: they are the backlog, not part of the plan.
  const terms = [...byTerm.keys()].sort((a, b) => {
    if (a === '') return 1;
    if (b === '') return -1;
    return compareNatural(a, b);
  });

  if (terms.length === 0) return;

  terms.forEach((term) => {
    const group = byTerm.get(term);
    const units = group.reduce((sum, c) => sum + c.units, 0);
    els.courseList.appendChild(buildTermHeading(term, group.length, units));
    group.forEach((course) => els.courseList.appendChild(buildCourseRow(course)));
  });
}

function buildTermHeading(term, count, units) {
  const heading = document.createElement('div');
  heading.className = 'course-category-heading';

  const name = document.createElement('span');
  name.textContent = term || 'No term assigned';
  heading.appendChild(name);

  const detail = document.createElement('span');
  detail.className = 'course-category-req';
  detail.textContent = `${count} course${count === 1 ? '' : 's'} · ${units} units`;
  heading.appendChild(detail);

  return heading;
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

/**
 * The prerequisite line under a course title. It flags unmet requirements
 * as a hint rather than a lock: the planner does not know about consent of
 * instructor, credited courses or anything else the student may have.
 */
function buildPrereqLine(course) {
  const hasAny = (course.prereqs || []).length || course.prereqUnits
    || course.prereqNote || (course.sequenceAfter || []).length;
  if (!hasAny) return null;

  const status = prereqStatus(course);
  const line = document.createElement('div');
  line.className = 'course-prereq';

  const parts = [];
  if ((course.prereqs || []).length) parts.push(course.prereqs.join(' + '));
  if (course.prereqUnits) parts.push(`${course.prereqUnits} units earned`);
  if (course.prereqNote) parts.push(course.prereqNote);

  if (parts.length) {
    const label = document.createElement('span');
    label.textContent = `Prereq: ${parts.join(' · ')}`;
    line.appendChild(label);
  }

  // The flowchart's ordering, where it goes beyond what FICS formally requires.
  if ((course.sequenceAfter || []).length) {
    const seq = document.createElement('span');
    seq.className = 'course-prereq-seq';
    seq.textContent = `Suggested after ${course.sequenceAfter.join(' + ')}`;
    line.appendChild(seq);
  }

  // Only worth flagging while the course is still ahead of you.
  const worthFlagging = course.status !== 'completed' && course.status !== 'in-progress';
  if (worthFlagging && !status.met) {
    line.classList.add('is-unmet');
    const gaps = [];
    if (status.missingCourses.length) gaps.push(`needs ${status.missingCourses.join(' + ')}`);
    if (status.unitsShort) gaps.push(`${status.unitsShort} more units (${status.earned} earned)`);
    const flag = document.createElement('span');
    flag.className = 'course-prereq-flag';
    flag.textContent = `Not yet met — ${gaps.join(', ')}`;
    line.appendChild(flag);
  }

  return line;
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

  const prereqLine = buildPrereqLine(course);
  if (prereqLine) main.appendChild(prereqLine);

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
    // In term view the term is what the grouping is built from, so editing it
    // has to rebuild the list rather than leave the row under its old heading.
    if (groupBy === 'term') renderCourseList();
  });

  row.append(main, units, statusSelect, termInput);
  return row;
}

[els.categoryFilter, els.statusFilter].forEach((el) => el.addEventListener('change', renderCourseList));

els.groupBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    groupBy = btn.dataset.groupBy;
    localStorage.setItem(GROUP_BY_KEY, groupBy);
    syncGroupButtons();
    renderCourseList();
  });
});

function syncGroupButtons() {
  els.groupBtns.forEach((btn) => {
    const active = btn.dataset.groupBy === groupBy;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
}

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
syncGroupButtons();
renderDashboard();
renderCourseList();
