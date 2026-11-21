# CampusFix requirements checklist

**Course:** ICT251 Introduction to Web Technologies  
**University:** Mulungushi University, School of Engineering and Technology, Computer Science Department  
**Student:** Katongo Ilunga  
**Student number:** 202508737. About pages and the API guide use this number.  
**Selected system:** Campus Maintenance Requests  
**Project name:** CampusFix – Campus Maintenance Management System  
**Documents read:**

- `Activity_6_Frontend_Development.pdf` (5 pages) — due 21 November 2026, 23:59
- `Activity_7_Backend_Development.pdf` (7 pages) — due 24 November 2026, 23:59
- `Activity_8_Frontend_Backend_Integration.pdf` (4 pages) — due 27 November 2026, 23:59

This file is the requirements record. The application code is in `activity6-frontend`, `activity7-backend`, and `activity8-integration`.

The three activities are one system built in three layers:

| Activity | What is built | What is submitted |
| --- | --- | --- |
| 6 | Browser interface. Records live in `localStorage`. | Live frontend URL |
| 7 | Independent Node.js and Express API plus a database. Tested without the frontend. | Live backend base URL, for example `https://your-backend.onrender.com` |
| 8 | The same kind of interface, reading and writing through the Activity 7 API. | Live frontend URL of the complete system |

Work is individual unless the lecturer assigns groups. Login, payments, and file uploads are out of scope. All records are fictional.

---

## 1. Database contradiction (do not hide this)

The PDFs do not agree about the database. Both instructions are quoted below. They are not mixed in the plan.

### What the prose says

Activity 7, Tools and scope:

> The sample hosting route uses Render for Node.js and SQL lite.

Activity 7, Step 3, page 4. This is the entire instruction on that page after the heading:

> Create an SQL lite Database

Activity 8, system diagram:

> Database — SQL lite service — Keep shared records after the server restarts.

### What the code samples say

Activity 7, Step 1, the only install command in the PDF:

```text
npm install express cors dotenv pg
```

`pg` is the PostgreSQL driver for Node.js. The PDF never mentions `sqlite3` or `better-sqlite3`.

Activity 7, Step 5, the required SQL style:

- `pool.query(...)`
- `WHERE id = $1`
- `INSERT ... RETURNING *`
- `UPDATE ... WHERE id = $5 ... RETURNING *`
- `DELETE ... RETURNING id`

`$1` placeholders, `RETURNING`, and a `pg` connection pool are PostgreSQL. SQLite Node drivers normally use `?` placeholders. Using `$1` against SQLite, or `?` against `pg`, would be the mix this project must avoid.

### What page 4 does not contain

Activity 7 page 4 has no `CREATE TABLE`, no column types, no seed SQL, and no Step 4. The schema has to be written by us. It must follow one database, not a blend of both.

### A second conflict inside the hosting section

Activity 7 also says:

> Render free services may pause when idle, so the first request can take time. Their local files are temporary. Keep the records in your hosted database so a service restart does not remove them.

A SQLite file stored on the Render web service disk is a local file. Render can wipe it on restart or redeploy. That would fail the required test: create a record, restart the server, then `GET` it and find it still there. Activity 8 also requires the same records to appear when the site is opened on another device.

### Recommended solution

**Use PostgreSQL only, with the `pg` package and PostgreSQL SQL.**

Reasons a lecturer can be shown:

1. The install command and every SQL example in Activity 7 are already written for PostgreSQL.
2. The persistence test and the Render warning both require a database that survives a service restart. A hosted PostgreSQL database does that. A file on the Render disk does not.
3. Activity 8 still gets a shared relational database. Only the product name in the prose ("SQL lite") is set aside, because it conflicts with the code and with the persistence rule in the same brief.

Rules that follow from this choice:

- `schema.sql` and `seed.sql` use PostgreSQL syntax.
- Queries use `$1`, `$2`, and so on, plus `RETURNING`.
- `db.js` creates a `pg` pool from `DATABASE_URL`.
- No SQLite package and no SQLite syntax (`AUTOINCREMENT`, `?` placeholders) anywhere in the backend.
- Local development uses a PostgreSQL server and a `DATABASE_URL`.
- Hosting uses a hosted PostgreSQL database (Render PostgreSQL, Neon, or another lecturer-approved PostgreSQL host). The Express service on Render only stores the connection string, not the data file.

