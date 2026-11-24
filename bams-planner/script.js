/* ==========================================================================
   BAMS Planner — application logic
   No frameworks, no build step. Curriculum seed lives in courses.js;
   this file handles persistence, dashboard math, and rendering.
   ========================================================================== */

const STORAGE_KEY = 'bamsPlanner.courses';

/* View preferences are kept apart from the plan itself: they describe how you
   are looking at it, not what it contains, so a corrupted or cleared view
   preference must never be able to take the plan down with it. */
const VIEW_KEY = 'bamsPlanner.view';

const GROUP_ORDER = ['GE', 'Common', 'Mandated', 'Major', 'Production', 'Capstone'];
const GROUP_SLUG = {
  GE: 'ge', Common: 'common', Mandated: 'mandated',
  Major: 'major', Production: 'production', Capstone: 'capstone',
};
const STATUS_LABELS = { '': '—', planned: 'Planned', 'in-progress': 'In progress', completed: 'Completed' };

/* ---------- Terms ----------
   Terms are picked from a fixed list rather than typed, so they can be
   ordered — which is what makes "this prerequisite is in an earlier term"
   a question the planner can actually answer.

   The list always opens at Term 1 of the current calendar year regardless of
   the month, since a plan is written forward from the start of a year. */

const TERMS_PER_YEAR = 3;   // UPOU runs trimesters
const TERM_YEARS = 6;       // 4-year program plus headroom for a slower pace

const TERM_OPTIONS = (() => {
  const startYear = new Date().getFullYear();
  const out = [];
  for (let y = 0; y < TERM_YEARS; y++) {
    for (let t = 1; t <= TERMS_PER_YEAR; t++) out.push(`${startYear + y} Term ${t}`);
  }
  return out;
})();

/** Position of a term in the sequence; -1 when unset or not recognised. */
function termIndex(term) {
  return TERM_OPTIONS.indexOf(term);
}

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

/* Warn once per page load: with storage full every later change would alert. */
let storageWarned = false;

function saveCourses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch (err) {
    // The quota is shared by every app on this domain, so a large Reading
    // Notebook can be what stops the plan saving.
    console.error('Failed to save courses to localStorage', err);
    if (!storageWarned) {
      storageWarned = true;
      alert('Could not save your plan — your browser storage is full.\n\nUse Export CSV or Export PDF to keep a copy before making more changes.');
    }
  }
}

/* Every field is re-derived rather than trusted, so a hand-edited or
   half-written value degrades to the default view instead of throwing
   somewhere in the middle of a render. */
function loadViewPrefs() {
  const fallback = { hideCompleted: false, collapsed: [] };
  try {
    const raw = localStorage.getItem(VIEW_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw);
    return {
      hideCompleted: saved.hideCompleted === true,
      collapsed: Array.isArray(saved.collapsed)
        ? saved.collapsed.filter((c) => typeof c === 'string')
        : [],
    };
  } catch (err) {
    console.error('Failed to load view preferences from localStorage', err);
    return fallback;
  }
}

function saveViewPrefs() {
  // Which sections are collapsed is a view, not the user's work: if it cannot
  // be stored the view still holds for this visit. Never interrupt for it,
  // and never let it be the thing that fails a course change.
  try {
    localStorage.setItem(VIEW_KEY, JSON.stringify(viewPrefs));
  } catch (err) {
    console.error('Failed to save view preferences to localStorage', err);
  }
}

let viewPrefs = loadViewPrefs();

/* ---------- DOM references ---------- */

const els = {
  dashboardGroups: document.getElementById('dashboard-groups'),
  dashboardTotalText: document.getElementById('dashboard-total-text'),
  dashboardTotalPct: document.getElementById('dashboard-total-pct'),
  dashboardTotalBar: document.getElementById('dashboard-total-bar'),
  dashboardNongwaList: document.getElementById('dashboard-nongwa-list'),

  backupReminder: document.getElementById('backup-reminder'),
  termSummary: document.getElementById('term-summary'),
  termSummaryList: document.getElementById('term-summary-list'),

  categoryFilter: document.getElementById('category-filter'),
  hideCompleted: document.getElementById('hide-completed'),
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

    // A category with nothing in it yet shouldn't shout as loudly as one in
    // progress: the empty track is dimmed rather than drawn at full strength.
    card.innerHTML = `
      <div class="dashboard-group-name">${group}</div>
      <div class="dashboard-group-units">${completed} / ${required} units</div>
      <div class="progress-bar${completed === 0 ? ' is-empty' : ''}"><div class="progress-bar-fill" style="width:${groupPct}%; background: var(--color-${GROUP_SLUG[group]})"></div></div>
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
      <div class="progress-bar${item.completed === 0 ? ' is-empty' : ''}"><div class="progress-bar-fill" style="width:${pctItem}%"></div></div>
    `;
    els.dashboardNongwaList.appendChild(div);
  });
}

