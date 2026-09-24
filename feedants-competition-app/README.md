# Feedants: Competition Details Screen

A full-stack implementation of a dynamic **Competition Details** screen: live countdowns, registration with concurrency-safe spot locking, and a state-driven call-to-action (register, upload, waiting, closed).

| Layer | Stack |
|---|---|
| Mobile | React Native (Expo, TypeScript), React Navigation, TanStack React Query, Axios, Context API, lucide icons |
| API | Node.js, Express 4, TypeScript, Zod validation |
| Database | MongoDB via Mongoose 8 (local or Atlas) |

---

## 1. Project structure

```
backend/
  src/
    config/env.ts              # Zod-validated environment (fails fast at boot)
    models/                    # Competition, User, Registration (+ indexes)
    routes/ controllers/       # HTTP layer: validation + response shaping only
    services/                  # Business rules (registration, submission, details)
    middleware/                # validate (Zod), errorHandler (one error envelope)
    utils/                     # AppError, asyncHandler, competitionState (pure)
    scripts/concurrencyTest.ts # 30 users race for 5 spots
    seed.ts                    # demo data
mobile/
  App.tsx                      # providers: SafeArea, React Query, Session
  src/
    api/                       # Axios client + endpoint functions
    hooks/                     # useCompetition (query + optimistic register), useServerNow, useSubmitEntry
    utils/                     # competitionState, cta, time: all pure functions
    components/                # Header, HeroCard, JudgeCard, CountdownBar, ImportantDates,
                               # PreviousWinners, InfoTabs, RewardsList, StickyCtaBar, ...
    screens/                   # CompetitionDetailsScreen, SubmissionScreen
    navigation/ theme.ts config.ts context/ types/
```

---

## 2. Setup

### Prerequisites
- Node.js 20+
- MongoDB: a local `mongod`, or a free MongoDB Atlas cluster (for Atlas, allow your IP under *Network Access* and use the `mongodb+srv://...` connection string)
- For the app: the Expo Go app on a phone, or an Android/iOS emulator

### Backend
```bash
cd backend
cp .env.example .env        # edit MONGODB_URI if not using local Mongo
npm install
npm run seed                # creates demo users + competitions, prints their IDs
npm run dev                 # http://localhost:4000  (health check: GET /health)
```

`backend/.env.example`

| Variable | Default | Purpose |
|---|---|---|
| `NODE_ENV` | `development` | `development` / `test` / `production` (stack traces only in development) |
| `PORT` | `4000` | HTTP port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/feedants` | Mongo connection string |
| `CORS_ORIGIN` | `*` | `*` or a comma-separated list of allowed origins |

Optional check of the no-overbooking guarantee (needs a running Mongo):
```bash
npm run test:concurrency    # 30 users race for 5 spots; prints PASS/FAIL
```

### Mobile
```bash
cd mobile
cp .env.example .env        # paste the IDs printed by `npm run seed`
npm install
npx expo install expo-clipboard react-native-screens react-native-safe-area-context react-native-svg
npx expo start              # press a (Android), i (iOS), or scan the QR with Expo Go
```

`mobile/.env.example`

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Android emulator: `http://10.0.2.2:4000`; iOS simulator: `http://localhost:4000`; physical phone: `http://<your-LAN-IP>:4000` (same Wi-Fi as your computer) |
| `EXPO_PUBLIC_DEMO_COMPETITION_ID` | Competition to open. Printed by the seed script |
| `EXPO_PUBLIC_DEMO_USER_ID` | The "logged-in" demo user. Printed by the seed script |

Restart Expo (`npx expo start -c`) after editing `.env`; `EXPO_PUBLIC_*` values are inlined at build time.

### Demo scenarios (seeded)

| Competition | Diya (not registered) | Aarav (registered) |
|---|---|---|
| Feedants Classical Dance: ₹99 entry, ₹1,500 pool, 19/20 spots, submission open | **State A** Register Now (₹99) | **State B** Upload Submission |
| Feedants Street Photography: submission opens in 3 days | State A | **State C** Registered (Starts on ...) |
| Feedants Sketch Masters: 10/10 spots | **State D** Registration Closed | State D |

Switch the demo user by changing `EXPO_PUBLIC_DEMO_USER_ID`. Seed dates are relative to the time you run `npm run seed`, so countdowns are always live.

---

## 3. API reference

