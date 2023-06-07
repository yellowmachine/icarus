# code icarus workspaces

# development

`cd app`

example of `.env` file:
```bash
JWT_SECRET=secret
PASSWORD=secret
PUBLIC_MODE=port
PUBLIC_DOMAIN=localhost
```

enter app folder, install npm dependencies and run dev server:
```bash
pnpm i
pnpm dev # open browser at localhost:5173
```

# production

I'm using `caddy` so you can `npm run gencaddy --domain=example.com > /some/path/Caddyfile`

An example of `docker-compose.yml` for production:

```yaml
services:
  ika:
    image: yellowmachine/icarus
    ports:
      - 3000:3000
    environment:
      - ORIGIN=https://example.com
      - PUBLIC_MODE=subdomain
      - PASSWORD=mypassword
      - JWT_SECRET=myjwtsecret
      - PUBLIC_DOMAIN=example.com
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /workspaces:/workspaces
```

PUBLIC_MODE: subdomain | port | path