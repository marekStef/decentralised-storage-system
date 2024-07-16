# Python Execution Service

Service responsible for uploading and executing custom python source code. To read more about this component, please consult [this](https://marekstef.github.io/storage-system-documentation/docs/main-system/python-execution-service/introduction) documentation which contains various information about it, including information about what interface this component must fulfill. If the link to the documentation does not work for some reason, the whole documentation project resides at the root of this main repository.

## Setup With Docker

All you need to do is to start the main `docker-compose.yml` file for the whole main data storage system - instructions are [here](../../).

If you need to change the port on which this execution service is running, please change `FLASK_RUN_PORT` in `.env` in this project. This change however, needs to be reflected in `Dockerfile` located in this component and also in the `View Manager` component which relies on this component.

## Setup Without Docker

As the project is prepared for the use of Docker for deployment, you need to make a few adjustments in the View Manager component to make it work with this component - see [View Manager's README](../viewManager).

Create a virtual environment in the project directory:
```bash
python3 -m venv env
```

Activate the virtual environment:

- This is how it's done on Linux:
```bash
source env/bin/activate
```

- And this is how it's done on Windows for Command Prompt:
```bash
env\Scripts\activate.bat
```

Install the project dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

```bash
python run.py
```

## Deactivation of virtual environment

```bash
deactivate
```