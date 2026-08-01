/* ==========================================================================
   courses.js — BAMS curriculum seed data
   Source: UPOU FICS BAMS program page + the official BAMS Curriculum 1.2.0
   flowchart (bams.mcco.ph), cross-checked 2026-07-31.

   Notes on data-quality decisions made while reconciling the two sources:
   - MMS 197 (Multimedia Research) is 3 units, confirmed against its own
     course page (fics.upou.edu.ph/.../mms-197/); the main program page
     omits the number. This is also what makes every category below sum to
     exactly the official 142-unit requirement.
   - The FICS page listed MMS 181 as a possible Major Elective, but the
     official flowchart's 5 major electives are MMS 144/145/146/149/151
     with no MMS 181. Went with the flowchart (more authoritative) and
     dropped MMS 181 entirely.
   - PE and NSTP are mandated but explicitly "do not count toward GWA"
     per the source page, and excluding them is what makes the totals
     reconcile to 142 — so they're tracked but excluded from the main
     progress bar (see `excludeFromTotal`). They're listed as the
     individual courses actually taken: PE 1–4 at 2 units each (8 total)
     and NSTP 1–2 at 3 units each (6 total).
   ========================================================================== */

/* Unit caps for elective pools — used to stop progress bars from exceeding
   100% if more electives are completed than the degree actually requires. */
const POOL_CAPS = {
  'ge-elective': 9,      // pick 3 of 5, 3 units each
  'major-elective': 15,  // all 5 required, 3 units each
};

