/* ==========================================================================
   Study Tracker — application logic
   No frameworks, no build step. All data lives in localStorage.
   ========================================================================== */

const STORAGE_KEY = 'studyTracker.tasks';
const WEEK_START_KEY = 'studyTracker.weekStartsMonday';
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS = {
  NOT_STARTED: 'not-started',
  PLANNING: 'planning',
  WRITING: 'writing',
  PROOFREAD: 'proofread',
  CITATIONS: 'citations',
  ONGOING: 'ongoing',
  DONE: 'done',
  SUBMITTED: 'submitted',
};

const STATUS_LABELS = {
  [STATUS.NOT_STARTED]: 'Not started',
  [STATUS.PLANNING]: 'Planning',
  [STATUS.WRITING]: 'Writing',
  [STATUS.PROOFREAD]: 'Proofread',
  [STATUS.CITATIONS]: 'Adding citations',
  [STATUS.ONGOING]: 'Ongoing',
  [STATUS.DONE]: 'Done',
  [STATUS.SUBMITTED]: 'Submitted',
};

const PRIORITY_LABELS = { high: 'High', medium: 'Medium', low: 'Low' };

/* ---------- State ---------- */

let tasks = loadTasks();
let currentView = 'calendar';       // 'calendar' | 'list'
let calendarCursor = new Date();    // month currently shown in calendar
calendarCursor.setDate(1);
let weekStartsMonday = localStorage.getItem(WEEK_START_KEY) === 'true';

/* ---------- Persistence ---------- */

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load tasks from localStorage', err);
    return [];
  }
}

/* Warn once per page load: with storage full every later click would save,
   fail, and alert again. */
let storageWarned = false;

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    // The quota is shared by every app on this domain, so a large Reading
    // Notebook can be what stops the tracker saving.
    console.error('Failed to save tasks to localStorage', err);
    if (!storageWarned) {
      storageWarned = true;
      alert('Could not save — your browser storage is full.\n\nExport your tasks to a calendar file before making more changes, or clear space by deleting old notes in the other apps.');
    }
  }
}

