# Python Execution Service

Service responsible for uploading and executing custom python source code.

## Setup With Docker

You don't have to do anything. All you need to do is to start the main `docker-compose.yml` for the whole main data storage system.

## Setup Without Dockeer

Create a virtual environment in the project directory:
```bash
python3 -m venv env
```

Activate the virtual environment:
```bash
source env/bin/activate
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