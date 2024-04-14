from utils import greet

import sys
import json

def main():
    # check if the json object argument is passed
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Expected one JSON string argument"}))
        sys.exit(1) # indicate error

    json_arg = sys.argv[1]
    try:
        # Parse the JSON string from the command line
        data = json.loads(json_arg)
    except json.JSONDecodeError as e:
        print(json.dumps({"error": "Invalid JSON provided"}))
        sys.exit(1)  # Exit with a non-zero status to indicate an error

    print(json.dumps({"received_data": data, "greeting": greet("user")}))

if __name__ == "__main__":
    main()
