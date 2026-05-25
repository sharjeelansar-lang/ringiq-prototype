# RingIQ Prototype — Daily Work Report

---

## Overview

This document covers everything built for the RingIQ Automated Client Enrollment Portal prototype. The portal replaces a fully manual onboarding process — previously, every new client practice required a developer to hand-craft a MongoDB document, provision a Twilio number via the Twilio Console, and coordinate credentials over Slack. Everything below is now handled through a polished, authenticated web interface.

---

## 1. Login Screen

**What was built:**
A full authentication screen at `/login` with a dark-themed card UI. Operators enter their email and password to receive a signed JWT stored in an `httpOnly` cookie (`ringiq-session`). The screen is the entry point for the entire portal.

**Before (manual process):**
There was no web UI. Developers accessed MongoDB Atlas and the Twilio Console directly using shared credentials stored in a team notes document. There was no concept of individual operator accounts or audit trails.

**What it includes:**
- Email + password form with inline validation
- JWT-based session issued on successful login (signed with `jose`, 7-day expiry)
- `httpOnly` cookie prevents client-side JavaScript from accessing the token
- Redirect to `/dashboard` on success; redirect to `/login` on any unauthenticated request
- Dark slate design with `-webkit-box-shadow` autofill override so browser password managers don't break the dark theme
- `color-scheme: dark` applied globally so the browser uses dark-mode autofill colors

---

## 2. Dashboard — Business Registry

**What was built:**
The main screen at `/dashboard`. Shows all enrolled practices pulled live from MongoDB Atlas, with stats and a sortable registry table.

**Before (manual process):**
To see how many practices were onboarded, a developer opened MongoDB Atlas, navigated to the `offices` collection, and eyeballed the document count. There was no status breakdown, no created-date visibility, and no way for a non-technical operator to check.

**What it includes:**
- **Stats strip** — full-width horizontal bar with four live counters: Total Enrolled, Live Production, Internal Testing, Active Today. Each cell has an icon, numeric value, and label. Separated by vertical dividers.
- **Registry table** — columns: Practice Name (+ MongoDB ID), Clean Name, Status badge, Timezone, Created date, Actions menu.
- **Status badges** — `Live` (emerald) and `Testing` (amber) with icon indicators.
- **Left-accent hover** — `border-l-2 border-l-transparent hover:border-l-cyan-500` on each row signals interactivity without cluttering the default state.
- **Actions dropdown** — three-dots menu per row with Edit and Delete options. Rendered with `position: fixed` using `getBoundingClientRect()` so it always appears above all other content regardless of container layout.
- **Loading skeleton** — staggered fade effect across skeleton rows while data loads.
- **Empty state** — centered icon card shown when no practices are registered yet.
- **Refresh button** — re-fetches from MongoDB without a full page reload.
- **"Add Business" CTA** — routes to the intake wizard.

---

## 3. Business Intake Wizard

**What was built:**
A 3-step wizard at `/dashboard/businesses/new` for enrolling a new practice. Replaces the manual MongoDB document creation process end-to-end.

**Before (manual process):**
Onboarding a new practice required a developer to:
1. Open MongoDB Atlas and manually create a new document in the `offices` collection, filling in ~20+ fields from a template.
2. Open the Twilio Console, navigate to sub-accounts, create one manually, then go to Phone Numbers, search by area code, purchase a number, and copy the SID.
3. Paste the SID and phone number back into the MongoDB document.
4. Share the office ID and Twilio SID over Slack with whoever needed them.
This process took 20–40 minutes per practice and had a high error rate from manual copy-paste.

**What it includes:**

**Step 1 — Practice Profile:**
- Practice Display Name, Corporate Clean Name
- Environment Status toggle (Internal Testing / Live Production)
- EHR identifiers: CPMID and SyeLocation ID
- Phone Numbers section: Inbound Tracking Number (10-digit) and Public Transfer Number (E.164 format, optional)
- Per-step Zod validation using `.pick()` — only validates the current step's fields so future steps never show premature errors

**Step 2 — Twilio Provisioning Widget:**
An embedded 3-sub-step widget that handles the entire Twilio setup inline:
- **Sub-step 1:** Creates a Twilio sub-account under the main account using the practice's friendly name. Each practice gets its own isolated Twilio sub-account for billing and number management separation.
- **Sub-step 2:** Area code search — queries `availablePhoneNumbers('US').local` and displays up to 8 available numbers with locality, region, voice/SMS capability icons. Numbers are selectable from the results list.
- **Sub-step 3:** Purchase confirmation — purchases the selected number using the sub-account's credentials (`twilio(subSid, subToken)`), which ties the number directly to that practice's sub-account in Twilio. Auto-fills the Inbound Phone field in the form on success.
- Test mode support: when `TWILIO_TEST_MODE=true`, all steps return simulated responses so the wizard can be exercised without a real Twilio account.
- Skip option for entering a number manually.

