# RingIQ — Full Build Plan & Checklist

> **How to use this file:** Each checkbox tracks one deliverable. Check it off as it ships. Work top-to-bottom unless a dependency forces a different order. The phases are ordered so that each one can be demoed independently before the next begins.

---

## Legend
- [x] Built & verified working
- [ ] Not yet built

---

## Current State (What Exists Today)

### Infrastructure & Auth
- [x] Next.js 16 App Router project, TypeScript strict, Tailwind v4
- [x] MongoDB Atlas connection singleton (`lib/mongodb.ts`)
- [x] JWT-based admin auth (`lib/auth.ts`, `app/api/auth/*`)
- [x] Admin login page (`app/login/page.tsx`)
- [x] Root redirect (`app/page.tsx` → dashboard or login)

### Admin Dashboard
- [x] Dashboard home page (`app/dashboard/page.tsx`)
- [x] Sidebar navigation (`components/dashboard/Sidebar.tsx`)
- [x] Settings page (`app/dashboard/settings/page.tsx`)
- [x] Enrolled offices table with delete modal (`components/dashboard/BusinessTable.tsx`)
- [x] Office detail view (`app/dashboard/offices/[id]/page.tsx`)

### 4-Step Admin Enrollment Wizard (`/dashboard/businesses/new`)
- [x] Wizard shell with step tabs and shared RHF instance (`app/dashboard/businesses/new/page.tsx`)
- [x] Pre-generated `mongoOfficeId` via `generateMongoId()` on page load
- [x] Step 1 — Practice Profile
  - [x] Core Business sub-section: `practiceDisplayName`, `corporateCleanName` (auto-slug), `environmentStatus`, `mongoOfficeId` read-only (`CoreBusinessSection.tsx`)
  - [x] EHR Mapping sub-section: `cpmid`, `syeLocationId`, `emailCompany` (`EHRMappingSection.tsx`)
  - [x] Telephony sub-section: `inboundPhone`, `vapiAssistantPhoneNumber`, `publicNumber`, `failoverTransferNumber`, `twilioSid/SubAccountSid/SubAccountToken` (`TelephonySection.tsx`)
  - [x] Behavior toggles: `recordingDisclosure`, `allowSameDayBookings`, `failoverRingCount`, `maxSlotSearchRounds`, `mandatoryEmailProfile` (`BehaviorTogglesSection.tsx`)
- [x] Step 2 — Twilio Setup
  - [x] Twilio provisioning widget: create sub-account → search numbers → purchase (`TwilioProvisioningWidget.tsx`)
  - [x] Auto-fill of telephony fields on purchase success
  - [x] localStorage bridge (`ringiq_twilio_creds`) to survive React unmount between steps
- [x] Step 3 — VAPI AI Setup
  - [x] "Deploy Iris" button → `POST /api/vapi/assistant` → stores `vapiAssistantId`
  - [x] "Link Number" button → `POST /api/vapi/phone-number/import`
  - [x] Credential recovery from localStorage on mount
  - [x] Success card: "Iris is deployed and live"
- [x] Step 4 — Site & Schedule: `timezone`, `streetAddress`, `city`, `state`, `zipCode`, `operationalHours`, `internalWorkingHours` (`LocalizationSection.tsx`)
- [x] Final Submit: full Zod validation → `POST /api/offices` → MongoDB document → redirect with success toast

### API Routes
- [x] `GET /api/offices` — list all offices
- [x] `POST /api/offices` — create office (full document write to MongoDB)
- [x] `GET /api/offices/[id]` — fetch single office
- [x] `DELETE /api/offices/[id]` — release Twilio number, delete MongoDB doc
- [x] `POST /api/twilio/subaccount` — create Twilio sub-account
- [x] `GET /api/twilio/numbers` — search available numbers by area code
- [x] `POST /api/twilio/numbers/purchase` — buy number on sub-account
- [x] `POST /api/vapi/assistant` — create Iris assistant with full parameterized prompt
- [x] `POST /api/vapi/phone-number/import` — import Twilio number into VAPI and link to assistant

