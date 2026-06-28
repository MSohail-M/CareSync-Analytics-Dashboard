# Retell Call Dashboard — Setup Guide

## How it works

```
Retell call ends  →  webhook fires  →  Next.js stores in Supabase  →  Client views dashboard
```

No Retell API key in the browser. No polling. Retell pushes everything (transcript, sentiment,
summary, recording URL) in one webhook call. Dashboard is pure Supabase reads.

---

## Step 1 — Supabase

1. Create project at supabase.com
2. SQL Editor → paste + run `supabase/schema.sql`
3. Copy three keys:
   - Project URL
   - anon key (public)
   - service_role key (secret — server only)

---

## Step 2 — Deploy to Vercel

```bash
npm install
npx vercel --prod
```

Set these environment variables in Vercel (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL          = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     = eyJ...
SUPABASE_SERVICE_ROLE_KEY         = eyJ...         # server only
RETELL_WEBHOOK_SECRET             = (from step 4)
NEXT_PUBLIC_APP_NAME              = Call Dashboard  # optional branding
```

---

## Step 3 — Add Clinic to Supabase

In Supabase SQL Editor:

```sql
INSERT INTO clinics (slug, name, retell_agent_id, phone_number, plan_tier)
VALUES (
  'your-clinic-slug',
  'Your Clinic Name',
  'agent_xxxxxxxxxxxx',    -- Retell agent ID from Retell dashboard
  '+1 (555) 000-0000',
  'growth'
);
```

---

## Step 4 — Configure Retell Webhook

1. Go to Retell Dashboard → Webhooks
2. Add webhook URL: `https://your-vercel-app.vercel.app/api/webhook`
3. Select event: **call_ended**
4. Copy the signing secret → paste as `RETELL_WEBHOOK_SECRET` in Vercel

Done. Every call that ends will now appear in the dashboard within seconds.

---

## Step 5 — Configure Retell Custom Analysis (optional but recommended)

In Retell Dashboard → your agent → Custom Analysis Data, add these fields so the dashboard
shows richer data:

```json
{
  "outcome": {
    "type": "enum",
    "values": ["booked", "rescheduled", "cancelled", "transferred", "failed"],
    "description": "What was the result of this call?"
  },
  "patient_name": {
    "type": "string",
    "description": "Full name of the patient if identified"
  },
  "provider_name": {
    "type": "string",
    "description": "Name of the provider or doctor mentioned"
  },
  "visit_type": {
    "type": "string",
    "description": "Type of appointment (annual physical, sick visit, follow-up, etc.)"
  }
}
```

Retell fills these automatically from the call transcript. They appear in the dashboard.

---

## Step 6 — Create Client User

In Supabase: Authentication → Users → Invite user (enter client's email).

Then link to clinic:
```sql
INSERT INTO users (id, clinic_id, role, name)
VALUES (
  'USER_UUID_FROM_SUPABASE_AUTH',
  (SELECT id FROM clinics WHERE slug = 'your-clinic-slug'),
  'owner',
  'Dr. Smith'
);
```

Share with client:
- URL: `https://your-vercel-app.vercel.app`
- Email: their email
- Temp password (they reset on first login)

---

## File Map

```
src/
├── app/
│   ├── (auth)/login/page.tsx           Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx                  Sidebar + auth guard
│   │   ├── dashboard/page.tsx          Stats + sentiment + recent calls
│   │   ├── calls/page.tsx              Full call log table
│   │   └── calls/[id]/page.tsx         Call detail + AI summary + transcript
│   └── api/webhook/route.ts            Retell webhook receiver
├── components/Sidebar.tsx
├── lib/supabase.ts
└── middleware.ts                       Auth redirect
supabase/schema.sql
```

---

## What clients see

| Page | What's shown |
|---|---|
| Overview | Stats (calls today/week/month), success rate, avg duration, sentiment breakdown, recent calls |
| Call Logs | Filterable table: time, caller, outcome, sentiment, patient, provider, duration |
| Call Detail | AI summary, call outcome, patient info, full transcript, recording player link |

## What clients never see

- Retell API keys or agent IDs
- Webhook URLs
- Any other clinic's data
- Raw JSON payloads
- Supabase or technical internals