**Step 3 — Site & Schedule:**
- Timezone selector (full IANA timezone list)
- Street address, city, state (dropdown), ZIP code
- Business hours for Monday–Friday, Saturday, Sunday (open/close time pickers)
- Internal working hours / doctor lunch block field

**Submission:**
- On "Register Business", the full form data is validated against the complete Zod schema and posted to `POST /api/offices`.
- The API builds a structured MongoDB `officeDocument` including `twilioNumbers` array (with number, SID, and sub-account SID), working hours object, address, EHR metadata, and status.
- Success screen shows the new MongoDB Office ID and redirects to the dashboard after 2.5 seconds.

**Horizontal step bar:** Shows Profile → Twilio → Schedule with completion checkmarks, active step highlight, and a progress bar that fills as steps complete.

---

## 4. Business Detail Page

**What was built:**
A read-only data view at `/dashboard/offices/[id]` showing all stored fields for an enrolled practice.

**Before (manual process):**
To look up a practice's inbound number, timezone, or CPMID, a developer had to open MongoDB Atlas, search by `_id`, and parse a raw JSON document.

**What it includes:**
- **Hero strip** — three full-width cards at the top surface the three most-accessed values immediately: Inbound Line (cyan accent), Timezone (violet accent), CPM ID (amber accent). No scrolling required to find critical identifiers.
- **Data panels** — six sections: Core Business, Telephony, EHR Mapping, Localization, Business Hours, Behavior Toggles. Each shows label/value pairs.
- Technical values (phone numbers, SIDs, MongoDB IDs) rendered in `font-mono text-cyan-400/80` to visually distinguish them from labels.
- All data is fetched server-side from MongoDB Atlas via the `GET /api/offices/[id]` route.

---

## 5. Account Settings Screen

**What was built:**
A full profile management screen at `/dashboard/settings` for the authenticated operator.

**Before (manual process):**
There was no UI for user management. Name or title changes required a developer to open MongoDB Atlas, find the user document in the `users` collection, and edit fields manually. Password resets required running a `bcrypt` hash script in the terminal and copying the result back into the database.

**What it includes:**
- **Identity strip** — compact header bar showing avatar (with derived initials), display name, email, job title, and "Active" status badge.
- **Profile Information card** — Display Name, Job Title, Phone Number fields. Email is shown as read-only (not editable). Fields are disabled by default; an "Edit Profile" button in the card header activates edit mode. A "Cancel" button reverts to the last saved values without a page reload.
- **Change Password card** — Current Password, New Password, Confirm New Password. Client-side match validation before the request is sent. Server validates the current password with `bcrypt.compare` before accepting the new one.
- Full-width two-column layout: Profile and Password cards sit side-by-side. Both cards grow to equal height; Save button anchored at the bottom of each card with `mt-auto`.

**API endpoints built:**
- `PATCH /api/auth/profile` — updates `name`, `title`, `phone` in the `users` collection. If the name changed, reissues the JWT cookie so the Sidebar reflects the new name immediately without requiring a logout.
- `PATCH /api/auth/password` — validates current password, hashes new password with `bcrypt` (12 rounds), updates `users.passwordHash`.
- `GET /api/auth/me` — returns the authenticated user's profile fields (`name`, `email`, `title`, `phone`) read directly from MongoDB.

---

## 6. Sidebar

**What was built:**
A persistent navigation sidebar present on all dashboard screens, showing the authenticated operator's real identity.

**Before:**
The sidebar showed hardcoded "Admin" / "admin@ringiq.ai" strings regardless of who was logged in.

**What it includes:**
- Fetches the authenticated user's profile from `GET /api/auth/me` on mount.
- Renders the operator's actual Display Name, email, and a two-letter avatar derived from the name (e.g., "TA" for "Testing Admin").
- Avatar uses a cyan-to-indigo gradient background.
- Navigation items: Dashboard, Settings.
- Logout button calls `POST /api/auth/logout` and redirects to `/login`.

---

## 7. Twilio Sub-Account → Number Ownership Tracking

