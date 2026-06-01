# RingIQ Prototype — Full Context Document

> **Purpose:** LLM context handoff. Covers every field, every step, every API call, every constraint, and the full current state of the codebase as of 2026-05-30. Intended to be pasted as context into any LLM continuing work on this project.

---

## What Is RingIQ?

RingIQ is an **internal SaaS portal** used by RingIQ staff to enroll eye-doctor practices onto an AI-powered phone reception system. The product automates inbound patient calls for optometry clinics — when a patient calls the clinic's tracking number, an AI voice agent (named **Iris**) answers, handles appointment scheduling, cancellations, rescheduling, and transfers, using the clinic's real EHR system (Schedule Your Exam / CrystalPM) as the data source.

**What the portal does:**
- Enrolls a new practice by provisioning a dedicated Twilio phone number, creating a VAPI AI voice agent with a full scheduling script personalized to that clinic, and saving a complete configuration record to MongoDB.
- Provides a dashboard for staff to view, manage, and delete enrolled practices.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 — App Router, TypeScript strict mode |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form + Zod, `mode: 'onSubmit'`, per-step partial schemas |
| Database | MongoDB Atlas — cluster `ringiq-prototype.uehsvad.mongodb.net` |
| Phone provisioning | Twilio — sub-account per practice |
| AI voice orchestration | VAPI |
| LLM (inside VAPI) | OpenAI `gpt-5.1-chat-latest` |
| Speech-to-text | Deepgram `nova-3-medical`, language `en` |
| Text-to-speech | Vapi built-in voice `Savannah` |
| EHR integration | Schedule Your Exam (SYE) / CrystalPM via MCP tools |

**Credentials rule:** All secrets go in `.env` (never `.env.local`, never hardcoded).

---

## Environment Variables

```env
# MongoDB Atlas connection string
MONGODB_URI=

# Twilio — TEST/restricted account (not used in any real operations, kept for reference)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# Twilio — PRODUCTION account (used for sub-account creation and number search)
TWILIO_PROD_ACCOUNT_SID=
TWILIO_PROD_AUTH_TOKEN=

# Set to "true" to skip actual Twilio + VAPI API calls and return mock data
TWILIO_TEST_MODE=

# VAPI platform API key
VAPI_API_KEY=
```

---

## Repo File Structure (relevant files only)

```
app/
  api/
    offices/
      route.ts                      — GET (list all offices) + POST (create new office)
      [id]/route.ts                 — GET (fetch single office) + DELETE (delete office)
    twilio/
      subaccount/route.ts           — POST: create a Twilio sub-account for a practice
      numbers/
        available/route.ts          — GET: search available Twilio numbers by area code
        purchase/route.ts           — POST: buy a specific number on the sub-account
    vapi/
      assistant/route.ts            — POST: create a VAPI AI assistant (Iris) with full prompt
      phone-number/
        import/route.ts             — POST: import the Twilio number into VAPI and link to assistant
  dashboard/
    businesses/
      new/page.tsx                  — 4-step onboarding wizard (the main enrollment flow)
    offices/
      [id]/page.tsx                 — Office detail view (read-only)

components/
  dashboard/
    BusinessTable.tsx               — Dashboard table: list of enrolled practices + delete modal
    Sidebar.tsx                     — Left sidebar navigation
  form/
    sections/
      CoreBusinessSection.tsx       — Wizard Step 1 sub-section: practice name + auto-slug
      EHRMappingSection.tsx         — Wizard Step 1 sub-section: CPMID, emailCompany, syeLocationId
      TelephonySection.tsx          — Wizard Step 1 sub-section: phone numbers + behavior toggles
      ProvisioningSection.tsx       — Wizard Step 2: Twilio provisioning (wraps the widget)
      VapiSetupSection.tsx          — Wizard Step 3: deploy Iris + link VAPI number
      LocalizationSection.tsx       — Wizard Step 4: address, timezone, business hours
    TwilioProvisioningWidget.tsx    — Self-contained UI component for the full Twilio flow

lib/
  mongodb.ts                        — MongoDB connection singleton
  twilio.ts                         — Twilio client factory functions
  vapi-prompt.ts                    — Full parameterized system prompt builder for VAPI
  schema.ts                         — Zod schema for the entire registration form
  utils.ts                          — generateMongoId(), slugifyDisplayName(), cn(), TIMEZONES, US_STATES, mock data

types/
  business.ts                       — TypeScript interfaces: BusinessFormData, MockBusiness, OperationalHours, etc.

scripts/
  seed-admin.js                     — Seeds an admin user into the database
```

---

## The 4-Step Onboarding Wizard

The wizard lives at `/dashboard/businesses/new`. It is a single-page React component (`new/page.tsx`) using one shared `react-hook-form` instance across all 4 steps. Each step validates only its own fields using `STEP_SCHEMAS` (Zod `.pick()` on the main schema).

The `mongoOfficeId` is pre-generated using `generateMongoId()` inside a `useEffect` on page load. This is critical because the VAPI prompt embeds the MongoDB office ID at assistant creation time (Step 3), but the MongoDB document is only created at the final submit — so the ID must be pre-generated and reused.

---

### Step 1 — Practice Profile

**Tab label:** "Profile" | **Icon:** Building2