### Lib / Utilities
- [x] `lib/vapi-prompt.ts` — full parameterized Iris system prompt (`buildSystemPrompt`)
- [x] `lib/twilio.ts` — `getTwilioClient()`, `getTwilioMainClient()`, `getTwilioSubClient()`
- [x] `lib/schema.ts` — Zod schema for the full wizard form
- [x] `lib/utils.ts` — `generateMongoId()`, `slugifyDisplayName()`, `TIMEZONES`, `US_STATES`
- [x] `types/business.ts` — `BusinessFormData`, `MockBusiness`, `OperationalHours`

---

## Phase 1 — Public Landing Page

> **Goal:** A marketing-quality public page at `/landing` (or `/`) that explains RingIQ and drives prospects to the signup form. No auth required.

### Page & Layout
- [ ] Create public layout (`app/(public)/layout.tsx`) — no sidebar, no auth guard, minimal shell
- [ ] Landing page (`app/(public)/landing/page.tsx` or `app/page.tsx` repurposed)
  - [ ] Hero section: headline, subheadline, primary CTA button "Get Started Free" → `/onboard`
  - [ ] How It Works section: 3-step explainer (Sign Up → We Configure → Iris Answers Your Calls)
  - [ ] Service Plans section: Free Nights & Weekends / 3-Ring Backup / Full Service — pricing cards
  - [ ] Social proof / features section (voice AI, EHR-connected, optometry-specific)
  - [ ] Footer: contact info, legal links placeholder
- [ ] Responsive mobile layout

---

## Phase 2 — Public Customer Signup Form (`/onboard`)

> **Goal:** A consumer-friendly, no-login form that captures everything needed to configure a new practice. On submit it creates a `prospect` record in MongoDB with `status: "pending"`. No Twilio or VAPI calls happen here.

### Schema & Types
- [ ] Add `ProspectFormData` Zod schema to `lib/schema.ts` (separate from wizard schema)
- [ ] Add `Prospect` TypeScript interface to `types/business.ts`
- [ ] Define new fields not in current wizard (see field list below)

### New Fields Captured at Signup (not in wizard today)
- [ ] `locationNote` — free text, context note about this office location for Iris
- [ ] `greetingNote` — free text, what Iris should say/know at greeting
- [ ] `afterHoursPolicy` — enum or free text: voicemail / take-a-message / emergency-only
- [ ] `onCallEmergencyMobile` — E.164 phone, on-call doctor emergency contact for Iris
- [ ] `voiceSelection` — enum: `savannah` | `emma` | `lily` (currently hardcoded as `savannah`)
- [ ] `servicePlan` — enum: `free_nights_weekends` | `three_ring_backup` | `full_service` (currently hardcoded as `"dashboard-399"`)
- [ ] `phoneProvider` — free text / select, informational (AT&T, Comcast, RingCentral, etc.)
- [ ] `priorityTransferNumber` — E.164, optional priority routing destination
- [ ] `specialCallRoutes.billing` — E.164, optional billing/insurance transfer number
- [ ] `specialCallRoutes.medical` — E.164, optional medical records transfer number
- [ ] `specialCallRoutes.other` — E.164, optional general transfer number
- [ ] `emailCompany` — collected here (currently admin-filled; confirm with client)
- [ ] `contactName` — prospect's own name (for approval queue display)
- [ ] `contactEmail` — prospect's email (for follow-up comms)
- [ ] `contactPhone` — prospect's direct phone
- [ ] `ehrSystem` — select: CrystalPM / other (informational for admin)

