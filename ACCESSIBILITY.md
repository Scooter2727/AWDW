# Accessibility implementation and verification

Updated November 7, 2026. Scope: improve accessibility of the original challenge page without adding event information or new content sections. Target: WCAG 2.2 AA for the existing page and controls.

## Recorded results

- Chrome: 20 of 20 checks passed.
- Microsoft Edge: 20 of 20 checks passed.
- Axe: 10 scans across both browsers, zero detected violations.
- HTML validation: passed without errors or warnings.
- Dependency audit: zero reported vulnerabilities.
- Final browser run after the readability/skip-link update: 29.9 seconds. Chrome's rendered-font inspection confirmed Grenze Gotisch is used by all three existing headings; a separate visual check confirmed the themed skip link fits at 320px. Original missing link destinations remain a documented limitation; passing tests do not certify those links as functional.

## Content preservation

The page retains HackTrent, @ Trent University, the Search/Go controls, all five navigation labels, Main content, both original Lorem ipsum paragraphs, the right-sidebar text, both photographs, HackTrent2025 Recap, November 15, 2025, the original copyright text, and the three footer labels.

The only new on-page text consists of accessibility/interaction assistance: the keyboard skip link and search feedback. Image descriptions are new accessibility metadata. The title's spelling is corrected. Footer pipe separators are replaced with a semantic list.

The previously added hero copy, application form, draft generation, schedule table, contact guidance, FAQ/disclosure, recap article, accessibility article, and policy sections have been removed. Nothing from the reference site's event description, dates, registration, or team information has been copied into the page.

## Keyboard navigation and focus — 25 possible points

- Original click-only navigation items are native, keyboard-operable anchors.
- The first Tab stop is Skip to main content. Enter focuses the main region; the next Tab reaches the original recap link.
- All existing interactive elements follow natural document order and support Shift+Tab. No positive tabindex or keyboard traps.
- A visible 3px focus outline uses night-purple on light surfaces and gold on dark surfaces. No sticky elements obscure controls.
- Search supports Enter from the input and Space/Enter on Go. Empty submission focuses the field and sets aria-invalid. Successful searches retain focus.
- Existing navigation/footer/recap links, search input, and Go button provide targets at least 44 by 44 CSS pixels.

The original placeholder destinations are preserved; see limitations below.

## Visual accessibility — 20 possible points

The palette uses the reference site's night-purple, cream, lavender, gold, and plum colors. Contrast calculations for the actual pairs used:

| Usage | Colors | Ratio |
| --- | --- | ---: |
| Header/footer text | cream `#fffdf6` on night `#2d265b` | 13.40:1 |
| Main text / navigation contrast | night-deep `#1e1940` and cream `#fffdf6` | 16.27:1 |
| Header tagline | lavender `#d1c4e9` on night `#2d265b` | 8.30:1 |
| Dark-surface focus | gold `#e0c57d` against night `#2d265b` | 8.09:1 |
| Go text / search highlight | night-deep `#1e1940` on gold `#e0c57d` | 9.82:1 |
| Light-surface links | plum `#4b3b5c` on cream `#fffdf6` | 9.92:1 |
| Sidebar text | night-deep `#1e1940` on parchment `#f0f0d0` | 14.26:1 |
| Sidebar link | plum `#4b3b5c` on parchment `#f0f0d0` | 8.70:1 |

- Links are underlined. Search matches use both a highlight and underline. Empty searches have explicit error text and a dashed field border.
- Responsive grid/flex layouts and proportional images avoid horizontal page overflow at 320, 375, 768, 1024, and 1440 CSS pixels.
- Relative sizing supports 200% text enlargement. The suite also applies WCAG text-spacing overrides: 1.5 line height, 2em paragraph spacing, .12em letter spacing, and .16em word spacing.
- Default sizes are 18px for body text/controls, 32px for main section headings, 28px for the sidebar heading, 16px for feedback/date, and 44–64px for the page title. All use relative units and remain responsive to browser font preferences. The skip link shares Go's gold fill/purple text, rounded corners, and a contrasting cream focus outline; forced-color mode uses system colors.
- Existing h1/h2 titles use the reference site's Grenze Gotisch font at weight 700. A local WOFF2 file, preload, swap behavior, and serif fallback avoid a third-party font request or invisible text. Paragraphs and controls keep their system font. Font license: `assets/grenze-gotisch-OFL.txt`.
- A 320px layout tests the reflow width associated with 400% zoom on a 1280px viewport. The actual browser zoom UI is not automated.
- Forced-color rules use system colors for surfaces, links, controls, focus, and highlights. Reduced-motion preferences disable animation, transitions, and smooth scrolling. No animation or flashing is introduced.

