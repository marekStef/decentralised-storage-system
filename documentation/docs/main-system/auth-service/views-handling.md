---
sidebar_position: 6
---

# Views Handling

:::note

`View Templates` and `View Instances` are trully being handled by `View Manager` component. `Auth Service` only checks whether the app is authorised to use given `View Instance` and then delegates this request to `View Manager` component. To know more about it, head over [there](../view-manager/introduction), please.

Therefore, we have `View Access` in `Auth Service` [have a look in schemas](./schemas).

:::

Before your app is able to register a `View Instance`, `View Template` needs to have been already created at this point. As mentioned before during this tour, there is no possibility for the app to register a custom source code by itself. The app needs to prepare `View Template`'s code to it to the user but it's ultimately the user who needs to make a decision about whether the code is safe enough to be registered in the `View Template`.

## Registering New View Instance *(application endpoint)*

- **/app/api/views/registerNewViewInstanceAccess** *(POST)*

```js title="Body of the request"
{
    "viewAccessName": "New View Access Name",
    "jwtTokenForPermissionRequestsAndProfiles": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjY2MDQyZTkwYzMwMjBmODc3YzFhYjEzOSIsIm5hbWVEZWZpbmVkQnlVc2VyIjoidGVzdGluZyIsIm5hbWVEZWZpbmVkQnlBcHAiOiJhcHBsaWNhdGlvbi5jb20iLCJpYXQiOjE3MTE1NTAxMDMsImV4cCI6MTExNzg4MzAxMDN9.qW2kUn0DvXMaGxnAvMVAZS8crAWh8f9OT1wXsis38aU",
    "viewTemplateId": "65fd8d379b3332eccb2769fd",
    //highlight-start
    "configuration": {}
    //highlight-end
}
```

As you can see in the request there is this `configuration` field that may surprise you, in particular what it's for. To learn more about it, visit [View Manager component](../view-manager/introduction). Long story short, each `View Instance` can have a `configuration` which can't be modified for the period of the `View Instance`'s whole life but this `configuration` is passed (along with other things - and yes dynamic `configuration` named as `clientData` exists as well) to the `View Instance` when being executed.

## Running View Instance *(application endpoint)*

As mentioned, **Auth Service** only performs checks and delegates Views related business logic to **View Manager** component. Therefore it's that component which is in the power of saying what's needed in the request.

For the sake of completness, we show it here as it's the **Auth Service** that is being requested (**View Manager** does not have `View Instances` related endpoints publicly accessible).

- **/app/api/views/runViewInstance** *(POST)*

```js title="Example Request Body"
{
    "viewAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWV3SW5zdGFuY2VJZCI6IjY1ZmRjMzBiM2VjZGEzMDA0NTFmYTVjZCIsImFwcElkIjoiNjVmZGMyZmQ5MDI2OTUyZjRhMzJlMTVhIiwiYXV0aFNlcnZpY2VWaWV3QWNjZXNzSWQiOiI2NWZkYzMwYjkwMjY5NTJmNGEzMmUxNmQiLCJpYXQiOjE3MTExMjk4NzYsImV4cCI6MTExNzg0MDk4NzZ9.pBiJnWjPCHZV-bf_0FPhs2H0RETB-VEfy7HyVOvVw6c",
    //highlight-start
    "clientCustomData": {
        "from": "new"
    }
    //highlight-end
}
```

:::note

To really know how `configuration` (static, life-time object being passed to each view execution), `clientCustomData` (dynamic, per-execution object being passed to each view instance from the client side request) and other data are passed to `View Instance` during its execution, you need to read **View Manager** component thoroughly as it has been already advised multiple times to you.

:::

## Getting All View Accesses *(admin endpoint)*

This endpoint is utilised by a frontend admin **Control Centre** component. The endpoint basically returns all `View Accesses` currently registered in the system.

- **/admin/api/views** *(GET)*

