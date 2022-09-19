FROM node:gallium-alpine AS base
WORKDIR /usr/src/app
COPY .cache/package.json package-lock.json ./
RUN npm install --force
COPY --chown=node:node . /usr/src/app

FROM base AS production
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN npm run build
USER node
CMD ["npm", "run", "start"]