Combines three sub-sections on a single screen: Core Business, EHR Mapping, and Telephony.

---

#### Sub-section: Core Business (`CoreBusinessSection.tsx`)

**`practiceDisplayName`** — `string`, required, min 2 chars
- The human-readable name of the practice. Example: `"Primary Eyecare Associates - Sterling Heights"`.
- **Auto-triggers:** When this field changes, `slugifyDisplayName()` is called and the result is written to `corporateCleanName` automatically via `useEffect`.

**`corporateCleanName`** — `string`, required, min 2 chars, **auto-populated**
- Snake_case slug derived from `practiceDisplayName`. Example: `"primary_eyecare_associates_sterling_heights"`.
- Used as a unique identifier in MongoDB and in system references. Displayed as read-only (auto-filled but can be edited).

**`environmentStatus`** — `"internal_testing" | "live_production"`, required, default: `"internal_testing"`
- Controls whether this practice record is treated as a test or a live production deployment.
- Stored in MongoDB as `officeStatus: "active"` (live_production) or `"testing"` (internal_testing).
- Affects how the practice appears in the dashboard.

**`mongoOfficeId`** — `string`, **auto-generated, read-only**
- Pre-generated MongoDB-compatible ObjectId hex string, created via `generateMongoId()` in a `useEffect` on page load.
- Embedded into the VAPI system prompt at assistant creation time (Step 3) as `RINGIQ_OFFICE_ID`.
- Later used as the `_id` of the MongoDB document when the office is saved.

---

#### Sub-section: EHR Mapping (`EHRMappingSection.tsx`)

**`emailCompany`** — `string`, optional
- EHR company identifier code. Example: `"tso"`, `"icare"`.
- Used by downstream email/EHR integrations to route messages to the right company.
- Stored in MongoDB under `email.company`.

**`cpmid`** — `string`, required, min 1 char
- CrystalPM / ChiroTouch store identifier. Example: `"6747"`.
- This is the most critical EHR field — it is embedded in the VAPI system prompt and used on **every single SYE/CPM tool call** by the AI agent. Without it, the agent cannot query appointments, availability, or patient records.
- Stored in MongoDB under `ehr.cpmid`.

**`syeLocationId`** — `number` (integer), required, min 1, default: `8`
- Schedule Your Exam (SYE) integer location ID for this specific clinic site. Example: `8`.
- Used on all `get_available_appointment_slots`, `validate_booking`, and `book_appointment` tool calls by the AI agent to scope scheduling to the correct physical location.
- Some practices have multiple SYE locations; this field hardcodes which one this practice maps to.
- Embedded in the VAPI system prompt as `SYE_LOCATION_ID`.
- Stored in MongoDB under `ehr.syeLocationId`.

---

#### Sub-section: Telephony + Behavior Toggles (`TelephonySection.tsx`)

**`inboundPhone`** — `string`, regex `/^\d{10}$/`, required
- The 10-digit Twilio tracking number that is the main RingIQ inbound line for this practice.
- Example: `"2313896122"`.
- **Auto-populated** from the Twilio provisioning result in Step 2 — the purchased number's digits are extracted and written here via `setValue('inboundPhone', digits)`.
- Stored in MongoDB inside `twilioNumbers` array as the "Main" entry.

**`vapiAssistantPhoneNumber`** — `string`, regex `/^\d{10}$/`, optional
- The 10-digit number that VAPI answers when Iris should pick up.
- Example: `"2313899335"`.
- **Auto-populated** from the Twilio provisioning result in Step 2 — same value as `inboundPhone` in the current prototype (one number serves both roles). In production these would be separate lines.
- Used in Step 3 to import the number into VAPI.

**`publicNumber`** — `string`, E.164 format (e.g. `+12488792388`), optional
- The office's public-facing main number — the one printed on business cards and the website.
- This is **not** the tracking number; it's the number patients already know.
- Embedded in the VAPI system prompt as `RINGIQ_PUBLIC_PHONE` — Iris gives this number to callers who want to call back or be transferred to staff, and uses it as the `transferCall` destination.
- Stored in MongoDB as `publicNumber`.

**`failoverTransferNumber`** — `string`, E.164 format, optional
- The number calls are forwarded to after the failover ring threshold (e.g. a second office line or answering service).
- Example: `"+15869916560"`.
- Stored in MongoDB as `failoverNumber`.

**`twilioSid`** — `string`, optional, **auto-populated**
- Twilio `PhoneNumber.sid` (e.g. `"PN..."`) of the purchased inbound tracking number.
- Auto-set in Step 2 from the purchase API response.
- Used in the DELETE route to release the number back to Twilio when a practice is deleted.
- Stored in MongoDB inside `twilioNumbers[0].sid`.

**`twilioSubAccountSid`** — `string`, optional, **auto-populated**
- The `AccountSID` of the Twilio sub-account created for this practice. Format: `"AC..."`.
- Auto-set in Step 2.
- Used in Step 3 as `twilioAccountSid` when importing the number into VAPI.
- Used in the DELETE route to create the sub-account client for number release.
- Stored in MongoDB as `twilioSubAccountSid`.

