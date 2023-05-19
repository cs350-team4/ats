#!/bin/sh

set -e
set -x

./scripts/format.sh
./scripts/lint.sh
./scripts/test.sh