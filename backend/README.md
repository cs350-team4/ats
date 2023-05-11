# Arcade Transaction System -- Backend

## Prerequisites
- Python >3.10
- [Poetry](https://python-poetry.org/docs/#installation)
- PostgreSQL
- OS: Linux (not tested on others)

## Usage
Copy [./.env.example](.env.example) file to `.env` file and edit the DB url there
with corresponding fields. Then run
```sh
$ poetry install
$ poetry shell
$ task start  # or `poetry run task start` w/o shell
```

Now you can access [http://localhost:8000/docs](http://localhost:8000/docs) to see the docs.
