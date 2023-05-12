#!/bin/sh

set -e
set -x

pytest --cov=api --cov-report=term-missing api/tests "${@}"