Proposed table, because the PDF does not supply one:

```sql
CREATE TABLE IF NOT EXISTS records (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL
);
```

`GENERATED ALWAYS AS IDENTITY` creates the positive integer id in the database. A client cannot set it. Length and status checks stay in JavaScript so a bad request returns `400` with a clear `message`, which a database error would not phrase for the marker.

This recommendation is the implementation decision for later phases unless you tell me to follow the SQLite wording instead. Following that wording would mean dropping `pg` and rewriting the PDF's SQL examples, and it would still fail persistence on Render's temporary disk.

---

## 2. Incorrect activity-number references

The briefs were renumbered to Activities 6, 7, and 8, but several sentences still say Activity 1, 2, or 3, or name the wrong folder. The intended meaning is below. The project will follow the corrected meaning.

| Document | What it says | What it means |
| --- | --- | --- |
| Activity 6, record rules | "In Activity 1, your browser data service generates the id. In Activity 2, the backend generates it." | Activity 6 generates the id in the browser. Activity 7 generates it in the database. |
| Activity 6, file table | `js/config.js` is "the backend address to be added in Activity 3". | The live API address is used in Activity 8. Activity 6 still has `config.js`, and its data layer does not call the API. |
| Activity 6, hosting step 5 | "Publish the integrated Activity 3 frontend at a separate URL." | Publish the Activity 8 frontend at its own URL. Keep the Activity 6 URL working. |
| Activity 7, task | "Test it without using your Activity 1 frontend." | Test Activity 7 with Postman or another API client, not with the Activity 6 page. |
| Activity 7, terminal hint | "open the terminal in activity2-backend." | Open the terminal in `activity7-backend`. |
| Activity 7, validation | "Apply the same length and status rules used by Activity 1." | Use the Activity 6 rules. |
| Activity 7, API guide | "It does not need the Activity 1 interface." | The guide is a small HTML page, not the Activity 6 dashboard. |
| Activity 7, deploy step 1 | "Upload activity6-backend to a GitHub repository." | Upload `activity7-backend`. |
| Activity 8, task | "Connect the frontend from Activity 6 to the independent Node.js API from Activity 6." | Connect the Activity 6 style of frontend to the Activity 7 API. |

Activity 7 section numbers are also out of order: section 2 is followed by section 4, then section 3. Step 4 is missing. Step 3 is the empty SQLite sentence, and the next step is Step 5. Nothing in those gaps adds a requirement that the surrounding pages do not already state.

The PDF header spells "Tehcnology" and Activity 6's title spells "Forntend". Those are typos in the brief, not names we should copy onto the site. The course name used on the pages will be Computer Science, ICT251.

---

## 3. Shared record contract

Every activity uses these field names and spellings.

| Field | Rule | Who sets it |
| --- | --- | --- |
| `id` | Positive whole number. Shown to the user. Never edited. | Activity 6: `recordService.create`. Activity 7 and 8: the database. |
| `title` | Text, 3 to 80 characters after trim. | User or API client. |
| `category` | Text, 2 to 40 characters after trim. | User or API client. |
| `description` | Text, 5 to 300 characters after trim. | User or API client. |
| `status` | Exactly one of `Pending`, `In progress`, `Completed`. | User or API client. The status control is a `<select>`. |

Example record from the brief:

```json
{
  "id": 1,
  "title": "Broken classroom light",
  "category": "Electrical",
  "description": "The light in Room B12 does not switch on.",
  "status": "Pending"
}
```

`POST` and `PUT` bodies contain only the four editable fields. `id` is not sent.

```json
{
  "title": "Broken classroom light",
  "category": "Electrical",
  "description": "The light in Room B12 does not switch on.",
  "status": "Pending"
}
```

### Categories

The brief's examples for this system are Electrical, Plumbing, and Furniture. It also says to use categories that suit the system, and the only hard rule is 2 to 40 characters.

CampusFix will offer these six choices in the form:

- Electrical
- Plumbing
- Furniture
- Infrastructure
- Cleaning
- Other

