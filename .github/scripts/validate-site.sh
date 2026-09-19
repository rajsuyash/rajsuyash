#!/usr/bin/env bash
# Validates the pages changed between two commits before they deploy.
# Usage: validate-site.sh <base-sha> <head-sha>
# Exit 0 = OK, 1 = at least one check failed (each failure printed as ::error::).
set -uo pipefail
BASE="$1"; HEAD="$2"; fail=0
err() { echo "::error::$*"; fail=1; }

# 1. sitemap.xml must be well-formed XML (a broken sitemap breaks indexing of the whole site).
#    Exit 1 = the file is bad, exit 2 = the parser itself could not run. Both fail the gate, but
#    with different messages: a check that cannot run must never look like a check that passed.
sm_out=$(python3 - <<'SITEMAP_PY' 2>&1
import sys
try:
    import xml.etree.ElementTree as ET
    ET.parse("sitemap.xml")
except Exception as e:
    bad = e.__class__.__name__ in ("ParseError", "FileNotFoundError")
    print("%s: %s" % (e.__class__.__name__, e))
    sys.exit(1 if bad else 2)
SITEMAP_PY
); sm_rc=$?
case "$sm_rc" in
  0) ;;
  1) err "sitemap.xml is not well-formed XML -- $(printf '%s' "$sm_out" | tail -1)" ;;
  *) err "sitemap.xml XML check could not run (broken python XML parser, not a site defect) -- $(printf '%s' "$sm_out" | tail -1)" ;;
esac

# 2. Every blog post ADDED in this push: Person byline twice (author + publisher),
#    listed in sitemap.xml, and has a card in blog/index.html.
for f in $(git diff --name-only --diff-filter=A "$BASE" "$HEAD" -- 'blog/*.html'); do
  b=$(basename "$f")
  [ "$b" = index.html ] && continue
  n=$(grep -c 'about.html#person' "$f")
  [ "$n" = 2 ] || err "$f: about.html#person appears $n times, expected 2 (author + publisher)"
  grep -q "rajsuyash.com/blog/$b" sitemap.xml || err "$f: not listed in sitemap.xml"
  grep -q "$b" blog/index.html || err "$f: no card in blog/index.html"
done

# 3. Every .html ADDED or MODIFIED in this push: same-site links must resolve to a file in the repo.
#    Only same-site links are checked; external, mailto:, tel: and fragment-only links are skipped.
broken=$(mktemp)
for f in $(git diff --name-only --diff-filter=AM "$BASE" "$HEAD" -- '*.html'); do
  [ -f "$f" ] || continue
  dir=$(dirname "$f")
  grep -oE 'href="[^"#?]+' "$f" | sed 's/^href="//' | sort -u | while read -r h; do
    case "$h" in
      https://rajsuyash.com/*|https://www.rajsuyash.com/*) p="${h#https://rajsuyash.com/}"; p="${p#https://www.rajsuyash.com/}" ;;
      http://*|https://*|//*|mailto:*|tel:*|javascript:*|data:*) continue ;;
      /*) p="${h#/}" ;;
      *) p="$dir/$h" ;;
    esac
    p="${p%/}"
    [ -z "$p" ] && continue
    [ -e "$p" ] || [ -e "$p/index.html" ] || echo "$f -> $h (no file: $p)"
  done
done > "$broken"
if [ -s "$broken" ]; then
  cat "$broken"
  err "$(wc -l < "$broken" | tr -d ' ') broken same-site link(s) in changed pages (listed above)"
fi
rm -f "$broken"

[ "$fail" = 0 ] && echo "validate: OK ($BASE..$HEAD)"
exit "$fail"