**`twilioSubAccountToken`** — `string`, optional, **auto-populated**
- The auth token of the Twilio sub-account. This is the secret credential for the sub-account.
- Auto-set in Step 2.
- Used in Step 3 as `twilioAuthToken` when importing the number into VAPI.
- Used in the DELETE route to authenticate the sub-account client.
- Stored in MongoDB as `twilioSubAccountToken`.
- **Critical note:** The Twilio SDK v6 returns `null` for `authToken` on `AccountInstance` when authenticated via API Key. The sub-account route uses AccountSID + AuthToken credentials (`getTwilioMainClient()`) specifically to ensure the auth token is returned properly.

**`vapiAssistantId`** — `string`, optional, **auto-populated**
- The VAPI-assigned UUID of the created Iris assistant. Format: `"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"`.
- Auto-set in Step 3 when the assistant is created.
- Stored in MongoDB as `vapiAssistantId`.

**`carrierTrunkName`** — `string`, optional
- SIP carrier trunk name for advanced VoIP routing. Not actively used in the current prototype.

**`failoverRingCount`** — `number` (int 1–5), default: `3`
- Number of rings before a call is forwarded to the failover number.

**`voipRoutingType`** — `literal('sip')`, locked
- Routing type for VoIP. Currently locked to `"sip"` in the schema.

**`recordingDisclosure`** — `boolean`, default: `true`
- When `true`, Iris includes a call recording notice in her greeting and at the start of the booking scenario.
- When `false`, all recording disclosure lines are stripped from the VAPI system prompt.
- Stored in MongoDB as `skipRecordingMessage: !recordingDisclosure`.

**`allowSameDayBookings`** — `boolean`, default: `false`
- Controls whether Iris offers same-day appointment slots.
- When `false`, the prompt instructs Iris to politely decline same-day requests and offer the next available future date.
- When `true`, Iris offers whatever SYE returns for today's date without restriction.

**`maxSlotSearchRounds`** — `number` (int 1–5), default: `3`
- How many rounds of slot searching Iris will attempt before escalating to a transfer or take-a-message. Not currently injected into the prompt (hardcoded at 3 in the prompt text), but stored in MongoDB for future dynamic prompt generation.

**`mandatoryEmailProfile`** — `boolean`, default: `false`
- When `true`, Iris must collect an email address before creating a new patient profile in SYE.
- SYE already requires email for `create_customer`, so this toggle adds extra enforcement at the agent behavior level. Not yet injected into the prompt dynamically.

---

### Step 2 — Twilio Setup

**Tab label:** "Twilio" | **Icon:** Phone

Rendered by `ProvisioningSection.tsx` which wraps `TwilioProvisioningWidget.tsx`. The widget is self-contained and handles the full multi-step provisioning flow.

**What happens in this step:**

1. **Create sub-account** — `POST /api/twilio/subaccount`
   - Request: `{ friendlyName: practiceDisplayName }`
   - Uses `getTwilioMainClient()` (TWILIO_PROD credentials) to call `client.api.v2010.accounts.create()`
   - Response: `{ subAccount: { sid, friendlyName, authToken, status, dateCreated } }`
   - If `TWILIO_TEST_MODE=true`, returns a fake `AC_TEST_...` SID and random token.

2. **Search available numbers** — `GET /api/twilio/numbers/available?areaCode=XXX`
   - Staff enters a 3-digit area code and clicks Search.
   - Uses `getTwilioMainClient()` to call `client.availablePhoneNumbers('US').local.list()`
   - Returns up to 10 numbers with their digits, friendly names, and capabilities (voice/SMS/MMS).

3. **Purchase number** — `POST /api/twilio/numbers/purchase`
   - Request: `{ phoneNumber, friendlyName, subAccountSid, subAccountToken }`
   - Uses `getTwilioSubClient(subAccountSid, subAccountToken)` so the number is purchased **on the sub-account**, not the main account.
   - Response: `{ number: { sid, phoneNumber, ... }, subAccountSid, subAccountToken }`
   - The `subAccountSid` and `subAccountToken` are echoed back in the response as the authoritative source (avoids React stale closure issue with the TwilioProvisioningWidget state).

**On provisioning success (`handleProvisioned` in `ProvisioningSection.tsx`):**
- Extracts 10-digit number from the `+1XXXXXXXXXX` response
- Calls `setValue()` for: `inboundPhone`, `twilioSid`, `twilioSubAccountSid`, `twilioSubAccountToken`, `vapiAssistantPhoneNumber`
- Saves all four credentials to `localStorage` under key `ringiq_twilio_creds`:
  ```json
  { "subAccountSid": "AC...", "subAccountToken": "...", "inboundPhone": "XXXXXXXXXX", "twilioSid": "PN..." }
  ```

**Why localStorage is needed:**
React Hook Form's `watch()` can miss `setValue()` calls made while a component is **unmounted**. When the user moves from Step 2 to Step 3, `ProvisioningSection` unmounts. If React re-renders at that point, `VapiSetupSection`'s `watch()` may read empty strings for `twilioSubAccountSid` and `twilioSubAccountToken`. The localStorage fallback is a reliable bridge between steps.

---

### Step 3 — VAPI AI Setup

**Tab label:** "VAPI" | **Icon:** Bot

Rendered by `VapiSetupSection.tsx`. Contains two sequential sub-steps.

**Prerequisite guard:** A "Twilio step pending" amber badge and a warning are shown if `subAccountSid` or `subAccountToken` are missing. The sub-steps are disabled until Twilio is complete.