### Fields Collected at Signup That Already Exist in Wizard
- [ ] `practiceDisplayName` (Office Name)
- [ ] `timezone`
- [ ] `streetAddress`, `city`, `state`, `zipCode`
- [ ] `publicNumber` (Office Main Phone Number)
- [ ] `failoverTransferNumber` (Transfer-Through Number)
- [ ] `operationalHours` (Mon–Fri, Sat, Sun open/close + closed flag)
- [ ] `internalWorkingHours` (lunch blocks)

### UI — Signup Form (`app/(public)/onboard/page.tsx`)
- [ ] Page layout: centered card, RingIQ branding, no sidebar
- [ ] Multi-section form (not a wizard — single scrollable page or 2-3 short accordion sections)
  - [ ] **Section A — Your Practice:** Office Name, Timezone, Address (Street/City/State/ZIP)
  - [ ] **Section B — Phone Numbers:** Main office number, Transfer-through number, AI transfer number, Priority transfer (optional), Special routes: Billing / Medical / Other (optional)
  - [ ] **Section C — Office Hours:** Mon–Fri hours, Saturday hours, Sunday hours (each with open/close + closed toggle), Lunch block free text
  - [ ] **Section D — Iris Configuration:** Voice selection (radio cards with voice name + description), After-hours policy, On-call emergency mobile (optional), Greeting note (optional), Location note (optional)
  - [ ] **Section E — Service Plan:** Three pricing cards with plan names, descriptions, and estimated volumes
  - [ ] **Section F — Your Contact Info:** Contact name, email, phone, EHR system (select)
- [ ] Inline Zod validation (field-level, not submit-only)
- [ ] Prominent reminder block: "Before we go live, you will need to remove any existing call greeting, voicemail pickup, or call ladder from your main line so Iris can answer cleanly."
- [ ] Submit button: "Submit for Review"
- [ ] Success screen: "We've received your submission! A RingIQ team member will review and reach out within 1 business day."

### API Route
- [ ] `POST /api/prospects` — validate `ProspectFormData`, write to `prospects` collection with `status: "pending"`, `submittedAt: new Date()`
- [ ] Return `{ success: true, prospectId }` on success

### MongoDB — `prospects` Collection
- [ ] Document shape mirrors signup fields + system fields:
  ```
  {
    _id: ObjectId,
    status: "pending" | "approved" | "rejected",
    submittedAt: Date,
    approvedAt?: Date,
    approvedBy?: string,
    officeId?: string,          // set when approved → links to offices collection
    // all signup fields ...
  }
  ```

---

## Phase 3 — Admin Approval Queue

> **Goal:** A dashboard view at `/dashboard/queue` that lists all pending prospects. Admin reviews a record and either approves (triggers wizard pre-fill) or rejects it.

### Page & UI
- [ ] Approval queue page (`app/dashboard/queue/page.tsx`)
- [ ] Sidebar nav entry: "Approval Queue" with pending count badge
- [ ] Queue table columns: Practice Name, Contact, Service Plan, Submitted Date, Status, Actions
- [ ] Status badges: Pending (amber), Approved (green), Rejected (red)
- [ ] Prospect detail modal or drawer: shows all submitted fields read-only
- [ ] "Approve & Auto-Configure" button on each pending row / in detail view
- [ ] "Reject" button with optional rejection reason (stored on the record)
- [ ] Rejected records stay in the table, filterable by status
- [ ] Empty state: "No pending signups" illustration

### API Routes
- [ ] `GET /api/prospects` — list prospects (admin only), supports `?status=pending|approved|rejected` filter
- [ ] `GET /api/prospects/[id]` — fetch single prospect
- [ ] `PATCH /api/prospects/[id]` — update status (`approved` / `rejected`), set `approvedAt`, `approvedBy`
- [ ] `DELETE /api/prospects/[id]` — hard delete (admin only, for cleanup)

### Auth Guard
- [ ] All `/api/prospects/*` routes require valid admin JWT (reuse existing `lib/auth.ts` pattern)
- [ ] Queue page redirects to `/login` if not authenticated

---

