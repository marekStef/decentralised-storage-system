from app import app
from dotenv import load_dotenv
import os
import sys

load_dotenv()

# @app.route('/')
# def home():
#     return "Only for testing purposes"

if __name__ == '__main__':
    host = os.getenv('FLASK_RUN_HOST', '127.0.0.1')
    port = int(os.getenv('FLASK_RUN_PORT', 0))
    if port == 0:
        print("Error: Port number is 0. PORT needs to be set in .env")
        sys.exit(1)

    app.run(host, port, debug=True)