All responses use `{ success: true, data }` or `{ success: false, error: { code, message, details? } }`.

| Method & path | Body / query | Notes |
|---|---|---|
| `GET /api/competitions/:id?userId=` | `userId` optional | Returns `{ competition, state, viewer }`. `state` includes `serverTime`; `viewer` is `null` without `userId` |
| `POST /api/competitions/:id/register` | `{ userId }` | 201 on success. Atomic spot claim (section 5) |
| `POST /api/competitions/:id/submit` | `{ userId, title, description?, fileUrl }` | `fileUrl` must be https. Only within the submission window |

Error codes: `VALIDATION_ERROR` (400) · `COMPETITION_NOT_FOUND` (404) · `USER_NOT_FOUND` (404) · `ALREADY_REGISTERED` (409) · `REGISTRATION_CLOSED` (409) · `COMPETITION_FULL` (409) · `REGISTRATION_UNAVAILABLE` (409, safe to retry) · `SUBMISSION_NOT_STARTED` (403) · `SUBMISSION_CLOSED` (403) · `NOT_REGISTERED` (403) · `PAYMENT_REQUIRED` (402) · `ALREADY_SUBMITTED` (409).

Quick test (IDs come from the seed output):
```bash
curl "http://localhost:4000/api/competitions/<competitionId>?userId=<userId>"
curl -X POST http://localhost:4000/api/competitions/<competitionId>/register \
  -H "Content-Type: application/json" -d '{"userId":"<userId>"}'
```

---

## 4. Key architectural decisions

**Time-based state is derived, never stored.** "Registration open", "submission open" and so on are computed from dates plus the current time in one pure function (`getCompetitionState` on the server, `deriveState` on the client). Nothing can go stale, and the same function enforces the rules in the API and drives the UI.

**The server tells the client what time it is.** `GET` returns `serverTime`. The app computes `offset = serverTime - deviceTime` and uses `now = Date.now() + offset`. Countdowns are always `target - now`, never decremented, so they can't drift, they survive the app being backgrounded, and a phone with a wrong clock still shows the right timer.

**The UI flips states by itself.** Because the client derives state against the ticking clock, the CTA changes from *Registered (Starts on ...)* to *Upload Submission* the moment the window opens, with no refetch. If the client guesses wrong, the server still enforces the rule and returns a friendly error, so the client's copy of the logic can never cause bad data.

**CTA logic is a pure function** (`getCtaState(competition, viewer, derivedState)`), covering the four states in the brief plus two extras (*Submitted*, *Submission Closed*). No hooks or side effects, so it's easy to unit-test.

**Server data lives in React Query; Context holds only the session.** Caching, refetching and optimistic updates come for free. Context API is enough for the tiny global state (the demo user). Redux would add ceremony without benefit here.

**Optimistic registration with rollback.** On tap, spots decrement and the user becomes "Registered" immediately. On error the cache is restored and the message is shown. On either outcome the query is invalidated so the screen ends up on the server's truth. Mutations never auto-retry, so a registration POST can't double-fire.

**Thin controllers, fat services, one error envelope.** Controllers validate and shape responses; services hold rules and throw `AppError`; a single error middleware maps Zod, Mongoose, duplicate-key and unknown errors to a consistent JSON shape and hides internals in production.

**Schema choices.** Embedded documents for data always read together (judge, rewards, tab content, previous winners). Money is stored as whole rupees (integers avoid float issues). `spotsRemaining` is a virtual so it can't drift from `spotsFilled`. Cross-field validation (date ordering, rewards ≤ prize pool) runs in a pre-validate hook. Indexes: unique `{competitionId, userId}` on registrations (correctness plus the hot lookup), `{userId, createdAt}`, `{status, registrationDeadline}`, `{categories}`, and unique `slug`.

**Rendering performance.** One ticker at screen level; static sections are `React.memo`'d, so only the countdown bar and CTA bar re-render each second. Tabular digits stop the timer from jittering.

---

## 5. Concurrency: no overbooking

The risk: 5,000 users tap *Register* for the last spot.

`POST /register` does this:

