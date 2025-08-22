## Contributing & Development

This guide covers local development, Docker setups, environment variables, and SQL migrations for LeetCode Tracker.

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

See `.env.example` for other environment variables used in this project (the rest are for authentication and deployment). You can create your own GitHub Application for authentication locally.

### Common commands

- Start DB only: `docker compose up -d db`
- Start app locally: `npm run dev`
- Stop everything: `docker compose down`

### Mock data generator

You can quickly seed your database with realistic problem history for development.

Run the generator (DB must be running):

```bash
npm run mock -- --count 80 --days 90 --reset
```

Flags:

- `--count <n>`: how many mock problems to insert (default 50)
- `--days <n>`: spread created_at dates across the last N days (default 60)
- `--reset`: delete existing problems for the target user before inserting
- `--delete`: delete problems for the target user and exit (no insert)
- `--provider <name>`: auth provider for the target user (default `mock`)
- `--provider-account-id <id>`: provider account id for the target user (default `seed`)

Using an existing user (e.g., your GitHub account):

1. Look up your user identifiers:

```bash
psql -h 127.0.0.1 -p 5433 -U postgres -d leettracker -c "SELECT id, provider, provider_account_id, name, email FROM users;"
```

2. Pass those to the generator:

```bash
npm run mock -- --provider github --provider-account-id <THE_ID_FROM_DB> --count 80 --days 90 --reset
```

Notes:

- If the `provider`/`provider_account_id` pair doesn’t exist, the script creates a user.
- Migrations are applied automatically if needed.
- The generator respects `DATABASE_URL` just like the app.
- Problem titles are sampled randomly from the LeetCode 150 set; URLs are derived from title slugs.

### Data persistence

- Postgres data is stored in the named volume `leet-tracker_db_data` defined in `docker-compose.yml`.
- Your data persists across container restarts. It is only removed if you pass `-v` to `docker compose down`.

### SQL migrations

- Place SQL files in the `migrations/` directory with filenames like `001_name.sql`, `002_other.sql`.
- On first API call, the app creates a `migrations` table and applies any pending SQL files in ascending filename order, recording applied files.
- Migrations are idempotent: already-recorded files are skipped.
- To apply new migrations, add a new `NNN_description.sql` and hit any API route (e.g. `/api/problems`).
