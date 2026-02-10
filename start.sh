#!/bin/sh
set -e

echo "Starting Astra AI..."
echo "Environment: ${NODE_ENV:-development}"

# Standalone mode (Docker / production build with output: "standalone")
if [ -f .next/standalone/server.js ]; then
  echo "Running standalone server..."
  exec node .next/standalone/server.js
fi

# Fallback: standard next start
echo "Running next start..."
exec npx next dev
