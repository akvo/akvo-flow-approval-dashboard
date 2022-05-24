# akvo-flow-approval-dashboard
Akvo Flow Dashboards for Data Approval

## Prerequisite
- Docker > v19
- Docker Compose > v2.1
- Docker Sync 0.7.1

## Development

### Environment Setup

Expected that PORT 5432 and 3000 are not being used by other services.

#### Start

For initial run, you need to create a new docker volume.

```bash
docker volume create akvo-flow-approval-docker-sync
```

```bash
./dc.sh up -d
```

The app should be running at: [localhost:3000](http://localhost:3000). Any endpoints with prefix
- `^/api/*` is redirected to [localhost:5000/api](http://localhost:5000/api)

Network Config:
- [setupProxy.js](https://github.com/akvo/akvo-flow-approval-dashboard/blob/main/frontend/src/setupProxy.js)
- [mainnetwork](https://github.com/akvo/akvo-flow-approval-dashboard/blob/docker-compose.override.yml#L4-L8) container setup

#### Log

```bash
./dc.sh log --follow <container_name>
```
Available containers:
- backend
- frontend
- mainnetwork
- db
- pgadmin

#### Stop

```bash
./dc.sh stop
```

#### Teardown

```bash
docker-compose down -v
docker volume rm akvo-flow-approval-docker-sync
```

## Production

```bash
export CI_COMMIT='local'
./ci/build.sh
```

Above command will generate two docker images with prefix `eu.gcr.io/akvo-lumen/akvo-flow-approval-dashboard` for backend and frontend

```bash
docker-compose -f docker-compose.yml -f docker-compose.ci.yml up -d
```

Network config: [nginx](https://github.com/akvo/akvo-flow-approval-dashboard/blob/main/frontend/nginx/conf.d/default.conf)

