from flask import Flask
import os
from .routes.codeRegistration import code_registration_bp
from .routes.codeExecution import code_execution_bp

app = Flask(__name__)

from app import routes

UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'source_codes/')
MAIN_FILE_NAME = 'main.py'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAIN_FILE_NAME'] = MAIN_FILE_NAME

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024 # maximum allowed payload 10 MB

# register routes
app.register_blueprint(code_registration_bp)
app.register_blueprint(code_execution_bp)