#!/usr/bin/env bash
#shellcheck disable=SC2039

set -euo pipefail

psql --user akvo-flow-approval --no-align --list | \
    awk -F'|' '/^test/ {print $1}' | \
    while read -r dbname
    do
	psql --user akvo-flow-approval -c "DROP DATABASE ${dbname}"
    done

echo "Done"
