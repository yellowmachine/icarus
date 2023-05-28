# Dockerfile
FROM node:16-alpine

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

