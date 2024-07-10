# Control Centre 

This frontend component is responsible for the user of the system to control multiple features of the main data storage. To read more about this component, please consult [this](https://marekstef.github.io/storage-system-documentation/docs/main-system/control-centre/introduction) documentation which contains significantly more information about it. If the link to the documentation does not work for some reason, the whole documentation project resides at the root of this main repository.

## Setup With Docker

All you need to do is to run the main `docker-compose.yml` file - instructions are [here](../../). this `docker-compose.yml` file starts the whole storage system including its backend and this frontend.

## Setup Without Docker

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

We need to first install dependencies:

```bash
npm install
```

If you have changed the address of the Auth Service or View Manager in backend of the main data storage system, this change needs to be reflected in `.env.local` file in this project.

Then, we can start the application:

```bash
npm run dev
```

Finally, we should see a final address `http://localhost:[port]` which can be opened in any browser.