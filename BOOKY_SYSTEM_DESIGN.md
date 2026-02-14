## Booky System Design

### 1. Requirements
- Functional requirements
  - User signup/login with JWT auth.
  - Create/join clubs and manage memberships.
  - Create meetings with assigned books and track attendance.
  - Track reading progress and place bets on outcomes.
  - Search for books via Google Books API.
- Non-functional requirements
  - Read-heavy for club/meeting pages.
  - Low latency for core CRUD APIs.
  - Eventual consistency acceptable for leaderboards.
  - High availability for browsing; strong consistency for auth.
- Out of scope
  - Payments and monetization.
  - Realtime chat or notifications.

### 2. Back-of-the-envelope estimations
- DAU: small-to-medium community scale.
- Read/write mix: ~80/20 (browse vs. create/update).
- Storage: user, club, meeting, bet records; growth modest per year.
- Network: low to moderate RPS; Google Books lookups cached later.

### 3. API design and data representation
- Entities: users, clubs, meetings, books, bets, friendships, requests.
- REST endpoints in FastAPI routers (auth, users, clubs, meetings, books).
- Pagination on list endpoints; JWT bearer auth on protected routes.

### 4. High-level design
- Frontend: React + Vite app in `ghi/`.
- Backend: FastAPI service in `api/`.
- Database: PostgreSQL with migrations in `api/migrations/`.
- External integration: Google Books API for book search.
- Deployment: Docker Compose for local orchestration.

### 5. Database design
- Tables: users, clubs, meetings, books, bets, friendships, requests.
- Join tables: clubs_members, clubs_meetings, meetings_attendees.
- Indexes on foreign keys for membership and meeting queries.
- Backups via database snapshots (local/dev default).

### 6. Detailed design choices
- Caching: optional cache for Google Books responses.
- Queues: future background job for bet settlement.
- Consistency: transactional updates for bets and meeting outcomes.
- Security: JWT validation, role checks on club ownership.
- Observability: structured logging and error responses.
