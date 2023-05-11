#!/usr/bin/sh

set -x

mypy api
black api --check
isort --check-only api
flake8
