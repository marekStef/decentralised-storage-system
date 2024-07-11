from dotenv import load_dotenv
load_dotenv() # this needs to be before the line 'from app import app'! ( otherwise environment varaibles won't be visible in __init__.py)
import os
import sys

from app import app


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