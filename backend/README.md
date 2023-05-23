# Arcade Transaction System -- Backend

## Prerequisites
- Python >3.10
- [Poetry](https://python-poetry.org/docs/#installation)
- PostgreSQL
- OS: Linux (not tested on others)

## Usage

## Client DB
Create a new database and execute [`./data/client.sql`](./data/client.sql) to get dummy data. 

Copy [./.env.example](.env.example) file to `.env` file and edit the required fields. Then run
```sh
$ poetry install
$ poetry shell
$ task start  # or `poetry run task start` w/o shell
```

Now you can access [http://localhost:8000/docs](http://localhost:8000/docs) to see the docs.

## Development

Copy [./.env.example](.env.example) file to `.env` file and edit the DB url there
with corresponding fields. Additionally, if you want to test,
edit `POSTGRES_TEST_DB` name to use that db in tests. Then
```sh
$ poetry install --with dev,test
$ poetry shell
# run lints
$ ./scripts/lint.sh
# test
$ pytest api/tests
```

### Using Docker Compose

Docker Compose is a tool to automatically setup environment with backend, database, and other services. If you have Docker Desktop installed, Docker Compose may be enabled from the settings.

```sh
$ cd backend
# Start backend and database
# Note that on first run, sometimes the backend may start before the database is ready
# In that case, simply shutdown (with Ctrl+C) and restart again
$ docker compose up
# Stop the backend and database
$ docker compose down
# Alternatively, stop and delete the database
$ docker compose down --volumes
# If there's problems with docker that isn't solved after containers are stopped, try rebuild
$ docker compose up --build --force-recreate --no-deps
# Enable adminer (Database explorer tool)
# Note that multiple profiles may be enabled at once by having multiple --profile arguments
$ docker compose --profile adminer up
```
