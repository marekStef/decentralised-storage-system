# View Manager

This component is responsible for managing `View Templates`. To read more about this component, please consult [this](https://marekstef.github.io/storage-system-documentation/docs/main-system/view-manager/introduction) documentation which contains significantly more information about it. If the link to the documentation does not work for some reason, the whole documentation project resides at the root of this main repository.

## Setup With Docker (recommended)

All you need to do is to run the main `docker-compose.yml` file - instructions are [here](../../).

Please check `.env` file in this component to verify you have the correct addresses and ports set. In case you need to change the port on which this component is running, you need to reflect these changes in `Dockerfile`, `docker-compose.yml` and also in other componets such as `authService` but also the frontend component `Control Centre`.

When using docker, part of `.env` file needs to have these items correctly commented out and others uncommented:

```
# JAVASCRIPT_EXECUTION_SERVICE_URI=http://localhost:3003 # for manual starting without docker
JAVASCRIPT_EXECUTION_SERVICE_URI=http://javascript_execution_service:3003 # for docker

# PYTHON_EXECUTION_SERVICE_URI=http://127.0.0.1:3004 # for manual starting
PYTHON_EXECUTION_SERVICE_URI=http://python_execution_service:3004 # for docker

# AUTH_SERVICE_URI=http://localhost:3000 # for manual starting
AUTH_SERVICE_URI=http://auth_service:3000 # for docker

# MONGO_DB_URI=mongodb://localhost:27017/viewManager # for manual starting
MONGO_DB_URI=mongodb://mongo1:27018/viewManager # for docker
```

## Setup Without Docker

We assume the user already has the URL of the `MongoDb` database. This URL needs to be placed in the `.env` file as the value for the key `MONGO_DB_URI`.

We need to add PROJECT_ROOT in `.env` file. This environment variable is set automatically by Docker but in manual mode it's up to you to set this variable based on the file path of this project.

```env
# Important if you don't use Docker but want to start this component manually:
# environment variable for project root - it is used by the code to locate some directories it uses inside!
# PROJECT_ROOT=[path to this application (such as /usr/src/app)
```

We also need to uncomment and comment the following in the `.env` file:

```env
MONGO_DB_URI=mongodb://localhost:27017/dataStorage # for manual starting
# MONGO_DB_URI=mongodb://mongo1:27017/dataStorage # for docker
```

### Installation

Install the dependencies:

```bash
npm install
```

### Usage

In the `.env` file, execution services like `JAVASCRIPT_EXECUTION_SERVICE_URI` and `PYTHON_EXECUTION_SERVICE_URI` need to be correctly set for a View Manager to be fully functional. `MONGO_DB_URI` needs to be set as well.

Start the server:

```bash
npm start
```

