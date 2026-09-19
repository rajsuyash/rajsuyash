#!/usr/bin/env bash
# Waits for the GitHub Actions deploy of the current HEAD and prints one line:
#   deploy: success | deploy: failure <run-url> | deploy: timeout
# Usage: run from inside the rajsuyash-site checkout after `git push origin main`.
# Repo is public, so no token is needed.
set -uo pipefail
REPO="rajsuyash/rajsuyash"
SHA=$(git rev-parse HEAD)
for _ in $(seq 1 36); do   # 36 x 10s = 6 minutes
  out=$(curl -sS -m 15 "https://api.github.com/repos/$REPO/actions/runs?head_sha=$SHA" \
    | python3 -c '
import json, sys
runs = json.load(sys.stdin).get("workflow_runs", [])
runs = [r for r in runs if r.get("name") == "Deploy to Hostinger"]
if not runs: print("pending"); sys.exit()
r = runs[0]
print((r.get("conclusion") or r.get("status") or "pending") + " " + r.get("html_url", ""))
' 2>/dev/null) || out="pending"
  state=${out%% *}; url=${out#* }
  case "$state" in
    success)                     echo "deploy: success"; exit 0 ;;
    failure|cancelled|timed_out) echo "deploy: $state $url"; exit 1 ;;
  esac
  sleep 10
done
echo "deploy: timeout (check https://github.com/$REPO/actions)"; exit 2
