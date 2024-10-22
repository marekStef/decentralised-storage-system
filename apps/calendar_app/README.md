# Calendar App

To read about this application, please consult [this](https://marekstef.github.io/storage-system-documentation/docs/example-apps/calendar-pro/walkthrough) documentation. If the link to the documentation does not work for some reason, the whole documentation project resides at the root of this main repository.

## Getting Started With Docker

Navigate to this directory in your terminal and run `docker compose up --build -d`. Calendar application shoud be accessible at `http://localhost:5000`. You can change the port in mapping inside `docker-compose.yml` for this project.

## Getting Started Without Docker

First, install required dependencies:

```bash
npm install
```

and then start the calendar app:

```bash
npm run dev dev_with_port_5000
```

Open [http://localhost:5000](http://localhost:5000) with your browser to see the result (you can change the port inside `package.json`).