## High-Level System Design

### Overview
Booky is a web application for book clubs that combines meeting scheduling,
reading progress tracking, social features, and betting on reading outcomes.
It is composed of a React-based frontend, a FastAPI backend, a local
PostgreSQL database (Docker volume), and an external integration with the
Google Books API.

### Goals
- Provide a friendly UI for clubs, meetings, and betting.
- Offer secure authentication and role-based access.
- Track progress and compute points based on betting outcomes.
- Support search and selection of books via Google Books API.

### Architecture
- Frontend: Single-page app built with Vite + React in `ghi/`.
- Backend API: FastAPI service in `api/` exposing REST endpoints.
- Database: local PostgreSQL with migrations in `api/migrations/`.
- External Service: Google Books API for book lookup.
- Local orchestration: Docker Compose in `docker-compose.yaml`.

### Primary Components
#### Frontend (React + Vite)
- UI components for auth, clubs, meetings, books, and betting.
- Calls the backend via HTTP for all core data operations.
- Uses an auth service and hooks to manage user sessions.

#### Backend (FastAPI)
- Router modules handle feature areas: users, auth, clubs, meetings,
  books, bets, friends, and requests.
- Query modules provide data access and encapsulate SQL interactions.
- Authentication utilities manage JWT generation/validation.
- Models define domain entities and request/response schemas.

#### Database (Local PostgreSQL)
- Core entities: users, clubs, meetings, books, bets, friends, requests.
- Association tables manage membership and attendance.
- Migrations define schema evolution.

#### External Integration
- Google Books API is used for searching and selecting books
  to create meeting content.

### Key Data Flows
#### Authentication
1. User signs up or signs in via the frontend.
2. Backend validates credentials and issues a JWT.
3. Frontend stores the token and attaches it to requests.
4. Backend authorizes protected routes using JWT validation.

#### Club and Meeting Management
1. Users create or join clubs.
2. Owners create meetings and associate a book.
3. Attendees update reading progress.
4. Backend stores progress and exposes it to attendees.

#### Betting and Points
1. Users place bets on meeting outcomes.
2. Backend calculates results when meetings conclude.
3. Points are awarded and reflected in leaderboards.

#### Book Search
1. User searches for books in the UI.
2. Frontend calls backend, which queries Google Books API.
3. Results are returned and can be selected for meetings.

### Cross-Cutting Concerns
- Authorization: enforce owner/member permissions for club data.
- Validation: request validation via FastAPI models.
- Error handling: consistent API error responses via shared utilities.
- Deployment: containerized services with Docker Compose.

### Future Considerations
- Background jobs for meeting conclusion and bet resolution.
- Caching for Google Books API results.
- Observability with structured logging and metrics.
