from flask import Flask
import os
from .routes.codeRegistration import code_registration_bp
from .routes.codeExecution import code_execution_bp
import sys

app = Flask(__name__)

from app import routes

project_root = os.getenv('PROJECT_ROOT')
source_codes_directory = os.getenv('SOURCE_CODES_DIRECTORY')

print(project_root)

if project_root is None or source_codes_directory is None:
    sys.stderr.write("Error: PROJECT_ROOT and SOURCE_CODES_DIRECTORY environment variables must be set.\n")
    sys.exit(1)

full_source_codes_directory = os.path.join(project_root, source_codes_directory)
app.config['SOURCE_CODES_DIRECTORY'] = full_source_codes_directory

MAIN_FILE_NAME = 'main.py'
app.config['MAIN_FILE_NAME'] = MAIN_FILE_NAME

os.makedirs(source_codes_directory, exist_ok=True)

app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024 # maximum allowed payload 10 MB

# register routes
app.register_blueprint(code_registration_bp)
app.register_blueprint(code_execution_bp)