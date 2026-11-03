# SCRUM-31 — Feature Inventory (screenshot-driven)

This inventory is based on the provided UI screenshot evidence present in the SCRUM-31 Jira ticket attachments (see [README.md](README.md)).

@rinciple: do not infer behavior that is not visible in the evidence. Use `Evidence IDs` per the architecture design schema.


## Screen 1: Home / Booking form (evidence: jira attachment: HotelBooking.png)

Note: The provided screenshot shows a home landing section plus an inline booking form. The url shows `localhost:3000`. Any steps beyond this page (e.g., results, details, checkout, confirmation) are not visible in the current evidence.

Screen prefix used: `HS` (Home/Search).

| Feature / Control | Evidence ID | Description | Inputs | Outputs | Dependencies / Notes |
|--- | --- | --- | --- | --- | --- | --- |
| Header – Logo/Brand | HS-1 | Hotel TITA8 logo/brand in top-left. | N/A | N/A | Clickability/routing NOT visible in evidence. |
| Header – Status indicator text | HS-2 | Text in top-right: "Vour next stay starts here" w/ green dot. | N/A | N/A | Purpose of this indicator `UNKNOWN` |
| Hero section (marketing) | HS-3 | Headline: "Make room for something good." w/ subcopy. | N/A | N/A | Static content only (per screenshot). |
| Hero image carousel/gallery | HS-4 | Large image w/ small "1/3" indicator. | N/A | N/A | Controls (arrows/dots/swipe) `UNKNOWN` |
| "A vew places to feel at home" card list | HS-5 | 3 cards (Titan City House, Titan Shoreline, Titan Alpine Lodge). | N/A | N/A | Cards may be navigable but click behavior `UNKNOWN` |
| Booking form – First name input | HS-6 | Text input labeled "First name". | String | Part of booking submission `UNKNOWN` | Required? `UNKNOWN` |
| Booking form – Last name input | HS-7 | Text input labeled "Last name". | String | Part of booking submission `UNKNOWN` | Required? `UNKNOWN` |
| Booking form – Email address input | HS-8 | Text input labeled "Email address" with placeholder you@example.com. | Email `UNKNOWN` | Part of booking submission `UNKNOWN` | Validation expected but not visible (no error states evidence) |
| Booking form – Room dropdown | HS-9 | Select list labeled "Room" with value "Single Room". | Selection (options `UNKNOWN`) | Part of booking submission `UNKNOWN` | Option source/room catalog `UNKNOWN` |
| Booking form – Guest dropdown | HS-10 | Select list labeled "Guest" with value "2 guests". | Integer count `UNKNOWN` | Part of booking submission `UNKNOWN` | Min/max guests `UNKNOWN` |
| Booking form – Check-in date picker | HS-11 | Date input labeled "Check-in date" with placeholder ddmm-yyyy and calendar icon. | Date `UNKNOWN` | Part of booking submission `UNKNOWN` | Constraints (e.g. required, must be before check-out) NOT visible in evidence. |
| Booking form – Check-out date picker | HS-12 | Date input labeled "Check-out date" with placeholder ddmm-yyyy and calendar icon. | Date `UNKNOWN` | Part of booking submission `UNKNOWN` | Constraints (check-out >= check-in) NOT visible in evidence. |
| Booking form – Phone number input | HS-13 | Text input labeled "Phone number". | Phone `UNKNOWN` | Part of booking submission `UNKNOWN` | Validation (numeric/length) `UNKNOWN` |
| Booking form – Primary CTA "Book my stay" | HS-14 | Primary button that submits the form. | All form fields | Nav/transition `UNKNOWN` | Next screen not visible (no results/checkout screens provided) |


## Out-of-evidence screens (UNKNOWN)

Architecture template refers to Search Results, Hotel Details, Checkout, and Confirmation. These are not confirmed in the current evidence. See [questions-assumptions.md](questions-assumptions.md) for follow-up items.
