## System Design Template

### 1. Requirements
- Functional requirements
- Non-functional requirements
- Out of scope

### 2. Back-of-the-envelope estimations
- Daily active users and read/write mix
- Storage growth (1 year or active period)
- Network usage (RPS, bandwidth, peak)

### 3. API design and data representation
- Core entities and fields
- External API surface (REST/gRPC/GraphQL)
- Pagination, rate limits, auth

### 4. High-level design
- Services and components
- Request flows
- External integrations

### 5. Database design
- Primary schema (tables/collections)
- Replication, sharding, backups
- Object storage (if needed)

### 6. Detailed design choices
- Caching, CDN, queues
- Consistency trade-offs
- Security, privacy, auth
- Failure handling and observability