## Phase 4 — Wizard Auto-Fill from Prospect

> **Goal:** When an admin clicks "Approve & Auto-Configure" on a prospect, the system navigates to the existing 4-step wizard at `/dashboard/businesses/new` with every matching field pre-populated from the prospect record. The admin reviews, adjusts if needed, then runs provisioning and registers normally.

### URL Pattern
- [ ] Wizard accepts an optional `?prospectId=xxx` query param
- [ ] On mount, if `prospectId` is present, fetch `GET /api/prospects/[id]` and `setValue()` all matching fields

### Field Mapping (Prospect → Wizard)
- [ ] `practiceDisplayName` → `practiceDisplayName` (triggers auto-slug)
- [ ] `timezone` → `timezone`
- [ ] `streetAddress`, `city`, `state`, `zipCode` → respective fields
- [ ] `publicNumber` → `publicNumber`
- [ ] `failoverTransferNumber` → `failoverTransferNumber`
- [ ] `operationalHours` → `operationalHours`
- [ ] `internalWorkingHours` → `internalWorkingHours`
- [ ] `voiceSelection` → drives VAPI assistant creation voice (currently hardcoded — needs to be wired)
- [ ] `servicePlan` → `servicePlan` (currently hardcoded `"dashboard-399"` — needs to be a form field)
- [ ] `emailCompany` → `emailCompany`
- [ ] `locationNote`, `greetingNote`, `afterHoursPolicy`, `onCallEmergencyMobile` → new fields stored on the office record
- [ ] `priorityTransferNumber`, `specialCallRoutes.*` → stored on office record
- [ ] `phoneProvider` → stored on office record (informational)
- [ ] `cpmid` → admin fills at this step (NOT from prospect — resolved from CrystalPM/DB)
- [ ] `syeLocationId` → admin fills at this step (default: 8)

### UI Changes to Wizard
- [ ] "Pre-filled from signup" read-only badge on auto-populated fields so admin can see what came from the customer
- [ ] Prospect info banner at the top of the wizard: "Configuring: {practiceName} — submitted by {contactName} on {date}"
- [ ] On successful final submit: `PATCH /api/prospects/[id]` sets status to `"approved"` and stores the new `officeId`

### New Wizard Fields (schema + UI additions)
- [ ] `servicePlan` — radio/select in Step 1, replaces hardcoded `"dashboard-399"` in `POST /api/offices`
- [ ] `voiceSelection` — select in Step 3 (or Step 1 behavior toggles), wired into `POST /api/vapi/assistant`
- [ ] `locationNote` — textarea in Step 1 or Step 4
- [ ] `greetingNote` — textarea in Step 1
- [ ] `afterHoursPolicy` — select in Step 4
- [ ] `onCallEmergencyMobile` — phone input in Step 1 telephony or Step 4
- [ ] `priorityTransferNumber` — phone input in Step 1 telephony
- [ ] `specialCallRoutes.billing/medical/other` — phone inputs in Step 1 telephony
- [ ] `phoneProvider` — text/select in Step 1 telephony (informational, stored only)
- [ ] `contactName`, `contactEmail`, `contactPhone` — read-only display in wizard banner (from prospect, not saved to office doc separately)

---

## Phase 5 — Schema, Prompt & Delete Cleanup

> **Goal:** Wire new fields into the VAPI prompt, office document, and cleanup flows.

### Zod Schema (`lib/schema.ts`)
- [ ] Add all new fields to `BusinessFormData` Zod schema
- [ ] Add per-step validation for new fields in `STEP_SCHEMAS`

