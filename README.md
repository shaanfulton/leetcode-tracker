## LeetCode Tracker

Next.js app for tracking LeetCode progress with a heuristic algorithm to help you determine what topics you should focus your practice efforts on.

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm (for local dev workflow)

### Option A: Local dev app + Dockerized Postgres (recommended)

1. Start the database container:

```bash
docker compose up -d db
```

2. Start the Next.js dev server (hot reload):

```bash
npm install
npm run dev
```

3. Open the app: `http://localhost:3000`

- The app will connect to the DB at `postgresql://postgres:postgres@127.0.0.1:5433/leettracker` by default.
- Tables are auto-created on first API call.

To stop the DB container:

```bash
docker compose down
```

### Option B: Run both app and DB in Docker (production-like)

This builds the app and runs it without hot reload:

```bash
docker compose up -d db web
```

Then open: `http://localhost:3000`

View logs:

```bash
docker compose logs -f web
docker compose logs -f db
```

Stop all containers:

```bash
docker compose down
```

### Environment variables

- App uses `DATABASE_URL`.
  - Local dev default (no .env required): `postgresql://postgres:postgres@127.0.0.1:5433/leettracker`
  - In `docker-compose.yml`, the `web` service uses: `postgresql://postgres:postgres@db:5432/leettracker`

To override locally, create `.env.local` at the project root:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/leettracker
```

### Common commands

- Start DB only: `docker compose up -d db`
- Start app locally: `npm run dev`
- Stop everything: `docker compose down`

### Data persistence

- Postgres data is stored in the named volume `leet-tracker_db_data` defined in `docker-compose.yml`.
- Your data persists across container restarts. It is only removed if you pass `-v` to `docker compose down`.

### SQL migrations

- Place SQL files in the `migrations/` directory with filenames like `001_name.sql`, `002_other.sql`.
- On first API call, the app creates a `migrations` table and applies any pending SQL files in ascending filename order, recording applied files.
- Migrations are idempotent: already-recorded files are skipped.
- To apply new migrations, add a new `NNN_description.sql` and hit any API route (e.g. `/api/problems`).
