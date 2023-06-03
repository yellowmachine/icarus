git config --global user.name "$USERNAME"
git config --global user.email "$EMAIL"

if [ -z "$REPO" ]
then
      echo "empty repo"
else
      git clone "$REPO" .
fi

code-server /project