**Credential recovery (`useEffect` on mount):**
```
1. Check watch('twilioSubAccountSid') and watch('twilioSubAccountToken')
2. If both present → use them, done
3. If either missing → read localStorage('ringiq_twilio_creds')
4. Restore subAccountSid, subAccountToken, inboundPhone from storage
5. Call setValue() on all recovered fields to sync back to the form
```

---

#### VAPI Sub-step 1 — Deploy Iris Assistant

Button: "Deploy Iris" (disabled until `practiceDisplayName` and `cpmid` are both non-empty)

**API call:** `POST /api/vapi/assistant`

**Request payload:**
```json
{
  "practiceDisplayName": "Primary Eyecare Associates - Sterling Heights",
  "cpmid": "6747",
  "mongoOfficeId": "69f4e7b340a0602fd7790804",
  "publicNumber": "+15869916560",
  "syeLocationId": 8,
  "recordingDisclosure": true,
  "allowSameDayBookings": false
}
```

**What the route does:**
- Validates `practiceDisplayName` and `cpmid` are present
- Calls `buildSystemPrompt(ctx)` from `lib/vapi-prompt.ts` to generate the full system prompt
- Creates the VAPI assistant via `POST https://api.vapi.ai/assistant` with:
  - `model.provider: 'openai'`, `model.model: 'gpt-5.1-chat-latest'`
  - `transcriber.provider: 'deepgram'`, `transcriber.model: 'nova-3-medical'`, `transcriber.language: 'en'`
  - `voice.provider: 'vapi'`, `voice.voiceId: 'Savannah'`
  - `firstMessageMode: 'assistant-speaks-first-with-model-generated-message'` (no hardcoded greeting — Iris generates it after calling `get_store_context`)
  - `name: "${practiceDisplayName} — Iris"`

**Response:** `{ success: true, assistant: { id: "uuid", name: "..." } }`

**On success in the UI:**
- `assistant` state is set → badge shows truncated UUID
- `setValue('vapiAssistantId', json.assistant.id)` — stored in form for final submit

---

#### VAPI Sub-step 2 — Link Number to Iris

Button: "Link Number" (disabled until assistant is created AND `vapiPhoneNumber` is non-empty AND Twilio creds are present)

**API call:** `POST /api/vapi/phone-number/import`

**Request payload:**
```json
{
  "phoneNumber": "5674026092",
  "twilioAccountSid": "AC...",
  "twilioAuthToken": "...",
  "assistantId": "c4e34a9a-..."
}
```

**What the route does:**
- Normalizes `phoneNumber` to E.164: if not starting with `+`, prepends `+1`
- Calls `POST https://api.vapi.ai/phone-number` with:
  - `provider: 'twilio'`
  - `number: e164` — **field name is `number`, not `twilioPhoneNumber`** (VAPI API requirement)
  - `twilioAccountSid`: the sub-account SID (not the main account)
  - `twilioAuthToken`: the sub-account auth token
  - `assistantId`: the VAPI assistant UUID
  - `name: 'VAPI AI Line'`

**Response:** `{ success: true, phoneNumber: { id, number, assistantId } }`

**On success in the UI:**
- `linked` state is set to `true`
- The full success card is shown: "Iris is deployed and live" with assistant name, assistant ID, and VAPI line number

---

### Step 4 — Site & Schedule

**Tab label:** "Schedule" | **Icon:** MapPin

Rendered by `LocalizationSection.tsx`.

**`timezone`** — `string`, required, selected from a dropdown of IANA timezone names
- Example: `"America/Chicago"`.
- Used to compute `tzOffset` (UTC offset integer) on the server when saving to MongoDB. The offset is computed using Node's `Intl` API.
- Stored in MongoDB as `tzName`.

**`streetAddress`** — `string`, required
- Full street address of the practice. Example: `"4230 Coolidge Hwy"`.
- Stored in MongoDB under `address.street`.

**`city`** — `string`, required
- Example: `"Sterling Heights"`.
- Stored in MongoDB under `address.city`.

**`state`** — `string`, 2-letter code, required
- Example: `"MI"`. Selected from a US states dropdown.
- Stored in MongoDB under `address.state`.

**`zipCode`** — `string`, regex `/^\d{5}(-\d{4})?$/`, required
- Standard or extended ZIP. Example: `"48310"` or `"48310-1234"`.
- Stored as a **string** (not parsed as integer) to preserve extended format.
- Stored in MongoDB under `address.zip`.

**`operationalHours`** — object with three blocks: `mondayFriday`, `saturday`, `sunday`

Each block has:
- `open` — `string`, time in `HH:MM` format. Example: `"08:00"`.
- `close` — `string`, time in `HH:MM` format. Example: `"17:00"`.
- `closed` — `boolean`. If `true`, open/close are ignored for that day.

Defaults:
- mondayFriday: `08:00–17:00`, not closed
- saturday: `09:00–14:00`, not closed
- sunday: closed

