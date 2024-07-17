---
sidebar_position: 1
---

# Requirements On Source Code

There are multiple requirements regarding the code structure as well as the files as well.

### Python Files Only

All uploaded source code files need to be valid python files with `.py` extension

### Importing of Other Files

You can upload up to 10 python files which can import one another. Importing from another file needs to be only local - meaning the imported
file must be one of the other files in the request.

### One Main File Requirement

As mentioned before, you can import multiple files **but exactly one of them must be called `main.py`**.

If none of the files will be called `main.py` or more of them will be called the same, `Python Execution Service` won't accept such source code.

### Defining the Main Function in the Entry File

The entry point of the script should be named main.py. This file must include a main() function that serves as the entry point for executing the script. The function should be structured to accept command line arguments. It needs to ignore the first one ( this is just the name of the program ) and it needs to handle the second argument. This will be the JSON object. This object contains the custom data.

### Main Function must print valid JSON string as output

This printed value will be taken as a return value from the executed program and therefore needs to be a valid JSON string.

This is an example of a simple source code, which just returns received data ( through the second argument ) and greets the user.

```python title="main.py"
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

```

```python title="utils.py"
def greet(name):
    return f"Hello, {name}!"
```