# Düşmanı Tanı Platform — Deployment Guide

Üretim ortamında deployment için adım adım rehber.

## Ön Koşullar

- Docker & Docker Compose
- Kubernetes (k3s veya başka flavor)
- PostgreSQL 16+ (managed service veya self-hosted)
- Redis 7+ (managed service veya self-hosted)
- Meilisearch 1.3+ (managed service veya self-hosted)
- MinIO (S3-compatible object storage)
- GitHub Actions (CI/CD) erişimi
- Domain & SSL certificate

## Ortam Değişkenleri

### API (.env.production)

```bash
# Database
DATABASE_URL=postgresql://user:password@db.example.com:5432/production
DATABASE_URL_TEST=postgresql://user:password@db.example.com:5432/test

# Cache
REDIS_URL=redis://cache.example.com:6379

# Search
MEILISEARCH_URL=https://search.example.com
MEILISEARCH_API_KEY=sk_production_...

# File Storage
S3_ENDPOINT=https://storage.example.com
S3_REGION=us-east-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=production

# Auth
JWT_SECRET=use-strong-random-key
JWT_EXPIRATION=86400

# Application
NODE_ENV=production
LOG_LEVEL=info
PORT=3001
```

### Web/Admin (.env.production.local)

```bash
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_GA_ID=UA-...
```

## PostgreSQL Kurulum

### Tabloları Oluştur

```bash
# Production veritabanını oluştur
createdb -h db.example.com -U postgres production

# Extension'ları etkinleştir
psql -h db.example.com -U postgres -d production -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql -h db.example.com -U postgres -d production -c "CREATE EXTENSION IF NOT EXISTS uuid-ossp;"
psql -h db.example.com -U postgres -d production -c "CREATE EXTENSION IF NOT EXISTS json;"

# Migration'ları çalıştır
pnpm db:migrate:deploy
```

### Yedekleme

```bash
# Günlük yedekleme (cron job)
pg_dump -h db.example.com -U postgres production | gzip > backup-$(date +%Y%m%d).sql.gz

# Geri yükleme
gunzip < backup-20240807.sql.gz | psql -h db.example.com -U postgres -d production
```

## Redis Kurulum

### Temel Konfigürasyon

```conf
# redis.conf (production)
port 6379
bind 127.0.0.1
requirepass strong-password-here
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Başlat

```bash
redis-server /etc/redis/redis.conf --daemonize yes
redis-cli -a strong-password-here ping  # PONG
```

## Meilisearch Kurups

### Docker ile

```bash
docker run -d --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY=production-key-here \
  -e MEILI_ENV=production \
  -v /data/meilisearch:/meili_data \
  getmeili/meilisearch:latest
```

### Index Setup

```bash
curl -X POST http://meilisearch:7700/indexes \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer production-key' \
  -d '{"uid":"entities","primaryKey":"id"}'

# Settings'i konfigüre et
curl -X PATCH http://meilisearch:7700/indexes/entities/settings \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer production-key' \
  -d '{
    "searchableAttributes": ["canonicalName", "description"],
    "filterableAttributes": ["type", "status", "visibility"],
    "sortableAttributes": ["canonicalName", "createdAt"],
    "typoTolerance": {"enabled": true}
  }'
```

## Docker Image Build

### API

```bash
docker build -f infra/docker/Dockerfile.api \
  -t registry.example.com/api:1.0.0 .

docker push registry.example.com/api:1.0.0
```

### Web & Admin

```bash
docker build -f infra/docker/Dockerfile.web \
  -t registry.example.com/web:1.0.0 .

docker build -f infra/docker/Dockerfile.admin \
  -t registry.example.com/admin:1.0.0 .
```

## Kubernetes Deployment

### Namespace & Secrets

```bash
kubectl create namespace production
kubectl apply -f infra/k8s/secrets.yaml -n production
kubectl apply -f infra/k8s/configmaps.yaml -n production
```

### Services

```bash
# API
kubectl apply -f infra/k8s/api-deployment.yaml -n production
kubectl apply -f infra/k8s/api-service.yaml -n production

# Web
kubectl apply -f infra/k8s/web-deployment.yaml -n production
kubectl apply -f infra/k8s/web-service.yaml -n production

# Ingress
kubectl apply -f infra/k8s/ingress.yaml -n production
```

### Health Checks

```bash
# API
curl https://api.example.com/health

# Web
curl https://example.com/
```

## SSL/TLS Sertifikası

### Let's Encrypt ile

```bash
certbot certonly --standalone \
  -d example.com \
  -d api.example.com \
  -d admin.example.com \
  -d search.example.com \
  --non-interactive \
  --agree-tos \
  -m admin@example.com
