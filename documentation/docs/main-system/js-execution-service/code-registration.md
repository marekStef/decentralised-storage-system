---
sidebar_position: 2
---

# Code Registration

## Uploading New Source Code

For source code files uploading, this node js express component uses [multer](https://www.npmjs.com/package/multer) middleware. Therefore, the post request must be of `form-data` type.

```js
router.post('/uploadNewSourceCode', uploadMulterMiddleware.array('files'), uploadNewSourceCode);
```

The body of `form-data` request must contain `files` key and the values are the actual files.

There are multiple kinds of responses:

- source code registered successfully

```js title="201 - created"
{
    "message": "Files were uploaded",
    "sourceCodeId": "3cd89158-9968-44cc-94c6-629c68f551dd"
}
```

The response body in this case contains `sourceCodeId` which is a handle for this code from now on.

Now any other component using `Javascript Execution Service` only remembers `sourceCodeId`.

- no files in the request

```js title="400 - bad request"
{
    "message": "No files were uploaded."
}
```

## Fetching Source Code

For fetching an existing source code based on `sourceCodeId`, there is **/sourceCodes/:sourceCodeId** *(GET)* endpoint.

For instance for this example request `{{JS_EXECUTION_SERVICE_URL}}/sourceCodes/3cd89158-9968-44cc-94c6-629c68f551dd` with empty body it retuns the following:

```js title="response for source code fethching"
{
    "sourceCode": [
        {
            "name": "main.js",
            "code": "const { getResponseMessage } = require('./second');\r\n\r\nconst helloWorld = (name) => {\r\n    return getResponseMessage() + name;\r\n}\r\n\r\nmodule.exports = helloWorld;"
        },
        {
            "name": "second.js",
            "code": "console.log('hello world');\r\n\r\nconst getResponseMessage = () => {\r\n    return 'hello world';\r\n}\r\n\r\nmodule.exports = {\r\n    getResponseMessage\r\n}"
        }
    ]
}
```

## Deleting Source Code

Last simple endpoint is for source code deletion. Endpoint is basically the same (**/sourceCodes/:sourceCodeId** *(DELETE)*) except for the http method type.

```js title="response - 200 ok"
{
    "message": "Source code deleted"
}
```