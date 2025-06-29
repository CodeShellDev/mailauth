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
{ { file.docker-compose.yaml } }
```

### Setup

Mailauth _currently_ works by modifying the `email` claim during Token Exchange and Userinfo,
this means that you **will have to** use a IdP (like [authentik](https://goauthentik.io)).

Create a `.env` file inside of you `docker-compose.yaml` directory and copy the template below

```dotenv
{ { file.examples/config.env } }
```

Now you need to setup a Oauth Authentication Method in your mailserver,
but instead of using your IdP's endpoints you use:

- `/oauth/mail/authorize`
- `/oauth/mail/token`
- `/oauth/mail/userinfo`

And for the Redirect Uri set it to the one from your `.env` file.

Next create `init-mongo.js` in your working directory:

```js
{ { file.examples/init-mongo.js } }
```

### Reverse Proxy

When working with Oauth2 and Auth in general it is recommended to be sure to use secure connections,
here you will see a Reverse Proxy implementation with traefik:

```y![mailauth_2](https://github.com/user-attachments/assets/4acfc818-7c66-414d-b604-5f02a900d524)
![mailauth_1](https://github.com/user-attachments/assets/216acae8-e6c3-410c-9ca9-c61e98cf8b54)
![mailauth_3](https://github.com/user-attachments/assets/6364a90c-30b0-4588-a36a-981c0ddb5c39)
![mailauth_4](https://github.com/user-attachments/assets/91cf383d-d67b-4088-848e-6ea04b31b1cb)
aml
{ { file.examples/traefik.docker-compose.yaml } }
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
