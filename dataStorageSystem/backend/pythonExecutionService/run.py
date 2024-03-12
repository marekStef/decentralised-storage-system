from app import app
from dotenv import load_dotenv
import os

load_dotenv()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(port=port, debug=True)