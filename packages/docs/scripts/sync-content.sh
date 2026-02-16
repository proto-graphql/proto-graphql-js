#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
SOURCE_DIR="${REPO_ROOT}/docs"
TARGET_DIR="${REPO_ROOT}/packages/docs/src/content"

if [[ ! -d "${SOURCE_DIR}" ]]; then
  echo "Source docs directory not found: ${SOURCE_DIR}" >&2
  exit 1
fi

mkdir -p "${TARGET_DIR}"

# Keep tracked metadata files, but remove generated markdown from previous sync.
find "${TARGET_DIR}" -type f \( -name "*.md" -o -name "*.mdx" \) -delete

cp -R "${SOURCE_DIR}/." "${TARGET_DIR}/"

# Treat README.md as index.md for Nextra routes.
while IFS= read -r -d '' readme_file; do
  mv "${readme_file}" "$(dirname "${readme_file}")/index.md"
done < <(find "${TARGET_DIR}" -type f -name "README.md" -print0)

# Rewrite relative links that still target README.md.
while IFS= read -r -d '' markdown_file; do
  sed -E -i.bak 's|\]\(([^):#)]*)README\.md(#[^)]+)?\)|](\1index.md\2)|g' "${markdown_file}"
  rm -f "${markdown_file}.bak"
done < <(find "${TARGET_DIR}" -type f \( -name "*.md" -o -name "*.mdx" \) -print0)

echo "Synced docs/ into packages/docs/src/content"
