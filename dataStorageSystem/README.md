# Data Storage System

The system consists of a backend and a frontend.

It is important to note that while every component in this repository has its own README, we highly recommend the online [documentation]() for reading instead of these READMEs. Online documentation is far more clear with illustrations attached and you can see the bigger picture of this project there. If the link to a hosted documentation does not work, documentation project is included in the root of this project.

---

Instructions for setting up and starting the backend can be found [here](./backend) and instructions for starting the frontend [here](./frontend).

All the requests that the backend currently supports are in this directory. It is an export of API requests from Postman for the given system. Each request has a name ending with a number. These numbers indicate the order in which they should be executed. This JSON export is created using the `PostMan` program, which is recommended to be installed. Then, it is possible to easily import this export into Postman and, if necessary, change the `URL` of the `authService` server in the `Environment` section if `authService` is running on a different port than 3000. [The export is here.](./dataStorageSystemApi.postman_collection.json)

### Setup of the individual components of the backend

Instructions for starting the individual parts of the system are [here.](./backend)

### Setup of the frontend

After starting the backend, you can proceed to start the frontend part [here.](./frontend)