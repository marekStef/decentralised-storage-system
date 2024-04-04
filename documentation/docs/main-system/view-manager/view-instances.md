---
sidebar_position: 4
---

# View Instances

Once you have your `View Template` created, you can proceed to creating `View Instance`. As you already know, YOU as admin was required to create a `View Template` as it can be very dangerous to run unknown code and therefore u act as a supervisor here.

`View Instances` on the other hand, are created by apps. Therefore, when your app wants to create a new `View Instance`, it needs to first give user a thorough plan for creating a new `View Template`.

### Creating a New View Instance

**/viewInstances/createNewViewInstance** *(POST)*

When the app wants to create a new `View Instance`, it needs to

This is example request:

```js title="Example New View Instance Request"
{
    "viewTemplateId": "660326e42f1d7be8fe0d6f2c",
    "jwtTokenForPermissionRequestsAndProfiles": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjY1ZTllY2QxZGU0NzZlZTdiNGEyNzFjNyIsIm5hbWVEZWZpbmVkQnlVc2VyIjoiTXkgTmV3IEFwcCIsIm5hbWVEZWZpbmVkQnlBcHAiOiJhaG9qLmNvbSIsImlhdCI6MTcwOTgyOTM0NCwiZXhwIjoxMTE3NzEwOTM0NH0.i-laNiFOuY-u8U_AEi3wkq2Qhuj22gSLkgEfLx4UFhA",
    "configuration": {
        "from":"23.12.2020",
        "to":"24.12.2026"
    }
}
```

Each `View Template` contains a list of profiles with their respective rights. Individual `View Instances` are meant to be utilising these sets of data corresponding to these profiles. Therefore, when the new `View Instance` is created, `View Manager` requests permissions for these profiles automatically in the `Auth Service`. These permissions requests need to be approved by the admin user using the `Auth Service` endpoints or using user interface in the form of `Control Centre` frontend component.

And this is response. Response shows which access tokens to profiles the view instance source code will get but most importantly, `_id` of the newly created `View Instance` is returned. This is the most important part of the response and the client app needs to remember this id for future execution of this source code.

```js title="Example New View Instance Response For Initiated Request"
{
    "viewTemplate": "660326e42f1d7be8fe0d6f2c",
    "accessTokensToProfiles": {
        "CalendarPro.com_CalendarEventProfile": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjYwMzI5NmFjMzAyMGY4NzdjMWFiMTMxIiwiYXBwSWQiOiI2NWU5ZWNkMWRlNDc2ZWU3YjRhMjcxYzciLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJDYWxlbmRhclByby5jb21fQ2FsZW5kYXJFdmVudFByb2ZpbGUiLCJyZWFkIjp0cnVlLCJjcmVhdGUiOnRydWUsIm1vZGlmeSI6ZmFsc2UsImRlbGV0ZSI6ZmFsc2V9LCJjcmVhdGVkRGF0ZSI6IjIwMjQtMDMtMjZUMjA6MDA6NDIuMjIyWiIsImFwcHJvdmVkRGF0ZSI6bnVsbCwiZXhwaXJhdGlvbkRhdGUiOm51bGwsImlhdCI6MTcxMTQ4MzI0MiwiZXhwIjoxMTE3ODc2MzI0Mn0.uNi8xA-GT3kDy70zaQVePiice6wL75hEJ1TbnMuCWik",
        "app2.com/profile2": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjYwMzI5NmFjMzAyMGY4NzdjMWFiMTM1IiwiYXBwSWQiOiI2NWU5ZWNkMWRlNDc2ZWU3YjRhMjcxYzciLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhcHAyLmNvbS9wcm9maWxlMiIsInJlYWQiOnRydWUsImNyZWF0ZSI6dHJ1ZSwibW9kaWZ5Ijp0cnVlLCJkZWxldGUiOnRydWV9LCJjcmVhdGVkRGF0ZSI6IjIwMjQtMDMtMjZUMjA6MDA6NDIuMjU0WiIsImFwcHJvdmVkRGF0ZSI6bnVsbCwiZXhwaXJhdGlvbkRhdGUiOm51bGwsImlhdCI6MTcxMTQ4MzI0MiwiZXhwIjoxMTE3ODc2MzI0Mn0._cq8cmxtVfrmC3J2c6T9czY3b_zZ72Ji5EtgF49mZFA"
    },
    "configuration": {
        "from": "23.12.2020",
        "to": "24.12.2026"
    },
    // highlight-start
    "_id": "6603296a2f1d7be8fe0d6f48",
    // highlight-end
    "createdDate": "2024-03-26T20:00:42.263Z",
    "__v": 0
}
```

