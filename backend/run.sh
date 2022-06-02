#!/usr/bin/env bash
# shellcheck disable=SC2155

DB_HOST=$(echo "${DATABASE_URL}" | cut -d '@' -f 2 | cut -d ':' -f 1)

./wait-for-it.sh -h "${DB_HOST}" -p 5432 -- echo "Database is up and running"

set -eu
pip -q install --upgrade pip
pip -q install --cache-dir=.pip -r requirements.txt
pip check

alembic upgrade head

uvicorn main:app --reload --port 5000
