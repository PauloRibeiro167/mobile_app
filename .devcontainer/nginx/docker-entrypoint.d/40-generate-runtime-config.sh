#!/bin/sh
set -eu

: "${API_BASE_URL:=/api}"

envsubst '${API_BASE_URL}' \
  < /usr/share/nginx/html/runtime-config.js.template \
  > /usr/share/nginx/html/runtime-config.js
