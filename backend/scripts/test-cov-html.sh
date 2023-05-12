#!/bin/sh

set -e
set -x

./scripts/test.sh --cov-report=html "${@}"
