#!/usr/bin/sh

set -x
set -e

mypy api
black api --check
isort --check-only api
flake8
