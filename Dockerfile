# CUB: Canine Understanding Buddy — production image.
# Pure Python stdlib app (no pip dependencies), so a slim base is all we need.
FROM python:3.12-slim

WORKDIR /app
COPY . .

# Bind all interfaces and keep the SQLite DB on the mounted persistent disk.
# PORT is supplied by the host (Render) at runtime and read by server.py.
ENV HOST=0.0.0.0 \
    CUB_DATA_DIR=/var/data \
    PYTHONUNBUFFERED=1

EXPOSE 10000

CMD ["python3", "server.py"]
