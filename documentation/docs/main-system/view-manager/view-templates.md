---
sidebar_position: 3
---

# View Templates

When user wants the apps to use their custom defined source code to be executed through Views, user needs to register this `View Template` manually. This is to ensure security of the system and to ensure that the user knows what they are doing.

These endpoints are therefore inaccessible to apps. `Control Centre` app utilises these endpoints. It's therefore essential to use `Control Centre` to first register `View Template`, get hold of the template id and pass it to the actual app. More on that later.

### Registering new View Template

**/viewTemplates/createNewViewTemplate** *(POST)*

To register a new `View Template`, you need to have the source code. 

Recommended workflow is the following:

When the app wants to use `View Templates`, it should provide the user with the source code and instructions for downloading it, which profiles needs to be set and so on. Once the user has the source code, they can either utilise this endpoint directly or via the `Control Centre`.

For seeing examples of `View Template Source Code`, visit documentation describing execution services.

#### Request

Request body needs to be of type `form-data`.

#### Required keys in the request body

- files

An array of file objects to be uploaded with the request. Each file is associated with a form field identifier.
Each file object includes metadata such as filename, content type, and the file data itself.
The file data should be encoded as binary for transmission.

example value: 

```js
[
  {
    "field": "attachment1",
    "filename": "example1.js",
    "content_type": "application/javascript",
    "data": "<BINARY DATA>"
  },
  {
    "field": "attachment2",
    "filename": "example2.js",
    "content_type": "application/javascript",
    "data": "<BINARY DATA>"
  }
]
```

- profiles

example value:

```js
[{"profile": "CalendarPro.com_CalendarEventProfile", "read": true, "create": true, "modify": false, "delete": false}, {"profile": "app2.com/profile2", "read": true, "create": true, "modify": true, "delete": true}]
```

- runtime

example value: `javascript`

- templateName

example value: `First Demo Template`

#### Response

This is the response for the above request:

```js
{
    "sourceCodeId": "7b7e47d1-ecd5-4bfe-9e5c-4e58ade51a9e",
    "viewTemplateId": "660326e42f1d7be8fe0d6f2c",
    "message": "View Template was created"
}
```

`viewTemplateId` is all the app needs to have to create `View Instance`. More on that in View Instances section.

Template names must be unique, so the second request with the same `templateName` ends up like this:

```js title="400 - template name uniqueness"
{
    "message": "Template name must be unique"
}
```

If the source code being uploaded does not follow guidelines of the given execution service where it's stored, response message from that execution service is returned.

```js title="400 - source code not conforming to requirements"
{
    "message": "Exactly one file must be named main.js"
}
```

### Fetching all existing View Templates

**/viewTemplates/templates** *(GET)*

This is a simple endpoint for fetching templates primarily used by `Control Centre` frontend. `Control Centre` then displays a list of registered templates in a nice user friendly way. You can read more about that in `Control Centre` section.

This is the response:

```js title="200 - fetched templates"
{
    "viewTemplates": [
        {
            "_id": "6603277a2f1d7be8fe0d6f34",
            "templateName": "First Demo Templatea",
            "sourceCodeId": "9638ecb1-c162-4817-a6a5-1f7abc883614",
            "metadata": {
                "runtime": "javascript"
            },
            "profiles": [
                {
                    "profile": "CalendarPro.com_CalendarEventProfile",
                    "read": true,
                    "create": true,
                    "modify": false,
                    "delete": false,
                    "_id": "6603277a2f1d7be8fe0d6f35"
                },
                {
                    "profile": "app2.com/profile2",
                    "read": true,
                    "create": true,
                    "modify": true,
                    "delete": true,
                    "_id": "6603277a2f1d7be8fe0d6f36"
                }
            ],
            "createdDate": "2024-03-26T19:52:26.251Z",
            "__v": 0
        },
        {
            "_id": "660326e42f1d7be8fe0d6f2c",
            "templateName": "First Demo Template",
            "sourceCodeId": "7b7e47d1-ecd5-4bfe-9e5c-4e58ade51a9e",
            "metadata": {
                "runtime": "javascript"
            },
            "profiles": [
                {
                    "profile": "CalendarPro.com_CalendarEventProfile",
                    "read": true,
                    "create": true,
                    "modify": false,
                    "delete": false,
                    "_id": "660326e42f1d7be8fe0d6f2d"
                },
                {
                    "profile": "app2.com/profile2",
                    "read": true,
                    "create": true,
                    "modify": true,
                    "delete": true,
                    "_id": "660326e42f1d7be8fe0d6f2e"
                }
            ],
            "createdDate": "2024-03-26T19:49:56.213Z",
            "__v": 0
        }
    ]
}
```

