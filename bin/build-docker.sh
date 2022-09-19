#!/bin/bash -e

# ---
# NOTE:
# All paths are relative to the root directory
# of the project.
# ---

# Build version of package.json that has
# unnecessary dependencies removed.
# This skips libraries like eslint or cypress
# from production build, since they're not
# needed.
npx @monteway/scripts slim-package-json \
  -o .cache/package.json

# Build the production image.
docker build --tag app:latest .
