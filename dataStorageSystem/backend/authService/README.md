# Auth Service
## Service for authentication and authorisation

This is the component responsible for making incoming data trusted before they continue on their way to `DataStorage` component. To read more about this component, please consult [this](https://marekstef.github.io/storage-system-documentation/docs/main-system/auth-service/introduction) documentation. If the link to the documentation does not work for some reason, the whole documentation project resides at the root of this main repository.

### Setup with Docker (recommended)

When using Docker, ensure that the correct settings in the `.env` file are uncommented:

```env
# MONGO_DB_URI=mongodb://localhost:27017/accessDb # for manual starting
MONGO_DB_URI=mongodb://mongo1:27018/accessDb # for docker

# DATA_STORAGE_URL=http://localhost:3001 # for manual starting
DATA_STORAGE_URL=http://data_storage:3001 # for docker

# VIEW_MANAGER_URL=http://localhost:3002 # for manual starting
VIEW_MANAGER_URL=http://view_manager:3002 # for docker
```

All you need to do now is to start the main `docker-compose.yml` for the whole main data storage system located [here](../../).

`authService` initially calls an initialization script. This script is automatically invoked by Docker.

In case this script does not run successfully, here is the manual process:

After running `docker compose up --build`, it is still necessary to initialize the `authService`. Although this `authService` is automatically started by the main `docker-compose.yml`, it still needs to be manually set up (adding root profile to the database) during the first run. Here is what you need to do:

```docker
docker ps
```

It will probably be called something like `backend-auth_service-1`.

Then we can run the script:

```docker
docker exec backend-data_storage-1 npm run delete_database
```

The result should be:

```docker
C:\Users\stefanec>docker exec backend-auth_service-1 npm run initialise_service

> datastorage@1.0.0 initialise_service
> node scripts/initialisation/initialise.js

Event uploaded successfully: Events were created successfully
Event uploaded successfully: Events were created successfully
```

### Setup and Running without Docker

#### .env Modifications

We need to add PROJECT_ROOT in `.env` file. This environment variable is set automatically by Docker but in manual mode it's up to you to set this variable based on the file path of this project.

```env
# Important if you don't use Docker but want to start this component manually:
# environment variable for project root - it is used by the code to locate some directories it uses inside!
# PROJECT_ROOT=[path to this application (such as /usr/src/app)
```

We also need to uncomment and comment the following in the `.env` file:

```env
MONGO_DB_URI=mongodb://localhost:27017/accessDb # for manual starting
# MONGO_DB_URI=mongodb://mongo1:27017/accessDb # for docker

DATA_STORAGE_URL=http://localhost:3001 # for manual starting
# DATA_STORAGE_URL=http://data_storage:3001 # for docker

VIEW_MANAGER_URL=http://localhost:3002 # for manual starting
# VIEW_MANAGER_URL=http://view_manager:3002 # for docker
```

In the `.env` file, the `DATA_STORAGE_URL` and `VIEW_MANAGER_URL` keys are crucial. If the port changes in the `dataStorage` component or `viewManager` component, this change must also be reflected here in the `.env` file (more information in  `dataStorage` component README [here](../dataStorage/README.md)).

In the `.env` file, the `AUTH_SERVICE_PORT=3000` key is required to run this component. If the authService component cannot run on this port, it must be changed.

#### Running

##### Installation

To install all dependencies, run:

```bash
npm install
```

##### Initialization

Now it is absolutely **essential** to first run `npm run initialise_service` before `npm run start`. This script is responsible for saving the `root` profile of all the future events. If the future third party app wants to register a new profile for its events, this new app's profile must have the 'root' profile set to the one which is added by this component ( we highly recommending reading [docs]((https://marekstef.github.io/storage-system-documentation/docs/main-system/auth-service/introduction)) if you don't understand these concepts).

Running this script uses `dataStorage` component, so before running this script, the `dataStorage` component must be fully running.

This script can be run multiple times - if the event that the `auth service` stores in the `dataStorage` component has not changed. If this has changed for some reason, then the entire `dataStorage` must be deleted before re-running (more information [here](../dataStorage/README.md#delete)).

##### Running

We can finally start the `authService`:

```bash
npm run start
```

##### Usage

In this case, `AuthService` is the initial component that can communicates with the applications and user. This component verifies individual events and applications and then stores all chabges using its own HTTP requests into `dataStorage`. Thus, `dataStorage` no longer verifies anything and fully trusts the component that collaborates with it (in this case, it is the `AuthService`).

---

Teda vonkajsi komunikace nikdy (alespon momentalne) neprobiha s `dataStorage`. Tohle je zmena, ktera byla provedena 28.2 [(konkretni zmeny vidno v tomhle commitu)](https://gitlab.mff.cuni.cz/stefanm4/managementsystem/-/commit/ad193493ce512c57ee2b143911f7d10cc827d872).