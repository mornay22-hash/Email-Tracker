# Email Radar Tracker

Daily 07:00 (SAST) morning brief, emailed automatically:
weather, one local / international / finance headline, today's
learning topic, then every property risk item ranked — overdue,
due soon, unattended emails, and anything else still open — plus
recurring checklist items due for review.

It also keeps the Google Sheet itself updated and growing into a
real dashboard: new unread inbox mail gets logged and auto-tagged
(building / risk category / owner) automatically, rows close
themselves out once you've read/replied, and every morning's
snapshot is appended to a Daily Log tab so trends are tracked over
time, not just today's point-in-time view.

**Tracker sheet:** https://docs.google.com/spreadsheets/d/1VbCXgB-C2E0mTrKdGJO2Te_nJRjb7uSY3u3Mk8U1xN4/edit

Tabs:
- **Radar** — the risk register itself (was "Sheet1")
- **Daily Log** — one row per morning, full snapshot, this is the dashboard's history
- **Dashboard** — formulas off Daily Log + Radar: open/overdue counts, trend sparkline, open items by building
- **Learning Queue** — add topics any time; one gets sent per day, in order
- **Daily Checklist** — recurring reviews (arrears, security log, etc.) with frequency; surfaced when due, you tick them off by editing "Last Completed"
- **Classification Rules** — editable keyword table (Building / Category / Owner) used to auto-tag new emails

This runs as a Google Apps Script bound to that sheet — not as a
separate server — because it needs native, low-friction access to
both Gmail and Sheets under your own Google account. Weather and
news come from free, keyless public sources (Open-Meteo, Google
News RSS), so there's nothing extra to configure or pay for. The
code lives here in `src/` and is deployed with `clasp`.

## One-time setup

1. **Install clasp** (Node required):
   ```
   npm install -g @google/clasp
   clasp login
   ```
   This opens a browser to authorise clasp against mornay22@gmail.com.

2. **Enable the Apps Script API** for that account (one click):
   https://script.google.com/home/usersettings

3. **Create the bound script** and push the code:
   ```
   git clone https://github.com/mornay22-hash/Email-Tracker.git
   cd Email-Tracker
   clasp create --type sheets --title "Email Radar Tracker" \
     --parentId 1VbCXgB-C2E0mTrKdGJO2Te_nJRjb7uSY3u3Mk8U1xN4 \
     --rootDir ./src
   clasp push
   ```
   This writes a `.clasp.json` with your new `scriptId` — commit it.

4. **Authorise scopes once:**
   ```
   clasp open
   ```
   In the Apps Script editor, pick `setupSheets` from the function
   dropdown and click **Run**. Google will prompt you to authorise
   Gmail + Sheets + external-request access — approve it. This
   creates and seeds the Daily Log / Dashboard / Learning Queue /
   Daily Checklist / Classification Rules tabs. Safe to re-run any
   time; it never overwrites a tab that already has data.

5. **Test it:** pick `dailyBrief` from the dropdown, click **Run**.
   You should get a full brief in your inbox within a few seconds.

6. **Install the 07:00 trigger:**
   Pick `installDailyTrigger` from the dropdown and click **Run**,
   once. That's it — `dailyBrief` now fires every day at 07:00
   Africa/Johannesburg automatically, no further action needed.

## How "open" / "unattended" is defined

- An email counts as open while it's **unread and sitting in your
  inbox**. Reading it, replying, or archiving it is enough to close
  the row automatically — no manual labelling needed.
- Every newly-logged email gets a `Radar/Logged` Gmail label so it's
  never logged twice.
- New emails are auto-classified against the **Classification
  Rules** tab (keyword → Building / Category / Owner). Anything that
  matches nothing falls back to `Uncategorised - needs triage`. Add
  rules any time — no redeploy needed, the script reads the tab
  fresh every run.
- A logged email never gets a Deadline set automatically — that's
  your call once you've actually reviewed it. Until then it sits in
  the "unattended emails" bucket of the brief.

## Tuning the daily routine (your ~30 min)

- **Learning Queue:** add topics whenever you come across something
  worth circling back to. One row moves from `Queued` to `Sent` each
  morning — refill it before it runs dry.
- **Daily Checklist:** add/remove recurring reviews and set
  `Frequency` to Daily / Weekly / Monthly. The brief only nags you
  about what's actually due, based on `Last Completed`.
- **Dashboard tab** updates live off Radar + Daily Log — no action
  needed, just open it whenever you want the trend view instead of
  today's brief.

## Changing things later

Edit files in `src/`, then:
```
clasp push
```
No need to touch triggers or re-run setup unless you add new tabs
or change OAuth scopes.

## Config

All tunables (recipient email, lookback window, weather location,
news feeds, column names) are in `src/Config.gs`.

