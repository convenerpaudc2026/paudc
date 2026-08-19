# PAUDC 2026 — Google Apps Script form destinations

The website's public forms are submitted to the FastAPI backend, which
forwards each one to a Google Apps Script Web App as a `POST` with a single
URL-encoded field: `payload` = a JSON string of the submission. Each script
reads `e.parameter.payload`, appends a row to a Google Sheet, and (optionally)
emails a confirmation.

## Which script handles what

| Script | Backend route | Render env var | Handles |
|--------|---------------|----------------|---------|
| `legacy-lab.gs` | `POST /api/v1/forms/legacy-lab` | `LEGACY_LAB_APPS_SCRIPT_URL` | Legacy Lab applications (`/legacy-lab/apply`) |
| `visa-invitation.gs` | `POST /api/v1/forms/submit` (type = `visa`) | `VISA_APPS_SCRIPT_URL` | Visa letter requests (`/visa`) |
| *(existing shared script)* | `POST /api/v1/forms/submit` (all other types) | `GOOGLE_APPS_SCRIPT_URL` | registration, contact, LMS waitlist |

Routing note: visa requests go through the **shared** `/forms/submit` endpoint,
but the backend sends them to `VISA_APPS_SCRIPT_URL` **when it is set**; if it is
not set, visa falls back to `GOOGLE_APPS_SCRIPT_URL` (no breakage). Legacy Lab
has its own dedicated endpoint.

## Deploy a script

1. Create a Google Sheet, then **Extensions → Apps Script** (binds the script
   to that sheet, so `SPREADSHEET_ID` can stay empty).
2. Paste the `.gs` file, edit the `CONFIG` block (admin email, confirmation
   toggle, Drive folder for Legacy Lab attachments).
3. **Deploy → New deployment → Web app** — *Execute as: Me*, *Who has access:
   Anyone*. Authorize the requested scopes (Sheets / Drive / Gmail).
4. Copy the **`/exec`** URL (`https://script.google.com/macros/s/…/exec`).
   The backend requires the host to be `script.google.com`, which this is.
5. Set the matching env var (table above) on Render and redeploy the backend.

## Test a script directly (no backend needed)

```bash
# Visa
curl -L -X POST "https://script.google.com/macros/s/…/exec" \
  --data-urlencode 'payload={"type":"visa","name":"Test User","email":"you@example.com","phone":"+234...","country":"Nigeria","institution":"Veritas","team":"Adjudicator","message":"Passport: A01234567"}'

# Legacy Lab
curl -L -X POST "https://script.google.com/macros/s/…/exec" \
  --data-urlencode 'payload={"fullName":"Test User","email":"you@example.com","applicantType":"Individual","projectTitle":"Demo","supportNeeded":["Mentorship"],"declarationConsent":true}'
```

A successful call opens the sheet and appends a row; `doGet` (open the `/exec`
URL in a browser) returns a short "is live" message for a quick health check.

> These scripts are reference copies kept in version control. The authoritative
> copy runs in Google Apps Script — keep this folder in sync when you edit there.
