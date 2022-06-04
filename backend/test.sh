#!/usr/bin/env bash

set -euo pipefail

DB_HOST=$(echo "${DATABASE_URL}" | cut -d '@' -f 2 | cut -d ':' -f 1)

./wait-for-it.sh -h "${DB_HOST}" -p 5432 -- echo "Database is up and running"

echo "Running tests"
/usr/local/bin/pytest -vvv -rP

flake8