### Fetching Detailed View Template Information

**/viewTemplates/templates/:templateId** *(GET)*

This endpoint is for getting a more detailed information about a given template. It includes source code data requested from the given execution service, information about its usage, about which instances are using this template and so on. Again, this is used mainly by `Control Center` fronted admin app.

This is example request: `{{VIEW_MANAGER_URL}}/viewTemplates/templates/660326e42f1d7be8fe0d6f2c`.

This is the example response:

```js
{
    "template": {
        "_id": "660326e42f1d7be8fe0d6f2c",
        "templateName": "First Demo Template",
        "sourceCodeId": "7b7e47d1-ecd5-4bfe-9e5c-4e58ade51a9e",
        "metadata": {
            "runtime": "javascript"
        },
        "profiles": [
            {
                "profile": "CalendarPro.com_CalendarEventProfile",
                "read": true,
                "create": true,
                "modify": false,
                "delete": false,
                "_id": "660326e42f1d7be8fe0d6f2d"
            },
            {
                "profile": "app2.com/profile2",
                "read": true,
                "create": true,
                "modify": true,
                "delete": true,
                "_id": "660326e42f1d7be8fe0d6f2e"
            }
        ],
        "createdDate": "2024-03-26T19:49:56.213Z",
        "__v": 0
    },
    "sourceCode": [
        {
            "name": "helpers.js",
            "language": "javascript",
            "code": "const get = (endpoint, queryParams) => {\r\n    const toQueryString = (params) => {\r\n        return Object.keys(params)\r\n            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)\r\n            .join('&');\r\n    };\r\n\r\n    const queryString = queryParams ? `?${toQueryString(queryParams)}` : '';\r\n    \r\n    return new Promise((res, rej) => {\r\n        fetch(`${endpoint}${queryString}`)\r\n            .then(response => response.json().then(body => response.ok ? res({...body, status: response.status}) : rej({...body, status: response.status})))\r\n            .catch(error => rej(error));\r\n    });\r\n}\r\n\r\nfunction isDateWithinInterval(dateToCheckStr, startDateStr, endDateStr) {\r\n    const checkDate = new Date(dateToCheckStr).getTime();\r\n    const start = new Date(startDateStr).getTime();\r\n    const end = new Date(endDateStr).getTime();\r\n\r\n    return checkDate >= start && checkDate <= end;\r\n}\r\n\r\n\r\nmodule.exports = {\r\n    get,\r\n    isDateWithinInterval\r\n}"
        },
        {
            "name": "main.js",
            "language": "javascript",
            "code": "const { get, isDateWithinInterval } = require('./helpers');\r\n\r\nconst CHECK_ACCESS_TOKEN_STATUS = '/app/api/checkAccessTokenStatus';\r\nconst GET_ALL_EVENTS_FOR_GIVEN_ACCESS_TOKEN = '/app/api/getAllEventsForGivenAccessToken';\r\n\r\nconst isAccessTokenActive = (endpoint, accessToken) => {\r\n    return new Promise((res, rej) => {\r\n        get(`${endpoint}${CHECK_ACCESS_TOKEN_STATUS}?accessToken=${accessToken}`)\r\n            .then(response => {\r\n                res(response.isActive);\r\n            })\r\n            .catch(errResponse => {\r\n                rej(false);\r\n            })\r\n    })\r\n}\r\n\r\nconst getAllCalendarEvents = (endpoint, tokenForCalendarEvents) => {\r\n    return new Promise(async (res, rej) => {\r\n        try {\r\n            const response = await get(`${endpoint}${GET_ALL_EVENTS_FOR_GIVEN_ACCESS_TOKEN}`, {\r\n                accessToken: tokenForCalendarEvents\r\n            });\r\n\r\n            res({\r\n                ...response,\r\n            });\r\n        } catch (error) {\r\n            console.error('Error getting calendar events:', error);\r\n            rej(`Error getting calendar events: ${error.message ?? 'Server not reachable probably'}`);\r\n        }\r\n    }) \r\n}\r\n\r\nconst mainFunction = (parametersObject) => {\r\n    return new Promise(async (res, rej) => {\r\n\r\n        const { accessTokensToProfiles, configuration, clientCustomData, dataEndpoint } = parametersObject;\r\n\r\n        const tokenForCalendarEvents = accessTokensToProfiles[\"CalendarPro.com_CalendarEventProfile\"];\r\n\r\n        const isAccessTokenActivated = await isAccessTokenActive(dataEndpoint, tokenForCalendarEvents);\r\n\r\n        // return res({isAccessTokenActivated, tokenForCalendarEvents, dataEndpoint, a: `${dataEndpoint}/app/api/checkAccessTokenStatus?accessToken=${tokenForCalendarEvents}`})\r\n\r\n        if (!isAccessTokenActivated) {\r\n            return res({\r\n                code: 400,\r\n                message: 'Access Token is not active!'\r\n            })\r\n        }\r\n\r\n        getAllCalendarEvents(dataEndpoint, tokenForCalendarEvents)\r\n            .then(response => {\r\n                const intervalStartTime = clientCustomData.selectedWeek.startOfWeek;\r\n                const intervalEndTime = clientCustomData.selectedWeek.endOfWeek;\r\n\r\n                const filteredEvents = response.events.filter(event => isDateWithinInterval(event.payload.startTime, intervalStartTime, intervalEndTime));\r\n\r\n                res({\r\n                    code: 200,\r\n                    message: 'Events loaded successfully',\r\n                    response,\r\n                    clientCustomData,\r\n                    filteredEvents\r\n                })\r\n            })\r\n            .catch(err => {\r\n                res({\r\n                    code: 500,\r\n                    message: 'Something went wrong when requesting events'\r\n                })\r\n            });\r\n    })\r\n}\r\n\r\nmodule.exports = mainFunction;"
        }
    ],
    "viewInstances": [
        {
            "_id": "6603296a2f1d7be8fe0d6f48",
            "viewTemplate": "660326e42f1d7be8fe0d6f2c",
            "accessTokensToProfiles": {
                "CalendarPro.com_CalendarEventProfile": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjYwMzI5NmFjMzAyMGY4NzdjMWFiMTMxIiwiYXBwSWQiOiI2NWU5ZWNkMWRlNDc2ZWU3YjRhMjcxYzciLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJDYWxlbmRhclByby5jb21fQ2FsZW5kYXJFdmVudFByb2ZpbGUiLCJyZWFkIjp0cnVlLCJjcmVhdGUiOnRydWUsIm1vZGlmeSI6ZmFsc2UsImRlbGV0ZSI6ZmFsc2V9LCJjcmVhdGVkRGF0ZSI6IjIwMjQtMDMtMjZUMjA6MDA6NDIuMjIyWiIsImFwcHJvdmVkRGF0ZSI6bnVsbCwiZXhwaXJhdGlvbkRhdGUiOm51bGwsImlhdCI6MTcxMTQ4MzI0MiwiZXhwIjoxMTE3ODc2MzI0Mn0.uNi8xA-GT3kDy70zaQVePiice6wL75hEJ1TbnMuCWik",
                "app2.com/profile2": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjYwMzI5NmFjMzAyMGY4NzdjMWFiMTM1IiwiYXBwSWQiOiI2NWU5ZWNkMWRlNDc2ZWU3YjRhMjcxYzciLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhcHAyLmNvbS9wcm9maWxlMiIsInJlYWQiOnRydWUsImNyZWF0ZSI6dHJ1ZSwibW9kaWZ5Ijp0cnVlLCJkZWxldGUiOnRydWV9LCJjcmVhdGVkRGF0ZSI6IjIwMjQtMDMtMjZUMjA6MDA6NDIuMjU0WiIsImFwcHJvdmVkRGF0ZSI6bnVsbCwiZXhwaXJhdGlvbkRhdGUiOm51bGwsImlhdCI6MTcxMTQ4MzI0MiwiZXhwIjoxMTE3ODc2MzI0Mn0._cq8cmxtVfrmC3J2c6T9czY3b_zZ72Ji5EtgF49mZFA"
            },
            "configuration": {
                "from": "23.12.2020",
                "to": "24.12.2026"
            },
            "createdDate": "2024-03-26T20:00:42.263Z",
            "__v": 0
        }
    ],
    "isInUse": true
}
```

### Deleting View Template

**/viewTemplates/deleteViewTemplate/:templateId** *(DELETE)*

:::note

`View Templates` are allowed to be deleted only when no instances is currently using them.

:::

This is example request: `{{VIEW_MANAGER_URL}}/viewTemplates/deleteViewTemplate/660326e42f1d7be8fe0d6f2c`

and this is response:

```js title="200 - response - deleted"
{
    "message": "View Template was deleted successfully"
}
```

Or if something goes wrong, 400 along with message is returned.

```js title="400 - template id not found"
{
    "message": "View Template could not be deleted: Template not found"
}
```

Congrats! You have your new `View Template` created now and you can move on to `View Instances`.