The server converts this into a full 7-day `workingHours` object where Mon–Fri all share the same `mondayFriday` block values:
```json
{
  "mon": { "isOpen": true, "open": "08:00", "close": "17:00" },
  "tue": { "isOpen": true, "open": "08:00", "close": "17:00" },
  "wed": { "isOpen": true, "open": "08:00", "close": "17:00" },
  "thu": { "isOpen": true, "open": "08:00", "close": "17:00" },
  "fri": { "isOpen": true, "open": "08:00", "close": "17:00" },
  "sat": { "isOpen": true, "open": "09:00", "close": "14:00" },
  "sun": { "isOpen": false, "open": "",      "close": ""      }
}
```

**`internalWorkingHours`** — `string`, default: `"Doctor Lunch Block: 12:00 PM - 01:00 PM"`
- Free-text field describing internal time blocks (e.g. doctor lunch) that the AI agent should be aware of.
- Stored in MongoDB as `workingLunchHours.doctorLunch`.

---

### Final Submit — Register Business

Button: "Register Business" — `type="button"` with explicit `form.handleSubmit(onValid, onInvalid)()` call.

**Why `type="button"` with explicit submit:** The original `type="submit"` silently swallowed validation errors when React Hook Form's `onInvalid` handler was not wired. Changed to explicit call so an error toast fires on validation failure.

**What happens:**
1. Zod validates the full form schema
2. `POST /api/offices` is called with the complete form data
3. Server creates a MongoDB document (see MongoDB Document Structure below)
4. On success: `localStorage.removeItem('ringiq_twilio_creds')` clears the stored Twilio credentials
5. User is redirected to the dashboard with a success toast

---

## MongoDB Document Structure

**Collection:** `offices`

Full shape of a saved document:

```json
{
  "_id": ObjectId("..."),

  "name": "Primary Eyecare Associates - Sterling Heights",
  "corporateCleanName": "primary_eyecare_associates_sterling_heights",

  "officeStatus": "active",

  "address": {
    "street": "4230 Coolidge Hwy",
    "city": "Sterling Heights",
    "state": "MI",
    "zip": "48310"
  },

  "email": {
    "company": "tso"
  },

  "tzName": "America/Chicago",
  "tzOffset": -5,

  "publicNumber": "+15869916560",
  "failoverNumber": "+15869916560",

  "twilioNumbers": [
    {
      "number": "5674026092",
      "title": "Main",
      "disabled": false,
      "sid": "PN...",
      "subAccountSid": "AC..."
    },
    {
      "number": "5674026092",
      "title": "VAPI",
      "disabled": false,
      "sid": "",
      "subAccountSid": "AC..."
    }
  ],

  "twilioSubAccountSid": "ACcb50bcb...",
  "twilioSubAccountToken": "0fc90bba...",

  "vapiAssistantId": "c4e34a9a-2664-4090-bb5b-c918d1848370",

  "skipRecordingMessage": false,

  "workingHours": {
    "mon": { "isOpen": true, "open": "08:00", "close": "17:00" },
    "tue": { "isOpen": true, "open": "08:00", "close": "17:00" },
    "wed": { "isOpen": true, "open": "08:00", "close": "17:00" },
    "thu": { "isOpen": true, "open": "08:00", "close": "17:00" },
    "fri": { "isOpen": true, "open": "08:00", "close": "17:00" },
    "sat": { "isOpen": false, "open": "09:00", "close": "14:00" },
    "sun": { "isOpen": false, "open": "", "close": "" }
  },

  "workingLunchHours": {
    "doctorLunch": "Doctor Lunch Block: 12:00 PM - 01:00 PM"
  },

  "servicePlan": "dashboard-399",

  "officeOpenHours": {},

  "ehr": {
    "cpmid": "6747",
    "syeLocationId": 8
  },

  "createdAt": "2026-05-30T..."
}
```

**Field notes:**
- `_id` — MongoDB ObjectId. The hex string of this ID is what was pre-generated as `mongoOfficeId` on the client and embedded in the VAPI prompt.
- `officeStatus` — `"active"` = live_production, `"testing"` = internal_testing
- `twilioNumbers[0]` — always the "Main" tracking number with its Twilio `sid`
- `twilioNumbers[1]` — always the "VAPI" line (same number in prototype, separate in production)
- `twilioNumbers[1].sid` — empty string currently; VAPI manages its own internal ID for the number
- `skipRecordingMessage` — inverse of `recordingDisclosure` form field
- `servicePlan` — currently hardcoded to `"dashboard-399"` in the route; not yet a form field

---

## VAPI System Prompt Architecture

**File:** `lib/vapi-prompt.ts`

### PromptContext interface

```typescript
interface PromptContext {
  practiceDisplayName: string;   // "Primary Eyecare Associates - Sterling Heights"
  cpmid: string;                 // "6747" — embedded on every MCP tool call
  mongoOfficeId: string;         // MongoDB _id hex — passed to get_store_context as office_id
  publicNumber: string;          // "+15869916560" — E.164, the ONLY transferCall destination
  syeLocationId: number;         // 8 — the ONLY location_id / id_locations used in all booking tools
  recordingDisclosure: boolean;  // true → include recording notice; false → strip it
  allowSameDayBookings: boolean; // false → decline today's date; true → offer SYE slots
}
```

### What is injected per-clinic

