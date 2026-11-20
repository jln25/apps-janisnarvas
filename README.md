# apps.janisnarvas.com

A few study tools I built for myself as a BAMS student at UPOU,
shared online in case they are useful to anyone else.

**Live at [apps.janisnarvas.com](https://apps.janisnarvas.com)**

| Tool | What it does |
|---|---|
| [Study Tracker](https://apps.janisnarvas.com/study-tracker/) | Assignments and deadlines in a calendar or list view, with priorities, statuses and `.ics` export |
| [Reading Notebook](https://apps.janisnarvas.com/reading-notebook/) | Tagged notes on academic sources, exportable to Markdown for Obsidian or to CSV |
| [BAMS Planner](https://apps.janisnarvas.com/bams-planner/) | Degree planner for the UPOU BAMS curriculum: units by category, courses by term, prerequisite checks, CSV and PDF export ([guide](https://apps.janisnarvas.com/bams-planner/guide.html)) |

## How it is built

Plain HTML, CSS and vanilla JavaScript. There is no account system and no server-side anything. Each app keeps its data
in the browser's `localStorage` under its own key, so nothing is uploaded and
nothing follows you between devices.

```
index.html          landing page; the tool grid is driven by the TOOLS array in script.js
license.html        full licence text
style.css           shared tokens, dark theme, prose pages, footer bar
theme.js            light/dark handling, loaded in <head> to avoid a flash
sitebar.js          the licensing bar at the foot of every page
analytics.js        GA4, in one file so each page needs a single tag

study-tracker/      index.html + script.js + style.css
reading-notebook/   + zip.js, a small hand-rolled ZIP writer for the Markdown export
bams-planner/       + courses.js (the curriculum) and guide.html (the user guide)
```

## Running it locally

No dependencies to install. Serve the folder over HTTP rather than opening the
files directly, so that `localStorage` behaves the way it does in production:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## One convention worth knowing

Every asset URL carries a version string — `style.css?v=1.7.0`, and so on, the
same number across all of them.

**Bump it in every file whenever you change a `.css` or `.js` file.** The host
serves stylesheets and images with a seven-day `max-age` and sends no
`cache-control` at all on scripts and HTML, so without a new URL a returning
visitor will pair new markup with a stale script for days. That failure is
silent and looks like a bug in the app.

```bash
grep -rl '?v=1.7.0' --include='*.html' --include='*.js' --include='*.xml' . \
  | xargs sed -i '' 's/?v=1\.7\.0/?v=1.8.0/g'
```

## Deployment

Static files uploaded to cPanel. The repository is the source of truth; the
`.zip` archives built for uploading are gitignored.

## Licence

Code under the [MIT License](LICENSE). The writing and design under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.en).

The BAMS Planner's recommended course ordering follows the
[BAMS curriculum flowchart](https://bams.mcco.ph/cms/public/index.php) by
Miguel Ferdinand C. Co, used with thanks. That work is his and is not covered
by the licences above.

The planner is unofficial and not endorsed by the UP Open University. 
Make sure to check the official BAMS curriculum and be guided accordingly.
