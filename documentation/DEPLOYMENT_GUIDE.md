# Deployment guide

**Student:** Katongo Ilunga, 202508737  
**Status:** the three sites run on this computer. They are not on public URLs yet, so the assignment is not ready to submit.

The briefs ask for three different addresses:

| Submission | What to paste | What not to paste |
| --- | --- | --- |
| Activity 6 | The Netlify URL of `activity6-frontend` | `localhost`, a GitHub link, or the Netlify dashboard |
| Activity 7 | The Render base URL, such as `https://campusfix-api.onrender.com` | A path to one route only, or a dashboard link |
| Activity 8 | The Netlify URL of `activity8-integration` | The same URL as Activity 6, or a repository link |

Activity 6 and Activity 8 must stay separate. Activity 6 keeps browser storage. Activity 8 calls the live API.

## Accounts you still have to create

This computer does not have a Netlify login or a Render login. Those sign-ins are interactive, so they were not invented and the deploy was not claimed. GitHub CLI is logged in as `katongoilunga05-netizen`. That does not publish the sites.

You need:

1. A free Netlify account for the two frontends.
2. A free Render account for the API.
3. A hosted PostgreSQL database. Render PostgreSQL is the match for this API. Keep the connection string private.

## 1. Publish the API on Render

1. Create a Render Web Service from `CampusFix/activity7-backend`.
2. Build command: `npm install`. If `NODE_ENV` is `production`, the `embedded-postgres` dev dependency is not required.
3. Start command: `npm start`.
4. Set these environment variables on Render:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | The hosted PostgreSQL connection string |
   | `DATABASE_SSL` | Leave unset for a remote host so the API uses SSL. Set `false` only for the local database. |
   | `CLIENT_ORIGINS` | The final Activity 8 `https://` origin, plus the Activity 6 origin if you want it allowed. Comma-separated, no spaces required, no trailing slash. |
   | `STUDENT_NUMBER` | `202508737` |
   | `PORT` | Render sets this. Do not hard-code 3000. |

5. Deploy and open `https://<your-service>.onrender.com/health`. A ready database returns:

   `{"status":"ok","database":"connected"}`

6. Open `https://<your-service>.onrender.com/` and confirm the HTML guide shows student number 202508737.
7. Open `https://<your-service>.onrender.com/api/records` and confirm the eight example requests are present after the first successful boot.

The first request after idle time can be slow because Render may pause a free service. The records must still be there after a restart. That is why they live in hosted PostgreSQL rather than a file on the web service.

## 2. Point Activity 8 at that API

Edit `activity8-integration/js/config.js` before uploading it:

```javascript
export const API_BASE_URL = "https://<your-service>.onrender.com";
```

No trailing slash. Leave `activity6-frontend/js/config.js` as an empty string. Activity 6 must not start calling the API.

Add the exact Activity 8 origin to Render `CLIENT_ORIGINS` and redeploy the API if the origin was not known at the first deploy.

## 3. Publish Activity 6

1. In Netlify, add a new site and deploy the folder `activity6-frontend` by itself.
2. Publish directory: that folder. There is no build command.
3. Open the site URL. The dashboard should show 8 requests the first time that browser stores data.
4. Keep this URL. Do not replace this site with the Activity 8 folder later.

## 4. Publish Activity 8

1. Create a second Netlify site from `activity8-integration` after `config.js` contains the Render URL.
2. Open that different URL. The dashboard sentence should say the figures count requests stored by the API.
3. Add a request, refresh, and confirm `GET /api/records` on the Render URL returns it.
4. Open the same Activity 8 URL on another device, or in a private window, and confirm the same request is there.

## 5. Check before you submit

- Activity 6 URL still shows the browser-only About text and does not need the API.
- Activity 7 URL ends at the host, and `/health` returns JSON.
- Activity 8 URL is different from Activity 6, and its About links open the Render guide and `/health`.
- None of the three submitted values is `localhost`, a repository, or a hosting dashboard.
- `.env`, `.pgdata`, and `node_modules` are not part of the upload. They are listed in `activity7-backend/.gitignore`.

## Local addresses used for testing

| Part | Address |
| --- | --- |
| Activity 6 | `http://127.0.0.1:5500` |
| Activity 7 | `http://127.0.0.1:3000` |
| Activity 8 | `http://127.0.0.1:5501` |
| PostgreSQL | `127.0.0.1:5433`, database `campusfix` |

These local addresses are for development only.