const DEFAULT_COURSES = [
  // ---------- GE Core (7 courses, 21 units) ----------
  { code: 'ETHICS 1', title: 'Ethics and Moral Reasoning in Everyday Life', category: 'GE Core', group: 'GE', units: 3 },
  { code: 'WIKA 1', title: 'Wika, Kultura at Lipunan', category: 'GE Core', group: 'GE', units: 3 },
  { code: 'ARTS 1', title: 'Critical Perspectives in the Arts', category: 'GE Core', group: 'GE', units: 3 },
  { code: 'SCIENCE 11', title: 'Living Systems: Concepts and Dynamics', category: 'GE Core', group: 'GE', units: 3 },
  { code: 'MATH 10', title: 'Mathematics, Culture and Society', category: 'GE Core', group: 'GE', units: 3 },
  { code: 'KAS 1', title: 'Kasaysayan ng Pilipinas', category: 'GE Core', group: 'GE', units: 3 },
  { code: 'STS', title: 'Science, Technology and Society', category: 'GE Core', group: 'GE', units: 3 },

  // ---------- GE Elective (pick 3 of 5, 9 units) ----------
  { code: 'SAS 1', title: 'Self and Society', category: 'GE Elective', group: 'GE', units: 3, poolKey: 'ge-elective' },
  { code: 'COMM 10', title: 'Critical Perspectives in Communication', category: 'GE Elective', group: 'GE', units: 3, poolKey: 'ge-elective' },
  { code: 'PHILARTS 1', title: 'Philippine Arts and Culture', category: 'GE Elective', group: 'GE', units: 3, poolKey: 'ge-elective' },
  { code: 'ENG 11', title: 'Literature and Society', category: 'GE Elective', group: 'GE', units: 3, poolKey: 'ge-elective' },
  { code: 'SOCSCI 2', title: 'Social, Political, and Economic Thought', category: 'GE Elective', group: 'GE', units: 3, poolKey: 'ge-elective' },

  // ---------- Common (4 courses, 12 units) ----------
  { code: 'COMM 2', title: 'Communication Skills 2', category: 'Common', group: 'Common', units: 3 },
  { code: 'COMP ED 10', title: 'Critical Digital Literacies', category: 'Common', group: 'Common', units: 3 },
  { code: 'COMP ED 20', title: 'Introduction to Analytics', category: 'Common', group: 'Common', units: 3 },
  { code: 'ENG 157', title: 'English for the Professions', category: 'Common', group: 'Common', units: 3 },

  // ---------- Mandated ----------
  { code: 'PI 100', title: 'Life and Works of Rizal', category: 'Mandated', group: 'Mandated', units: 3 },
  { code: 'PE 1', title: 'Physical Education 1', category: 'Mandated', group: 'Mandated', units: 2, excludeFromTotal: true, nonGwaGroup: 'PE' },
  { code: 'PE 2', title: 'Physical Education 2', category: 'Mandated', group: 'Mandated', units: 2, excludeFromTotal: true, nonGwaGroup: 'PE' },
  { code: 'PE 3', title: 'Physical Education 3', category: 'Mandated', group: 'Mandated', units: 2, excludeFromTotal: true, nonGwaGroup: 'PE' },
  { code: 'PE 4', title: 'Physical Education 4', category: 'Mandated', group: 'Mandated', units: 2, excludeFromTotal: true, nonGwaGroup: 'PE' },
  { code: 'NSTP 1', title: 'Civic Welfare Training Service 1', category: 'Mandated', group: 'Mandated', units: 3, excludeFromTotal: true, nonGwaGroup: 'NSTP' },
  { code: 'NSTP 2', title: 'Civic Welfare Training Service 2', category: 'Mandated', group: 'Mandated', units: 3, excludeFromTotal: true, nonGwaGroup: 'NSTP' },

  // ---------- Major Core (19 courses, 55 units) ----------
  { code: 'MMS 100', title: 'Introduction to Multimedia Studies', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 101', title: 'Introduction to Information Technology', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 102', title: 'Theories in Multimedia', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 111', title: 'Gender and Multimedia', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 112', title: 'Multimedia and Society', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 115', title: 'Law and Multimedia', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 120', title: 'Communication and Culture', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 121', title: 'Multimedia and Popular Culture', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 130', title: 'Information and Communication Technology for Development', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 131', title: 'Introduction to Knowledge Management', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 140', title: 'Mathematics in Multimedia', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 141', title: 'Principles of Programming', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 142', title: 'Internet Technologies and Web Development', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 143', title: 'Introduction to Multimedia Computing', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 150', title: 'User Interface and User Experience Design', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 170', title: 'Aesthetics in Multimedia', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 194', title: 'New Media Art', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 197', title: 'Multimedia Research', category: 'Major Core', group: 'Major', units: 3 },
  { code: 'MMS 199', title: 'Undergraduate Seminar on Multimedia Studies', category: 'Major Core', group: 'Major', units: 1 },

  // ---------- Major Elective (5 of 5 required per official flowchart, 15 units) ----------
  { code: 'MMS 144', title: 'Principles of Multimedia Information Management', category: 'Major Elective', group: 'Major', units: 3, poolKey: 'major-elective' },
  { code: 'MMS 145', title: 'Multimedia Communications and Networking', category: 'Major Elective', group: 'Major', units: 3, poolKey: 'major-elective' },
  { code: 'MMS 146', title: 'Object-Oriented Programming', category: 'Major Elective', group: 'Major', units: 3, poolKey: 'major-elective' },
  { code: 'MMS 149', title: 'Software Engineering in Multimedia Practice', category: 'Major Elective', group: 'Major', units: 3, poolKey: 'major-elective' },
  { code: 'MMS 151', title: 'Introduction to Web Accessibility', category: 'Major Elective', group: 'Major', units: 3, poolKey: 'major-elective' },

  // ---------- Multimedia Production (6 courses, 18 units) ----------
  { code: 'MMS 171', title: 'Text in Multimedia', category: 'Production', group: 'Production', units: 3 },
  { code: 'MMS 172', title: 'Audio in Multimedia', category: 'Production', group: 'Production', units: 3 },
  { code: 'MMS 173', title: 'Photography in Multimedia', category: 'Production', group: 'Production', units: 3 },
  { code: 'MMS 174', title: 'Graphics in Multimedia', category: 'Production', group: 'Production', units: 3 },
  { code: 'MMS 175', title: 'Videography in Multimedia', category: 'Production', group: 'Production', units: 3 },
  { code: 'MMS 176', title: 'Animation in Multimedia', category: 'Production', group: 'Production', units: 3 },

  // ---------- Special Topics & Capstone (9 units) ----------
  { code: 'MMS 198', title: 'Special Topics', category: 'Capstone', group: 'Capstone', units: 3 },
  { code: 'MMS 200a', title: 'Special Project (Part 1)', category: 'Capstone', group: 'Capstone', units: 3 },
  { code: 'MMS 200b', title: 'Special Project (Part 2)', category: 'Capstone', group: 'Capstone', units: 3, note: 'Take one term after MMS 200a, leaving a term in between for implementation.' },
];

/* Every course starts with no status and no term; the app fills these in
   as the user edits, then persists the whole array. */
DEFAULT_COURSES.forEach((course) => {
  course.status = '';
  course.term = '';
});

/* What each category actually requires, for the "x of y" heading labels.
   `courses` is how many must be taken (relevant where a category offers
   more options than are required, e.g. GE Elective is pick-3-of-5). */
const CATEGORY_REQUIREMENTS = {
  'GE Core': { courses: 7, units: 21 },
  'GE Elective': { courses: 3, units: 9 },
  'Common': { courses: 4, units: 12 },
  // No `units` here: the note replaces the unit requirement in the heading.
  'Mandated': { courses: 7, note: 'PE and NSTP excluded from the 142 units of the degree program' },
  'Major Core': { courses: 19, units: 55 },
  'Major Elective': { courses: 5, units: 15 },
  'Production': { courses: 6, units: 18 },
  'Capstone': { courses: 3, units: 9 },
};

const TOTAL_UNITS_REQUIRED = 142;
