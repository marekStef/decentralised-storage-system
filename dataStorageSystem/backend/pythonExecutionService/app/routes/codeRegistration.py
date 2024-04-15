from flask import Flask, request, jsonify, Blueprint, current_app
from werkzeug.utils import secure_filename
import os
import uuid
import shutil

from ..constants.httpStatusCodes import HTTP_OK, HTTP_CREATED, HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_INTERNAL_SERVER_ERROR

code_registration_bp = Blueprint('codeRegistration', __name__)

@code_registration_bp.route('/uploadNewSourceCode', methods=['POST'])
def upload_source_code():
    if len(request.files) == 0:
        return jsonify({'message': 'No files sent'}), HTTP_BAD_REQUEST

    files = request.files.getlist('files')  # getlist to get all files under the 'files' key

    # checking all files to be python files
    for file in files:
        if not file.filename.endswith('.py'):
            return jsonify({'message': 'All files must be python files'}), HTTP_BAD_REQUEST

    # Check that exactly one file is named main.py
    main_py_count = sum(1 for file in files if file.filename == current_app.config['MAIN_FILE_NAME'])
    if main_py_count != 1:
        return jsonify({'message': 'Exactly one file must be named main.py'}), HTTP_BAD_REQUEST
    

    print(len(files))

    source_code_id = str(uuid.uuid4())
    unique_dir_name = os.path.join(current_app.config['UPLOAD_FOLDER'], source_code_id)

    os.makedirs(unique_dir_name, exist_ok=True)


    uploaded_files = []
    for file in files:
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(unique_dir_name, filename)
            file.save(file_path)
            uploaded_files.append(filename)

    if not uploaded_files:
        return jsonify({'message': 'No files uploaded'}), HTTP_BAD_REQUEST

    return jsonify({'message': 'Files uploaded successfully', 'sourceCodeId': source_code_id, 'filenames': uploaded_files}), HTTP_CREATED

@code_registration_bp.route('/sourceCodes/<sourceCodeId>', methods=['GET'])
def get_source_code(sourceCodeId):
    source_code_directory = os.path.join(current_app.config['UPLOAD_FOLDER'], sourceCodeId)

    if not os.path.exists(source_code_directory):
        return jsonify({'message': 'Source code not found.'}), HTTP_NOT_FOUND

    try:
        files_in_directory = os.listdir(source_code_directory)
        source_code = []
        for file_name in files_in_directory:
            file_path = os.path.join(source_code_directory, file_name)
            with open(file_path, 'r', encoding='utf-8') as file:
                file_contents = file.read()
            source_code.append({
                'name': file_name,
                'language': 'python',
                'code': file_contents
            })

        return jsonify({'sourceCode': source_code}), HTTP_OK
    except Exception as e:
        print('Failed to read source code files:', str(e))
        return jsonify({'message': 'Something went wrong while retrieving the source code'}), HTTP_INTERNAL_SERVER_ERROR

@code_registration_bp.route('/sourceCodes/<sourceCodeId>', methods=['DELETE'])
def delete_source_code(sourceCodeId):
    source_code_directory = os.path.join(current_app.config['UPLOAD_FOLDER'], sourceCodeId)

    if not os.path.exists(source_code_directory):
        return jsonify({'message': 'Source code not found.'}), HTTP_NOT_FOUND

    try:
        shutil.rmtree(source_code_directory)
        return jsonify({'message': 'Source code deleted successfully.'}), HTTP_OK
    except Exception as e:
        print('Failed to delete source code:', str(e))
        return jsonify({'message': 'Something went wrong during the deletion process.'}), HTTP_INTERNAL_SERVER_ERROR