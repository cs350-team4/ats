#!/bin/bash

set -e
set -x

if [[ -z "$CI" ]]; then
    set -o allexport
    source .env
    set +o allexport

    # Disable pager output from postgre
    export PAGER=

    export PGHOST=$POSTGRES_SERVER
    export PGDATABASE=$POSTGRES_TEST_DB
    export PGUSER=$POSTGRES_USER
    export PGPASSWORD=$POSTGRES_PASSWORD

    psql -f data/ats.sql

    export PGHOST=$POSTGRES_CLIENT_SERVER
    export PGDATABASE=$POSTGRES_TEST_CLIENT_DB
    export PGUSER=$POSTGRES_CLIENT_USER
    export PGPASSWORD=$POSTGRES_CLIENT_PASSWORD

    psql -f data/client.sql
    psql -c "SELECT * FROM client"
fi

pytest --cov=api --cov-report=term-missing api/tests "${@}"
