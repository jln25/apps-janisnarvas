# Design system

The rules this site is built to. Where the site departs from them, the reason
is recorded — every departure here exists because a measurement forced it.

## Colour

| Role | Light | Dark |
|---|---|---|
| Primary | `#50ebec` | `#50ebec` |
| Secondary | `#30A8B9` | `#30A8B9` |
| Tertiary | `#F09B48` | `#F09B48` |
| Background | `#FFF8F0` | `#1A1714` |
| Surface | `#FFFFFF` | `#242019` |
| Text primary | `#1A1A1A` | `#F5EFE6` |
| Text secondary | `#6B6B6B` | `#A79E92` |
| Border | `#E0D5C7` | `#3A332A` |
| Success | `#2D6A4F` | — |
| Warning | `#E85D04` | — |
| Error | `#D00000` | — |

**The palette as given is light-mode only.** The dark column is derived: a warm
deep background rather than a neutral one, so it reads as the same family as
the cream. Measured on `#1A1714`: text 15.61:1, secondary text 6.76:1, Primary
12.27:1, Secondary 6.31:1.

### Two colours outside the palette

`--color-link: #1D6B77` — Secondary, deepened. **None of the palette's accents
are legible as body-sized link text on the cream background:** Primary measures
1.38:1, Secondary 2.68:1, Tertiary 2.10:1, against a 4.5:1 requirement. Only
Success and Error pass, and those carry meaning that shouldn't be borrowed for
links. The deepened teal reaches 5.83:1. In dark mode links use Primary
directly, which is already 12.27:1 there.

The footer band (`#36a8a8` / `#234242`) and the banner gradient (`#217582` →
`#185861`, dark `#2b5050` → `#1a3333`) come from the sibling copy-cat site and
are kept deliberately, so the two sites read as one family.

### The rule that keeps catching people

**Both cyans need dark text, never white.** White on Primary is 1.45:1 and on
Secondary 2.83:1 — both fail outright. `#1A1A1A` gives 11.96:1 and 6.16:1.
Any new surface painted in either cyan takes a near-black label.

## Typography

Jost, with Helvetica Neue / Arial as fallbacks. Headings bold and tight;
body regular.

Size scale: **12 / 14 / 16 / 20 / 24 / 32 / 40 / 48px**

## Spacing

A 4px base unit. Use **4, 8, 12, 16, 24, 32, 48, 64** and nothing between them.
The footer's 30px top padding is a deliberate exception, asked for directly.

## Radius

| Element | Token | Value |
|---|---|---|
| Inputs, chips | `--radius-sm` | 4px |
| Cards, buttons | `--radius` | 12px |
| Modals, containers | `--radius-lg` | 24px |
| Pills, avatars | `--radius-full` | 9999px |

## Shadows

| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| `--shadow` | `0 4px 12px rgba(0,0,0,0.1)` |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.15)` |

Dark mode uses the same geometry at higher opacity (0.35 / 0.45 / 0.55), since
a shadow tuned for white disappears on a dark surface.

## Components

- **Buttons** — 16px vertical / 24px horizontal padding, 48px tall, scale to
  1.02 on hover.
- **Inputs** — 48px tall, 16px padding, 2px border on focus in Primary.
- **Cards** — 24px padding, medium shadow, medium radius.

**Not yet applied to dense controls.** The BAMS Planner puts 112 `<select>`
elements in one 56-row list; at 48px each that list becomes unusable. Standalone
buttons and inputs follow the spec; in-row controls stay compact.

## Page structure

Every page reads in this order:

```
nav           sticky, logo + links + theme toggle, hamburger below 640px
banner        gradient band carrying the page's single H1 and a one-line description
tool          the page's own actions, then its content
footer        teal band: logo, place, three licence terms, contact icons
```

One H1 per page, and it lives in the banner.

## Conventions

- **Light and dark are both first-class.** `theme.js` writes `data-theme` on
  `<html>`; stylesheets key off `:root[data-theme="dark"]`, never
  `prefers-color-scheme` directly.
- **Shared furniture is rendered once.** `nav.js` and `sitebar.js` build the
  nav and footer on all six pages; neither is pasted into markup.
- **Four stylesheets carry their own copy** of the shared rules, because each
  app page loads only its own. A change to shared furniture goes in all four.
- **Category colours in the planner are not UI chrome.** They encode a data
  dimension and sit outside this palette on purpose.
- **Bump `?v=` on every CSS or JS change.** The host serves stylesheets and
  images with a seven-day `max-age` and no `cache-control` at all on scripts
  and HTML, so a stale asset pairs with new markup for days, silently.

## Working rules

1. Ask before introducing a colour outside the palette.
2. Use the spacing scale — no arbitrary values.
3. Keep radius consistent per element type.
4. Keep whitespace generous.
5. Measure contrast before shipping a new colour pairing; AA is 4.5:1 for body
   text and 3:1 for large text.
