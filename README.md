# EduPge → Google Calendar

Upload a photo of your timetable and have all the events added to Google Calendar automatically.

## Project structure

```
index.html   — login page
app.html     — main app
auth.js      — Google OAuth (token flow)
parser.js    — Claude Vision API call
calendar.js  — Google Calendar API
style.css    — shared styles
```

---

## Setup (do this before running)

### 1. Google Cloud — OAuth Client ID

1. Go to https://console.cloud.google.com
2. Create a new project (or use an existing one)
3. **APIs & Services → Enable APIs** → enable **Google Calendar API**
4. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorised JavaScript origins: `http://localhost:63342` (or wherever WebStorm serves from)
   - Authorised redirect URIs: same origin + `/index.html`
   - e.g. `http://localhost:63342/edupge-cal/index.html`
5. Copy the **Client ID** and paste it into `auth.js`:
   ```js
   const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
   ```
6. **APIs & Services → OAuth consent screen** — add your Google account as a test user while in development

### 2. Gemini API Key (free)

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account → Create API key
3. Paste it into `parser.js`:
   ```js
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
   ```
   No billing required — Gemini 2.5 Flash has a free tier (1500 requests/day).

> ⚠️ Don't commit either key to git. For production use environment variables or a backend proxy.

---

## Running locally in WebStorm

1. Open the project folder in WebStorm
2. Right-click `index.html` → **Open In → Browser**
3. WebStorm's built-in server runs on `http://localhost:63342` by default
4. Make sure that origin matches what you set in Google Cloud

---

## How it works

1. User logs in via Google OAuth — token is stored in `sessionStorage`
2. User uploads / pastes / photographs their timetable
3. Image is sent as base64 to Claude (claude-opus-4-5) with a prompt asking it to:
   - Decide whether the image is actually a timetable
   - Extract all events as structured JSON if it is
4. If it's not a timetable, an error is shown
5. Extracted events are previewed, then pushed to the chosen Google Calendar via the Calendar API
6. Events are created as **weekly recurring** starting from the next occurrence of each weekday

---

## Notes

- The app runs entirely in the browser — no backend needed
- The Google OAuth token flow (implicit grant) is used because there's no server
- Events default to weekly recurrence; you can remove `recurrence` in `calendar.js` if you want one-off events