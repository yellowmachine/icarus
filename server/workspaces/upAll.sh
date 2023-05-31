cd $1
export SSH_KEY=$(cat ~/.ssh/id_ed25519)
docker compose up --build -d