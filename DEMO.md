# Demo: semantic HTML, screen readers, and the mock form

Use the updated site at http://127.0.0.1:4173/. The verified original ZIP preview is at http://127.0.0.1:4174/. Demonstrate the new form only on the updated site. Allow about 4 minutes.

## What to say about semantic HTML

“Semantic HTML means using elements that describe their purpose. The page has a header, navigation, a main content region, related content, and a footer. Headings show the hierarchy. The news item is an article, and form controls have labels and grouped choices. This gives screen-reader users structure they can navigate.”

Show the updated heading order: HackTrent (h1), Main content (h2), Mock application form (h2), this is the right content (h2), and HackTrent2025 Recap (h3). Errors and the submitted-details heading appear when those states are relevant.

## What to say about screen readers and alt text

“Screen readers can announce the page structure, image descriptions, and control names and states. When this form has errors, focus moves to a summary with links to the affected fields. Each field is connected to its own error message. Successful submission is announced without an unexpected focus jump.”

Both photographs use alt attributes, often called alt tags:

- Students gathered around laptops at shared tables, discussing their projects.
- HackTrent 2025 welcome slide and balloons in a lecture hall.

Alt text normally does not appear on hover. Inspect an image's HTML or navigate to it with a screen reader to demonstrate the description. A hover title tooltip is a different feature and is not a substitute for alt text. The original version intentionally lacks these descriptions.

## Using NVDA on Windows

Get NVDA from [NV Access](https://www.nvaccess.org/download/) if needed, launch it, and open the updated page. In browse mode:

| Key | Demonstration |
| --- | --- |
| H / Shift+H | Move forward/backward through headings |
| D / Shift+D | Move through page landmarks |
| G / Shift+G | Reach photographs and hear image descriptions |
| F / Shift+F | Move through form controls |
| Tab / Shift+Tab | Follow the interactive keyboard order |
| NVDA+Space | Toggle browse/focus mode when needed |

The NVDA modifier is usually Insert; Caps Lock can be configured instead. In focus mode, type into inputs, use arrow keys in the radio group, Space for checkboxes, and Enter/Space for buttons. Expected speech varies with reader settings; listen for the meaning rather than an exact transcript.

These commands are documented in the [official NVDA user guide](https://api.nvaccess.org/documentation/userGuide.html#BrowseMode). Automated tests check the exposed structure and behavior; the spoken output still needs rehearsal/listening verification.

## Exact mock-form demonstration

Use made-up details throughout.

1. Activate Apply Now. It moves to Mock application form; Tab reaches Full name. Point out the explicit demo-only notice.
2. Tab to Submit mock form and press Enter with the fields empty. Focus moves to Check the mock form, which lists three errors.
3. Press Tab to the first correction link, then Enter. Focus moves to Full name, with the required/invalid state and its error description available to the reader.
4. Enter Alex Demo. Tab to Email and enter invalid-email. Tab to the radio group. Use Space to select and the arrow keys to change the choice to With a team.
5. Tab to the acknowledgement and press Space. Tab to Submit mock form and press Enter. The remaining error explains the email format. The name and chosen controls retain their values.
6. Follow the email correction link and replace the value with alex@example.com. Tab through the selected radio and acknowledgement to Submit mock form, then press Enter. A polite status says the mock submission is complete and no information was sent or saved. Focus remains on the button. Read the local review below it.
7. Tab to Clear form and press Space. Fields, errors, and review clear; focus returns to Full name and the reset is announced.

No data is uploaded, no email is sent, no registration is created, and no site storage is written. The mock flow demonstrates labels, native controls, validation, focus recovery, announcements, and reset.

## Finish with evidence

Open the browser report using npm run test:report. Explain: “There are 28 tests in Chrome and the same 28 in Edge: 56 passing executions. Sixteen axe scans found no detected violations. HTML validation passed.” Show a semantic-role check, error/focus test, and keyboard form test.

The original missing About/Schedule/Contact/Recap/policy destinations still need real content from the owner. Do not present those placeholders as completed pages. The original comparison site remains untouched.