The Activity 7 API will accept any category string of 2 to 40 characters. It will not reject a category just because it is outside the form list. An API client is allowed to send another suitable label. The form uses a `<select>` so the demonstration data stays inside the six labels. Status remains a closed list of three exact values on both sides.

### Validation rules (frontend and backend)

Apply these before saving. The backend must not trust the form.

1. Each of `title`, `category`, `description`, and `status` must be a string. Reject numbers, objects, arrays, `null`, and missing fields with `400`.
2. Trim leading and trailing spaces, then measure the length.
3. Reject empty strings and strings that are only spaces.
4. `title`: 3 to 80 characters after trim.
5. `category`: 2 to 40 characters after trim.
6. `description`: 5 to 300 characters after trim.
7. `status` after trim must be exactly `Pending`, `In progress`, or `Completed`.
8. Ignore a client-supplied `id` and any other extra property. Do not write them.
9. `PUT` replaces all four editable fields. It does not create a record that is missing.
10. A route id must be a positive whole number. `abc`, `0`, `-1`, `1.5`, and an empty id are invalid input (`400`). A well-formed id that is not in the table is `404` for get, update, and delete.

Activity 6 shows the same validation messages in the page. It does not use HTTP codes. Activity 7 returns the message in JSON, for example:

```json
{ "message": "Title must have 3 to 80 characters." }
```

Useful messages to standardise:

| Case | Message |
| --- | --- |
| Missing or non-string title | `Title is required and must be text.` |
| Title length | `Title must have 3 to 80 characters.` |
| Missing or non-string category | `Category is required and must be text.` |
| Category length | `Category must have 2 to 40 characters.` |
| Missing or non-string description | `Description is required and must be text.` |
| Description length | `Description must have 5 to 300 characters.` |
| Missing, non-string, or unknown status | `Status must be Pending, In progress, or Completed.` |
| Invalid route id | `Record id must be a positive whole number.` |
| Valid id, no row | `Record not found.` |
| Malformed JSON | `Request body must be valid JSON.` |
| Unknown route | `That route does not exist.` |
| Unexpected failure | `The server could not complete the request.` |
| Database down on `/health` | `Database is unavailable.` |

---

## 4. Activity 6 — frontend features

Folder: `CampusFix/activity6-frontend/`

Files required by the brief:

| File | Purpose |
| --- | --- |
| `index.html` | Sections, form, and record display. |
| `css/styles.css` | Colours, spacing, responsive layout. |
| `js/app.js` | Buttons, form events, page updates. |
| `js/data.js` | `recordService` for demonstration records. |
| `js/config.js` | Present because the brief lists it. Activity 6 does not call the API. |

Page requirements:

- HTML5: `header`, `nav`, `main`, `section`, `footer`.
- `lang="en"`, charset UTF-8, viewport meta tag.
- JavaScript loaded as a module: `<script type="module" src="./js/app.js">`.
- Serve it with a local web server (Live Server or equivalent). Do not rely on opening the file directly, because modules and later `fetch` calls need a real origin.
- Visible label on every form field.
- Status is a `<select>`.
- Heading and a short explanation of CampusFix.
- Navigation to Home, Manage Records, and About. One page with sections is allowed and will be used.
- List or table of records with View, Edit, and Delete.
- Create, view full details, update, and delete.
- Delete asks for confirmation. Cancel keeps the record. Confirm removes it.
- Search by title. Filter by status. Show how many records are in the displayed results.
- Clear messages for success, invalid input, and an empty list.
- Cancel Edit clears the form and does not change the stored record.
- Keep the existing id while editing.
- `preventDefault()` on submit.
- Display user-entered text with `textContent`. Do not put user input into `innerHTML`.
- At least eight fictional starting records.
- About states the project name, student number 202508737, and that this version uses browser demonstration data.

Design requirements from the brief, plus the CampusFix brief you gave:

- Navy blue, white, and light grey.
- Readable type, consistent spacing, clear button labels.
- Visible keyboard focus (`button:focus-visible` style, extended to links and fields).
- Tab and Enter must operate the form.
- Media query for a narrow screen. Usable at 375px and 1280px.
- Sidebar or equivalent navigation, statistic cards, status badges, and a records table or cards.
- Dashboard counts: total, Pending, In progress, Completed. Counts describe the full stored set. The result count describes the filtered list.

