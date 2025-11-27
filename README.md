# super-nova-2177

# Deploy with Docker

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

## Configuration

1. **Set up the `.env` file at the root of the project (next to `docker-compose.yml`):**

   Create a `.env` file with the following content (adjust as needed):

   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=example
   POSTGRES_DB=postgres
   POSTGRES_PORT=5433
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

2. **Configure the frontend `.env` file:**

   The file `super-nova-2177/frontend/.env` should already contain:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   Adjust if needed to reflect the backend address in production.

## Start the services

In the directory containing `docker-compose.yml`, run:

```sh
docker compose up -d
```

This will build and start the services:
- **db** (PostgreSQL)
- **backend** (FastAPI)
- **frontend** (Next.js)

The frontend will be available at [http://localhost:3000](http://localhost:3000) and the backend API at [http://localhost:8000](http://localhost:8000).

The backend image installs `supernova_2177_ui_weighted` in editable mode at `/app/supernova_2177_ui_weighted`, and Docker Compose bind-mounts the same directory locally. If you install dependencies on your host instead of Docker, run `pip install -r super-nova-2177/backend/requirements.txt` from the `super-nova-2177` folder so the editable dependency resolves to the same path.

## Stop the services

```sh
docker compose down
```

## Notes
- For production, adjust the environment variables as needed.
- The backend expects the `DATABASE_URL` environment variable to be provided via docker-compose.
- The frontend reads the `NEXT_PUBLIC_API_URL` environment variable to connect to the backend.

## Railway deployment

To mirror the existing `Procfile` when deploying to Railway:

- Set the **start command** to `cd super-nova-2177 && uvicorn backend.app:app --host 0.0.0.0 --port $PORT`.
- Set the **working directory** to `super-nova-2177` so `backend` resolves as a package.

After redeploying with these settings, the logs should show `Loaded application 'backend.app:app'` instead of `/app/app.py`.
