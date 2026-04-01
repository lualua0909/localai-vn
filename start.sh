#!/bin/sh
set -eu

PORT="${PORT:-3000}"
NODE_ENV="${NODE_ENV:-development}"

echo "Starting Astra AI..."
echo "Environment: ${NODE_ENV}"
echo "Port: ${PORT}"

if lsof -ti TCP:"${PORT}" >/dev/null 2>&1; then
  echo "Port ${PORT} is already in use."
  echo "Stop the existing process or run with a different PORT."
  exit 1
fi

if [ "${NODE_ENV}" = "production" ]; then
  if [ -f .next/standalone/server.js ]; then
    echo "Running standalone production server..."
    exec node .next/standalone/server.js
  fi

  echo "Running next start..."
  exec npx next start -p "${PORT}"
fi

echo "Running next dev..."
exec npx next dev -p "${PORT}"