`recordService` in `js/data.js` (all methods `async`):

| Method | Behaviour |
| --- | --- |
| `list()` | Return every stored record. |
| `get(id)` | Return one record, or report that it is missing. |
| `create(record)` | Generate a new positive integer id, save, return the record. |
| `update(id, record)` | Replace the four editable fields. Return the record. The id does not change. |
| `remove(id)` | Delete the record and return a success message. |

Storage rules:

- One `localStorage` key: `maintenance-demo-v1` (the key in the brief).
- Store a JSON array.
- Insert the eight starter records only when that key is absent.
- If the saved value is `[]`, leave it empty after refresh. Do not reseed.
- A new id must not match an id that is already in the array. Use one more than the highest current id, or `1` when the array is empty.
- The user cannot edit an id.

### Activity 6 tests (from the PDF)

| Test | Expected result |
| --- | --- |
| Submit an empty form or spaces only | A useful message. Nothing is saved. |
| Add a valid record and refresh | The record is still in this browser. |
| View and edit one record | The correct record changes. Its id stays the same. |
| Cancel deletion, then confirm deletion | Cancel keeps it. Confirm removes it. |
| Search and filter by status | Only matches appear, and the count is correct. |
| 375px and 1280px | Form and buttons stay usable. |
| Tab and Enter | Labels exist and focus is visible. |

These tests will be run in a browser and written into `TEST_REPORT.md` with the real result. They are not marked passed in advance.

Hosting later: Netlify manual deploy of this folder. `index.html` at the top. Visitors must open it without signing in to Netlify. Records stay in that browser only. Publish Activity 8 at a different URL and keep this URL up for marking.

---

## 5. Activity 7 — backend routes

Folder: `CampusFix/activity7-backend/`

The API runs on its own. It must not need a browser, and it must not import the frontend.

Setup required by the PDF:

```text
npm init -y
npm install express cors dotenv pg
npm pkg set scripts.start="node server.js"
```

- CommonJS `require`. Do not set `"type": "module"` in `package.json`.
- On Windows, use `npm.cmd` if `npm.ps1` is blocked.
- Listen on `process.env.PORT || 3000` and host `0.0.0.0`.

| File | Purpose |
| --- | --- |
| `server.js` | Express app, JSON middleware, CORS, `GET /`, `GET /health`, mount the router, unknown-route handler, error middleware. |
| `routes/records.js` | The five `/api/records` handlers. |
| `db.js` | Create and export the `pg` pool. |
| `schema.sql` | Create `records`. |
| `seed.sql` | Insert at least eight fictional records, once. |
| `.env` | Local `DATABASE_URL` and `CLIENT_ORIGINS`. Not committed. |
| `.env.example` | Same keys with placeholders. Safe to commit. |
| `.gitignore` | Ignore `.env` and `node_modules`. |
| `package.json` | Dependencies and `start` script. |
| `package-lock.json` | Produced by npm. Required for the Render deploy. |

### Routes

| Method | Route | Success | Body |
| --- | --- | --- | --- |
| `GET` | `/` | `200` | HTML API guide, not the dashboard. |
| `GET` | `/health` | `200` | JSON confirming the server and the database. Database failure: `503` and `{ "message": "Database is unavailable." }`. |
| `GET` | `/api/records` | `200` | JSON array, or `[]` when empty. `ORDER BY id`. |
| `GET` | `/api/records/:id` | `200` | One record object including `id`. |
| `POST` | `/api/records` | `201` | The saved record, including the new database id. |
| `PUT` | `/api/records/:id` | `200` | The updated record with the original id. |
| `DELETE` | `/api/records/:id` | `200` | `{ "message": "Record deleted." }` |

Error status codes:

| Situation | Status |
| --- | --- |
| Invalid input, wrong types, bad status, bad id, malformed JSON | `400` |
| Record id is valid but missing, or the route does not exist | `404` |
| Unexpected server failure | `500` |
| `/health` cannot reach the database | `503` |

Every error body is JSON: `{ "message": "..." }`. Log the real error on the server. Do not send stack traces to the client.

Router behaviour:

