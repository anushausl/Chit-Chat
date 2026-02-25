Quick Deploy (easy path) — Docker + Render / VPS

Overview
- This project can be deployed quickly using Docker. You can run the container on a VPS or use a managed service that supports Docker containers (Render, Fly, Railway, etc.).

Local quick run (Docker)
1. Build image locally:

```bash
docker build -t chit-chat:local .
```

2. Run (recommended with env vars):

```bash
docker run -e PORT=3000 -e JWT_SECRET=replace_this_secret -e ADMIN_USERNAME=admin -e ADMIN_PASSWORD=admin123 -e ADMIN_TOKEN=change_me -p 3000:3000 chit-chat:local
```

3. Open http://localhost:3000

Local compose (app + redis)

```bash
docker-compose up --build
```

Deploy to Render (simple GUI):
- Push your repo to GitHub.
- On Render (https://render.com) create a new Web Service and connect your GitHub repo.
- Choose Docker for Environment (Render will use the Dockerfile in repo).
- Set environment variables on Render dashboard: `PORT` (3000), `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_TOKEN`.
- Deploy — Render builds the image and runs the service.

Deploy to a VPS (Ubuntu) — minimal steps:
1. Install Docker and docker-compose.
2. Copy repo to server (git clone).
3. Set up environment file `.env` with secrets.
4. Run `docker-compose up -d --build`.
5. Set up `nginx` as reverse proxy and enable TLS (Certbot) for your domain.

CI/CD
- Use the included GitHub Action to build and push Docker images to Docker Hub on push to `main`.
- Add `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` as GitHub secrets.

	- When running multiple instances, set `REDIS_URL` (e.g. `redis://redis:6379`) and ensure Redis is reachable by all instances.
	- The project now includes Redis adapter wiring in `server/app.js` and `docker-compose.yml` exposes `REDIS_URL`.

- Create a Render/YAML config for automated deploys.
Which one should I do next?