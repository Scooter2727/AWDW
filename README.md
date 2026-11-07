# HackTrent accessibility challenge

Accessibility improvements for the supplied page, preserving its original wording and photographs. The explicitly requested mock form is a separate, clearly labeled demonstration. The original ZIP preview runs separately on port 4174; the updated site runs on port 4173.

## Run and verify

```sh
npm ci
npm start
npm test
npm run test:html
npm audit
```

Visit http://127.0.0.1:4173/ or open `index.html` directly. There is no build requirement or production package dependency. With installed Chrome and Microsoft Edge, the browser suite runs 28 tests per browser. Use `npm run test:report` for the interactive report. Generated screenshots and axe summaries are saved in `accessibility-results/`.

## Implemented behavior

- Semantic header, named navigation/search/main regions, a labeled form section, an aside, a titled news article, and a footer.
- One h1, logical h2/h3 headings, lists, machine-readable date, and meaningful alt descriptions for both original photographs.
- Native links and controls, a themed skip link, visible focus, large targets, and keyboard form interaction.
- Readable typography, local Grenze Gotisch heading font, responsive layout, text resizing/spacing, reduced motion, and system-color support. The right sidebar uses a darker muted gold-tan with measured text contrast.
- Search of the original public content with literal matching, highlights, errors, and polite announcements. Mock form values and its review are excluded from indexing.
- A demo-only application form with labels, autocomplete purposes, native required states, fieldsets/legends, radio choices, checkbox acknowledgement, inline errors, a focused linked error summary, a local review, a polite success message, and Clear form.

Use made-up details in the mock form. No form data is sent to a server or written to browser storage. Editing clears the previous review; clearing resets the fields, errors, and feedback, and returns focus to the name field. Without JavaScript, the original content remains available and the mock section explains why interactive controls are unavailable.

## Demo and accessibility evidence

See [DEMO.md](./DEMO.md) for a spoken explanation, NVDA navigation, alt-text demonstration, and exact form interactions. See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for the rubric mapping, contrast measurements, test results, and remaining listening checks.

Only the h1 title uses the local Grenze Gotisch font; body text, section headings, and controls use Verdana with DejaVu Sans, Tahoma, and sans-serif fallbacks. The heading font's SIL Open Font License is in `assets/grenze-gotisch-OFL.txt`. Text sizes at the default browser base are 18px for body/controls, 32px for main section headings, 28px for the sidebar heading, 16px for feedback/date, and 44–64px for the page title. The body and section headings retain the repository’s updated readable Verdana font.

## Scope and limits

Apply Now now targets the explicitly labeled mock form. Original destinations `#about`, `#schedule`, `#contact`, `#image`, `#privacy`, `#terms`, and `#accessibility` still have no supplied content. No real event information or policy pages have been invented. The original photographs and original Lorem ipsum paragraphs remain intact.

Chrome and Edge share Chromium. Actual screen-reader speech, Firefox/Safari, real OS themes, and user testing remain separate manual checks. Automated passing results do not establish complete WCAG conformance or a guaranteed judging score.

## Made by:

James, Scott, Crystal, Anton
