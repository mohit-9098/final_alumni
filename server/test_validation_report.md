# API Testing Report (Script-based)

## How to run
1. Start MongoDB (if not already running).
2. Start server:
   - `cd server && npm run dev`
3. Run test suite:
   - `node server/test_runner.js`

Optional:
- Use a different base URL:
  - `TEST_BASE_URL=http://localhost:5000 node server/test_runner.js`

## What is validated
1. `GET /api/health` returns HTTP `200` and `{ message: 'Server is running' }`.
2. `POST /api/auth/admin-login`:
   - Failure path: wrong password returns `>=400` with a JSON error.
   - Success path: correct credentials return HTTP `200` with `{ token, user }`.
3. `GET /api/auth/me`:
   - Without token returns `401`.
   - With token returns `200` and user details.

## Results / validation
Run `node server/test_runner.js` and capture console output.
If the script exits with code `0`, all checks passed.
If exit code is `1`, at least one check failed.

## 6. Testing

- **Purpose:** Validate core API behavior (health and auth) using the script-based test runner.

- **Test environment:**
   - Local dev machine (Windows). Ensure MongoDB is running and the server is started.
   - Node.js installed; run tests from the repository root.

- **Test cases:**
   - **Health check — GET /api/health**
      - Input: simple GET
      - Expected: HTTP 200, body `{ message: 'Server is running' }`
   - **Admin login (failure) — POST /api/auth/admin-login**
      - Input: invalid credentials
      - Expected: HTTP 4xx and JSON error
   - **Admin login (success) — POST /api/auth/admin-login**
      - Input: valid admin credentials
      - Expected: HTTP 200 and JSON with `token` and `user`
   - **Get current user (unauthenticated) — GET /api/auth/me**
      - Input: no Authorization header
      - Expected: HTTP 401
   - **Get current user (authenticated) — GET /api/auth/me**
      - Input: valid `Authorization: Bearer <token>` header
      - Expected: HTTP 200 and user details

- **How tests run:**
   - Tests are executed by `node server/test_runner.js` which issues HTTP requests to the running server and asserts responses.
   - The script prints pass/fail messages to the console and exits with `0` (all pass) or `1` (one or more failures).

- **Example result output (illustrative):**

```
PASS  GET /api/health — 200
PASS  POST /api/auth/admin-login (failure) — 400
PASS  POST /api/auth/admin-login (success) — 200
PASS  GET /api/auth/me (no token) — 401
PASS  GET /api/auth/me (with token) — 200
SUMMARY: 5 passed, 0 failed
Exit code: 0
```

- **Validation checklist:**
   - Confirm HTTP status codes match expectations.
   - Confirm response JSON contains required fields (`message`, `token`, `user`, etc.).
   - Confirm token is well-formed (JWT-like) when returned.
   - Inspect server logs for unexpected errors or stack traces.
   - Optionally verify database state for side effects produced by tests.

- **Run and capture results:**

PowerShell:

```powershell
cd server
npm run dev            # start server in dev mode
# in a second terminal
node server/test_runner.js > ..\test-results.txt
```

Or override base URL:

```powershell
TEST_BASE_URL=http://localhost:5000 node server/test_runner.js > ..\test-results.txt
```

- **Next steps / recommendations:**
   - Add more endpoint coverage (events, jobs, messages) to the test runner.
   - Integrate `node server/test_runner.js` into CI to run on push.

## 7. Results & Discussion

- **Output capture & screenshots:**
   - Save console output to a file for embedding in reports:

```powershell
cd server
node server/test_runner.js > ..\test-results.txt
```

   - Capture screenshots on Windows using the Snipping Tool or `PrtSc` and paste into your document. For automated image capture, copy the saved `test-results.txt` into a markup document or take a terminal screenshot with your OS tools.

- **Representative output (text):**

```
PASS  GET /api/health — 200
PASS  POST /api/auth/admin-login (failure) — 400
PASS  POST /api/auth/admin-login (success) — 200
PASS  GET /api/auth/me (no token) — 401
PASS  GET /api/auth/me (with token) — 200
SUMMARY: 5 passed, 0 failed
Exit code: 0
```

- **Performance analysis (latency & throughput):**
   - Quick ad-hoc timing using `curl`:

```powershell
curl -s -o nul -w "time_total: %{time_total}\n" http://localhost:5000/api/health
```

   - Simple load test with `autocannon` (no install required via `npx`):

```powershell
npx autocannon -c 10 -d 10 http://localhost:5000/api/health
```

   - Key metrics to collect:
      - Requests/sec (throughput)
      - Latency (p50, p95, p99)
      - Errors (non-2xx responses, connection failures)

- **Example performance output (illustrative):**

```
Running 10s test @ http://localhost:5000/api/health
10 connections, 10 pipelining, 10 seconds
Requests: 12,345 total, 1,234.5 req/sec
Latency: 15 ms (p50), 42 ms (p95), 120 ms (p99)
Non-2xx responses: 0
```

- **Interpretation & thresholds:**
   - For a small dev API, healthy signs are low error count, stable latency, and throughput consistent with resources.
   - Watch p95/p99: spikes there indicate tail-latency issues needing investigation (DB, blocking code).
   - If errors or high latencies appear, check server logs, database query times, and increase connection limits or add caching.

- **Next analysis steps / tooling:**
   - For sustained or CI-driven performance checks, use `k6` or `artillery` and store metrics in Grafana/Prometheus for trends.
   - Correlate load test spikes with server logs and MongoDB slow query logs.

- **Conclusion:**
   - Save `test-results.txt` and any screenshots alongside this report. Use load-test metrics to set performance goals and prioritise fixes when p95/p99 exceed acceptable limits.

## 8. Conclusion & Future Work

- **Summary of contributions:**
   - Provided a script-based test runner validating core API endpoints (`/api/health`, auth flows).
   - Documented how to run tests, capture outputs, and interpret results.
   - Added guidance for basic performance checks and result reporting.

- **Current scope / limitations:**
   - Tests cover only a small subset of endpoints (health + auth). No DB state teardown or test fixtures are included.
   - No CI integration or automated performance regression tracking yet.
   - Load-testing is ad-hoc; no historical metrics store is configured.

- **Future work / improvements:**
   - Expand endpoint coverage: events, jobs, messages, notifications, user flows.
   - Add unit and integration tests with fixtures, mocks, and isolated test DBs (use `mongodb-memory-server` or separate test DB).
   - Integrate tests into CI (GitHub Actions) with matrix runs and artifact collection (logs, `test-results.txt`).
   - Add automated performance tests (k6/artillery) and push metrics to a time-series store for trend analysis.
   - Add security and input-validation checks (fuzzing, OWASP tests) and contract tests for public APIs.
   - Add clear test data management and teardown to avoid flaky state-dependent failures.

- **Suggested immediate next step:**
   - Add `server/test_runner.js` to CI as a smoke test, run once on PRs, then iterate by adding more endpoint checks.

