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

## Optional backend dependencies

The backend ships with a minimal `requirements.txt` that keeps Railway builds fast. Machine-learning and analysis extras (e.g. PyTorch, SciPy, pandas) now live in `super-nova-2177/backend/requirements-ml.txt`.

- Default deployments (including Docker Compose) only install `requirements.txt`.
- To enable the optional features locally or in a custom image, install both files:

  ```sh
  pip install -r super-nova-2177/backend/requirements.txt \
              -r super-nova-2177/backend/requirements-ml.txt
  ```

## Railway deployment notes

- Railway will default to the Node buildpack because of the monorepo layout. Deployments should instead target the Python backend by either selecting the repository root Dockerfile (which builds from `super-nova-2177/backend`) or setting the service path to `super-nova-2177/backend`.
- The `Procfile` pins the start command to `uvicorn backend.app:app --host 0.0.0.0 --port ${PORT:-8000}` and ensures `pip install -r super-nova-2177/backend/requirements.txt` runs before boot so requirements are installed even when the backend is not the detected root.

## Stop the services

```sh
docker compose down
```

## Notes
- For production, adjust the environment variables as needed.
- The backend expects the `DATABASE_URL` environment variable to be provided via docker-compose.
- The frontend reads the `NEXT_PUBLIC_API_URL` environment variable to connect to the backend.
