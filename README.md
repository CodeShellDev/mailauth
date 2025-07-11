# Mailauth

Mailauth is a Mailbox Manager which enables you too select between your Mailboxes and authenticate with your Mailserver, like [mailcow](https://github.com/mailcow/mailcow-dockerized)

## Showcase

![mailauth-home](https://github.com/user-attachments/assets/934fb3a3-3160-4fcb-a30e-10b62a804411)

![mailauth_1](https://github.com/user-attachments/assets/f24119aa-2749-467d-a7bc-9ee091eee5aa)

![mailauth_2](https://github.com/user-attachments/assets/124d9e7d-b377-4935-85c2-cf16e2be47c5)

![mailauth_3](https://github.com/user-attachments/assets/a3631281-dedf-4f91-a2a8-140531cef665)

![mailauth_4](https://github.com/user-attachments/assets/7a29fa39-2fbf-40fb-9c4a-3c0e16ade15d)


## Getting Started

Get the latest version of the `docker-compose.yaml` file:

```yaml
---
services:
  mailauth:
    image: ghcr.io/codeshelldev/mailauth:latest
    container_name: mailauth
    ports:
      - "80:80"
    env_file:
      - .env
    restart: unless-stopped
    networks:
      mailauth:
        aliases:
          - mailauth

  mongodb:
    image: mongo:latest # Use arm64v8/mongo for ARM Architecture
    container_name: mailauth-db
    volumes:
      - db:/data/db
      - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js
    env_file:
      - .env
    networks:
      mailauth:
        aliases:
          - mongo
    restart: unless-stopped

  redis:
    image: redis:latest
    container_name: mailauth-redis
    command: ["redis-server", "--requirepass", ""]
    env_file:
      - .env
    networks:
      mailauth:
        aliases:
          - redis
    restart: unless-stopped

networks:
  mailauth:

volumes:
  db:
```

### Setup

Mailauth _currently_ works by modifying the `email` claim during Token Exchange and Userinfo,
this means that you **will have to** use a IdP (like [authentik](https://goauthentik.io)).

Create a `.env` file inside of you `docker-compose.yaml` directory and copy the template below

```dotenv
# Mail

# Get from your IdP (for your mailserver)
MAIL_CLIENT_ID=
MAIL_CLIENT_SECRET=

MAIL_AUTHORIZATION_ENDPOINT=
MAIL_TOKEN_ENDPOINT=
MAIL_USERINFO_ENDPOINT=

MAIL_REDIRECT_URIS=https://mailauth.domain.com/oauth/mail/callback,https://mailauth.yourdomain.com/oauth/mail/callback
MAIL_CALLBACK_URIS=https://mail.domain.com,https://mail.yourdomain.com # This is your mailservers oauth callback url

# App

# Get this from your IdP (for mailauth)
APP_CLIENT_ID= 
APP_CLIENT_SECRET=

APP_ISSUER=
APP_AUTHORIZATION_ENDPOINT=
APP_TOKEN_ENDPOINT=
APP_USERINFO_ENDPOINT=
APP_LOGOUT_ENDPOINT=

APP_REDIRECT_PATH=/oauth/app/callback

# DB

MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=SECURE_ROOT_PW
MONGO_INITDB_DATABASE=mailauth

MONGO_USER=mailauth
MONGO_PW=SECURE_PW

# ---- #

REDIS_PASSWORD=SECURE_REDIS_PW

# General

SESSION_SECRET=SECURE_KEY # Gen with openssl

HOST=https://mailauth.domain.com

PREFIX=/ # Optional

DB_HOST=mongodb://::27017/
REDIS_HOST=redis://default::6379
```

Now you need to setup a Oauth Authentication Method in your mailserver,
but instead of using your IdP's endpoints you use:

- `/oauth/mail/authorize`
- `/oauth/mail/token`
- `/oauth/mail/userinfo`

And for the Redirect Uri set it to the one from your `.env` file.

Next create `init-mongo.js` in your working directory:

```js
// This is only for initializing the db and creating the mailauth user

db = db.getSiblingDB("mailauth")
db.createUser({
	user: "mailauth",
	pwd: "SECURE_PW", // This should match the one in your env
	roles: [{ role: "readWrite", db: "mailauth" }],
})
```

### Reverse Proxy

When working with Oauth2 and Auth in general it is recommended to be sure to use secure connections,
here you will see a Reverse Proxy implementation with traefik:

```yaml
---
services:
  mailauth:
    image: ghcr.io/codeshelldev/mailauth:latest
    container_name: mailauth
    labels:
      - traefik.enable=true
      - traefik.http.routers.mailauth-secure.entrypoints=websecure
      - traefik.http.routers.mailauth-secure.rule=Host(`mailauth.domain.com`)
      - traefik.http.routers.mailauth-secure.tls=true
      - traefik.http.routers.mailauth-secure.tls.certresolver=resolver
      - traefik.http.routers.mailauth-secure.service=mailauth-svc
      - traefik.http.services.mailauth-svc.loadbalancer.server.port=80
      - traefik.docker.network=proxy
    env_file:
      - .env
    restart: unless-stopped
    networks:
      mailauth:
        aliases:
          - mailauth
      proxy:

  mongodb:
    image: mongo:latest # Use arm64v8/mongo for ARM Architecture
    container_name: mailauth-db
    volumes:
      - db:/data/db
      - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js
    env_file:
      - .env
    networks:
      mailauth:
        aliases:
          - mongo
    restart: unless-stopped

  redis:
    image: redis:latest
    container_name: mailauth-redis
    command: ["redis-server", "--requirepass", ""]
    env_file:
      - .env
    networks:
      mailauth:
        aliases:
          - redis
    restart: unless-stopped

networks:
  mailauth:
  proxy:
    external: true

volumes:
  db:
```

## Usage

When authenticating via mailauth you get redirected to your actual IdP then to `/select`,
where you will be able to select your mailbox, mailauth changes the `email` claim and now you're logged in.

## Contributing

Found an Issue or want to see something implemented into Mailauth?
Open up an Issue or start a Pull Request!

But always be respectful and patient, we are all volunteers after all.

## Supporting

Found this Project useful? Let others know about Mailauth by ⭐️ this Repo!

## License

[MIT](https://choosealicense.com/licenses/mit/)
