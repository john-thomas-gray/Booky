## System Design (Interview-Style)

### 1) Goal and Audience (1 page)
**Goal**: Explain what Booky is, why the design works, key tradeoffs, and how
the system scales or fails under load.
**Audience**: An interviewer or senior engineer who needs clarity fast.
**Timebox**: 5-minute overview with 20–30 minute deep-dive expansion.

**Elevator pitch (3–6 sentences)**
Booky is a web app that helps book clubs organize meetings, track reading
progress, and gamify participation through betting and points. Users create
clubs, schedule meetings tied to books, and update progress as they read.
FastAPI provides a clean REST layer and PostgreSQL keeps relational data
consistent across users, clubs, meetings, and bets. The design favors a simple
monolithic backend for fast development and clear ownership, with room to scale
via caching, background jobs, and read replicas.

**Non-goals**
- Real-time chat or live collaborative features.
- Payments, monetary wagering, or regulated gambling compliance.
- Complex recommendation engines or personalization.
- Multi-tenant enterprise controls and advanced audit trails.

---

### 2) System Definition (One Picture + One Paragraph)

**System context diagram (whiteboard-friendly)**
```
[User]
   |
   v
[Web UI (React/Vite)]
   |
   v
[FastAPI API Service] ----> [Google Books API]
   |
   v
[PostgreSQL]
```

**Flow narrative**
A request enters through the React UI, which calls the FastAPI backend. The
backend authenticates the user, applies authorization rules, reads or writes
data in PostgreSQL, optionally fetches book metadata from Google Books, and
returns a JSON response to the client.

---

### 3) Requirements (with priorities)

**Functional requirements**
- **P0**: User registration, login, and authenticated sessions.
- **P0**: CRUD for clubs and meetings.
- **P0**: Join/leave clubs and list membership.
- **P0**: Track meeting attendance and reading progress.
- **P1**: Place and resolve bets on meeting outcomes.
- **P1**: Friend management and friend requests.
- **P1**: Search for books via Google Books API.
- **P2**: Leaderboards and gamified scoring views.

**Non-functional requirements**
- **P0**: Data durability (PostgreSQL).
- **P0**: Basic auth security (hashed passwords, JWT/session).
- **P1**: p95 API latency < 500ms under normal load.
- **P1**: Availability > 99% for API and DB.
- **P2**: Cost-efficient deployment (single DB + API).

**Constraints**
- Small team, student project timeline.
- Monolith backend for simplicity.
- Docker Compose for local orchestration.
- No complex cloud infrastructure dependencies.

---

### 4) High-Level Architecture (Box-and-Arrows)

**Architecture overview diagram**
```
         +---------------------+
         |   Web Client (UI)   |
         +----------+----------+
                    |
                    v
         +----------+----------+
         |     FastAPI API     |
         |  Auth + Business    |
         |      Logic          |
         +----------+----------+
                    |
          +---------+---------+
          |   PostgreSQL DB   |
          +---------+---------+
                    |
         +----------+----------+
         |  Google Books API  |
         +--------------------+
```

**Component responsibilities**
- **Web client**: User interface, form validation, session storage, API calls.
- **FastAPI**: Auth, validation, business logic, data access orchestration.
- **PostgreSQL**: Source of truth for users, clubs, meetings, bets, friendships.
- **Google Books API**: External lookup for book metadata.

---

### 5) Key End-to-End Flows (3)

**Flow A: Create a club**
1. Trigger: User submits club creation form.
2. Entry point: `POST /clubs`.
3. AuthN/AuthZ: Validate JWT; ensure user is authenticated.
4. Logic: Create club record with `owner_id` as current user.
5. DB writes: Insert row in `clubs`; insert `clubs_members` for owner.
6. Response: Newly created club data.
7. Failure handling: Reject if missing fields; return 401 if unauthenticated.
8. Correctness: Owner membership is guaranteed by inserting both records.
9. Risk: No FK constraints in DB; relies on app logic for consistency.

**Flow B: Update meeting progress**
1. Trigger: Attendee updates progress on meeting page.
2. Entry point: `PUT /meetings/{id}/attendees`.
3. AuthN/AuthZ: JWT required; user must be meeting attendee.
4. Logic: Update `attendee_page`, `finished` fields in `meetings_attendees`.
5. DB writes: Update by `(meeting_id, attendee_id)`.
6. Response: Updated progress record.
7. Failure handling: 404 if meeting/attendee not found; 403 if not a member.
8. Correctness: Single-row update per attendee per meeting.
9. Risk: Concurrent updates can overwrite without optimistic locking.

**Flow C: Place a bet**
1. Trigger: User submits bet on a meeting outcome.
2. Entry point: `POST /bets`.
3. AuthN/AuthZ: JWT required; user must be participant in the meeting.
4. Logic: Insert bet row keyed by `(meeting_id, better_id)`.
5. DB writes: Insert into `bets`.
6. Response: Bet confirmation.
7. Failure handling: Reject duplicates (PK conflict); 400 on invalid inputs.
8. Correctness: Unique bet per user per meeting via composite PK.
9. Risk: No transaction tying to meeting lifecycle.

---

### 6) Data Model and Storage Decisions

