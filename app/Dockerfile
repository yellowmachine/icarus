FROM node:16-alpine

ARG PUBLIC_MODE
ARG JWT_SECRET
ARG PASSWORD
ARG PUBLIC_DOMAIN
ARG SSH_KEY

ENV PUBLIC_MODE=$PUBLIC_MODE
ENV JWT_SECRET=$JWT_SECRET
ENV PASSWORD=$PASSWORD
ENV PUBLIC_DOMAIN=$PUBLIC_DOMAIN
ENV SSH_KEY=$SSH_KEY

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

