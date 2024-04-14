from app import app
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import uuid

MAIN_FILE_NAME = 'main.py'

UPLOAD_FOLDER = 'uploads/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024 # maximum allowed payload 10 MB

@app.route('/uploadNewSourceCode', methods=['POST'])
def upload_file():
    if len(request.files) == 0:
        return jsonify({'message': 'No files sent'}), 400

    files = request.files.getlist('files')  # getlist to get all files under the 'files' key

    # checking all files to be python files
    for file in files:
        if not file.filename.endswith('.py'):
            return jsonify({'message': 'All files must be python files'}), 400

    # Check that exactly one file is named main.py
    main_py_count = sum(1 for file in files if file.filename == MAIN_FILE_NAME)
    if main_py_count != 1:
        return jsonify({'message': 'Exactly one file must be named main.py'}), 400
    

    print(len(files))

    source_code_id = str(uuid.uuid4())
    unique_dir_name = os.path.join(app.config['UPLOAD_FOLDER'], source_code_id)

    os.makedirs(unique_dir_name, exist_ok=True)


    uploaded_files = []
    for file in files:
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(unique_dir_name, filename)
            file.save(file_path)
            uploaded_files.append(filename)

    if not uploaded_files:
        return jsonify({'message': 'No files uploaded'}), 400

    return jsonify({'message': 'Files uploaded successfully', 'sourceCodeId': source_code_id, 'filenames': uploaded_files}), 200

@app.route('/sourceCodes/<sourceCodeId>', methods=['GET'])
def get_source_code(sourceCodeId):
    source_code_directory = os.path.join(UPLOAD_FOLDER, sourceCodeId)

    if not os.path.exists(source_code_directory):
        return jsonify({'message': 'Source code not found.'}), 404

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

        return jsonify({'sourceCode': source_code}), 200
    except Exception as e:
        print('Failed to read source code files:', str(e))
        return jsonify({'message': 'Something went wrong while retrieving the source code'}), 500

@app.route('/execute', methods=['POST'])
def execute_code():
    code = request.json.get('code', '')
    print(f"Executing Python code: {code}")
    return jsonify({"result": "Code executed", "code": code})