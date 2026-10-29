# SCRUM-25 — Screenshot Capture Instructions

This document explains how to capture screenshots for the SCRUM-25 baseline-inputs intake. The goal is to ensure screenshots are legible, cover the primary journey, and do not expose sensitive information.

---

## What to capture (minimum)

Capture at least one screenshot that shows:

- The primary user journey (Search/Results OR Booking/Checkout)
- Global navigation (e.g., header, nav menu, link to home, etc.)

If the app has hotel details or room selection, include a screenshot of that too.

## Quality requirements

- **Full page.** Use a full-page capture tool or include the entire app screen without cropping out navigation.
- **Legible text.** All form labels and values should be readable when viewed at 100% zoom.
- **No stack traces.** If an error occurs, capture it if it helps explain behavior, but don't capture sensitive info.
- **Rellevant elements.** Where applicable, make sure these are visible:
  - check-in / check-out date inputs
  - guest count or room selector
  - booking call-to-action (e.g., Book, Submit, Confirm)

## Security & privacy guidance (PII / secrets)

Do **not** capture any of the following:

- API keys tokens or secrets (even in the URL bar)
- Real personal phone numbers, emails, addresses, or other PII

- Payment data or credit card info (if present)

If sensitive data is visible, please redact it or recapture the screen.

## Including the URL bar
if you include the browser URL bar, double check that it does not include tokens, session ids, or access keys. If you need to hide the UVL bar for safety, that is acceptable — just make sure the app navigation is still visible.

## Recommended file naming (for repo submissions)

Use this convention in the submissions folder:

- `screenshots/screen-01.png`
- `screenshots/screen-02.png`
 
## Trabeshooting

- If the screenshot ends up blurry: try a higher resolution display scale, or make the browser window wider and recapture.
- If the page is long: use full-page capture (browser extension or devtools) to avoid cutting off sections.
