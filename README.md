# HackTrent accessibility challenge

Accessibility fixes for the supplied website, preserving its original on-page information, photographs, navigation labels, and three-column structure. The colors follow the night-purple, cream, lavender, and gold palette used by the HackTrent reference site. No event information is imported from that site.

Existing headings use Grenze Gotisch, matching the reference site's section titles. The variable Latin font is hosted locally with `font-display: swap` and a Georgia/serif fallback. Its SIL Open Font License is included in `assets/grenze-gotisch-OFL.txt`. Body text remains in the readable system font.

At the default browser text size, body text and controls are 18px, main section headings are 32px, sidebar headings are 28px, and the page title scales from 44px to 64px. Search feedback and the date are 16px. Sizes remain relative to the browser's base font. The skip link uses the same gold button fill and purple text as Go, with a clear cream focus outline on the purple header.

Open `index.html` directly, or run:

```sh
npm ci
npm start
```

Visit http://127.0.0.1:4173. No build step or production packages are required.

## Changes

- Repaired document nesting and added semantic header, navigation, main, aside, and footer landmarks.
- Promoted existing text to correctly ordered headings without changing its wording.
- Added a keyboard skip link, native navigation links, visible focus outlines, and large control targets.
- Added descriptions for the two original photographs and preserved their files.
- Replaced low-contrast colors, made the layout responsive, and supported text resizing, text spacing, forced colors, and reduced motion.
- Labeled the existing Search field, corrected its input type, and made Go search the existing main/sidebar text. Search highlights matches in place and announces feedback without adding content sections.
- Preserved all original link destinations, including placeholders with no supplied pages.

The added application form, draft download, schedule, FAQ, promotional copy, extra content sections, and policy text from the earlier revision have been removed.

## Verification

With Chrome and Microsoft Edge installed:

```sh
npm test
npm run test:html
npm audit
```

The suite runs 20 checks per browser. It includes a full original-copy comparison, keyboard traversal, axe scans, search behavior, responsive layouts, enlarged text, forced colors, and direct-file/no-JavaScript behavior. Open the interactive report with `npm run test:report`. Screenshots and axe summaries are saved in `accessibility-results/`.

See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for the rubric mapping and remaining checks.

## Scope and limits

The original links to `#about`, `#apply`, `#schedule`, `#contact`, `#image`, `#privacy`, `#terms`, and `#accessibility` have no supplied destination content. They remain unchanged; no replacement pages or event facts have been invented. Home and the added skip link have working targets. A complete operational navigation system requires actual destinations from the site owner.

The page content remains readable without JavaScript. In-page highlighting and feedback require JavaScript. Search does not upload queries when JavaScript is running. Both photographs are unchanged; their original file sizes are retained.

Actual screen-reader speech and Firefox/Safari behavior still need human verification. Passing automated checks does not establish complete WCAG conformance or a guaranteed judging score.
