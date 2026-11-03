# SCRUM-31 — Booking Journey Map (evidence-based)

This journey map documents the end-to-end booking flow per [SCRUM-31](https://vinayqa24-1792155730342.atlassian.net/browse/SCRUM-31).

Important: the current UI evidence provided to date shows only the Home/Booking form screen. The downstream screens (results, details/rooms, checkout, success/confirmation) are therefore documented as `UNKNOWN` with clear follow-up questions in [questions-assumptions.md](questions-assumptions.md).

## 1) States & transitions (high-level)

1 (State) – Home / Book stay (Home / Search)
   - Visible inputs: first name (HS-6), last name (HS-7), email (HS-8), room (HS-9), guests (HS-10), check-in (HS-11), check-out (HS-12), phone (HS-13)
   - Action: click "Book my stay" (HS-14)
   - Transition: next state `UNKNOWN` (not shown in evidence)

Required downstream flow per acceptance criteria (not currently evidenced):

2 (State) – Search → Results
3 (State) – Results – > Hotel/Room selection
4 (State) – Guest details / Submit booking
5 (State) – Confirmation (Success or Failure)

_/\ These are mandated by the SCRUM-31 acceptance criteria, but should not be detailed beyond what is proven by evidence. See questions for requesting missing screens._

## 2) Step-by-step details

### Step A: Home / Book stay (embedded form)

- Page goal: capture booking request details (guest + dates + room).
- Required inputs (visible):
  - First name (HS-6) → format `UNKNOWN`
  - Last name (HS-7) → format `UNKNOWN`
  - Email (HS-8) → must be valid email format `UNKNOWN` (not proven by screenshot)
  - Room (HS-9) → dropdown options `UNKNOWN`
  - Guests (HS-10) → min/max `UNKNOWN`
  - Check-in date (HS-11) → must be a valid date; format per placeholder `dd-mm-yyyy`
  - Check-out date (HS-12) → must be a valid date; expected check-out >= check-in (not evidenced)
  - Phone number (HS-13) → format `UNKNOWN`

- Transition trigger:
  - Click "Book my stay" (HS-14)
  - Expected next page/state `UNKNOWN` however may be one of: results, checkout, confirmation.

### Step B: Search → Results (Expected, not evidenced)

- Status: `UNKNOWN` in current evidence set.
- Minimum expected outputs (to verify once screens provided):
  - Search results list
  - Page navigation (pagination/load more) `UNKNOWN`
  - Filters/sort `UNKNOWN`

### Step C: Results → Hotel/Room selection (Expected, not evidenced)

- Status: `UNKNOWN`

- Minimum expected outputs:
  - Hotel details page (title, gallery, amenities)
  - Room list w/ price and a select/reserve button
  - Unavailability messaging or error state `UNKNOWN`

### Step D: Guest details / Submit booking (Expected, not evidenced)

- Status: `UNKNOWN`

- Minimum expected inputs:
  - Guest name/email/phone (already captured on Home in evidence, but may be on checkout)
  - Terms/Policies ack `UNKNOWN` if present
- Transition: submit booking → confirmation or failure
