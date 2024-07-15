# Data Storage System

The system consists of a backend and a frontend.

It is important to note that while every component in this repository has its own README, we highly recommend the online [documentation](https://marekstef.github.io/storage-system-documentation/docs/category/introduction) for reading instead of these READMEs. Online documentation is far more clear with illustrations attached and you can see the bigger picture of this project there. If the link to a hosted documentation does not work, documentation project is included in the root of this project.

## Setup With Docker (recommended)

To read about a setup with Docker in individual components, please read their own READMEs. Each component in this project has its own `Setup With Docker` section.

To start all backend components of the main storage system as well as the frontend component `Control Centre`, all you need to do is to set the path in your terminal:

```bash
cd [path to this project]/managementsystem/dataStorageSystem 
```

Now you need to run the follwing:

```bash
docker compose up --build -d
```

At this point everything should be started successfully.

`AuthService` component should be accessible at `localhost:3000` and `View Manager` component at `localhost:3002`.

## Setup Without Docker

Instructions for setting up and starting the backend can be found [here](./backend) and instructions for starting the frontend [here](./frontend).

---

### Exported PostMan HTTP requests to test APIs

All the requests that the backend currently supports are in this directory. It is an export of API requests from Postman for the given system. Each request has a name ending with a number. These numbers indicate the order in which they should be executed. This JSON export is created using the `PostMan` program, which is recommended to be installed. Then, it is possible to easily import this export into Postman and, if necessary, change the `URL` of the `authService` server in the `Environment` section if `authService` is running on a different port than 3000. [The export is here.](./dataStorageSystemApi.postman_collection.json)