Every occurrence of the following is parameterized — nothing is hardcoded for a specific clinic:
- Practice name (title, greeting, Step 7 location, success message)
- CPMID (every single SYE tool call instruction)
- MongoDB office ID (passed to `get_store_context` and `get_practice_office`)
- Public phone number (all `transferCall` destinations, emergency script, data integrity fallback)
- SYE location ID (all scheduling tool parameters)
- Recording disclosure (conditional lines in greeting and booking scenario)
- Same-day booking policy (conditional rule in Step 6)

### What the prompt covers (sections in order)

1. **Identity** — Iris is a voice assistant. Never mention agents, MCP, APIs, transfers, or internal systems.
2. **Store and office identifiers** — Hardcoded CPMID, RINGIQ_OFFICE_ID, RINGIQ_PUBLIC_PHONE, SYE_LOCATION_ID with exact tool parameter names.
3. **MCP tools** — Full list of all available tools with exact parameter names:
   - `get_store_context` — first call every call; loads practice metadata + SYE catalog
   - `get_practice_office` — MongoDB-only fetch
   - `list_exam_types` — service catalog on demand
   - `list_providers` — provider roster on demand
   - `get_available_appointment_slots` — availability with up to 5 slots
   - `validate_booking` — validate before booking
   - `search_customers` — find existing patient
   - `create_customer` — create new patient (requires email)
   - `update_customer` — patch patient record
   - `list_appointments` — list patient appointments
   - `book_appointment` — create booking
   - `reschedule_appointment` — move existing booking
   - `cancel_appointment` — cancel booking
   - `ping_sye_api` — connectivity check
4. **On call start** — Silent `get_store_context` before first spoken word. Greeting template. Recording disclosure (conditional).
5. **Current date and time** — Rules for converting relative dates to YYYY-MM-DD. Never ask caller for "tomorrow's exact date."
6. **Data integrity** — Never fabricate information, never invent availability.
7. **Communication style** — One question at a time, no double-barreled questions, never read raw IDs aloud, use caller's name.
8. **Emergency handling** — "Call nine one one" for true emergencies. Urgent-but-not-911 → immediate `transferCall`.
9. **Office connection** — `transferCall` to `publicNumber` only. Run immediately, no verbal confirmation required. Three cases: out-of-scope, urgent, orders/labs/glasses.
10. **When you cannot help** — Billing, insurance decisions, orders → `transferCall`.
11. **Take-a-message scenario** — Collect reason, name, callback number. No ticket numbers.
12. **Booking scenario (11 steps):**
    - Step 1: Who is the appointment for?
    - Step 2: Patient name (one playback, move on)
    - Step 3: Reason + new vs established
    - Step 4: Appointment type / service (from SYE catalog, no IDs spoken)
    - Step 5: Insurance (asked every caller, for office record only)
    - Step 6: Preferred date + morning/afternoon (conditional same-day rule)
    - Step 7: Location always = `practiceDisplayName` + `syeLocationId`
    - Step 8: Doctor preference (optional)
    - Step 9: Available slots (up to 3 presented, doctor name always included)
    - Step 10: Patient record in SYE (search first, create only if no match, email required)
    - Step 11: Validate → book → confirm with date+time+doctor name
13. **Cancel / reschedule scenario** — Find appointment → confirm → cancel or repeat Steps 6–11.
14. **End conversation** — "We look forward to seeing you. Have a wonderful day!"

### VAPI assistant creation config

```json
{
  "name": "{practiceDisplayName} — Iris",
  "model": {
    "provider": "openai",
    "model": "gpt-5.1-chat-latest",
    "messages": [{ "role": "system", "content": "..." }]
  },
  "transcriber": {
    "provider": "deepgram",
    "model": "nova-3-medical",
    "language": "en"
  },
  "voice": {
    "provider": "vapi",
    "voiceId": "Savannah"
  },
  "firstMessageMode": "assistant-speaks-first-with-model-generated-message"
}
```

No `firstMessage` string is set — Iris calls `get_store_context` silently and then generates her own greeting using the practice name from the result.

---

## Twilio Architecture

### Account hierarchy

```
TWILIO_PROD_ACCOUNT_SID (main production account)
  └── Sub-account per practice (created at Step 2)
        └── Phone number(s) (purchased at Step 2 on the sub-account)
```

- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` — test/restricted account. **Not used in any real flow.** Present in `.env` for reference only.
- `TWILIO_PROD_ACCOUNT_SID` / `TWILIO_PROD_AUTH_TOKEN` — main production account. Used for sub-account creation and available number search.
- Sub-account — created per practice. Numbers purchased on it belong to it, not the main account. Operations on those numbers must use the sub-account's SID + auth token.

### Client factory (`lib/twilio.ts`)

```typescript
getTwilioClient()
// → twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
// Unused in real flows. Test account only.

getTwilioMainClient()
// → twilio(TWILIO_PROD_ACCOUNT_SID, TWILIO_PROD_AUTH_TOKEN)
// Used for: creating sub-accounts, searching available numbers.
// Must use AccountSID + AuthToken (NOT API Key) — see constraint below.