```

### Nginx Konfigürasyonu

```nginx
server {
  listen 443 ssl http2;
  server_name example.com api.example.com admin.example.com;

  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # API
  location ~ ^/api/ {
    proxy_pass http://api:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Admin
  location /admin/ {
    proxy_pass http://admin:3002/;
  }

  # Web
  location / {
    proxy_pass http://web:3000;
  }
}

# HTTP'yi HTTPS'ye yönlendir
server {
  listen 80;
  server_name example.com api.example.com admin.example.com;
  return 301 https://$server_name$request_uri;
}
```

## Monitoring & Logging

### Prometheus Metrikleri

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'api'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
```

### ELK Stack (Logs)

```bash
# Logstash Pipeline (logstash.conf)
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  mutate {
    add_field => { "[@metadata][index_name]" => "logs-%{+YYYY.MM.dd}" }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][index_name]}"
  }
}
```

## Performance Tuning

### PostgreSQL

```sql
-- Shared buffers (25% of RAM)
ALTER SYSTEM SET shared_buffers = '16GB';

-- Effective cache size (50-75% of RAM)
ALTER SYSTEM SET effective_cache_size = '48GB';

-- Work memory
ALTER SYSTEM SET work_mem = '20MB';

-- Random page cost (for SSD)
ALTER SYSTEM SET random_page_cost = 1.1;

-- Index optimization
CREATE INDEX idx_entities_type ON "Entity"(type);
CREATE INDEX idx_entities_status ON "Entity"(status);
CREATE INDEX idx_relations_verified ON "Relation"(verificationStatus);
CREATE INDEX idx_timeline_entity_date ON "TimelineEvent"(entityId, occurredAt DESC);

-- PostGIS spatial index
CREATE INDEX idx_entity_location ON "Entity" USING GIST(location);
```

### Redis

```conf
# Memory optimization
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence (RDB + AOF)
save 900 1
appendonly yes
appendfsync everysec
```

## CI/CD Pipeline

GitHub Actions workflow: `.github/workflows/ci.yml`

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build images
        run: docker-compose build
      - name: Push to registry
        run: docker-compose push
      - name: Deploy to k8s
        run: kubectl set image deployment/api api=${{ env.IMAGE }}
```

## Backup & Disaster Recovery

### Günlük Yedekleme

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)

# Database
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > backup_db_$DATE.sql.gz

# Redis
redis-cli -h $REDIS_HOST --rdb backup_redis_$DATE.rdb

# Upload S3'e
aws s3 cp backup_db_$DATE.sql.gz s3://backups/production/
aws s3 cp backup_redis_$DATE.rdb s3://backups/production/

# Eski yedekleri sil (30 günlük retention)
aws s3 rm s3://backups/production/ --recursive --include "*" --older-than 30
```

### Disaster Recovery

```bash
# Database restore
gunzip < backup_db_20240807.sql.gz | psql $DATABASE_URL

# Redis restore
redis-cli BGREWRITEAOF
cp backup_redis_20240807.rdb /var/lib/redis/dump.rdb
redis-cli SHUTDOWN
redis-server /etc/redis/redis.conf

# Verify data integrity
pnpm db:validate
```

## Troubleshooting

### Database bağlantı hatası

```bash
# Connection test
psql -h db.example.com -U postgres -d production -c "SELECT 1"

# Logs
docker logs api-container
kubectl logs deployment/api -n production
```

### Cache miss yüksek

```bash
# Redis memory usage
INFO memory

# Top keys
redis-cli --bigkeys

# Memory optimization
CONFIG GET maxmemory-policy
CONFIG SET maxmemory-policy allkeys-lru
```

### Search sorguları yavaş

```bash
# Meilisearch stats
curl http://meilisearch:7700/stats

# Index optimization
curl -X POST http://meilisearch:7700/indexes/entities/update-settings \
  -H 'Authorization: Bearer key' \
  -d '{"typoTolerance":{"enabled":true}}'
```

## Güvenlik Checklist

- [ ] HTTPS/TLS etkinleştirilmiş
- [ ] Database ve Redis parolalar strong
- [ ] JWT secrets production-grade
- [ ] API rate limiting aktif
- [ ] CORS properly configured
- [ ] WAF rules enabled
- [ ] Firewalls configured
- [ ] Log retention policies set
- [ ] Backup encryption enabled
- [ ] Regular security audits scheduled

## Support & Monitoring

- **Uptime Monitoring:** Monitoring service (e.g., Datadog, New Relic)
- **Alert Channels:** PagerDuty, Slack, Email
- **On-call Rotation:** Weekly rotation
- **SLA Targets:** 99.9% uptime, <2s API response
