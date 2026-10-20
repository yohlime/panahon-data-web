#!/bin/bash
set -euo pipefail

LEVEL="patch"
DO_COMMIT=false
DO_TAG=false
PKG="package.json"

usage() {
  cat <<EOF
Usage: $0 [patch|minor|major] [--commit] [--tag]

Bumps the version in $PKG (default: patch). Without flags only the file is
updated.
  --commit  commit the bump (unsigned)
  --tag     commit (implied) and create the lightweight tag vX.Y.Z
EOF
  exit "${1:-1}"
}

for arg in "$@"; do
  case "$arg" in
  patch | minor | major) LEVEL="$arg" ;;
  --commit) DO_COMMIT=true ;;
  --tag) DO_TAG=true ;;
  -h | --help) usage 0 ;;
  *) echo "Unknown argument: $arg" >&2; usage ;;
  esac
done

[[ -f "$PKG" ]] || {
  echo "Missing $PKG" >&2
  exit 1
}

current="$(jq -r '.version // empty' "$PKG")"
[[ -n "$current" ]] || {
  echo "No version in $PKG" >&2
  exit 1
}
base="${current%%[-+]*}"
IFS=. read -r major minor patch <<<"$base"
major="${major:-0}"
minor="${minor:-0}"
patch="${patch:-0}"

case "$LEVEL" in
major)
  major=$((major + 1))
  minor=0
  patch=0
  ;;
minor)
  minor=$((minor + 1))
  patch=0
  ;;
patch) patch=$((patch + 1)) ;;
esac
new="$major.$minor.$patch"

# Replace only the top-level "version" line so the rest of the file (and its
# formatting) is untouched; fall back to jq if that line isn't found.
if grep -qE '^  "version":' "$PKG"; then
  sed -i -E "s/^  \"version\": *\"[^\"]+\"/  \"version\": \"$new\"/" "$PKG"
else
  tmp="$(mktemp)"
  jq --indent 2 --arg v "$new" '.version = $v' "$PKG" >"$tmp"
  mv "$tmp" "$PKG"
fi

[[ "$(jq -r '.version' "$PKG")" == "$new" ]] || {
  echo "Failed to update $PKG" >&2
  exit 1
}
echo "version: $current -> $new"

if $DO_TAG && ! $DO_COMMIT; then
  DO_COMMIT=true
fi
if $DO_COMMIT; then
  git add "$PKG"
  git commit --no-gpg-sign -m "chore: bump version to $new" -- "$PKG"
fi
if $DO_TAG; then
  git tag "v$new"
  echo "tagged v$new"
fi
