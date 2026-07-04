# CUB: Canine Understanding Buddy

Website for matching humans and dogs using:

- A public consumer home page with curated pet-resource links
- A public match quiz (MBTI-style personality + lifestyle + housing + preferences)
- A private partner intake page for shelters/pet shops
- C-BARQ short-form item-level intake with 42 questions
- SQLite dog storage
- MBTI-style, lifestyle, housing, experience, and preference-based matching

**Live:** https://meetmycub.com/

## Run Locally

Pure Python standard library — nothing to install.

```bash
python3 server.py --host 127.0.0.1 --port 4173
```

Open http://127.0.0.1:4173/

### Configuration

`server.py` reads these from flags or the environment (env vars let the host inject
settings in production):

| Setting        | Flag     | Env var        | Default       |
|----------------|----------|----------------|---------------|
| Bind host      | `--host` | `HOST`         | `127.0.0.1`   |
| Port           | `--port` | `PORT`         | `4173`        |
| Data directory | –        | `CUB_DATA_DIR` | `./data`      |

The SQLite database lives at `$CUB_DATA_DIR/cub.sqlite`. In production `CUB_DATA_DIR`
points at a persistent disk so data survives restarts and redeploys.

## Pages

- `/` — public home page (hero + pet-resource links)
- `/match` — public match quiz and results
- `/shelter` — locked shelter question/intake page
- `/partner` — old alias for the shelter intake page

Partner access code: `CUBSHOP`

## Data

The dog database starts empty; partners add dogs through `/shelter`, which stores
them in `data/cub.sqlite`. Consumer matching only reads saved records. Two sample
dogs (Mochi, Rocket) are bundled for demos.

## Deployment

CUB runs on a single AWS EC2 instance (Amazon Linux 2023) behind nginx with Let's
Encrypt TLS. See **[DEPLOY-AWS.md](DEPLOY-AWS.md)** for the full runbook. A
`Dockerfile` is also included for container-based hosting.

## Project layout

| Path                  | Purpose                                          |
|-----------------------|--------------------------------------------------|
| `index.html`, `src/`  | Frontend SPA (vanilla JS + CSS)                  |
| `server.py`           | Stdlib HTTP server + JSON API + SQLite           |
| `assets/`             | Logos and dog images                             |
| `data/cub.sqlite`     | Dog records                                      |
| `deploy/`             | Host provisioning scripts (systemd, nginx, bootstrap) |
| `docs/`               | Research summary and references                  |