```js title="200 - OK Response"
[
    {
        "_id": "66045360c3020f877c1ab189",
        "app": "66045321c3020f877c1ab176",
        "viewAccessName": "View Instance Access Name For Calendar Events Fetching Based On Selected Week",
        "viewInstanceId": "660453604d828192b18e62f1",
        "createdDate": "2024-03-27T17:12:00.620Z",
        "__v": 0,
        "viewAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWV3SW5zdGFuY2VJZCI6IjY2MDQ1MzYwNGQ4MjgxOTJiMThlNjJmMSIsImFwcElkIjoiNjYwNDUzMjFjMzAyMGY4NzdjMWFiMTc2IiwiYXV0aFNlcnZpY2VWaWV3QWNjZXNzSWQiOiI2NjA0NTM2MGMzMDIwZjg3N2MxYWIxODkiLCJpYXQiOjE3MTE1NTk1MjAsImV4cCI6MTExNzg4Mzk1MjB9.Ekx_M3nAvpzv3sGeTFTwlvjQVDXfb3F75d06AyQtqo8"
    },
    {
        "_id": "660884c34b4934969eeb25c6",
        "app": "66045321c3020f877c1ab176",
        "viewAccessName": "View access for getting unique apps names",
        "viewInstanceId": "660884c34d828192b18e6c25",
        "createdDate": "2024-03-30T21:31:47.373Z",
        "__v": 0,
        "viewAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWV3SW5zdGFuY2VJZCI6IjY2MDg4NGMzNGQ4MjgxOTJiMThlNmMyNSIsImFwcElkIjoiNjYwNDUzMjFjMzAyMGY4NzdjMWFiMTc2IiwiYXV0aFNlcnZpY2VWaWV3QWNjZXNzSWQiOiI2NjA4ODRjMzRiNDkzNDk2OWVlYjI1YzYiLCJpYXQiOjE3MTE4MzQzMDcsImV4cCI6MTExNzkxMTQzMDd9.sdDE9WLVwFnywlYkjGKCOJUQPIBIUfPi_zneydtaY_o"
    },
    {
        "_id": "6608869c4b4934969eeb2624",
        "app": "66045321c3020f877c1ab176",
        "viewAccessName": "View access for getting location data from the android app",
        "viewInstanceId": "6608869c4d828192b18e6c74",
        "createdDate": "2024-03-30T21:39:40.556Z",
        "__v": 0,
        "viewAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWV3SW5zdGFuY2VJZCI6IjY2MDg4NjljNGQ4MjgxOTJiMThlNmM3NCIsImFwcElkIjoiNjYwNDUzMjFjMzAyMGY4NzdjMWFiMTc2IiwiYXV0aFNlcnZpY2VWaWV3QWNjZXNzSWQiOiI2NjA4ODY5YzRiNDkzNDk2OWVlYjI2MjQiLCJpYXQiOjE3MTE4MzQ3ODAsImV4cCI6MTExNzkxMTQ3ODB9.MqSsVSnDdVQAFUYFESx3hruCYn1dIIbOqP2GMuwi7cE"
    }
]
```

:::note
As mentioned above, `View Access` is just an access to the `View Instance`. `View Instances` are being managed by `View Manager`.
:::

## Getting All View Accesses For a Given App *(admin endpoint)*

**/admin/api/apps/:appHolderId/views** *(GET)* endpoint is for getting more detailed `View Accesses` information for a given app.

For a request like this `{{AUTH_SERVER_URL}}/admin/api/apps/66045321c3020f877c1ab176/views` we get this response:

```js title="200 - OK Response"
{
    "viewAccesses": [
        {
            "viewAccessId": "66096a55495e3a7c8e05cc19",
            "viewAccessName": "View access for getting windows apps data",
            "viewAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWV3SW5zdGFuY2VJZCI6IjY2MDk2YTU1NGQ4MjgxOTJiMThlNmU5YyIsImFwcElkIjoiNjYwNDUzMjFjMzAyMGY4NzdjMWFiMTc2IiwiYXV0aFNlcnZpY2VWaWV3QWNjZXNzSWQiOiI2NjA5NmE1NTQ5NWUzYTdjOGUwNWNjMTkiLCJpYXQiOjE3MTIwOTk2MDQsImV4cCI6MTExNzkzNzk2MDR9.vleXBOO4Q7-tbVcwrTU_D08SpSxSv_C222DnWYwfvZw",
            "viewInstanceId": "66096a554d828192b18e6e9c",
            "createdDate": "2024-03-31T13:51:17.902Z",
            "viewInstance": {
                "_id": "66096a554d828192b18e6e9c",
                "viewTemplate": {
                    "_id": "66096a4d4d828192b18e6e8c",
                    "templateName": "get_windows_apps_data_for_calendar_view_template",
                    "sourceCodeId": "d5fd5709-8a08-42eb-9e88-2959e8fc82b2",
                    "metadata": {
                        "runtime": "javascript"
                    },
                    "profiles": [
                        {
                            "profile": "activityTracker.com/activityTrackerEvent",
                            "read": true,
                            "create": false,
                            "modify": false,
                            "delete": false,
                            "_id": "66096a4d4d828192b18e6e8d"
                        }
                    ],
                    "createdDate": "2024-03-31T13:51:09.449Z",
                    "__v": 0
                },
                "accessTokensToProfiles": {
                    "activityTracker.com/activityTrackerEvent": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjYwOTZhNTU0OTVlM2E3YzhlMDVjYzE1IiwiYXBwSWQiOiI2NjA0NTMyMWMzMDIwZjg3N2MxYWIxNzYiLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhY3Rpdml0eVRyYWNrZXIuY29tL2FjdGl2aXR5VHJhY2tlckV2ZW50IiwicmVhZCI6dHJ1ZSwiY3JlYXRlIjpmYWxzZSwibW9kaWZ5IjpmYWxzZSwiZGVsZXRlIjpmYWxzZX0sImNyZWF0ZWREYXRlIjoiMjAyNC0wMy0zMVQxMzo1MToxNy44ODVaIiwiYXBwcm92ZWREYXRlIjpudWxsLCJleHBpcmF0aW9uRGF0ZSI6bnVsbCwiaWF0IjoxNzExODkzMDc3LCJleHAiOjExMTc5MTczMDc3fQ.m88oLlyu3T0GGUX4_6tICWU2GhBQb6AXpJZepdmuPSI"
                },
                "createdDate": "2024-03-31T13:51:17.896Z",
                "__v": 0
            }
        }
    ]
}
```
---

Congratulations! You have now covered most of the `Auth Service` component functionality! 🎉🎉🎉