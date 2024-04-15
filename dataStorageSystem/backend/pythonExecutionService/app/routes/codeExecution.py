from flask import Flask, request, jsonify, Blueprint, current_app
from werkzeug.utils import secure_filename
import os
import uuid
import shutil
import subprocess
import json

from ..constants.httpStatusCodes import HTTP_OK, HTTP_BAD_REQUEST, HTTP_INTERNAL_SERVER_ERROR

code_execution_bp = Blueprint('codeExecution', __name__)

@code_execution_bp.route('/executeSourceCode/<sourceCodeId>', methods=['POST'])
def execute_source_code(sourceCodeId):
    jsonParametersForMainEntry = request.json.get('parametersForMainEntry')
    
    if not sourceCodeId:
        return jsonify({'message': 'No source code id specified'}), HTTP_BAD_REQUEST

    if not isinstance(jsonParametersForMainEntry, dict):
        return jsonify({'message': 'jsonParametersForMainEntry must be of type object'}), HTTP_BAD_REQUEST

    source_code_directory = os.path.join(current_app.config['UPLOAD_FOLDER'], sourceCodeId)
    main_entry_path = os.path.join(source_code_directory, current_app.config['MAIN_FILE_NAME'])

    if not os.path.exists(main_entry_path):
        return jsonify({'message': 'Given source code does not exist'}), HTTP_BAD_REQUEST
    try:
        # Prepare the command to run the Python script with parameters
        cmd = ['python', main_entry_path, json.dumps(jsonParametersForMainEntry)]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        output = result.stdout
        return jsonify({'message': 'Code execution result', 'result': output}), HTTP_OK
    except subprocess.CalledProcessError as e:
        return jsonify({
            'message': 'Error executing the source code',
            'error': str(e),
            'stdout': e.stdout,
            'stderr': e.stderr
        }), HTTP_BAD_REQUEST
    except Exception as e:
        return jsonify({'message': 'Failed to execute the source code', 'error': str(e)}), HTTP_INTERNAL_SERVER_ERROR