/* ---------- Rendering: term load summary ----------
   A compact read of how heavy each term is, so an overloaded term is visible
   without scrolling the whole list. Only terms with something in them appear;
   an empty plan hides the panel entirely rather than showing 18 blank rows. */

/* The plan lives only in this browser, and there is no JSON backup to
   restore from — so once there is anything worth losing, say so. */
function renderBackupReminder() {
  const hasPlan = courses.some((c) => c.status || c.term);
  els.backupReminder.hidden = !hasPlan;
}

function renderTermSummary() {
  const load = new Map();
  courses.forEach((course) => {
    if (!course.term || !course.status) return; // untagged courses are not part of the plan
    const entry = load.get(course.term) || { units: 0, count: 0 };
    entry.units += course.units;
    entry.count += 1;
    load.set(course.term, entry);
  });

  els.termSummary.hidden = load.size === 0;
  els.termSummaryList.innerHTML = '';
  if (load.size === 0) return;

  [...load.keys()]
    .sort((a, b) => {
      const ai = termIndex(a); const bi = termIndex(b);
      // Terms outside the generated list (older saved data) sort last.
      if (ai === -1 || bi === -1) return ai === bi ? a.localeCompare(b) : (ai === -1 ? 1 : -1);
      return ai - bi;
    })
    .forEach((term) => {
      const { units, count } = load.get(term);
      const item = document.createElement('div');
      item.className = 'term-summary-item';
      item.innerHTML = `
        <span class="term-summary-name">${term}</span>
        <span class="term-summary-units">${units} units</span>
        <span class="term-summary-count">${count} course${count === 1 ? '' : 's'}</span>
      `;
      els.termSummaryList.appendChild(item);
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

/**
 * Why a course cannot be planned yet, as a list of plain-English reasons.
 * Empty means it is fine to plan.
 *
 * A prerequisite counts as satisfied when it is already passed, or when it is
 * planned / in progress in a strictly earlier term — you cannot sit a course
 * and its prerequisite in the same term.
 */
function planBlockers(course) {
  const prereqs = course.prereqs || [];
  if (prereqs.length === 0) return [];

  const myIndex = termIndex(course.term);
  if (myIndex === -1) {
    return [`Pick a term for ${course.code} first, so its prerequisites can be checked against it.`];
  }

  const reasons = [];
  prereqs.forEach((code) => {
    const pre = courses.find((c) => c.code === code);
    if (!pre) return;

    if (pre.status === 'completed') return; // already passed, term is irrelevant

    if (pre.status !== 'planned' && pre.status !== 'in-progress') {
      reasons.push(`${code} is not yet passed or planned.`);
      return;
    }

    const preIndex = termIndex(pre.term);
    if (preIndex === -1) {
      reasons.push(`${code} has no term set, so it cannot be shown to come first.`);
    } else if (preIndex >= myIndex) {
      reasons.push(`${code} is in ${pre.term}, which is not before ${course.term}.`);
    }
  });

  return reasons;
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
    // Asking for completed courses explicitly beats the blanket hide, so the
    // toggle can never leave you staring at an empty list you just filtered to.
    if (viewPrefs.hideCompleted && c.status === 'completed' && statusValue !== 'completed') return false;
    return true;
  });

  els.courseList.innerHTML = '';

  renderByTerm(filtered);
}

/* ---------- Grouping by term ----------
   Courses are grouped under the term they are assigned to. Everything starts
   under "No term assigned", which is the pool the student plans out of, and
   it sorts last so the scheduled terms read top-down in order. */

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

    // A scheduled term is a short, deliberate list, so it reads better flat.
    // The unassigned pool is everything still to be placed — without the
    // category breakdown it is one long wall of courses to scroll through.
    if (term === '') {
      renderByCategory(group);
    } else {
      group.forEach((course) => els.courseList.appendChild(buildCourseRow(course)));
    }
  });
}

