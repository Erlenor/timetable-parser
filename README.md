# EduPge → Google Calendar

Upload a photo of your timetable and have all the events added to Google Calendar automatically.

## Project structure

```
index.html         — login page
app.html           — main app
auth.js            — Google OAuth (token flow)
parser.js          — Gemini Vision API call
calendar.js        — Google Calendar API
style.css          — shared styles
config.js          — your API keys (gitignored, never pushed)
config.example.js  — template for config.js, safe to push
```

---

## Setup

Copy `config.example.js` → `config.js` and fill in your two keys. `config.js` is gitignored so your keys stay local and never end up on GitHub.

### 1. Gemini API Key (free)

1. Go to https://aistudio.google.com/app/apikey
2. Sign in → Create API key → copy it
3. Paste into `config.js`:
   ```js
   GEMINI_API_KEY: 'paste here'
   ```
   No billing needed — Gemini 2.5 Flash has a free tier (1500 requests/day).

### 2. Google Cloud — OAuth Client ID

1. Go to https://console.cloud.google.com → create a new project
2. **APIs & Services → Library** → search and enable **Google Calendar API**
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorised JavaScript origins: `http://localhost:63342`
   - Authorised redirect URIs: `http://localhost:63342/index.html`
4. Copy the Client ID and paste into `config.js`:
   ```js
   GOOGLE_CLIENT_ID: 'paste here'
   ```
5. **OAuth consent screen → Publish app** so anyone with a Google account can log in

---

## Running locally in WebStorm

1. Right-click `index.html` → Open In → Browser
2. Check the port in the URL bar — if it's not `63342`, update the origins and redirect URIs in Google Cloud to match
3. Log in and you're good to go

---

## How it works

1. User logs in via Google OAuth — token stored in `sessionStorage` for the session
2. User uploads, pastes or photographs their timetable
3. Image is sent to Gemini 2.5 Flash which decides if it's a timetable and extracts all events as JSON
4. If it's not a timetable, an error is shown
5. Extracted events are previewed, then pushed to the chosen Google Calendar
6. Events are created as weekly recurring starting from the next occurrence of each weekday

---

## Notes

- Runs entirely in the browser — no backend needed
- OAuth uses the implicit token flow since there's no server
- To make events one-off instead of recurring, remove the `recurrence` line in `calendar.js`