#!/bin/bash
# Build web para ambiente staging
cd "$(dirname "$0")/../.." || exit 1
./bin/build staging