- Mount with `app.use("/api/records", require("./routes/records"))` before the error handlers.
- `GET /` selects `id, title, category, description, status` from `records` ordered by `id`.
- `GET /:id` selects one row with `WHERE id = $1`.
- `POST /` inserts the four fields and uses `RETURNING *`.
- `PUT /:id` updates the four fields `WHERE id = $5` and uses `RETURNING *`.
- `DELETE /:id` deletes `WHERE id = $1` and uses `RETURNING id`.
- Check the row count on get-one, put, and delete. Zero rows after a valid id is `404`.

Other backend behaviour:

- `express.json()` for JSON bodies.
- Malformed JSON is caught by error middleware with four parameters `(error, req, res, next)` and returned as `400`.
- Unknown routes return JSON `404`.
- CORS origins come from `CLIENT_ORIGINS`, split on commas, trimmed. Keep local origins in that list. The hosted Activity 8 origin is added when it exists.
- Parameterised queries only. No string concatenation of user input into SQL.
- Async handlers pass errors to `next(error)`.
- Seed at least eight fictional rows. Starting the server again must not insert them again. `seed.sql` will insert only when `records` is empty, so a restart is safe and an intentionally emptied table is not refilled by a later boot. That matches the Activity 6 rule that an emptied store stays empty, and it matches "insert once".
- The API guide at `GET /` includes: project name, student number 202508737, short description, the live base URL, links to `/health` and `/api/records`, a table of routes, the four fields, the three statuses, a valid POST and PUT body, the success and error codes, and a note that an idle Render service may take time to wake.

### Activity 7 tests (from the PDF)

Run these with an API client against the local server, then record the real HTTP status and body in `TEST_REPORT.md`.

1. `GET /health` — `200` and a successful database check.
2. `GET /api/records` — `200` and a JSON array.
3. `POST /api/records` with a valid body — `201` and a new record. Save the id.
4. `GET /api/records/{id}` — `200` and that same record.
5. `PUT` that id with all four fields — `200`, new values, same id.
6. `DELETE` that id — `200` and `Record deleted.`
7. `GET` that id again — `404`.
8. `POST` with a missing title — `400`, useful message, no new row.
9. `POST` with an invalid status — `400`, useful message, no new row.
10. Malformed JSON — `400` and a JSON message.
11. Invalid id — `400` and a JSON message.
12. Positive id that does not exist — `GET`, `PUT`, and `DELETE` each return `404`.
13. Create a record, restart the server, `GET` it — the row is still there.

Repeat the CRUD checks on the hosted URL after deployment. That hosted run is a later phase and will not be claimed until it happens.

---

## 6. Activity 8 — integration

Folder: `CampusFix/activity8-integration/`

Separate copies of `index.html`, `css/styles.css`, `js/app.js`, `js/data.js`, and `js/config.js`. Activity 6 stays on `localStorage`. Activity 8 does not use `localStorage` for maintenance records. A theme preference could use browser storage; records cannot.

`js/config.js`:

```js
export const API_BASE_URL = "https://your-backend.onrender.com";
```

Use HTTPS and no trailing slash. Until the Render URL exists, this file will point at the local API, and the deployment guide will say exactly where to change it. A localhost value must not be what you submit.

`recordService` keeps the five method names and calls:

| Method | Request |
| --- | --- |
| `list()` | `GET /api/records` |
| `get(id)` | `GET /api/records/:id` |
| `create(record)` | `POST /api/records` with the four fields only |
| `update(id, record)` | `PUT /api/records/:id` with the four fields only |
| `remove(id)` | `DELETE /api/records/:id` |

Request rules:

- Check `response.ok`. `fetch` does not reject HTTP 400 or 500.
- Read the JSON `message` when the response is not ok.
- A network failure or a non-JSON response is caught and shown on the page.
- On first load, show "Loading records", then render `list()`.
- Search and status filter run on the loaded array. Update the displayed count.
- View uses `get(id)`.
- Add: validate, `create`, then reload the list.
- Edit: fill the form and keep the id.
- Save: send all four fields with `update`. Disable Save while the request runs. Use `finally` to enable it again.
- Show success only after the API confirms the action.
- On failure, keep the input, show the message, and let the user try again.
- Delete: confirm, `remove`, then reload. Cancel does nothing.
- Do not seed demonstration records in this version. The eight rows come from `seed.sql`.
- If the backend is down, show a real error.
- Keep the browser checks for fast feedback and the backend checks for every write.
- A change made on the page must be visible in `GET /api/records`.
- Use `textContent` for user-entered values.
- About includes the project name, student number 202508737, short usage instructions, a link to the API guide (`/`), and a link to `/health`.