### Running View Instance

**/viewInstances/runViewInstance** *(POST)*

This is example request: `{{VIEW_MANAGER_URL}}/viewInstances/runViewInstance`.

This is example body:

```js 
{
    "viewInstanceId": "65fd8967a6ef77f149701be7",
    "clientCustomData": {
        "from": "this is from client data"
    }
}
```

Your custom source code entry function, as mentioned in the source code requirements sections, needs to be able to receive exactly one parameter. This parameter is object containing the following:

```js
{ 
    accessTokensToProfiles: {}, // tokens for profiles 
    configuration: {...}, 
    clientCustomData: {...}, // this is the object from the request body
    dataEndpoint: '...' // url for getting data 
}
```

This is what `accessTokensToProfiles` object looks like (it is a normal object containing keys - names of the profiles).

```js
"accessTokensToProfiles": {
    "CalendarPro.com_CalendarEventProfile": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjYwMzI5NmFjMzAyMGY4NzdjMWFiMTMxIiwiYXBwSWQiOiI2NWU5ZWNkMWRlNDc2ZWU3YjRhMjcxYzciLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJDYWxlbmRhclByby5jb21fQ2FsZW5kYXJFdmVudFByb2ZpbGUiLCJyZWFkIjp0cnVlLCJjcmVhdGUiOnRydWUsIm1vZGlmeSI6ZmFsc2UsImRlbGV0ZSI6ZmFsc2V9LCJjcmVhdGVkRGF0ZSI6IjIwMjQtMDMtMjZUMjA6MDA6NDIuMjIyWiIsImFwcHJvdmVkRGF0ZSI6bnVsbCwiZXhwaXJhdGlvbkRhdGUiOm51bGwsImlhdCI6MTcxMTQ4MzI0MiwiZXhwIjoxMTE3ODc2MzI0Mn0.uNi8xA-GT3kDy70zaQVePiice6wL75hEJ1TbnMuCWik",
    "app2.com/profile2": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjYwMzI5NmFjMzAyMGY4NzdjMWFiMTM1IiwiYXBwSWQiOiI2NWU5ZWNkMWRlNDc2ZWU3YjRhMjcxYzciLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhcHAyLmNvbS9wcm9maWxlMiIsInJlYWQiOnRydWUsImNyZWF0ZSI6dHJ1ZSwibW9kaWZ5Ijp0cnVlLCJkZWxldGUiOnRydWV9LCJjcmVhdGVkRGF0ZSI6IjIwMjQtMDMtMjZUMjA6MDA6NDIuMjU0WiIsImFwcHJvdmVkRGF0ZSI6bnVsbCwiZXhwaXJhdGlvbkRhdGUiOm51bGwsImlhdCI6MTcxMTQ4MzI0MiwiZXhwIjoxMTE3ODc2MzI0Mn0._cq8cmxtVfrmC3J2c6T9czY3b_zZ72Ji5EtgF49mZFA"
}
```

This is example response:

```js title="Execution Result Response (200)"
{
    "message": "Source code successfully executed",
    "result": {} // whatever your source code returns ( look at source code requirements here in View Manager module)
}
```

There may be other response codes in case something goes wrong. In every error response, it is ensured that you get `message` about what went wrong.

### Getting View Instance Details

**/viewInstances/:viewInstanceId** *(GET)*

To get details about a given `View Instance`, this endpoint does exactly that.

This is example request `{{VIEW_MANAGER_URL}}/viewInstances/6603296a2f1d7be8fe0d6f48`

and this object is returned:

```js
{
    "_id": "6603296a2f1d7be8fe0d6f48",
    "viewTemplate": {
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
```

In case the `View Instance` is not found, `400` is returned along with a message.

```js title="404 - not found"
{
    "message": 'View Instance not found'
}
```