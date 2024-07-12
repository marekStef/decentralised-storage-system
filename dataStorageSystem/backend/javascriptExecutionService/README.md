# Javascript Execution Service

Service responsible for uploading and executing custom javascript source code. To read more about this component, please consult [this](https://marekstef.github.io/storage-system-documentation/docs/main-system/js-execution-service/introduction) documentation which contains various information about it, including information about what interface this component must fulfill. If the link to the documentation does not work for some reason, the whole documentation project resides at the root of this main repository.

## Setup With Docker (recommended)

All you need to do is to run the main `docker-compose.yml` file - instructions are [here](../../).

If you need to change the port on which this execution service is running, please change `JAVASCRIPT_EXECUTION_SERVICE_PORT` in `.env` in this project. This change however, needs to be reflected in `Dockerfile` in this component and also in the `View Manager` component which relies on this component.

## Setup Without Docker

## Installation

Install the dependencies:

```bash
npm install
```

## Usage

In the `.env` file, `JAVASCRIPT_EXECUTION_SERVICE_PORT` needs to be set. However, if u decide to modify it, you need to make changes in the View Manager component in this project as well.

Start the server:

```bash
npm start
```