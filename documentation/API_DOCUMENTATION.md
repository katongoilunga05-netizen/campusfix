# CampusFix API

**Project:** CampusFix – Campus Maintenance Management System  
**Student:** Katongo Ilunga, student number 202508737  
**Course:** ICT251, Mulungushi University  
**Base URL while developing:** `http://127.0.0.1:3000`  
**Hosted base URL:** not published yet. Replace this sentence with the Render URL before submission. Do not add a trailing slash.

The API is a separate Node.js and Express application in `activity7-backend`. It stores maintenance requests in PostgreSQL. The Activity 6 page does not call this API. The Activity 8 page does.

## Run it locally

1. Start PostgreSQL on port 5433. From `activity7-backend`, run `npm run db:local` the first time. If that process has stopped, start the same data directory with the port flag:

   `pg_ctl -D .pgdata start -o "-p 5433"`

   A start command without `-p 5433` listens on 5432, and the API then cannot connect.

2. Copy `.env.example` to `.env` if `.env` is missing. The local file uses:

   `postgres://postgres:campusfix@127.0.0.1:5433/campusfix`

   `DATABASE_SSL=false` is required for this local server.

3. Run `npm start`. The process listens on `0.0.0.0` and `PORT`, or 3000 when `PORT` is unset.

`embedded-postgres` is a development dependency used only by `local-db.mjs`. The API itself imports `pg`, not the embedded server. Render should use a hosted PostgreSQL `DATABASE_URL`.

## Database

PostgreSQL is the only database. The brief’s prose says “SQL lite”, but the install command is `npm install express cors dotenv pg` and the samples use `$1` and `RETURNING`. A SQLite file on Render would also disappear when the service restarts. Those two instructions are not mixed: there is no SQLite driver and no `?` placeholder.

`records.id` is `INTEGER GENERATED ALWAYS AS IDENTITY`. Deleted ids are not reused. The eight example rows are inserted once, guarded by `schema_meta.key = 'records_seeded'`. Restarting the API does not insert them again. An emptied table stays empty.

| Column | Rule |
| --- | --- |
| id | Positive integer. The database assigns it. Clients cannot set it. |
| title | Text, 3–80 characters after trim |
| category | Text, 2–40 characters after trim |
| description | Text, 5–300 characters after trim |
| status | Exactly `Pending`, `In progress`, or `Completed` |

## Records the API accepts

`POST /api/records` and `PUT /api/records/:id` read only these four fields:

```json
{
  "title": "Broken classroom light",
  "category": "Electrical",
  "description": "The light in Room B12 does not switch on.",
  "status": "Pending"
}
```

A client `id`, and any other extra property, is ignored. Values are trimmed. A missing field, a value that is not text, or a value that is only spaces returns 400.

The form offers Electrical, Plumbing, Furniture, Infrastructure, Cleaning, and Other. The API checks category length, not a fixed list, so a suitable label of 2–40 characters is valid.

## Routes

| Method and path | Success | Failure |
| --- | --- | --- |
| `GET /` | 200 HTML API guide | — |
| `GET /health` | 200 `{"status":"ok","database":"connected"}` | 503 `{"message":"Database is unavailable."}` |
| `GET /api/records` | 200 JSON array, ordered by id | 500 if the database query fails |
| `GET /api/records/:id` | 200 one record | 400 bad id, 404 missing record |
| `POST /api/records` | 201 the created record | 400 invalid body or invalid JSON |
| `PUT /api/records/:id` | 200 the updated record | 400 bad id or body, 404 missing record |
| `DELETE /api/records/:id` | 200 `{"message":"Record deleted."}` | 400 bad id, 404 missing record |
| Any other path | — | 404 `{"message":"That route does not exist."}` |

`PUT` updates an existing row. It does not create a row when the id is missing.

An id in the path must match `^[1-9]\d*$` and be no larger than 2147483647. `abc`, `0`, `-1`, `1.5`, and `01` are 400 with `{"message":"Record id must be a positive whole number."}`. A well-formed id that is not in the table is 404 `{"message":"Record not found."}`.

Malformed JSON is 400 `{"message":"Request body must be valid JSON."}`. A JSON array or other non-object body is 400 `{"message":"Request body must be a JSON object."}`.

Validation messages:

- `Title is required and must be text.`
- `Title must have 3 to 80 characters.`
- `Category is required and must be text.`
- `Category must have 2 to 40 characters.`
- `Description is required and must be text.`
- `Description must have 5 to 300 characters.`
- `Status must be Pending, In progress, or Completed.`

An unexpected server error is 500 `{"message":"The server could not complete the request."}`. Error responses are JSON objects with a `message` string.

## CORS

`CLIENT_ORIGINS` is a comma-separated list. The local example allows:

- `http://127.0.0.1:5500`
- `http://localhost:5500`
- `http://127.0.0.1:5501`
- `http://localhost:5501`

Before the Activity 8 site is published, add its exact Netlify origin to `CLIENT_ORIGINS` on Render and redeploy the API. The Activity 6 origin can be added as well if that page is later pointed at the API. Activity 6 currently does not send API requests.

## What Activity 8 calls

`activity8-integration/js/config.js` sets `API_BASE_URL` with no trailing slash. Locally it is `http://127.0.0.1:3000`. Change it to the hosted `https://` URL before uploading Activity 8. The five calls are:

| Page action | Request |
| --- | --- |
| Load the list | `GET /api/records` |
| View or edit one row | `GET /api/records/:id` |
| Add | `POST /api/records` |
| Save changes | `PUT /api/records/:id` |
| Confirm delete | `DELETE /api/records/:id` |

The page checks `response.ok`. It shows the API `message` when the response is an error. If the browser cannot connect, it shows `The server could not be reached. Check that the API is running.`
