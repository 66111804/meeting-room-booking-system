#!/usr/bin/env bash
TIMEOUT=5
HOST=$1
PORT=$2
shift 2
CMD="$@"

echo "Waiting for $TIMEOUT seconds before executing command..."

# Wait for the specified timeout (15 seconds)
# sleep $TIMEOUT
for i in $(seq 1 $TIMEOUT); do
  echo "Waiting for $i seconds..."
  sleep 1
done


echo "Timeout reached. Executing command."
bunx prisma migrate deploy && bun run start
