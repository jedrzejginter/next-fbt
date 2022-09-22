#!/bin/bash -e

rm -rf .cache/next-fbt 2&> /dev/null || exit 0

mkdir -p .cache/next-fbt

npx fbt-manifest \
  --enum-manifest .cache/next-fbt/enum-manifest.json \
  --src-manifest .cache/next-fbt/src-manifest.json \
  --src src pages

npx fbt-collect --pretty --manifest < .cache/next-fbt/src-manifest.json > .cache/next-fbt/source-strings.json
