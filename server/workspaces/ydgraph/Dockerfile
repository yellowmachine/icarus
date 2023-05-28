FROM node:16-bullseye

RUN apt-get update 
RUN apt-get install -y \
  build-essential \
  pkg-config \
  python3

RUN curl -fsSL https://code-server.dev/install.sh | sh

COPY config.yaml /root/.config/code-server/
WORKDIR /project

CMD code-server