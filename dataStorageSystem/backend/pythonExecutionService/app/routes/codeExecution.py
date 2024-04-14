from flask import Flask, request, jsonify, Blueprint, current_app
from werkzeug.utils import secure_filename
import os
import uuid
import shutil
import subprocess
import json

code_execution_bp = Blueprint('codeExecution', __name__)

@code_execution_bp.route('/executeSourceCode/<sourceCodeId>', methods=['POST'])
def execute_source_code(sourceCodeId):
    jsonParametersForMainEntry = request.json.get('parametersForMainEntry')
    
    if not sourceCodeId:
        return jsonify({'message': 'No source code id specified'}), 400

    if not isinstance(jsonParametersForMainEntry, dict):
        return jsonify({'message': 'jsonParametersForMainEntry must be of type object'}), 400

    source_code_directory = os.path.join(current_app.config['UPLOAD_FOLDER'], sourceCodeId)
    main_entry_path = os.path.join(source_code_directory, current_app.config['MAIN_FILE_NAME'])

    if not os.path.exists(main_entry_path):
        return jsonify({'message': 'Given source code does not exist'}), 400
    try:
        # Prepare the command to run the Python script with parameters
        cmd = ['python', main_entry_path, json.dumps(jsonParametersForMainEntry)]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        output = result.stdout
        return jsonify({'message': 'Code execution result', 'result': output}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({
            'message': 'Error executing the source code',
            'error': str(e),
            'stdout': e.stdout,
            'stderr': e.stderr
        }), 400
    except Exception as e:
        return jsonify({'message': 'Failed to execute the source code', 'error': str(e)}), 500
