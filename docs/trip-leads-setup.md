# Trip plan leads → Google Sheet

The "Get a free golf trip plan" form on the EN Valencia course pages posts to `/api/trip-lead`
(Vercel function), which forwards each lead to a Google Apps Script web app that appends a row
to a Google Sheet. No emails are sent.

## One-time setup (≈5 minutes)

1. Create a Google Sheet, e.g. **golfspain.guide – trip leads**.
2. In the sheet: **Extensions → Apps Script**. Delete the sample code and paste the script below.
3. Replace `CHANGE-ME` with a long random string (e.g. 32 letters and numbers). Save.
4. **Deploy → New deployment → type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, authorise with your Google account, and copy the **Web app URL** (ends in `/exec`).
5. In **Vercel → project → Settings → Environment Variables**, add:
   - Name: `TRIP_LEADS_WEBHOOK`
   - Value: `<Web app URL>?key=<your random string>`
   - Environments: Production and Preview
   - Mark it **Sensitive**: the `?key=` part is a secret. Never commit it or paste it in chat.
6. Redeploy (or merge the next PR) so the function picks up the variable.
7. Test: submit the form on a preview URL and check that a row appears in the **Leads** tab.

If you change the script later, use **Deploy → Manage deployments → Edit → New version**
so the URL stays the same.

**Rotating the key** (if it ever leaks): change `KEY` in the script → New version (as above) →
update `TRIP_LEADS_WEBHOOK` in Vercel with the new `?key=` → redeploy.

## Apps Script

```javascript
const KEY = 'CHANGE-ME';

const HEADERS = ['Received', 'Name', 'Email', 'Arrival', 'Departure', 'Players',
                 'Courses', 'Clubs', 'Newsletter', 'Page', 'Lang'];

// Stop spreadsheet formula injection (values starting with = + - @)
function safe(v) {
  const s = String(v == null ? '' : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doPost(e) {
  if (!e || !e.parameter || e.parameter.key !== KEY) {
    return ContentService.createTextOutput('forbidden');
  }
  const d = JSON.parse(e.postData.contents);
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName('Leads') || book.insertSheet('Leads');
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  sheet.appendRow([d.received_at, d.name, d.email, d.arrival, d.departure, d.players,
                   d.courses, d.clubs, d.newsletter, d.page, d.lang].map(safe));
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## What is stored

Received (UTC), name, email, arrival, departure, players (1–8), course ids, clubs
(`bring` / `rent` / `unsure`), newsletter opt-in, page, language. Retention: up to 2 years
(see the privacy policy). Bots that fill the hidden honeypot field are dropped without storing.

## Measuring

Google Analytics event `trip_plan_request` (players, courses_count, clubs, course_page).
Compare it with the rows in the sheet: fewer rows than events means the webhook is failing.
