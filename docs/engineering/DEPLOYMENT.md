# Deployment — Coolify/VPS

## Initial topology

One VPS is acceptable for the target MVP, but deploy components as separate containers/resources
so they can move independently later.

```text
Internet
  |
Coolify proxy / TLS
  |-------------------- apps/web
  |-------------------- apps/api
                          |
                    private network
        +-----------------+------------------+
        |                 |                  |
     worker          PostgreSQL 18.6       WAHA
        |                 |
        +---------- S3-compatible media
```

Only public web/api endpoints should be internet exposed. PostgreSQL and WAHA should remain private
unless a documented operational need says otherwise.

## Coolify resource strategy

Prefer Git-backed or OCI-image applications with version-controlled deployment configuration.
Docker Compose is appropriate for local and multi-container service definitions.

Production:
- pinned image tags/digests;
- health checks;
- restart policy;
- CPU/memory limits where useful;
- persistent volumes explicitly defined;
- backup path tested;
- graceful `SIGTERM`;
- non-root containers where supported.

## Database

For early MVP the DB may run on the same VPS, but treat it as replaceable infrastructure:
- scheduled backups;
- off-host backup copy;
- periodic restore test;
- dedicated persistent storage;
- versioned PostgreSQL image;
- no public DB port;
- separate app/migration DB roles.

Move PostgreSQL to a separate VPS/managed service before CPU/IO contention or availability risk
becomes material.

## WAHA

- version pin;
- persistent session data according to chosen engine;
- internal-only service exposure;
- dashboard/Swagger disabled or strongly protected in production;
- API key and webhook HMAC secrets in Coolify;
- backup/re-auth runbook.

## Staging isolation

Even if staging is on the same VPS:
- separate Coolify project/resource;
- separate DB/database/role;
- separate WAHA test session;
- separate object-storage prefix/bucket;
- separate auth provider environment;
- separate secrets.

Never let staging callbacks mutate production.

## Media storage

Prefer S3-compatible storage with durability independent of the application container. MinIO is
valid for self-hosted/local use; an external S3-compatible provider can reduce VPS disk/backup risk.

## Scaling triggers

Do not split from aesthetics. Split when metrics show:
- DB IO/CPU pressure;
- WAHA isolation/restart risk;
- worker contention;
- deploy downtime;
- storage growth;
- backup/restore window;
- reliability objective.

Coolify can continue managing multiple servers, but application state must already be externalized.