getTwilioSubClient(subSid: string, subToken: string)
// → twilio(subSid, subToken)
// Used for: purchasing numbers on sub-account, releasing numbers on delete.
```

### Critical constraint: Twilio SDK v6 + API Key auth token null

When authenticating via API Key (instead of AccountSID + AuthToken), the Twilio SDK v6 returns `null` for `AccountInstance.authToken`. This means if you use an API Key to create a sub-account, you cannot retrieve the sub-account's auth token from the SDK response.

**Solution:** All clients use AccountSID + AuthToken credentials, never API Key.

### Auth token scope

One sub-account has **one auth token** shared across all numbers on that account. The auth token is retrieved once during sub-account creation and stored in MongoDB as `twilioSubAccountToken`. Every subsequent operation on that sub-account's numbers uses this stored token.

---

## Bugs Fixed (full history)

### Bug 1 — VAPI voice field name
- **Error:** `{"success":false,"error":"voice.property voice should not exist"}`
- **Root cause:** For Vapi's own built-in voices, the VAPI API uses `voiceId`, not `voice` as the field name.
- **Fix:** `voice: 'Savannah'` → `voiceId: 'Savannah'` in `app/api/vapi/assistant/route.ts`

### Bug 2 — VAPI phone number field name
- **Error:** `property twilioPhoneNumber should not exist, number must be a valid phone number in the E.164 format`
- **Root cause:** VAPI's phone number import API (`POST /phone-number`) requires `number` as the field name, not `twilioPhoneNumber`.
- **Fix:** Changed `twilioPhoneNumber: e164` → `number: e164` in `app/api/vapi/phone-number/import/route.ts`

### Bug 3 — "Twilio step pending" badge not clearing on VAPI step
- **Root cause:** React Hook Form's `watch()` in `VapiSetupSection` misses `setValue()` calls made from `ProvisioningSection` while it was mounted. When the user navigates to Step 3, the Step 2 component unmounts. Any `watch()` reads in Step 3 see the initial empty values.
- **Fix:** Save Twilio credentials to `localStorage` (`ringiq_twilio_creds`) immediately after purchase. In `VapiSetupSection`, a `useEffect` reads from localStorage as a fallback when `watch()` returns empty strings.

### Bug 4 — Sub-account auth token was null
- **Root cause:** The original `getTwilioMainClient()` used API Key authentication. Twilio SDK v6 returns `null` for `authToken` on `AccountInstance` in that auth mode.
- **Fix:** All Twilio clients switched to AccountSID + AuthToken credentials.

### Bug 5 — "Resource not accessible with Test Account Credentials"
- **Root cause:** The sub-account creation route was using `getTwilioClient()` which points to `TWILIO_ACCOUNT_SID` — a restricted test account that cannot create sub-accounts or perform real operations.
- **Fix:** Sub-account route now uses `getTwilioMainClient()` (TWILIO_PROD credentials).

### Bug 6 — Silent form submit failure on final Register step
- **Root cause:** `form.handleSubmit(fn)` was called without an `onInvalid` handler. When Zod validation failed on any step, the submit silently did nothing — no error, no toast, no feedback to the user.
- **Fix:** Register button changed to `type="button"` with:
  ```tsx
  onClick={() => form.handleSubmit(onValid, () => {
    toast.error('Some required fields are missing — check all steps before submitting.');
  })()}
  ```

### Bug 7 — Delete office failing with "Failed to delete office"
- **Root cause:** The DELETE route used `getTwilioMainClient()` to release the phone number, but the number was purchased on a sub-account. The main account cannot release numbers it doesn't own.
- **Fix:** Delete route reads `twilioSubAccountSid` and `twilioSubAccountToken` from the office document and uses `getTwilioSubClient()`. Twilio release errors are caught and logged but do **not** abort the MongoDB document deletion (so the record can still be cleaned up even if the number was already released or the creds expired).

### Bug 8 — ZIP code losing extended format
- **Root cause:** `POST /api/offices` was storing `zipCode` as `parseInt(zipCode, 10)`, which truncated `"12345-6789"` to `12345`.
- **Fix:** Store `zipCode` as a string.

### Bug 9 — PlayHT voice ID invalid (historical)
- **Error:** VAPI rejected the assistant creation.
- **Root cause:** Voice was configured as PlayHT provider with voice ID `jennifer` — not a valid VAPI/PlayHT voice ID.
- **Fix:** Switched to ElevenLabs Sarah (`EXAVITQu4vr4xnSDxMaL`), later updated to Vapi Savannah in the current configuration.

---

## Known Technical Decisions & Constraints

### 1. mongoOfficeId pre-generation
`mongoOfficeId` is generated client-side using `generateMongoId()` inside a `useEffect` when the wizard page loads. This is necessary because the VAPI system prompt must embed the MongoDB office ID (as `RINGIQ_OFFICE_ID` for `get_store_context`) at assistant creation time (Step 3), but the MongoDB document is only created at the final submit (Step 5). The pre-generated ID is reused as the MongoDB `_id`.

### 2. Same number for Main + VAPI in prototype
`twilioNumbers` stores two entries (Main + VAPI) but in the current prototype they reference the same phone number and SID. The VAPI entry has an empty `sid` string. In production they would be two separate Twilio numbers — one the practice's public tracking line and one the VAPI AI line.

### 3. TWILIO_ACCOUNT_SID is a test account
The `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` env vars point to a Twilio test account with restricted capabilities. They are not used in any real flow. All real operations use `TWILIO_PROD_*`.

### 4. firstMessageMode: no hardcoded greeting
Iris's first spoken words are model-generated after calling `get_store_context`. This is more accurate than a hardcoded string because the greeting uses the practice name from the Mongo + SYE response rather than the value baked in at creation time.

### 5. React Hook Form cross-step state limitation
React Hook Form's `watch()` reads the current form store. `setValue()` calls made while a component is unmounted are written to the store but may not be picked up by `watch()` in a component that mounts later in the same render cycle. The localStorage bridge is the solution — it's synchronous, survives component unmounts, and is explicitly cleared on final submit.

### 6. servicePlan hardcoded
`servicePlan` is hardcoded as `"dashboard-399"` in the `POST /api/offices` route. The form schema and UI do not yet have a field for this. It is listed in pending work.

---

## Pending Work

### High Priority — Next Sprint

**Public prospect onboarding form**
- Route: `/onboard` — no authentication required (public-facing)
- Fields (Page 1 from the prospect intake PDF): practice name, contact name, email, phone, EHR system, number of locations, current call volume
- After submission: practice appears in an approval queue on the internal dashboard
- RingIQ staff reviews and clicks "Approve & Auto-Configure" to trigger the full Twilio + VAPI provisioning
- Architecture decision already made: **same Next.js project**, not a separate repo

### Medium Priority

**`servicePlan` field**
- Enum values: `free_nights_weekends` | `three_ring_backup` | `full_service`
- Needs a form UI element (radio/select) in Step 1
- Needs to replace the hardcoded `"dashboard-399"` value in the offices route

**`specialRingtone: boolean`**
- Toggle per practice for a custom ringtone/hold experience
- Not yet in the schema or form

**Per-number role designation**
- Currently `twilioNumbers` entries are auto-labelled "Main" / "VAPI" based on position
- Needs a proper UI for labeling roles when a practice has more than 2 numbers

### Low Priority / Future

- **Visiting hours** — a separate schedule block from operational hours (for after-hours patient pickup, etc.)
- **Carrier/QSG forwarding numbers array** — multiple forwarding destinations for complex routing
- **Office users per practice** — multi-user access scoped to a single location

### Not Started (important gaps)

**VAPI assistant update flow**
- Currently there is no way to update the VAPI system prompt after initial setup
- If a practice's CPMID, public number, or behavior toggles change, the existing assistant still has the old prompt
- Needs: `PATCH /api/vapi/assistant/[id]` route + a "Re-deploy Iris" button on the office detail page

**VAPI assistant deletion on office delete**
- The DELETE route releases the Twilio number and removes the MongoDB document
- It does **not** delete the VAPI assistant — the orphaned assistant remains in VAPI's system
- Needs: call `DELETE https://api.vapi.ai/assistant/{id}` using `vapiAssistantId` from the office doc before or after the MongoDB delete