**Major entities and relationships**
- Users own clubs, attend meetings, place bets, and make friends.
- Clubs have members and meetings.
- Meetings have attendees and bets.
- Books are referenced by title for meetings.

**Example schema (top 5 tables)**
- `users(id PK, username, password, email, score, picture_url)`
- `clubs(club_id PK, owner_id, name, location fields, score)`
- `meetings(id PK, club_id, book_title, active)`
- `meetings_attendees(meeting_id PK, attendee_id PK, attendee_page, finished)`
- `bets(meeting_id PK, better_id PK, horse_id, amount, paid)`

**Indexes (implicit via PKs)**
- Composite PKs on join tables for fast membership and bet lookups.
- Primary keys on `users`, `clubs`, `meetings` for direct access.

**Read/write patterns**
- Read: list clubs, meetings, attendees, and progress by foreign keys.
- Write: create clubs/meetings, update progress, insert bets.
- Joins: frequent joins between users, clubs, and meetings.

**Data lifecycle**
- No TTL/archival currently; data retained indefinitely.
- Migrations stored in `api/migrations/`.

**Storage rationale**
- SQL fits the relational structure and many-to-many relationships.
- No need for NoSQL or search indexes at current scale.

---

### 7) API and Interface Design

**Auth model**
- JWT-based auth with protected routes (FastAPI utilities).

**Top endpoints (illustrative)**
| Endpoint | Purpose | Notes |
|---|---|---|
| `POST /auth/login` | Authenticate user | Returns JWT |
| `POST /users` | Create user | Signup |
| `GET /clubs` | List clubs | Public or auth-dependent |
| `POST /clubs` | Create club | Requires auth |
| `POST /meetings` | Create meeting | Requires club ownership |
| `PUT /meetings/{id}/attendees` | Update progress | Requires attendance |
| `POST /bets` | Place bet | Requires auth |

**Pagination/filtering**
- Not explicitly defined; can be added as `?limit`/`?offset`.

**Versioning**
- Not implemented; would add `/v1` prefix or header-based versioning.

**Idempotency**
- Composite PKs provide natural dedupe for some actions (bets).

---

### 8) Scalability and Performance

**Current scale (assumed)**
- Tens to hundreds of users; low RPS.
- Single API service + single DB.

**Bottlenecks**
- DB joins on membership and attendance tables.
- External API rate limits (Google Books).

**Next 10x plan**
- Add caching for Google Books responses.
- Add read replicas for PostgreSQL.
- Add background jobs for bet resolution.
- Add rate limiting for search endpoints.

---

### 9) Reliability and Failure Modes

**Resiliency patterns used**
- Simple retries for external API calls (candidate improvement).
- Data stored in a durable SQL DB.

**Failure mode table**
| Failure | Impact | Detection | Mitigation |
|---|---|---|---|
| DB outage | All reads/writes fail | Health checks | Backups + restart |
| Google Books API down | Book search fails | API error responses | Cache + fallback UI |
| JWT invalid/expired | User blocked | 401 responses | Re-auth flow |
| Partial writes (no FK) | Data inconsistency | Unexpected joins | Add FK + validations |

---

### 10) Security

**Threat model**
- Protect user credentials and club data from unauthorized access.

**Mitigations**
- Auth via JWT; protected routes in API.
- Input validation with FastAPI models.
- HTTPS in production deployment.
- Secrets via environment variables.

---

### 11) Observability and Operations

**Health indicators**
- API error rate and latency.
- DB connection availability and slow queries.

**Logging**
- Structured logs from API endpoints (recommended).

**Deployment**
- Docker Compose locally; CI/CD can automate builds and deploys.

**Runbook examples**
- If API error spikes: check DB connectivity and recent deploys.
- If search fails: check Google Books API availability.

---

### 12) Tradeoffs, Alternatives, and Next Steps

**Decision log**
- **Monolith vs microservices**: chose monolith for simplicity and speed.
- **SQL vs NoSQL**: chose SQL for strong relational modeling.
- **No FK constraints**: faster migrations but higher consistency risk.

**What I’d change next**
- Add foreign keys and constraints.
- Add background job runner for bet resolution.
- Improve caching and rate limiting.

---

### 13) Closing Summary (60–90 seconds)
Booky is a web app that organizes book clubs, meetings, and reading progress,
and adds gamification via bets and scoring. The system uses a React frontend,
a FastAPI monolith backend, and PostgreSQL for reliable relational storage.
Key design choices include a simple monolith architecture and normalized SQL
tables for relationships, prioritizing clarity and speed of development. The
largest risks are external API dependency and lack of explicit FK constraints,
both addressable with caching and schema hardening. With more time, I would add
background jobs, caching, and stronger DB constraints to scale safely.

---

### Afterward: Critique (What Impresses vs Amateurish)

**What would impress an interviewer**
- Clear product scope and explicit non-goals.
- Solid relational model with normalized join tables.
- Explicit prioritization of requirements (P0/P1/P2).
- Thoughtful scalability roadmap (caching, jobs, replicas).
- Honest risk identification and mitigations.

**What feels amateurish**
- Missing foreign key constraints and reliance on app logic for integrity.
- `books.title` as a primary key while `book_id` is non-PK.
- No background jobs for bet resolution or consistency tasks.
- Limited observability and operational runbooks.
- Minimal idempotency and concurrency controls.