**What was built:**
Full traceability between a purchased Twilio phone number and the sub-account it belongs to, stored persistently in MongoDB.

**Before:**
There was no record in the database of which Twilio sub-account owned a given practice's phone number. The sub-account SID was created, used once, and then lost. Future number management (billing lookup, number migration, sub-account suspension) had no anchor in the data.

**What it includes:**
- `twilioSubAccountSid` field added to the Zod schema and form.
- When provisioning completes, `ProvisioningSection` captures `result.subAccount.sid` and stores it via `form.setValue('twilioSubAccountSid', ...)` alongside the phone number and number SID.
- The `POST /api/offices` route stores `subAccountSid` inside the `twilioNumbers` array entry in MongoDB: `{ number, sid, subAccountSid, title, disabled }`.
- The number purchase itself (`POST /api/twilio/numbers/purchase`) uses `getTwilioSubClient(subSid, subToken)` — meaning the number is purchased under the sub-account's credentials, making it owned by that sub-account in Twilio's system, not the main account.

---

## 8. Design System & Visual Language

**What was built:**
A cohesive dark enterprise design system applied consistently across all screens.

**Core palette:**
- Background: `#020617` (slate-950)
- Surfaces: `slate-900`, `slate-800`
- Primary accent: `cyan-500` — used on active states, CTAs, hero strip highlights, progress bars
- Secondary accents: `emerald-500` (success/live), `amber-500` (testing/warning), `red-500` (destructive)
- Typography: monospace (`font-mono`) for all technical values (IDs, phone numbers, SIDs)

**Component patterns:**
- All primary CTA buttons: `bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25`
- Form inputs: `bg-slate-900 border-slate-700/60` with `focus:ring-cyan-500/60`
- Cards: `border border-slate-800/60 bg-slate-900/30`
- Step indicators: emerald fill for completed, cyan fill for active, slate for pending

---

## Summary of Files Built

| File | Description |
|---|---|
| `app/login/page.tsx` | Login screen |
| `app/globals.css` | Global styles, dark-mode autofill override, design tokens |
| `components/auth/LoginCard.tsx` | Login form card component |
| `app/dashboard/page.tsx` | Dashboard — stats strip + business registry |
| `app/dashboard/settings/page.tsx` | Account Settings — profile + password management |
| `app/dashboard/offices/[id]/page.tsx` | Business Detail — hero strip + data panels |
| `app/dashboard/businesses/new/page.tsx` | Business Intake Wizard — 3-step enrollment flow |
| `components/dashboard/Sidebar.tsx` | Navigation sidebar with live user identity |
| `components/dashboard/BusinessTable.tsx` | Registry table with actions dropdown |
| `components/form/TwilioProvisioningWidget.tsx` | Twilio sub-account + number provisioning widget |
| `components/form/sections/CoreBusinessSection.tsx` | Practice name + environment fields |
| `components/form/sections/EHRMappingSection.tsx` | CPMID + SyeLocation ID fields |
| `components/form/sections/TelephonySection.tsx` | Inbound + public transfer number fields |
| `components/form/sections/ProvisioningSection.tsx` | Twilio widget wrapper + form sync |
| `components/form/sections/LocalizationSection.tsx` | Address + timezone + business hours fields |
| `components/ui/FormField.tsx` | Shared form field, input, and select components |
| `lib/schema.ts` | Zod schema for the full business form |
| `lib/twilio.ts` | Twilio client factory (main, API key, sub-account) |
| `lib/mongodb.ts` | MongoDB Atlas connection singleton |
| `app/api/auth/login/route.ts` | POST — authenticate operator, issue JWT cookie |
| `app/api/auth/logout/route.ts` | POST — clear session cookie |
| `app/api/auth/me/route.ts` | GET — return authenticated user's profile |
| `app/api/auth/profile/route.ts` | PATCH — update name, title, phone; reissue JWT |
| `app/api/auth/password/route.ts` | PATCH — validate + update password hash |
| `app/api/offices/route.ts` | GET — list all offices; POST — create new office |
| `app/api/offices/[id]/route.ts` | GET — single office; DELETE — remove + release Twilio number |
| `app/api/twilio/subaccount/route.ts` | POST — create Twilio sub-account |
| `app/api/twilio/numbers/route.ts` | GET — search available numbers by area code |
| `app/api/twilio/numbers/purchase/route.ts` | POST — purchase number under sub-account |

---

*Generated: 2026-05-26*