**Twilio sub-account closure on office delete**
- The DELETE route releases the phone number from the sub-account
- The sub-account itself is **not** closed — it remains open on the main Twilio account
- Needs: call `client.api.v2010.accounts(subAccountSid).update({ status: 'closed' })` after number release

---

## End-to-End Flow (verified working as of 2026-05-30)

```
1. Staff opens /dashboard/businesses/new
   → mongoOfficeId pre-generated client-side

2. Step 1 — Practice Profile
   → Fills: practiceDisplayName (auto-slugs corporateCleanName)
   → Fills: cpmid, syeLocationId, emailCompany
   → Fills: publicNumber, failoverTransferNumber
   → Toggles: recordingDisclosure (true), allowSameDayBookings (false)
   → Clicks Next

3. Step 2 — Twilio Setup
   → Creates sub-account → receives subAccountSid + subAccountToken
   → Searches numbers by area code → picks one
   → Purchases number ON the sub-account
   → inboundPhone, twilioSid, twilioSubAccountSid, twilioSubAccountToken, vapiAssistantPhoneNumber
     all auto-populated in form + saved to localStorage
   → Clicks Next

4. Step 3 — VAPI AI Setup
   → VapiSetupSection reads Twilio creds from form or localStorage
   → Clicks "Deploy Iris"
     → POST /api/vapi/assistant with full PromptContext
     → VAPI creates assistant with gpt-5.1-chat-latest + nova-3-medical + Savannah voice
     → vapiAssistantId auto-populated in form
   → Clicks "Link Number"
     → POST /api/vapi/phone-number/import with sub-account creds
     → VAPI links Twilio number to Iris
   → "Iris is deployed and live" success card shown
   → Clicks Next

5. Step 4 — Site & Schedule
   → Fills: timezone, streetAddress, city, state, zipCode
   → Sets: mondayFriday hours, saturday hours, sunday closed
   → Sets: internalWorkingHours (lunch block)
   → Clicks Next

6. Final Submit — Register Business
   → form.handleSubmit validates full schema
   → POST /api/offices → MongoDB document inserted
   → localStorage.removeItem('ringiq_twilio_creds')
   → Redirect to dashboard with success toast
```

**Result:** MongoDB document created with all fields populated: `vapiAssistantId`, `twilioSubAccountToken`, `twilioNumbers` (Main + VAPI), `workingHours` (7-day), `ehr.cpmid`, `ehr.syeLocationId`, `address`, `tzName`, `tzOffset`, `publicNumber`, `failoverNumber`, `skipRecordingMessage`, `corporateCleanName`, `createdAt`.
