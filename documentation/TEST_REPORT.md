# CampusFix test report

**Date:** 17 November 2026  
**Student:** Katongo Ilunga, 202508737  
**Where it was tested:** this computer only.

| Part | Address during the test |
| --- | --- |
| Activity 6 | `http://127.0.0.1:5500` |
| Activity 7 API | `http://127.0.0.1:3000` |
| Activity 8 | `http://127.0.0.1:5501` |
| PostgreSQL | `127.0.0.1:5433`, database `campusfix` |

No public Netlify or Render URL exists yet. Nothing below is a result from a hosted site.

The final database list is the eight example requests, ids 1–8. Request 11 was created and deleted during the Activity 8 test. Request 1 was edited and then restored to `Broken classroom light`.

## Activity 7 API

These calls were made with `fetch` against the running API.

| Test | Expected | Actual | Result |
| --- | --- | --- | --- |
| `GET /health` with PostgreSQL running | 200 and both status fields | `200 {"status":"ok","database":"connected"}` | Pass |
| `GET /api/records` after the test data was cleaned up | 200 and the eight example rows | 200, ids 1–8, titles and statuses match `seed.sql` | Pass |
| `GET /api/records/1` | 200, original example | 200, title `Broken classroom light`, status `Pending` | Pass |
| `GET /api/records/11` after the UI delete | 404 | `404 {"message":"Record not found."}` | Pass |
| `GET /api/records/abc` and `GET /api/records/0` | 400 | `400 {"message":"Record id must be a positive whole number."}` | Pass |
| `GET /api/no-such-route` | 404 | `404 {"message":"That route does not exist."}` | Pass |
| `POST /api/records` with no title | 400 | `400 {"message":"Title is required and must be text."}` | Pass |
| `POST /api/records` with status `Done` | 400 | `400 {"message":"Status must be Pending, In progress, or Completed."}` | Pass |
| `POST /api/records` with body `{bad` | 400 and the project message | `400 {"message":"Request body must be valid JSON."}` | Pass |
| Stop the API process and open Activity 8 | The page reports that it cannot reach the server | Message `The server could not be reached. Check that the API is running.` Empty text `Records could not be loaded.` Counts `0`. Loading text hidden. | Pass |
| Start the API again | The eight rows return | Activity 8 showed 8 total, 4 pending, 2 in progress, 2 completed | Pass |
| `GET /health` while PostgreSQL was stopped, earlier in this build | 503 | `503 {"message":"Database is unavailable."}` The API process stayed up. | Pass |
| Create, restart the API, and read the new row, earlier in this build | The row survives and the seed is not duplicated | A row was created, the process was restarted, the seed stayed at eight rows, and the new row was still returned. That row was later deleted so the demo list is the seed again. | Pass |

One local mistake was recorded and corrected: starting PostgreSQL without `-o "-p 5433"` made it listen on 5432. The API then returned 500 for `/api/records` because port 5433 refused the connection. Starting it again with port 5433 restored `GET /health` to 200.

## Activity 8 in the browser

The page at `http://127.0.0.1:5501` called `http://127.0.0.1:3000`. `localStorage` key `maintenance-demo-v1` was `null` on that origin.

