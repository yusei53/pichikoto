FROM node:20-slim

RUN npm install -g pnpm

WORKDIR /app

COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY tsconfig.json ./tsconfig.json
COPY turbo.json ./turbo.json

COPY packages ./packages

RUN chmod +x packages/backend/entrypoint.sh

RUN rm -rf packages/backend/node_modules

RUN pnpm install --prod=false

EXPOSE 8787