CORS:

- Add the final Netlify origin to `CLIENT_ORIGINS` (scheme and host, no path, no trailing slash).
- Keep local origins, such as the Live Server origin, in the same list.
- Restart or redeploy the backend after changing it.
- `cors` on Express answers the browser preflight used by `PUT` and `DELETE`.

---

## 7. Hosting and submission

Not done in Phase 1. No accounts will be created and no URL will be invented.

| Part | Host named in the brief | You must supply |
| --- | --- | --- |
| Activity 6 frontend | Netlify | The live site URL after you deploy |
| Activity 7 API | Render Web Service, free instance, Node | GitHub repository, then the `https://....onrender.com` base URL |
| Database | Hosted PostgreSQL | `DATABASE_URL` |
| Activity 8 frontend | Netlify, separate site from Activity 6 | The live site URL, then that origin added to `CLIENT_ORIGINS` |

Render settings from the brief: build command `npm install`, start command `npm start`, root directory `activity7-backend` if the repo contains the whole project. Include `package.json` and `package-lock.json`. Exclude `.env` and `node_modules`.

Environment variables you will set on the host, not in git:

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `CLIENT_ORIGINS` | Comma-separated browser origins allowed to call the API |
| `PORT` | Set by Render. Local default `3000`. |
| `STUDENT_NUMBER` | Printed on the API guide and can be mirrored in the About pages |

Submission fields:

- Activity 6: your details and the live Activity 6 frontend URL. Due 21 November 2026, 23:59.
- Activity 7: your details and the live backend base URL. Due 24 November 2026, 23:59.
- Activity 8: your details and the live Activity 8 frontend URL only. Due 27 November 2026, 23:59. Do not submit localhost, a repository link, or a hosting dashboard link.

The Google form itself is not in the PDFs. The lecturer provides it.

What must stay online until marking: the Activity 6 site, the Activity 8 site, the API, the API guide at `/`, and the database.

---

## 8. Required tests still to run

Phase 1 does not mark any of these as passed.

**Activity 6:** empty and spaces-only form, valid add plus refresh, view, edit with stable id, cancel edit, cancel delete, confirm delete, search, status filter, result count, eight starters only on first visit, emptied storage stays empty, 375px, 1280px, Tab, Enter, focus, labels, `textContent` rendering.

**Activity 7:** the thirteen API cases in section 5, plus unknown route `404`, health failure behaviour where it can be provoked safely, and proof that a second server start does not duplicate the seed.

**Activity 8:** loading state, live list, create, view, update, cancel, confirmed delete, search, filter, counts, button disabled during the request, error message when the API is down, success only after `response.ok`, same data visible from `GET /api/records`, CORS from the page origin, no `localStorage` record key.

**QA:** navigation, every control, console errors, keyboard path, persistence across restart, and the two widths. Failures get fixed and retested. `TEST_REPORT.md` will list test case, expected result, actual result, pass or fail, and any remaining limitation.

---

## 9. Decisions locked for the next phases

1. PostgreSQL with `pg` and PostgreSQL SQL, for the reasons in section 1.
2. Project root `CampusFix/` with `activity6-frontend`, `activity7-backend`, `activity8-integration`, and `documentation`.
3. Activity 6 and Activity 8 are separate copies. Activity 6 keeps `localStorage`. Activity 8 uses `fetch`.
4. One-page layout with Home, Manage Records, and About.
5. Six maintenance categories in the form. Three exact statuses. API category check is the length rule from the PDF.
6. Student number is 202508737.
7. No deploy, no fake URL, and no claimed test pass until that step is actually run.
8. Wrong activity numbers in the PDFs are mapped in section 2. The folders follow Activities 6, 7, and 8.

Phase 2 can create the empty project structure next. Activity 6 can be built before a PostgreSQL server is installed. Activity 7 cannot be tested until `DATABASE_URL` points at a real PostgreSQL database.