### VAPI Prompt (`lib/vapi-prompt.ts`)
- [ ] Add `voiceSelection` to `PromptContext` — drives `voice.voiceId` in assistant creation
- [ ] Add `greetingNote` to `PromptContext` — injected into Iris's greeting section
- [ ] Add `locationNote` to `PromptContext` — injected into Step 7 (location)
- [ ] Add `afterHoursPolicy` to `PromptContext` — injected into after-hours handling section
- [ ] Add `onCallEmergencyMobile` to `PromptContext` — injected into emergency handling section
- [ ] Add `specialCallRoutes` to `PromptContext` — billing/medical/other transfer numbers injected as conditional transfer destinations
- [ ] Add `priorityTransferNumber` to `PromptContext` — injected as secondary transfer destination

### MongoDB Office Document (`POST /api/offices`)
- [ ] Store `servicePlan` from form (remove hardcoded `"dashboard-399"`)
- [ ] Store `voiceSelection`
- [ ] Store `locationNote`, `greetingNote`, `afterHoursPolicy`, `onCallEmergencyMobile`
- [ ] Store `priorityTransferNumber`, `specialCallRoutes`
- [ ] Store `phoneProvider`

### Office Detail View (`app/dashboard/offices/[id]/page.tsx`)
- [ ] Display all new fields in the read-only detail view

### Delete Cleanup (currently incomplete — flagged in CONTEXT.md)
- [ ] `DELETE /api/offices/[id]` — call `DELETE https://api.vapi.ai/assistant/{vapiAssistantId}` to remove orphaned VAPI assistant
- [ ] `DELETE /api/offices/[id]` — call `client.api.v2010.accounts(subAccountSid).update({ status: 'closed' })` to close the Twilio sub-account after number release

### VAPI Update Flow (flagged in CONTEXT.md as not started)
- [ ] `PATCH /api/vapi/assistant/[id]` — update assistant system prompt when practice config changes
- [ ] "Re-deploy Iris" button on office detail page — triggers prompt rebuild and PATCH

---

## Phase 6 — End-to-End QA & Polish

- [ ] Test full prospect → approval → wizard pre-fill → provisioning → register flow end-to-end
- [ ] Verify all new fields appear correctly in the saved MongoDB office document
- [ ] Verify VAPI assistant prompt contains all new injected fields
- [ ] Verify delete flow removes VAPI assistant and closes Twilio sub-account
- [ ] Mobile responsive pass on landing page and signup form
- [ ] Error states on signup form (network failure, duplicate submission)
- [ ] Error states on approval queue (approve fails, prospect already approved)
- [ ] Loading / skeleton states on queue table

---

## Build Order Summary

```
Phase 1  → Landing page          (visual, standalone, no backend)
Phase 2  → Public signup form    (/onboard + POST /api/prospects)
Phase 3  → Admin approval queue  (/dashboard/queue + GET/PATCH /api/prospects)
Phase 4  → Wizard auto-fill      (prospectId query param + field mapping)
Phase 5  → Schema / prompt / delete cleanup  (wire new fields throughout)
Phase 6  → QA pass
```

Each phase is independently demoable. Phase 2 can be tested before Phase 3 exists (prospect lands in DB, admin reads it directly). Phase 4 requires Phase 2 and 3 to be complete.

---

## Open Decisions (Needs Confirmation Before Building)

- [ ] **Signup field set** — Is the Phase 2 field list complete? Which fields are required vs optional on the public form?
- [ ] **CPMID source** — Confirm: customer does NOT enter CPMID; admin resolves it from CrystalPM lookup or enters it at approval step.
- [ ] **Email Company Code source** — Customer-provided at signup or admin-resolved at approval?
- [ ] **Voice options** — Which voices should customers choose from? (Currently only `Savannah` is built and tested in VAPI.)
- [ ] **Twilio provisioning timing** — Confirmed: runs at admin approval step, not at public signup.
- [ ] **New fields in Iris prompt** — Confirm which of the new fields (greeting note, location note, after-hours policy, on-call mobile, special call routes) Iris should actively use vs just store for reference.
- [ ] **Approval action flow** — Confirmed: review record → "Approve & Auto-Configure" → pre-filled wizard → admin edits → Register Business.
