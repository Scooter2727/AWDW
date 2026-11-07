# Accessibility implementation and verification

Updated November 7, 2026. The existing page's wording and photographs are retained, with a mock application form explicitly requested for the accessibility demonstration. Target: WCAG 2.2 AA. The original ZIP preview on port 4174 is unchanged.

## Recorded checks

- Chrome: 28 of 28 tests passed.
- Microsoft Edge: 28 of 28 tests passed.
- Axe: 16 scans across both browsers, zero detected violations.
- HTML validation: passed without errors or warnings.
- Final browser suite after integrating the repository's Verdana font update: 44.7 seconds.
- Actual screen-reader speech: listening check still required.

The test suite includes the original 20 checks adapted to the mock form and eight additional checks per browser. The eight check named semantic roles/headings/input purposes; Apply Now focus; linked errors and descriptions; invalid-email/whitespace handling; keyboard radio/checkbox/submission and network/storage behavior; local review/reset; exclusion of form values from search; and form reflow/forced colors.

Axe scans cover desktop, mobile at 320px, search errors, search matches, forced colors, mock form errors, mock form success, and mobile/forced-color mock success. One forced-color search scan requests manual contrast review of the system-colored highlight; its readability should be checked in the actual OS theme. No rules are suppressed.

## Keyboard navigation and focus — 25 possible points

- Native links replace click-only navigation divs. All controls use natural Tab order and Shift+Tab, with no positive tabindex or keyboard traps.
- The first stop is the themed Skip to main content link. Enter focuses the named main landmark. The next Tab reaches the first mock form input.
- Apply Now links to the labeled mock section. Enter focuses that section; the next Tab reaches Full name.
- Focus outlines are 3px, with theme-appropriate contrast. There are no sticky overlays obscuring focused controls.
- Search works with Enter or Go. Form radio buttons use arrow keys, checkboxes use Space, and buttons support native activation.
- Invalid form submission focuses a named error-summary group. Its correction links focus the affected inputs, whose values are preserved.
- Primary controls and links have targets at least 44 by 44 CSS pixels. Compact radio/checkbox controls are inside large clickable labels.

## Visual accessibility — 20 possible points

The reference site's night-purple, cream, lavender, and gold palette is retained. The right sidebar is darkened to muted gold-tan `#d9c69c`.

| Usage | Colors | Contrast |
| --- | --- | ---: |
| Header/footer text | `#fffdf6` on `#2d265b` | 13.40:1 |
| Main text / navigation | `#1e1940` and `#fffdf6` | 16.27:1 |
| Header tagline | `#d1c4e9` on `#2d265b` | 8.30:1 |
| Dark-surface focus | `#e0c57d` against `#2d265b` | 8.09:1 |
| Gold button/highlight text | `#1e1940` on `#e0c57d` | 9.82:1 |
| Main links | `#4b3b5c` on `#fffdf6` | 9.92:1 |
| Sidebar text | `#1e1940` on `#d9c69c` | 9.86:1 |
| Sidebar link | `#4b3b5c` on `#d9c69c` | 6.02:1 |
| Form error text | `#952138` on `#fffdf6` | 8.08:1 |

- Relative sizes, wrapping layouts, native controls, and proportional photographs support resizing and browser preferences.
- The suite checks 320, 375, 768, 1024, and 1440px widths, plus 200% root text size and WCAG text-spacing overrides.
- A 320px viewport tests reflow at the width associated with 400% zoom on a 1280px viewport. Actual browser zoom controls are a separate manual check.
- Errors use text, aria-invalid, and a dashed border; color is not the sole cue. Links are underlined. Search highlights also use an underline.
- Forced colors use system colors, and reduced motion is respected. Only the h1 uses the locally hosted Grenze Gotisch font with swap behavior and a serif fallback. Body text, section headings, and controls preserve the repository’s Verdana font with DejaVu Sans, Tahoma, and sans-serif fallbacks.

## Semantic HTML and screen readers — 20 possible points

- Valid document, English language, descriptive title, one h1, and logical h2/h3 hierarchy.
- Header, named Main navigation, named Site search, named Main content, a named mock section/form, a labeled aside, and named Footer navigation expose structure.
- The original news item is an article with a heading and machine-readable time. Lists retain native structure.
- Both original images have meaningful alt attributes. Alt text is an accessible description, not a hover tooltip.
- The form uses visible labels, native input types, autocomplete=name/email, native required states, fieldsets, and legends. Descriptions connect instructions and errors to their controls.
- Validation uses a focused named group rather than simultaneous alert/focus announcements. Successful submission uses a persistent polite atomic status region and keeps focus on the button.
- Search and form statuses are independent; repeated messages are made observable to assistive technology. These mechanisms are tested structurally; actual pronunciation and announcement timing need listening checks.

## Forms and interaction — 15 possible points

The requested mock form uses made-up name/email data, optional solo/team radio choices, and a required acknowledgement that it is a demonstration.

- Empty/whitespace names, missing/malformed email, and missing acknowledgement produce field-specific errors and a linked summary.
- Correcting one input clears its invalid state and preserves other values. No validation focus jump occurs while typing.
- A valid submission renders a safe text-only review and announces that nothing was sent or saved. There is no network submission or browser-storage write.
- Editing clears stale results. Clear form removes values/errors/review, announces the reset, and focuses the name input. Reload starts with a clean form without autofocus.
- Search indexes only original public copy; form details and reviews remain outside the index. Literal query handling and DOM text insertion avoid interpreting user data as HTML.
- The original page remains readable without JavaScript; the mock section presents an explanatory fallback instead of active submission controls.

## Testing and technical quality — 20 possible points

```sh
npm ci
npm test
npm run test:html
npm audit
```

A dedicated original-copy regression excludes the explicitly requested mock section and transient feedback, then compares all starter wording. Other tests inspect accessible roles/names/descriptions, required states, focus order, keyboard activation, errors, success, reset, network/storage behavior, safe text rendering, responsive states, direct file opening, and original assets.

`npm run test:report` opens the report. Screenshots and JSON scan summaries are generated under `accessibility-results/`. The site has no production dependencies, external font requests, analytics, or build requirement. The preview server serves only public assets and binds to loopback.

## Limits and manual checks

Apply Now now has the mock-form destination. Original destinations `#about`, `#schedule`, `#contact`, `#image`, `#privacy`, `#terms`, and `#accessibility` still lack supplied content. They have not been represented as working pages. Original placeholder paragraphs and image files remain unchanged.

Use [DEMO.md](./DEMO.md) to check NVDA or another available screen reader: headings/landmarks, both image descriptions, field labels and required state, fieldset legends, linked errors, radio/checkbox states, repeated search messages, success, and reset. Check actual 200%/400% browser zoom, real OS contrast themes, Firefox/Safari, and completion by an assistive-technology user. The automated suite cannot guarantee a score or establish full WCAG conformance.

References: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [HackTrent visual reference](https://www.hacktrent.ca/), and [NVDA user guide](https://api.nvaccess.org/documentation/userGuide.html).
