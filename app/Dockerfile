# Dockerfile
FROM node:16-alpine

ARG PUBLIC_MODE
ARG PUBLIC_HTTP
ARG JWT_SECRET
ARG PASSWORD

ENV PUBLIC_MODE=$PUBLIC_MODE
ENV PUBLIC_HTTP=$PUBLIC_HTTP
ENV JWT_SECRET=$JWT_SECRET
ENV PASSWORD=$PASSWORD

RUN apk add docker docker-cli-compose

RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .

RUN pnpm build
EXPOSE 3000

ENV ORIGIN=http://localhost:3000
CMD ["node", "build"]