/* ---------- Grouping by category (inside the unassigned pool) ---------- */

/** Curriculum order, read off the data itself so this and the category
    filter can never drift apart. */
function categoryOrder() {
  const order = [];
  courses.forEach((c) => {
    if (!order.includes(c.category)) order.push(c.category);
  });
  return order;
}

function renderByCategory(list) {
  const byCategory = new Map();
  list.forEach((course) => {
    if (!byCategory.has(course.category)) byCategory.set(course.category, []);
    byCategory.get(course.category).push(course);
  });

  const order = categoryOrder();
  const rank = (cat) => {
    const i = order.indexOf(cat);
    // An unknown category sorts last rather than first, so a typo in the data
    // shows up at the bottom instead of displacing GE Core.
    return i === -1 ? order.length : i;
  };

  [...byCategory.keys()]
    .sort((a, b) => rank(a) - rank(b))
    .forEach((category) => {
      // <details> rather than a hand-rolled toggle: the open/closed state,
      // keyboard access and screen-reader semantics all come for free.
      const section = document.createElement('details');
      section.className = 'course-category';
      section.open = !viewPrefs.collapsed.includes(category);

      section.appendChild(buildCategoryHeading(category));

      const body = document.createElement('div');
      body.className = 'course-category-body';
      byCategory.get(category).forEach((course) => body.appendChild(buildCourseRow(course)));
      section.appendChild(body);

      section.addEventListener('toggle', () => {
        // `toggle` fires asynchronously, so events queued against a section
        // the list has since rebuilt — including the ones the print pass
        // provokes by forcing every section open — arrive after that section
        // is detached. Acting on them would overwrite the real state with a
        // snapshot of a list that no longer exists.
        if (!section.isConnected) return;

        const collapsed = new Set(viewPrefs.collapsed);
        if (section.open) collapsed.delete(category);
        else collapsed.add(category);

        // Re-rendering re-opens every expanded section, so most of these
        // events change nothing; only write when the set actually moved.
        const next = [...collapsed];
        if (next.length === viewPrefs.collapsed.length
            && next.every((c) => viewPrefs.collapsed.includes(c))) return;

        viewPrefs.collapsed = next;
        saveViewPrefs();
      });

      els.courseList.appendChild(section);
    });
}

