---
sidebar_position: 3
---

# Deployment

We will discuss here deployment using Docker only. If you want to start the system manually by starting all individual components by yourself, please head over to the [repository](https://github.com/marekStef/decentralised-storage-system/tree/master/dataStorageSystem) and read all READMEs of those components.

Now we focus on Docker.

To read about a setup with Docker in individual components, please read their own READMEs. Each component in this project has its own `Setup With Docker` section.

To start all backend components of the main storage system as well as the frontend component `Control Centre`, all you need to do is to set the path in your terminal:

```bash
cd [path to the project]/managementsystem/dataStorageSystem 
```

Now you need to run the follwing:

```bash
docker compose up --build -d
```

At this point, everything should be started successfully - you can check it in Docker. Please wait a few seconds after the components have been started. There are healthchecks being performed and some components are waiting to be started until other components are marked as healthy. You can have a look at `docker-compose.yml` file [here](https://github.com/marekStef/decentralised-storage-system/blob/master/dataStorageSystem/docker-compose.yml). The system should be accessible at `localhost:8020` now.
