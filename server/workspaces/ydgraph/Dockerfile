FROM node:16-bullseye

ARG SSH_KEY
ENV SSH_KEY=$SSH_KEY

RUN mkdir /root/.ssh/

RUN echo "***"
RUN echo $SSH_KEY
RUN echo "***"

RUN echo "$SSH_KEY" > /root/.ssh/id_ed25519
RUN chmod 600 /root/.ssh/id_ed25519

RUN touch /root/.ssh/known_hosts

RUN ssh-keyscan github.com >> /root/.ssh/known_hosts

RUN apt-get update 
RUN apt-get install -y \
  build-essential \
  pkg-config \
  python3 openssh-client

RUN curl -fsSL https://code-server.dev/install.sh | sh

RUN npm install -g pnpm
COPY config.yaml /root/.config/code-server/

WORKDIR /project

CMD code-server