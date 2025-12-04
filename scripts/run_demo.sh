#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p tmp
printf '%s' 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYGWNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=' | base64 --decode > tmp/sample.png
echo "sample.png size: $(stat -f%z tmp/sample.png)"

CREATERESP=$(curl -s -X POST http://localhost:8080/emr -H 'Content-Type: application/json' -d '{"patient_name":"Auto Test","age":50,"notes":"from automation"}' -w '\nHTTP_STATUS:%{http_code}\n' || true)
echo "CREATE_RESPONSE:"
echo "$CREATERESP"

ID=$(echo "$CREATERESP" | tr '\n' ' ' | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*\([0-9]*\).*/\1/p')
if [ -z "$ID" ]; then echo 'No ID parsed, aborting'; exit 1; fi

UPLOADRESP=$(curl -s -F "scan=@tmp/sample.png" http://localhost:8080/upload/$ID -w '\nHTTP_STATUS:%{http_code}\n' || true)
echo "UPLOAD_RESPONSE:"
echo "$UPLOADRESP"

FETCHRESP=$(curl -s http://localhost:8080/emr/$ID -w '\nHTTP_STATUS:%{http_code}\n' || true)
echo "FETCH_RESPONSE:"
echo "$FETCHRESP"

echo "Demo complete."
