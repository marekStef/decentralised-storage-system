# Gateway Component

## Introduction

The Gateway serves as the primary entry point to our system, controlling access to all runtime components of the system while ensuring that only necessary endpoints are exposed to the public. Auth Service is the only component fully accessible as well as a subset of endpoints related to the management of View Template in View Manager component. Gateway is configured to pass only specific endpoints to the View Manager component. Lastly, the Control Centre component is accessible at */control-centre*. To make it easier for user, the root endpoint */* is redirected to the Control Centre component.

## Setup and Deployment

This Gateway component is incorporated into the main `docker-compose.yml` file. Therefore, this component cannot be started manually - this wouldn't even make a logical sense. You can see the whole architecture of the system including this Gateway in the [online documentation](https://marekstef.github.io/storage-system-documentation/docs/main-system/introduction/architecture-of-the-storage-backend-system). 