## Semantic HTML and screen readers — 20 possible points

- Valid HTML, English language, corrected title, properly closed elements, and relative asset paths.
- Header, named main/footer navigation, main content, a named aside, and footer expose the original structure.
- One h1 (HackTrent), then h2 headings for the original main/sidebar labels.
- Original navigation, news item, and footer links use lists. The existing date is a machine-readable time element.
- Both original photographs have meaningful alt descriptions. Their explicit dimensions reserve layout space.
- Search has a visible, programmatically associated label, a search input type, an accessible Go button, connected feedback, and a native search landmark.
- A persistent polite/atomic status region reports search errors and results. Repeated messages are cleared and reinserted so they can be announced again.

## Forms and interaction — 15 possible points

Only the original Search and Go interface remains; no application or other form has been added.

- Search is case-insensitive, treats punctuation literally, and handles phrases crossing source-text line breaks.
- Matches are highlighted within existing main/sidebar text. Clearing or changing the query removes old highlights and errors without changing the source copy.
- Empty input gets a useful text error and aria-invalid. No matches gets explicit feedback.
- Text is inserted using DOM text nodes, not interpreted as HTML. Search queries are not sent over the network when JavaScript is running.
- No focus jump on successful search, no timed interaction, no CAPTCHA, no drag/hover requirement, and no data collection.
- All original content and native links remain available without JavaScript. In-page search enhancement requires JavaScript.

## Testing and technical quality — 20 possible points

The suite has 20 checks per browser in installed Chrome and Microsoft Edge. A dedicated regression compares the entire original visible copy (excluding the skip link and transient search feedback) and verifies that invented sections/forms are absent. It also locks the original navigation destinations, including the known placeholders.

Five states per browser receive full default axe scans: desktop, 320px mobile, empty-search error, highlighted search matches, and forced colors.

```sh
npm ci
npm test
npm run test:html
npm audit
```

`npm run test:report` opens the generated browser report. Axe JSON summaries and screenshots are saved under `accessibility-results/`. Other checks cover keyboard order/focus, source-copy preservation after highlights, safe literal queries, actual asset loads, runtime errors, target sizes, responsive layout, text resizing/spacing, and direct file opening.

The preview server binds to loopback and serves only public site files. The site has no production packages, external fonts, third-party scripts, or build requirement. Original image files are unchanged.

## Remaining limitations and human checks

- The starter links to `#about`, `#apply`, `#schedule`, `#contact`, `#image`, `#privacy`, `#terms`, and `#accessibility` have no supplied destination elements or pages. These original destinations are deliberately unchanged to preserve scope. They are keyboard accessible but do not lead to content. Resolving them requires actual destinations from the owner, not invented pages.
- The original Lorem ipsum paragraphs are preserved rather than replaced with newly written information.
- Search highlighting requires JavaScript. Without it, the original content remains available to browser Find.
- Both browsers use Chromium. Firefox, Safari, actual screen-reader speech, and real OS high-contrast themes have not been verified by the automated suite.
- Check NVDA/VoiceOver heading and landmark navigation, image descriptions, the Search label and error description, repeated result announcements, and highlight readability. Verify actual 200%/400% browser zoom and ask an assistive-technology user to complete the existing search and navigation flow.
- Automated passing checks do not establish full WCAG conformance or guarantee judging points.

References: [HackTrent visual reference](https://www.hacktrent.ca/) and [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).
