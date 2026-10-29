# SCRUM-25 — App Description Template (5–10 bullets)

Fill this out for the baseline inputs intake. Keep it to 5—10 short bullets. The goal is to capture "what exists today" so the next step (evidence-based analysis) does not have to guess.

> Paste the filled template into your submission folder as `app-description.md` or replace this file content.

## Required bullets

Include all items below as bullets. You can add more, but do not exceed 10.

- **Target users:** (e.g., guests only, guests + admins)
- **Current booking flow steps:**
  - (list the steps a user takes from landing to confirmation)
- **Authentication:** **Yes/No** (if yes, how do users login?)
- **Payment handling:** **Real/Mock** (if real, what provider?)
- **Admin/management capabilities: **Yes/No** (if yes, list basic capabilities)
- **Data source:** (e.g., SQLite/seeded data/static JSON/API)
- **Environment(s):** (local/dev/stage, and the URL if applicable)
- **Known limitations:** (1 – 3 bullets or a short statement)

## Example (edit/delete this)

- Target users: Guests only
- Booking flow: Home → Select room type → Select dates • Enter name / phone → Submit → Success message
- Authentication: No
- Payment: Mock (no payment flow)
- Admin: No
- Data source: Local SQLite database created at runtime
- Environment: Local (http://localhost:3000)
- Known limitations: Does not check availability or calculate prices