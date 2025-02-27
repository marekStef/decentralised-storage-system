# DataStorage Component

Component for aggregating `events`. To read more about this component, please consult [this](https://marekstef.github.io/storage-system-documentation/docs/main-system/data-storage/introduction) documentation. If the link to the documentation does not work for some reason, the whole documentation project resides at the root of this main repository.

### Setup with Docker (recommended)

When using Docker, ensure the correct lines are uncommented in the `.env` file:

```env
# MONGO_DB_URI=mongodb://localhost:27017/dataStorage # for manual starting
MONGO_DB_URI=mongodb://mongo1:27017/dataStorage # for docker
```

Also, if you have previously tried setting this without docker and uncommented certain code according to the instructions there, you need to undo these changes for docker to work. This does not apply to you if you just cloned this repo or have always started this project using docker.

You will find notes above it explaining the reason.

All you need to do now is to start the main `docker-compose.yml` for the whole main data storage system located [here](../../). Important information about using Docker is provided [here in the README for the entire data storage system](../../) and also [here in the README focusing on the backend part of the data storage system](../).

---

If you need to manually drop the database created by the `dataStorage` component, first find the container:

```docker
docker ps
```

It will likely be called something like: `backend-data_storage-1`.

Then you can run the following script:

```docker
docker exec backend-data_storage-1 npm run delete_database
```

The result should be:

```docker
C:\Users\stefanec>docker exec backend-data_storage-1 npm run delete_database

> datastorage@1.0.0 delete_database
> node scripts/deletion/deleteDatabase.js

MongoDB connected. Now, dropping the database.
Database dropped: true
```

### Setup Without Docker (not recommended but doable)

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

In the `.env` file, the key `DATA_STORAGE_SERVER_PORT=3001` is also important. If this project cannot run on port `3001`, it needs to be changed.

If it needs to be changed, an additional change is required - to change this value in the `.env` file of the `authService` component, which directly communicates with this component.

In the `authService` component, the key `DATA_STORAGE_URL` needs to be changed (read about `authService` component [here](../authService/)).

Also, you need to open the main [index.js](./index.js) file and uncomment the following there:

```js
// app.use(cors({
//     origin: '*',
//     optionsSuccessStatus: 200
// }));
```

You will find notes above it explaining the reason.

##### Installation
To install all dependencies, run:

```bash
npm install
```

##### Deletion

To reset the entire database, you can use the script which is run as follows:

```bash
npm run delete_database
```

It is **important** to note that for the system to function correctly, the `authStorage` must now be initialized using the script in the respective `authStorage` project (more information on what needs to be done can be found [here](../authService/README.md)).

##### Starting

Then we can start the `dataStorage` component:

```bash
npm run start
```