function generateId() {
  return 'task-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

/* ---------- DOM references ---------- */

const els = {
  toggleBtns: document.querySelectorAll('.toggle-btn'),
  calendarView: document.getElementById('calendar-view'),
  listView: document.getElementById('list-view'),

  addTaskBtn: document.getElementById('add-task-btn'),

  searchInput: document.getElementById('search-input'),
  statusFilter: document.getElementById('status-filter'),
  weekFilter: document.getElementById('week-filter'),
  sortSelect: document.getElementById('sort-select'),

  calendarGrid: document.getElementById('calendar-grid'),
  calendarWeekdays: document.getElementById('calendar-weekdays'),
  calendarMonthLabel: document.getElementById('calendar-month-label'),
  prevMonthBtn: document.getElementById('prev-month-btn'),
  nextMonthBtn: document.getElementById('next-month-btn'),
  todayBtn: document.getElementById('today-btn'),
  weekStartToggle: document.getElementById('week-start-toggle'),

  taskList: document.getElementById('task-list'),
  listEmptyMsg: document.getElementById('list-empty-msg'),

  taskModal: document.getElementById('task-modal'),
  taskForm: document.getElementById('task-form'),
  taskModalTitle: document.getElementById('task-modal-title'),
  taskId: document.getElementById('task-id'),
  taskName: document.getElementById('task-name'),
  taskCourse: document.getElementById('task-course'),
  taskType: document.getElementById('task-type'),
  taskDueDate: document.getElementById('task-due-date'),
  taskDueTime: document.getElementById('task-due-time'),
  taskStatus: document.getElementById('task-status'),
  taskPriority: document.getElementById('task-priority'),
  taskNotes: document.getElementById('task-notes'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),

  dayModal: document.getElementById('day-modal'),
  dayModalTitle: document.getElementById('day-modal-title'),
  dayModalList: document.getElementById('day-modal-list'),
  dayModalAddBtn: document.getElementById('day-modal-add-btn'),

  exportIcsBtn: document.getElementById('export-ics-btn'),
  importIcsBtn: document.getElementById('import-ics-btn'),
  importIcsInput: document.getElementById('import-ics-input'),
};

let dayModalDate = null; // ISO date string currently shown in the day modal

/* ---------- Date helpers ---------- */

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfWeek(date) {
  const d = new Date(date);
  const offset = weekStartsMonday ? (d.getDay() + 6) % 7 : d.getDay();
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date) {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

/* ---------- View switching ---------- */

els.toggleBtns.forEach((btn) => {
  btn.addEventListener('click', () => setView(btn.dataset.view));
});

function setView(view) {
  currentView = view;
  els.toggleBtns.forEach((btn) => {
    const active = btn.dataset.view === view;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  els.calendarView.hidden = view !== 'calendar';
  els.listView.hidden = view !== 'list';
  render();
}

/* ---------- Filtering / sorting (shared by both views) ---------- */

/** Search + status test, shared so the calendar and list stay in agreement. */
function matchesSearchAndStatus(task) {
  const query = els.searchInput.value.trim().toLowerCase();
  if (query) {
    const haystack = `${task.name} ${task.course} ${task.taskType || ''}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  const statusValue = els.statusFilter.value;
  if (statusValue !== 'all' && task.status !== statusValue) return false;
  return true;
}

function getFilteredSortedTasks() {
  const weekOnly = els.weekFilter.checked;
  const sortBy = els.sortSelect.value;

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  let result = tasks.filter((t) => {
    if (!matchesSearchAndStatus(t)) return false;
    if (weekOnly) {
      const due = new Date(t.dueDate + 'T00:00:00');
      if (due < weekStart || due > weekEnd) return false;
    }
    return true;
  });

  result.sort((a, b) => {
    if (sortBy === 'course') {
      return a.course.localeCompare(b.course) || compareByDeadline(a, b);
    }
    return compareByDeadline(a, b);
  });

  return result;
}

[els.searchInput, els.statusFilter, els.weekFilter, els.sortSelect].forEach((el) => {
  el.addEventListener('input', render);
  el.addEventListener('change', render);
});

// Ticking "This week" should land on the current week, not on whatever month
// was being browsed. Runs before the shared change listener re-renders.
els.weekFilter.addEventListener('change', () => {
  if (els.weekFilter.checked) calendarCursor = new Date();
}, true);

/** Orders by due date, then by time of day. Untimed tasks sort before timed
    ones on the same date, since they are not pinned to any hour. */
function compareByDeadline(a, b) {
  return a.dueDate.localeCompare(b.dueDate)
    || (a.dueTime || '').localeCompare(b.dueTime || '');
}

/* ---------- Rendering: List view ---------- */

function renderListView() {
  const filtered = getFilteredSortedTasks();
  els.taskList.innerHTML = '';
  els.listEmptyMsg.hidden = filtered.length !== 0;

  filtered.forEach((task) => {
    els.taskList.appendChild(buildTaskCard(task));
  });
}

function buildTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card' + (task.status === STATUS.SUBMITTED ? ' is-submitted' : '');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-card-check';
  checkbox.checked = task.status === STATUS.SUBMITTED;
  checkbox.title = 'Quick-complete: mark as Submitted';
  checkbox.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSubmitted(task.id);
  });

  const body = document.createElement('div');
  body.className = 'task-card-body';
  body.addEventListener('click', () => openTaskModal(task.id));

  const titleRow = document.createElement('div');
  titleRow.className = 'task-card-title-row';

  const name = document.createElement('span');
  name.className = 'task-card-name';
  name.textContent = task.name;

  const badge = document.createElement('span');
  badge.className = 'status-badge ' + task.status;
  badge.textContent = STATUS_LABELS[task.status];

  titleRow.append(name, badge);

  if (task.priority) {
    const priorityBadge = document.createElement('span');
    priorityBadge.className = 'priority-badge ' + task.priority;
    priorityBadge.textContent = PRIORITY_LABELS[task.priority];
    titleRow.appendChild(priorityBadge);
  }

  const meta = document.createElement('div');
  meta.className = 'task-card-meta';
  const metaParts = [];
  if (task.taskType) metaParts.push(task.taskType);
  if (task.course) metaParts.push(task.course);
  metaParts.push(`Due ${formatDateReadable(task.dueDate)}${task.dueTime ? ` · ${formatTimeReadable(task.dueTime)}` : ''}`);
  meta.textContent = metaParts.join(' · ');

  body.append(titleRow, meta);
  card.append(checkbox, body);
  return card;
}

/** "14:30" -> "2:30 PM" in the viewer's locale. */
function formatTimeReadable(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function formatDateReadable(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function toggleSubmitted(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  if (task.status === STATUS.SUBMITTED) {
    // Restore whatever status the task was in before it was quick-completed.
    task.status = task.previousStatus || STATUS.NOT_STARTED;
    delete task.previousStatus;
  } else {
    task.previousStatus = task.status;
    task.status = STATUS.SUBMITTED;
  }
  saveTasks();
  render();
}

/* ---------- Rendering: Calendar view ---------- */

function renderWeekdayHeader() {
  const labels = weekStartsMonday
    ? [...WEEKDAY_LABELS.slice(1), WEEKDAY_LABELS[0]]
    : WEEKDAY_LABELS;
  els.calendarWeekdays.innerHTML = labels.map((l) => `<span>${l}</span>`).join('');
}

els.weekStartToggle.checked = weekStartsMonday;
renderWeekdayHeader();

els.weekStartToggle.addEventListener('change', () => {
  weekStartsMonday = els.weekStartToggle.checked;
  // A preference, not the user's work: if it cannot be stored the toggle
  // still applies for this visit, so there is nothing worth interrupting for.
  try { localStorage.setItem(WEEK_START_KEY, String(weekStartsMonday)); } catch { /* storage unavailable */ }
  renderWeekdayHeader();
  renderCalendarView();
});

/* "This week" switches the calendar between a month grid and a single-week
   layout with tall day columns that show task names rather than just dots. */
function isWeekView() {
  return els.weekFilter.checked;
}

function renderCalendarView() {
  const todayISO = toISODate(new Date());
  const weekView = isWeekView();

  // The calendar honours search and status like the list does. The week filter
  // is not applied here — in week view the layout itself is the date constraint.
  const tasksByDate = {};
  tasks.filter(matchesSearchAndStatus).forEach((t) => {
    (tasksByDate[t.dueDate] ||= []).push(t);
  });

  els.calendarGrid.classList.toggle('is-week-view', weekView);
  // In week view each cell carries its own weekday label, so the shared header row is redundant.
  els.calendarWeekdays.hidden = weekView;
  els.calendarGrid.innerHTML = '';

  updateCalendarLabel();
  const navNoun = weekView ? 'week' : 'month';
  els.prevMonthBtn.setAttribute('aria-label', `Previous ${navNoun}`);
  els.nextMonthBtn.setAttribute('aria-label', `Next ${navNoun}`);

  if (weekView) {
    renderWeekGrid(tasksByDate, todayISO);
  } else {
    renderMonthGrid(tasksByDate, todayISO);
  }
}

function updateCalendarLabel() {
  if (!isWeekView()) {
    els.calendarMonthLabel.textContent = calendarCursor.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
    return;
  }

  const start = startOfWeek(calendarCursor);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const sameMonth = start.getMonth() === end.getMonth();
  const startText = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endText = end.toLocaleDateString(undefined, sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' });
  els.calendarMonthLabel.textContent = `${startText} – ${endText}, ${end.getFullYear()}`;
}

/** Builds one day cell shared by both layouts. */
function buildDayCell(cellDate, cellISO, todayISO, extraClass) {
  const cell = document.createElement('button');
  cell.type = 'button';
  cell.className = 'calendar-day' + extraClass + (cellISO === todayISO ? ' is-today' : '');
  cell.addEventListener('click', () => openDayModal(cellISO));

  const num = document.createElement('div');
  num.className = 'calendar-day-number';
  // Built from WEEKDAY_LABELS rather than toLocaleDateString so the weekday
  // always leads ("Sun 26"); some locales order the parts the other way.
  num.textContent = isWeekView()
    ? `${WEEKDAY_LABELS[cellDate.getDay()]} ${cellDate.getDate()}`
    : cellDate.getDate();
  cell.appendChild(num);

  return cell;
}

function renderMonthGrid(tasksByDate, todayISO) {
  const month = calendarCursor.getMonth();
  const gridStart = startOfWeek(new Date(calendarCursor.getFullYear(), month, 1));

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + i);
    const cellISO = toISODate(cellDate);

    const cell = buildDayCell(cellDate, cellISO, todayISO, cellDate.getMonth() === month ? '' : ' outside-month');

    const dayTasks = tasksByDate[cellISO] || [];
    if (dayTasks.length) {
      const dots = document.createElement('div');
      dots.className = 'calendar-day-dots';
      dayTasks.slice(0, 6).forEach((t) => {
        const dot = document.createElement('span');
        dot.className = 'status-dot';
        dot.style.background = statusColor(t.status);
        dots.appendChild(dot);
      });
      cell.appendChild(dots);
    }

    els.calendarGrid.appendChild(cell);
  }

  // Keep the 42 cells in six even rows rather than letting them auto-size.
  els.calendarGrid.style.gridTemplateRows = 'repeat(6, minmax(0, 1fr))';
}

function renderWeekGrid(tasksByDate, todayISO) {
  const start = startOfWeek(calendarCursor);
  els.calendarGrid.style.gridTemplateRows = '';

  for (let i = 0; i < 7; i++) {
    const cellDate = new Date(start);
    cellDate.setDate(start.getDate() + i);
    const cellISO = toISODate(cellDate);

    const cell = buildDayCell(cellDate, cellISO, todayISO, ' is-week-cell');

    [...(tasksByDate[cellISO] || [])].sort(compareByDeadline).forEach((t) => {
      const chip = document.createElement('span');
      chip.className = 'week-task-chip ' + t.status;
      if (t.dueTime) {
        const time = document.createElement('span');
        time.className = 'week-task-time';
        time.textContent = formatTimeReadable(t.dueTime);
        chip.append(time, ' ');
      }
      chip.append(t.name);
      cell.appendChild(chip);
    });

    els.calendarGrid.appendChild(cell);
  }
}

function statusColor(status) {
  return `var(--color-${status})`;
}

/** Steps the calendar by one week or one month depending on the active layout. */
function stepCalendar(direction) {
  if (isWeekView()) {
    calendarCursor.setDate(calendarCursor.getDate() + 7 * direction);
  } else {
    // Normalise to the 1st first: stepping from a 29th–31st can otherwise skip a month.
    calendarCursor.setDate(1);
    calendarCursor.setMonth(calendarCursor.getMonth() + direction);
  }
  renderCalendarView();
}

els.prevMonthBtn.addEventListener('click', () => stepCalendar(-1));
els.nextMonthBtn.addEventListener('click', () => stepCalendar(1));

els.todayBtn.addEventListener('click', () => {
  calendarCursor = new Date();
  if (!isWeekView()) calendarCursor.setDate(1);
  renderCalendarView();
});

/* ---------- Day modal (tasks due on a clicked date) ---------- */

function openDayModal(isoDate) {
  dayModalDate = isoDate;
  const d = new Date(isoDate + 'T00:00:00');
  els.dayModalTitle.textContent = d.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const dayTasks = tasks
    .filter((t) => t.dueDate === isoDate)
    .sort((a, b) => compareByDeadline(a, b) || a.name.localeCompare(b.name));

  els.dayModalList.innerHTML = '';
  if (dayTasks.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty-msg';
    p.textContent = 'No tasks due this day.';
    els.dayModalList.appendChild(p);
  } else {
    dayTasks.forEach((t) => els.dayModalList.appendChild(buildTaskCard(t)));
  }

  showModal(els.dayModal);
}

els.dayModalAddBtn.addEventListener('click', () => {
  openTaskModal(null, dayModalDate);
});

/* ---------- Task add/edit modal ---------- */

function openTaskModal(taskId, prefillDate) {
  // Only one modal at a time: the day panel and the task form share a
  // stacking context, so leaving the day panel open would swallow clicks
  // meant for this form (Delete/Save/Cancel).
  hideModal(els.dayModal);

  const task = taskId ? tasks.find((t) => t.id === taskId) : null;

  els.taskModalTitle.textContent = task ? 'Edit Task' : 'Add Task';
  els.taskId.value = task ? task.id : '';
  els.taskName.value = task ? task.name : '';
  els.taskCourse.value = task ? task.course : '';
  els.taskType.value = task ? task.taskType : '';
  els.taskDueDate.value = task ? task.dueDate : (prefillDate || toISODate(new Date()));
  els.taskDueTime.value = task ? (task.dueTime || '') : '';
  els.taskStatus.value = task ? task.status : STATUS.NOT_STARTED;
  els.taskPriority.value = task ? task.priority : '';
  els.taskNotes.value = task ? task.notes : '';
  els.deleteTaskBtn.hidden = !task;

  showModal(els.taskModal);
  els.taskName.focus();
}

els.addTaskBtn.addEventListener('click', () => openTaskModal(null));

els.taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const id = els.taskId.value;
  const data = {
    name: els.taskName.value.trim(),
    course: els.taskCourse.value.trim(),
    taskType: els.taskType.value.trim(),
    dueDate: els.taskDueDate.value,
    dueTime: els.taskDueTime.value, // '' when no time is set

    status: els.taskStatus.value,
    priority: els.taskPriority.value,
    notes: els.taskNotes.value.trim(),
  };
  if (!data.name || !data.dueDate) return;

  if (id) {
    const task = tasks.find((t) => t.id === id);
    Object.assign(task, data);
    // The form is now the authoritative source for status, so drop any
    // stale "restore point" left over from an earlier quick-complete toggle.
    delete task.previousStatus;
  } else {
    tasks.push({ id: generateId(), ...data });
  }

  saveTasks();
  hideModal(els.taskModal);
  render();
});

els.deleteTaskBtn.addEventListener('click', () => {
  const id = els.taskId.value;
  if (!id) return;
  if (!confirm('Delete this task? This cannot be undone.')) return;
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  hideModal(els.taskModal);
  render();
});

/* ---------- Modal show/hide (generic, event-delegated close buttons) ---------- */

function showModal(modalEl) {
  modalEl.hidden = false;
}

function hideModal(modalEl) {
  modalEl.hidden = true;
}

document.querySelectorAll('[data-close-modal]').forEach((btn) => {
  btn.addEventListener('click', () => {
    hideModal(document.getElementById(btn.dataset.closeModal));
  });
});

document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideModal(overlay);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      if (!overlay.hidden) hideModal(overlay);
    });
  }
});

/* ---------- Calendar export (.ics) ----------
   Produces an RFC 5545 iCalendar file that imports into Google Calendar,
   Apple Calendar, Outlook, etc. Each task becomes an all-day event on its
   due date. Calendar apps are strict about this format, so the CRLF line
   endings, 75-octet line folding and text escaping below are all required —
   getting any of them wrong makes the file fail to import. */

/** Escapes a text value per RFC 5545 §3.3.11. */
function icsEscapeText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Folds a content line to 75 octets; continuation lines begin with a space. */
function icsFoldLine(line) {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const pieces = [];
  let current = '';
  let currentBytes = 0;
  // Iterate by code point so multi-byte characters are never split in half.
  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    const limit = pieces.length === 0 ? 75 : 74; // continuation lines lose one octet to the leading space
    if (currentBytes + charBytes > limit) {
      pieces.push(current);
      current = char;
      currentBytes = charBytes;
    } else {
      current += char;
      currentBytes += charBytes;
    }
  }
  if (current) pieces.push(current);
  return pieces.join('\r\n ');
}

/** "2026-08-05" -> "20260805", offset in whole days. */
function icsDate(isoDate, dayOffset = 0) {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + dayOffset);
  return toISODate(d).replace(/-/g, '');
}

/** Local ("floating") date-time: 2026-08-05 + 14:30 -> 20260805T143000.
    Deliberately timezone-free — a personal deadline means that wall-clock
    time wherever the calendar is opened, with no conversion surprises. */
function icsDateTime(isoDate, hhmm, addMinutes = 0) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(isoDate + 'T00:00:00');
  d.setHours(h, m + addMinutes, 0, 0);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
}

function buildIcs(taskList) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Janis Narvas//Study Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Study Tracker',
  ];

  taskList.forEach((task) => {
    const detail = [];
    if (task.course) detail.push(`Course: ${task.course}`);
    if (task.taskType) detail.push(`Type: ${task.taskType}`);
    detail.push(`Status: ${STATUS_LABELS[task.status] || task.status}`);
    if (task.priority) detail.push(`Priority: ${PRIORITY_LABELS[task.priority]}`);
    if (task.notes) detail.push('', task.notes);

    const summary = task.course ? `${task.course} — ${task.name}` : task.name;

    lines.push(
      'BEGIN:VEVENT',
      // Stable UID: re-importing updates the existing event instead of duplicating it.
      `UID:${task.id}@study-tracker.janisnarvas.com`,
      `DTSTAMP:${stamp}`,
      // All-day event: DTEND is exclusive, so it points at the following day.
      // With a time set this becomes a timed event; otherwise it stays
      // all-day (DTEND is exclusive, hence the following day).
      ...(task.dueTime
        ? [`DTSTART:${icsDateTime(task.dueDate, task.dueTime)}`,
           `DTEND:${icsDateTime(task.dueDate, task.dueTime, 30)}`]
        : [`DTSTART;VALUE=DATE:${icsDate(task.dueDate)}`,
           `DTEND;VALUE=DATE:${icsDate(task.dueDate, 1)}`]),
      `SUMMARY:${icsEscapeText(summary)}`,
      `DESCRIPTION:${icsEscapeText(detail.join('\n'))}`,
      `STATUS:${task.status === STATUS.SUBMITTED ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT',
    );
  });

  lines.push('END:VCALENDAR');

  return lines.map(icsFoldLine).join('\r\n') + '\r\n';
}

els.exportIcsBtn.addEventListener('click', () => {
  if (tasks.length === 0) {
    alert('No tasks to export yet.');
    return;
  }
  const blob = new Blob([buildIcs(tasks)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `study-tracker-${toISODate(new Date())}.ics`;
  a.click();
  URL.revokeObjectURL(url);
});

/* ---------- Calendar import (.ics) ----------
   Accepts .ics only. Handles files this app wrote (reading its own
   Course/Type/Status/Priority description back out) as well as generic
   calendar files, where the event just becomes a task with its summary
   as the name and its description as notes. */

const MAX_ICS_BYTES = 5 * 1024 * 1024;
const MAX_ICS_EVENTS = 5000;
const OUR_UID_SUFFIX = '@study-tracker.janisnarvas.com';

/** Reverse lookups so exported labels map back to internal keys. */
const STATUS_BY_LABEL = Object.fromEntries(Object.entries(STATUS_LABELS).map(([k, v]) => [v.toLowerCase(), k]));
const PRIORITY_BY_LABEL = Object.fromEntries(Object.entries(PRIORITY_LABELS).map(([k, v]) => [v.toLowerCase(), k]));

/** Reverses RFC 5545 text escaping in a single pass. */
function icsUnescapeText(value) {
  return String(value).replace(/\\([\\;,nN])/g, (_, ch) => (ch === 'n' || ch === 'N' ? '\n' : ch));
}

/** Splits an unfolded .ics into VEVENT property maps. */
function parseIcsEvents(text) {
  // Normalise line endings, then undo folding (CRLF + space/tab continues a line).
  const unfolded = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '');

  const events = [];
  let current = null;

  unfolded.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (/^BEGIN:VEVENT$/i.test(trimmed)) { current = {}; return; }
    if (/^END:VEVENT$/i.test(trimmed)) {
      if (current) events.push(current);
      current = null;
      return;
    }
    if (!current) return;

    const colon = line.indexOf(':');
    if (colon === -1) return;
    // Property name may carry parameters: DTSTART;VALUE=DATE:20260801
    const name = line.slice(0, colon).split(';')[0].trim().toUpperCase();
    if (name) current[name] = line.slice(colon + 1);
  });

  return events;
}

/** Pulls { date, time } out of a DTSTART value; time is '' for all-day
    events. A UTC timestamp is converted to local, which can shift both. */
function icsParseDateTime(value) {
  const m = String(value).trim().match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
  if (!m) return null;
  const [, y, mo, d, hh, mm, ss, zulu] = m;
  const p = (n) => String(n).padStart(2, '0');

  if (hh && zulu) {
    const local = new Date(Date.UTC(+y, +mo - 1, +d, +hh, +mm, +ss));
    return { date: toISODate(local), time: `${p(local.getHours())}:${p(local.getMinutes())}` };
  }
  const iso = `${y}-${mo}-${d}`;
  if (Number.isNaN(Date.parse(iso))) return null;
  return { date: iso, time: hh ? `${hh}:${mm}` : '' };
}

/** Reads back the Course/Type/Status/Priority block this app writes. */
function parseIcsDescription(description) {
  const result = { course: '', taskType: '', status: '', priority: '', notes: '' };
  const lines = description.split('\n');

  let i = 0;
  for (; i < lines.length; i++) {
    const m = lines[i].match(/^(Course|Type|Status|Priority):\s*(.*)$/);
    if (!m) break;
    const [, label, value] = m;
    if (label === 'Course') result.course = value.trim();
    else if (label === 'Type') result.taskType = value.trim();
    else if (label === 'Status') result.status = STATUS_BY_LABEL[value.trim().toLowerCase()] || '';
    else if (label === 'Priority') result.priority = PRIORITY_BY_LABEL[value.trim().toLowerCase()] || '';
  }

  // Anything after the recognised block (or the whole thing, for a foreign
  // calendar) is free-text notes.
  result.notes = lines.slice(i).join('\n').trim();
  return result;
}

/** Converts one VEVENT into a task, or null when it has no usable date. */
function icsEventToTask(event) {
  const when = icsParseDateTime(event.DTSTART || '');
  if (!when) return null;

  // Single-line fields: collapse control characters to spaces.
  const clean = (s, max) => icsUnescapeText(s || '').replace(/[\x00-\x1F\x7F]/g, ' ').trim().slice(0, max);

  const parsed = parseIcsDescription(icsUnescapeText(event.DESCRIPTION || ''));
  let name = clean(event.SUMMARY, 500);

  // Our own export prefixes the summary with the course; drop the duplicate.
  if (parsed.course && name.startsWith(`${parsed.course} — `)) {
    name = name.slice(parsed.course.length + 3).trim();
  }
  if (!name) name = 'Untitled task';

  return {
    uid: clean(event.UID, 300),
    task: {
      name,
      course: clean(parsed.course, 200),
      taskType: clean(parsed.taskType, 200),
      dueDate: when.date,
      dueTime: when.time,
      status: STATUS_LABELS[parsed.status] ? parsed.status : STATUS.NOT_STARTED,
      priority: PRIORITY_LABELS[parsed.priority] ? parsed.priority : '',
      // Notes keep newlines, but drop every other control character.
      notes: parsed.notes.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '').slice(0, 20000),
    },
  };
}

els.importIcsBtn.addEventListener('click', () => els.importIcsInput.click());

els.importIcsInput.addEventListener('change', () => {
  const file = els.importIcsInput.files[0];
  els.importIcsInput.value = ''; // reset early so re-picking the same file works
  if (!file) return;

  // `accept` is only a picker filter, so the type is enforced here too.
  if (!/\.ics$/i.test(file.name)) {
    alert('Please choose a .ics calendar file.');
    return;
  }
  if (file.size > MAX_ICS_BYTES) {
    alert(`That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. Calendar files are expected to be under 5 MB.`);
    return;
  }

  const reader = new FileReader();
  reader.onerror = () => alert('Could not read that file.');
  reader.onload = () => {
    try {
      const text = String(reader.result);
      if (!/BEGIN:VCALENDAR/i.test(text)) throw new Error('this does not look like a calendar file.');

      const events = parseIcsEvents(text);
      if (events.length === 0) throw new Error('it contains no calendar events.');
      if (events.length > MAX_ICS_EVENTS) throw new Error(`it contains ${events.length} events, more than the ${MAX_ICS_EVENTS} supported.`);

      const parsed = events.map(icsEventToTask).filter(Boolean);
      if (parsed.length === 0) throw new Error('none of its events have a usable date.');

      // Merge rather than replace: matching UIDs update in place, so
      // re-importing an edited calendar doesn't duplicate everything.
      const byUid = new Map();
      tasks.forEach((t) => {
        if (t.icsUid) byUid.set(t.icsUid, t);
        byUid.set(`${t.id}${OUR_UID_SUFFIX}`, t);
      });

      let added = 0;
      let updated = 0;
      const pending = [];

      parsed.forEach(({ uid, task }) => {
        const existing = uid ? byUid.get(uid) : null;
        if (existing) {
          pending.push(() => Object.assign(existing, task));
          updated++;
        } else {
          pending.push(() => tasks.push({ id: generateId(), icsUid: uid || undefined, ...task }));
          added++;
        }
      });

      const summary = [added ? `add ${added}` : '', updated ? `update ${updated}` : '']
        .filter(Boolean).join(' and ');
      const skipped = events.length - parsed.length;
      const skippedNote = skipped ? `\n\n${skipped} event(s) without a usable date were skipped.` : '';
      if (!confirm(`Import will ${summary} task(s). Existing tasks are kept.${skippedNote}`)) return;

      pending.forEach((apply) => apply());
      saveTasks();
      render();
    } catch (err) {
      alert('Could not import this file: ' + err.message);
    }
  };
  reader.readAsText(file);
});

/* ---------- Master render ---------- */

function render() {
  if (currentView === 'calendar') {
    renderCalendarView();
  } else {
    renderListView();
  }
}

render();
