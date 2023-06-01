export SSH_KEY=$(cat ~/.ssh/id_ed25519)
docker build . -t codenode -f Dockerfilenode 