function buildCategoryHeading(category) {
  const heading = document.createElement('summary');
  heading.className = 'course-category-heading course-category-heading-sub';

  const name = document.createElement('span');
  name.textContent = category;
  heading.appendChild(name);

  const req = CATEGORY_REQUIREMENTS[category];
  if (req) {
    // Counted across the whole plan, not just the rows showing: the heading
    // answers "how much of this category have I dealt with?", which a filter
    // should narrow the view of without changing the answer.
    const claimed = courses.filter((c) => c.category === category && c.status).length;

    const detail = document.createElement('span');
    detail.className = 'course-category-req';
    // Mandated carries a note instead of a unit requirement, since PE and
    // NSTP sit outside the 142 units.
    const parts = [`${claimed}/${req.courses} courses`];
    if (req.units) parts.push(`${req.units} units required`);
    if (req.note) parts.push(req.note);
    detail.textContent = parts.join(' · ');
    heading.appendChild(detail);
  }

  return heading;
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

  // Only flag courses you have not committed to yet. Planning is already
  // gated on prerequisites (see planBlockers), so a planned course has passed
  // that check — flagging it here would contradict what the app just allowed.
  const worthFlagging = !course.status;
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
  // The row carries its own status so the whole card can respond, not just
  // the dropdown — a completed course should *look* dealt with.
  row.className = `course-row is-${course.status || 'none'}`;
  row.style.setProperty('--group-color', `var(--color-${GROUP_SLUG[course.group]})`);

  const main = document.createElement('div');
  main.className = 'course-row-main';

  const codeLine = document.createElement('div');
  codeLine.className = 'course-code-line';
  const codeSpan = document.createElement('span');
  codeSpan.className = 'course-code';
  codeSpan.textContent = course.code;
  codeLine.appendChild(codeSpan);

  // Units sit with the code rather than out in the middle of the row: they
  // are part of what the course *is*, not a separate column to scan.
  const units = document.createElement('span');
  units.className = 'course-units';
  units.textContent = `${course.units}u`;
  codeLine.appendChild(units);
  if (course.unverifiedUnits) {
    const flag = document.createElement('span');
    flag.className = 'unverified-flag';
    flag.title = 'Unit count not published; assumed';
    flag.textContent = '(unverified)';
    codeLine.appendChild(flag);
  }

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
    // Planning a course means committing to a term, so its prerequisites must
    // already sit in an earlier one. Only 'Planned' is gated: recording a
    // course as passed or in progress is history, which the planner accepts
    // as given (credited courses, consent of instructor, and so on).
    const blockers = course.status === 'planned' ? planBlockers(course) : [];

    if (overflow || blockers.length) {
      alert(overflow || `Cannot plan ${course.code} yet:\n\n· ${blockers.join('\n· ')}`);
      course.status = previous;
      statusSelect.value = previous;
    }

    statusSelect.className = `status-${course.status || 'none'}`;
    row.className = `course-row is-${course.status || 'none'}`;
    saveCourses();
    renderDashboard();
    renderTermSummary();
    renderBackupReminder();
    renderCourseList();
  });

  const termInput = document.createElement('select');
  termInput.className = 'course-term';
  const termChoices = ['', ...TERM_OPTIONS];
  // Keep any saved term that predates this list so existing plans survive.
  if (course.term && !termChoices.includes(course.term)) termChoices.push(course.term);
  termChoices.forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t || 'No term';
    if (t === course.term) opt.selected = true;
    termInput.appendChild(opt);
  });

  termInput.addEventListener('change', () => {
    const previous = course.term;
    course.term = termInput.value;

    // Moving a planned course can break the ordering its prerequisites rely on.
    const blockers = course.status === 'planned' ? planBlockers(course) : [];
    if (blockers.length) {
      alert(`Cannot move ${course.code} to ${course.term || 'no term'}:\n\n· ${blockers.join('\n· ')}`);
      course.term = previous;
      termInput.value = previous;
    }

    saveCourses();
    // The term drives the grouping, so the list has to be rebuilt rather than
    // leave the row sitting under its old heading.
    renderCourseList();
  });

  row.append(main, statusSelect, termInput);
  return row;
}

[els.categoryFilter, els.statusFilter].forEach((el) => el.addEventListener('change', renderCourseList));

els.hideCompleted.checked = viewPrefs.hideCompleted;
els.hideCompleted.addEventListener('change', () => {
  viewPrefs.hideCompleted = els.hideCompleted.checked;
  saveViewPrefs();
  renderCourseList();
});


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

/* Printing renders the DOM as it stands, but filters, "Hide completed" and a
   collapsed category all remove courses from it. A Plan of Study that quietly
   omits half the degree is worse than no export, so the full list is restored
   for the duration of the print and the student's view is put back after. */

function withFullListForPrint(print) {
  const saved = {
    category: els.categoryFilter.value,
    status: els.statusFilter.value,
    hideCompleted: viewPrefs.hideCompleted,
  };

  els.categoryFilter.value = 'all';
  els.statusFilter.value = 'all';
  viewPrefs.hideCompleted = false;
  renderCourseList();
  // Opened after the render, since renderCourseList rebuilds each section
  // from the saved collapsed list.
  document.querySelectorAll('details.course-category').forEach((d) => { d.open = true; });

  try {
    print();
  } finally {
    els.categoryFilter.value = saved.category;
    els.statusFilter.value = saved.status;
    viewPrefs.hideCompleted = saved.hideCompleted;
    // Rebuilds the list from the saved preferences, which also detaches the
    // forced-open sections so their pending toggle events are ignored.
    renderCourseList();
  }
}

els.exportPdfBtn.addEventListener('click', () => {
  const { totalCompleted } = computeDashboard();
  els.printHeader.innerHTML = `
    <h1>BAMS Plan of Study</h1>
    <p>${totalCompleted} / ${TOTAL_UNITS_REQUIRED} units completed — generated ${new Date().toLocaleDateString()}</p>
  `;
  withFullListForPrint(() => window.print());
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
renderTermSummary();
renderBackupReminder();
renderCourseList();
