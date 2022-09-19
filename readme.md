# react-nextjs

## Getting started

```shell
# STEP 1
# Create file containing environment variables that configure app behaviour.
# We have some default set in example file, so we can just copy it.
cp .env.example .env

# STEP 2
# Install NPM dependencies
npm i

# STEP 3
# Start the development server (http://localhost:3000).
npm run dev
```

## Optimizing Docker image

For production use we want to optimize the Docker image by not installing dependencies that are useless in production like libraries for tests, linting, executing development-only workflows. The **`@monteway/scripts`** package offers a CLI command that creates a `package.json` file with some dependencies removed. So copying the modified `package.json` instead of the original one allow us to run `npm install` and get only the dependencies we need for the production app run.

This is how it's done:

```shell
# Generate the slim version of the package.json
npx @monteway/scripts slim-package-json -o .cache/package.json]
```

Then in Dockerfile

```dockerfile
# Copy files and npm install
COPY .cache/package.json package-lock.json ./
RUN npm install --force
COPY . .
```
