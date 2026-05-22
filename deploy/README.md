# Deploy ke VPS

Alur manual: build di lokal → push Docker Hub → pull di VPS → `docker compose up -d`.

## Prasyarat

- Nginx Proxy (jwilder/nginx-proxy + acme-companion, atau NPM, atau Traefik) sudah jalan di VPS dan membuat external Docker network.
- DNS `pilahyuk.aspriai.my.id` sudah diarahkan ke IP VPS.
- Akun Docker Hub yang sudah `docker login` di lokal.

## Konfigurasi awal

1. Buka `docker-compose.yml`. Ganti nama network `nginx-proxy` di blok `networks` agar sama persis dengan network proxy di VPS:
   ```bash
   docker network ls   # cari nama proxy network
   ```
2. Kalau proxy yang dipakai bukan `jwilder/nginx-proxy`:
   - **Nginx Proxy Manager:** buang blok `environment`, atur host & SSL dari UI NPM. Pastikan container ikut network NPM.
   - **Traefik:** ganti `environment` jadi `labels` Traefik (`traefik.enable=true`, `traefik.http.routers.pilahyuk.rule=Host(...)`, dst).

## Build & push (di lokal)

```bash
docker build -t azmifauzan/pilahyuk:latest .
docker push azmifauzan/pilahyuk:latest
```

## Deploy pertama (di VPS)

```bash
mkdir -p /opt/pilahyuk && cd /opt/pilahyuk
# salin deploy/docker-compose.yml ke sini
docker compose pull
docker compose up -d
docker compose logs -f
```

## Update

```bash
cd /opt/pilahyuk
docker compose pull && docker compose up -d
```

## Rollback cepat

Tag image sebelum push baru:

```bash
docker tag azmifauzan/pilahyuk:latest azmifauzan/pilahyuk:$(date +%Y%m%d-%H%M)
docker push azmifauzan/pilahyuk:$(date +%Y%m%d-%H%M)
```

Di VPS, ubah `image:` ke tag tadi lalu `docker compose up -d`.