1. **Cheap pre-checks**: the user exists and isn't already registered (friendly errors, no spot touched).
2. **Atomic claim**, one operation:
   ```js
   Competition.findOneAndUpdate(
     { _id, status: 'published',
       registrationDeadline: { $gt: now },
       $expr: { $lt: ['$spotsFilled', '$totalSpots'] } },
     { $inc: { spotsFilled: 1 } }, { new: true })
   ```
   Every rule lives in the filter, and MongoDB applies filter plus `$inc` atomically on that document. If N requests race for the last spot, exactly one matches; the others get `null` and a precise error (`COMPETITION_FULL` or `REGISTRATION_CLOSED`). There is no read-then-write gap, so there's nothing to race.
3. **Insert the `Registration`.** The unique `{competitionId, userId}` index is the last line of defence against duplicate requests (double taps, retries) that slipped past step 1.
4. **Compensate on failure**: if the insert fails, `$inc: -1` releases the spot.

**Failure mode, chosen deliberately.** If the process crashes between steps 2 and 3, one spot leaks (the competition looks one seat fuller than reality). The alternative ordering (insert first, claim after) fails the other way, admitting people without a counted seat, which is worse. A leak is fixed by a reconcile job that sets `spotsFilled` to the count of registrations.

**Submissions** use the same idea: one conditional update that only matches a *paid, not-yet-submitted* registration, so a double tap can't submit twice.

**`npm run test:concurrency`** fires 30 parallel registrations at a 5-spot competition and asserts exactly 5 succeed, `spotsFilled === 5`, and exactly 5 registration documents exist.

### Scaling to thousands of concurrent users

Reads and writes scale differently:

- **Writes.** Registrations for one competition all update one document, so that document is the contention point. Atomic updates keep it *correct*; for extreme bursts, keep it *fast* with:
  1. A **Redis atomic counter/Lua script** as a front gate: claim a seat in Redis in microseconds, reject the rest immediately, and persist to Mongo asynchronously (queue). Mongo stays the source of truth; Redis absorbs the spike.
  2. **Sharded counters**: split the seat pool into K buckets and pick a bucket at random, so writes spread across K documents.
  3. A **virtual waiting room/queue** for very large launches.
- **Reads.** The public part of `GET` (competition content) is identical for everyone. Cache it in Redis or behind a CDN with a short TTL (5-30 s) and fetch only the small viewer-specific part (registration status) uncached. Add **read replicas** for the public reads, but read a user's own registration from the primary, or use `readConcern: majority`/session causal consistency, so users see their own writes.
- **Stateless API.** The Express app holds no state, so it scales horizontally behind a load balancer.

---

## 6. Trade-offs made (and what I'd do next)

| Area | Current | Production upgrade |
|---|---|---|
| **Auth** | `userId` is sent by the client (demo user). Anyone could register as anyone | JWT/session auth; derive `userId` from the token, never the body |
| **Payments** | Mocked as instantly `paid` | Create a Razorpay order, hold the seat as `pending` with a TTL, confirm via signed webhook, release expired holds; idempotency keys on `POST /register` |
| **Seat atomicity** | Claim-then-insert with compensating decrement (works on standalone Mongo) | Multi-document transaction on a replica set (Atlas), plus a reconcile job |
| **File upload** | Client posts an https link | Pre-signed S3/Cloudinary upload URLs, size/type limits, virus scan, in-app file picker |
| **Caching** | None | Redis/CDN for public reads (section 5) |
| **Index management** | `syncIndexes()` at boot for convenience | Run it as a migration step; it drops indexes not in the schema, so avoid it on a shared prod DB |
| **Abuse protection** | Helmet + CORS + body limit | Rate limiting per IP/user, request IDs, structured logging, metrics/alerting |
| **i18n** | ENG / हिंदी toggle is UI only | i18n library (e.g. i18next) and Hindi copy; localized dates |
| **Scope** | Bottom tab bar from the design not built | Add as part of the app shell |
| **Testing** | Pure logic (CTA, countdown, state) is unit-test-ready; one concurrency script | Jest unit tests for the pure functions, integration tests with `mongodb-memory-server`, Detox/Maestro E2E |
| **Time zones** | Stored in UTC, shown in the device's local time | Show the competition's canonical time zone alongside local time |

---

## 7. Known limitations

- No real authentication or payments (see above); do not deploy as-is.
- Previous-winner and judge videos open in the system browser/player via a link; there's no in-app video player.
- "Hear From Our Users" shows a placeholder alert.
- `spotsFilled` for the two extra seeded competitions is set higher than their actual registration documents (demo data), so a reconcile job would flag them.
