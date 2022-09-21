#!/bin/bash -e

export NEXT_PUBLIC_FBT_PATTERNS='[["src/pages/**/*","pages-${1}"]]'
export NEXT_PUBLIC_FBT_DEFAULT_LOCALE='en_US',
export NEXT_PUBLIC_FBT_ROOT_DIR=$(pwd)

rm -rf dist

npx tsc -p ./tsconfig.lib.json

cp ./dist/lib/lib-utils.js ./dist/lib/lib-utils.mjs

node group.mjs $@
