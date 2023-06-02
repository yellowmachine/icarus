SSH_KEY=$(cat ~/.ssh/id_ed25519)
USER=yellowm
EMAIL=yellow.machine@mailfence.com

docker build . -t codenode -f Dockerfilenode --build-arg EMAIL="$EMAIL" --build-arg USER="$USER" --build-arg SSH_KEY="$SSH_KEY"