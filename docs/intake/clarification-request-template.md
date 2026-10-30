# SCRUM-26 — Clarification Request Template

Copy/paste this into a SCRUM-26 Jira comment when inputs are missing or unreadable.

---

Hi <first_name>,

Thanks for the info so far. To produce the evidence-based feature inventory + prioritized enhancements, we still need a few more inputs.

## Missing or unreadable inputs

- [ ] [Screenshot] (describe which page/screen) is missing or too blurry to read at 100% zoom.
- [ ] [App description] Missing required fields: flows, data source type, MVP scope, known limitations, OUT OF SCOPE items. (please mark anything as “Unknown” if you don’t have it yet)

> Note: The template we use is `ocs/intake/app-intake.md`.

===

## Why this matters

- (1-2 sentences) explain the dependency. Example: "Without the booking form screen, we can’t list current validations and error states."

## Example of acceptable screenshots

- Show the full-page UI (the form + any summary/sidebar)
- Show form fields and button labels
- If an error state exists, capture at least one screenshot of the error too (for any validations/messages)

## Filenaming (optional if stored in repo)

- `01-search.png`, `02-results.png`, `03-details.png`, `04-booking.png`, `05-confirm.png`

Thanks! Once we have the above, we’ll publish the updated deliverable in repo: `docs/analysis/SCRUM-26-output.json` and link it back in SCRUM-26.
