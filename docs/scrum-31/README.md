# SCRUM-31 — Screenshot-driven baseline artifacts

This folder contains the authoritative, source-controlled documentation artifacts for [SCRUM-31](https://vinayqa24-1792155730342.atlassian.net/browse/SCRUM-31) as specified in the Confluence architecture design.

## Artifacts

- [feature-inventory.md](feature-inventory.md) – Per-screen feature inventory with Evidence IDs
- [journey-map.md](journey-map.md) – End-to-end booking journey (transitions, inputs, validations, failure states)
- [gaps-prioritization.md](gaps-prioritization.md) – Prioritized gap list (P0/P1/P2)\
- [questions-assumptions.md](questions-assumptions.md) – Open questions and assumptions with owners + due dates

## Evidence schema (how to read these docs)

These docs are evidence-based. Every claim should be traceable to an evidence ID that maps to a screen and control.

* Screen prefixes: `HS` (Home/Search), `SR` (Search Results), `HD` (Hotel Details/Rooms), `CO` (Checkout/Booking Details), `CF` (Confirmation)
* Evidence ID pattern: `<PREFIX>-<n>` (e.g., `HS-1`)

## Notes / status

- Screenshots were provided via the Jira ticket attachments (HotelBooking.png); only a home/booking form screen is visible in the evidence so far. Any steps outside that screen are marked `UNKNOWN` and captured in [questions-assumptions.md](questions-assumptions.md).
