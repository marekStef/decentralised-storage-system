# Backend

The backend is divided into 5 parts:
- `dataStorage`
- `authService`
- `viewManager`
- `javascriptExecutionService`
- `pythonExecutionService`

## Starting the backend components with Docker (recommended)

Before proceeding, you need to read about Docker in READMEs of all aforementioend components .

Then, simply run `docker compose up --build` in the main data storage directory where the main `docker-compose.yml` file is located.

## Starting the backend components without Docker

`DataStorage` and other components like `ViewManager` requires a `MongoDb` database. Before proceeding, you need to have it set up locally on your PC. It is sufficient to install it from [here](https://www.mongodb.com/docs/manual/installation/).

After successfully starting the database via Docker, you need to obtain the access `url` from it.

Now you can proceed to the actual setup of all mentioned components. Please, read their READMEs. Each README has a section for a setup without a Docker.