| Test | Expected | Actual | Result |
| --- | --- | --- | --- |
| First load | Eight API records and the loading text hides | Total 8, pending 4, in progress 2, completed 2. `Showing 8 of 8 requests`. | Pass |
| Dashboard wording | It describes the API, not browser storage | `These figures count every request stored by the CampusFix API.` | Pass |
| Add `Broken desk in Lab 4` | Save stays disabled while the request runs, then the API id appears | The button was disabled. The message became `Request added.` The new id was 11. Total became 9 and pending became 5. | Pass |
| Search `desk` | The list narrows and the dashboard still counts every record | `Showing 1 of 9 requests`. Dashboard total stayed 9. | Pass |
| Cancel delete | The row remains | Total stayed 9. | Pass |
| Confirm delete | The API confirms, then the row is gone | Message `Record deleted.` Total returned to 8. The search still said `desk`, so the list showed `Showing 0 of 8 requests` and `No requests match your search or filter.` | Pass |
| Edit request 1 | The id stays 1 and the new title is stored | The form said `Editing request 1`. Save was disabled during the request. `GET /api/records/1` returned the new title. It was then restored with `PUT` 200. | Pass |
| View a completed row | The dialog shows the stored fields | Dialog opened for id 7, `Blocked drain near the hostel`, Plumbing, Completed, with the full description. Close returned to the list. | Pass |
| Filter `Completed` | Two rows, dashboard unchanged | `Showing 2 of 8 requests`. Dashboard stayed 8 / 4 / 2 / 2. Resetting the filter showed `Showing 8 of 8 requests`. | Pass |
| Width 375 | One column, no sideways scroll, stacked rows | Shell column `375.2px`, navigation in a row, table header hidden, sticky sidebar, `scrollWidth` equal to `clientWidth`. | Pass |
| Width 1280 | Sidebar plus content, four stat cards, table header visible | Shell columns `250px 1014.8px`, navigation in a column, four stat tracks, table header displayed, no sideways overflow. | Pass |
| About | Student number and API links | Student number `202508737`. Guide and health links pointed at `http://127.0.0.1:3000/` and `/health`. | Pass |

## Activity 6 in the browser

Tested at `http://127.0.0.1:5500`. Records used `localStorage` key `maintenance-demo-v1`.

| Test | Expected | Actual | Result |
| --- | --- | --- | --- |
| Validation and create, earlier in this build | Reject empty, spaces, and a 2-character title. Accept a trimmed title. | Empty title: `Title is required and must be text.` Title `ab`: `Title must have 3 to 80 characters.` A padded title was stored trimmed as id 9. Refresh kept it. | Pass |
| Edit and view, earlier in this build | Edit keeps the id. Cancel does not save. User text is shown as text. | Cancel left id 9 unchanged. Saving the title `Door <b>hinge</b> fixed` showed those characters as text, kept id 9, and changed that row to Completed. | Pass |
| Search and filter, earlier in this build | Search and status filter change the list, not the stored count | Search `hinge` showed 1 of 9. That search plus Pending showed 0 and the no-match message. Pending alone showed 4 of 9. All showed 9 of 9. | Pass |
| Cancel delete | The row stays | The dialog named id 9. Cancel left the total at 9. | Pass |
| Confirm delete | The row is removed in this browser | Confirm showed `Record deleted.` Total became 8 and completed returned to 2. | Pass |
| Empty saved array | A second refresh does not put the examples back | The key was set to `[]`. Two reloads both showed total 0 and `No maintenance requests yet. Add one with the form.` | Pass |
| Missing key | The eight examples appear once | Removing the key and reloading showed 8 total, 4 pending, 2 in progress, 2 completed. | Pass |
| Width 375 and 1280 | Same layout rules as Activity 8 | 375: one column, row navigation, table header hidden, no overflow. 1280: `250px` sidebar, column navigation, four stat tracks, table header visible, no overflow. | Pass |
| About | Browser-only explanation and student number | The page says Activity 6 uses browser demonstration data and shows student number `202508737`. | Pass |

## Limits

- Keyboard Tab and Enter were not confirmed. The available key action did not move focus, and a script focus did not match `:focus-visible`. The controls are labelled native fields, and `styles.css` sets a 3px `#1456a0` outline for `:focus-visible`. A person still needs to press Tab through the page once.
- The browser console was not saved as a log. The flows above completed without a broken page. The only error state observed was the intentional message when the API was stopped.
- `GET /health` returning 503 was observed earlier when PostgreSQL was stopped. It was not repeated in the final pass, because the final pass needed the database left running.
- Hosted behaviour is untested. Render idle delay, hosted SSL, and Netlify CORS are not covered by these local results.
