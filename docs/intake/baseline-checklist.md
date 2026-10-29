# SCRUM-25 — Baseline Inputs Intake Checklist

As part of [SCRUM-25], this checklist defines the minimum baseline inputs required to produce an evidence-based capability/gap analysis for the Hotel Booking Web Application.

> Scope: documentation/process only. Do not implement new app features in SCRUM-25.

---

## 1) Required Screenshots (Minimum)

Provide at least **one** full-page screenshot covering the primary user journey **and** global navigation.

** Screenshot coverage must include:**

- [ ] Full-page: Search/Results OR Booking/Checkout (whichever is present in the app)
- ] Global navigation visible (header/surrounding navigation controls)
- [ ] Key UI elements visible if applicable: dates, guests/rooms selector, hotel/room list or details, and a booking/CTO call-to-action (BOOK, Reserve, Submit, etc.)
- ] Legible text (no blurry, cropped, or too-small to read)

**Roles coverage (required):**

- ] Guest role screens included
- [ ] Admin role screens included (if admin exists)
- ] Explicit statement: "Admin is not supported" (if only guest exists)

---

## 2) General Screenshot Quality Rules

- [ ] Full-page capture (instead of a small crop)
- ] High enough resolution to read field labels and values
- [ ] No secrets or PII in the capture (redact or recapture if needed)
- [ ] If you include the browser URL bar, confirm no tokens/secrets are visible

---

## 3) Non-screenshot Inputs (Required)

Attach the filled templates below (repo-repo or external link acceptable).

- [ ] App description (5-10 bullets) using `/docs/intake/app-description-template.md`
- [ ] Constraints (env, data, mocks/real integrations, limitations) using `/docs/intake/constraints-template.md`
- ] Submission metadata (using `/docs/intake/submissions/` conventions, see readme in that folder)

---

## 4) Validation Gate — Ready for Evidence-based Analysis

A submission is **Ready for analysis** when all of the following are true:

- [] Minimum screenshot coverage is present and legible
- [] Non-screenshot templates are complete (app description + constraints)
- [] ROLES are clearly stated (guest only vs admin exists)
- ] Environment URL is provided (local/dev/stage)

---

## 5) Maintainer Gap-Request Template (Paste-able)

Use this when inputs are incomplete/illegible:

**Submission Status: INCOMPLETE***

Thank you! To make this submission ready for evidence-based analysis, please provide the missing items():

- [] Missing/illegible screenshot: <(describe)
- [] Missing app description bullet(s): (describe)
- [] Missing constraints info: (describe)
- [] ROLE coverage unclear: (state guest/office admin or "admin not supported")
- ] Environment URL missing (e.g., local/dev/stage)

# Next Step
Once the above items are supplied, we will mark the submission as **Ready for Analysis** and start the follow-up story on current capabilities, gaps, and prioritized enhancements.
