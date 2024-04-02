---
sidebar_position: 4
---

# Permissions

Before continuing, your app needs to have profiles sorted out. In other words, if it needs to work with a completely new type of events, it first needs to notify the system of that new type of event. If the app just wants to process some existing events, you already should know, you don't need to do anything.

## Requesting New Permission *(application part)*

When you app wants to access raw events, it needs to specify which profile it wants to access and what rights the app wants. Events are bound to profiles so that's the reason why `profile` name must be specified in every event.

When the app requests to access a profile ( we mean a set of events having that particular profile in the metadata) which does not exist, this is totally fine and the app will get an empty list of events. The idea is that in future, such profile may be created, rendering the set of events of that particular type non-empty.

The app needs to hit this endpoint: **/app/api/requestNewPermission** *(POST)* with the following body (as example):

```js title="Body of a new permission request"
{
    "jwtTokenForPermissionRequestsAndProfiles": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjY1ZmFlMDk0N2E5MGI0YTUyNjNhNDk4MCIsIm5hbWVEZWZpbmVkQnlVc2VyIjoiTXkgTmV3IEFwcGxpY2F0aW9uIiwibmFtZURlZmluZWRCeUFwcCI6ImFwcGxpY2F0aW9uLmNvbSIsImlhdCI6MTcxMDk0MDcxMywiZXhwIjoxMTE3ODIyMDcxM30.3zHTC0_igQKfzjF8uZadJLkmd4qRXY_hePd_M6pmPj0",
    "permissionsRequest": {
        "profile": "application.com/first_profile",
        "read": true,
        "create": true,
        "modify": true,
        "delete": true
    },
    "optionalMessage": "This is optional message for the permission from the app"
}
```

Optional message can be left out. This is just an opportunity for the app to state its reason behind this permission request. This message is shown in the admin frontend `Control Centre` component.

There are multiple possible responses:

- everything ok, `generatedAccessToken` is returned.

```js title="201 - Created response"
{
    "message": "Permissions requested successfully",
    // highlight-start
    "generatedAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjVmYWZiM2UxYjI3YjQxNjE0NTk0Mjc3IiwiYXBwSWQiOiI2NWZhZTA5NDdhOTBiNGE1MjYzYTQ5ODAiLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhcHBsaWNhdGlvbi5jb20vZmlyc3RfcHJvZmlsZSIsInJlYWQiOnRydWUsImNyZWF0ZSI6dHJ1ZSwibW9kaWZ5Ijp0cnVlLCJkZWxldGUiOnRydWV9LCJjcmVhdGVkRGF0ZSI6IjIwMjQtMDMtMjBUMTU6MDU6MzQuNDE3WiIsImFwcHJvdmVkRGF0ZSI6bnVsbCwiZXhwaXJhdGlvbkRhdGUiOm51bGwsImlhdCI6MTcxMDk0NzEzNCwiZXhwIjoxMTE3ODIyNzEzNH0.30tA0SPYMcYMdVg15Mqll6bcFOnE41u9rRGcF5kIY5M"
    // highlight-end
}
```

:::caution

Just as with `jwtTokenForPermissionRequestsAndProfiles`, your app needs to remember `generatedAccessToken` which will be used once the app decides to manipulate or processs events in some way.

:::

- invalid `jwtTokenForPermissionRequestsAndProfiles`

```js title="401 - Unauthorised response"
{
    "message": "Invalid or expired JWT token"
}
```

Remeber, this was just a permission request which needs to be approved. Unless it's approved, the app cannot do anything about it. However, the app has an option to check for permission status (access token status) and so can notify its user that they should take an action if they want to fully use their new app. Or maybe the user will find out the app wants to access some other irrelevant data it should have no access to!

## Checking Permission Status

To check the permission status, there is this endpoint **/app/api/checkAccessTokenStatus?accessToken=[token]** *(GET)*.

So for the result above, the request looks like this: 

```js title="demo request"
[AUTH SERVICE URL]/app/api/checkAccessTokenStatus?accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjVmYWZiM2UxYjI3YjQxNjE0NTk0Mjc3IiwiYXBwSWQiOiI2NWZhZTA5NDdhOTBiNGE1MjYzYTQ5ODAiLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhcHBsaWNhdGlvbi5jb20vZmlyc3RfcHJvZmlsZSIsInJlYWQiOnRydWUsImNyZWF0ZSI6dHJ1ZSwibW9kaWZ5Ijp0cnVlLCJkZWxldGUiOnRydWV9LCJjcmVhdGVkRGF0ZSI6IjIwMjQtMDMtMjBUMTU6MDU6MzQuNDE3WiIsImFwcHJvdmVkRGF0ZSI6bnVsbCwiZXhwaXJhdGlvbkRhdGUiOm51bGwsImlhdCI6MTcxMDk0NzEzNCwiZXhwIjoxMTE3ODIyNzEzNH0.30tA0SPYMcYMdVg15Mqll6bcFOnE41u9rRGcF5kIY5M
```

And the response is following:

```js title="response - 200"
{
    "isActive": true,
    "isRevoked": false
}
```

So if the access token is not active, your app can notify user that they need to approve this permission.

## Getting Unapproved Permissions Requests *(admin part)*

For getting a full list of unapproved permissions, admin can hit this endpoint (it is paginated): **/admin/api/permissions/getUnapprovedPermissionsRequests?pageIndex=2&limit=100** *(GET)*

The response is the following:

```js title="response - 200"
{
    "status": "success",
    "data": {
        "permissions": [
            {
                // highlight-start
                "_id": "65faf9c8f9b73ae41344361f",
                // highlight-end
                "app": {
                    "_id": "65f85d8f72d3cb5a148a96f6",
                    "nameDefinedByUser": "My New App",
                    "dateOfAssociationByApp": "2024-03-18T15:28:29.331Z",
                    "jwtTokenForPermissionRequestsAndProfiles": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjY1Zjg1ZDhmNzJkM2NiNWExNDhhOTZmNiIsIm5hbWVEZWZpbmVkQnlVc2VyIjoiTXkgTmV3IEFwcCIsIm5hbWVEZWZpbmVkQnlBcHAiOiJhaG9qLmNvbSIsImlhdCI6MTcxMDc3NTcwOSwiZXhwIjoxMTE3ODA1NTcwOX0.EKgX4SevCgdCUq3QbpWbSahb47sbJL9o9hGGtfQIY10",
                    "dateOfRegistration": "2024-03-18T15:28:15.541Z",
                    "__v": 0,
                    "nameDefinedByApp": "ahoj.com"
                },
                "optionalMessage": "This is optional message for the permission from the app",
                "permission": {
                    "profile": "ahoj.com/first_profile",
                    "read": true,
                    "create": true,
                    "modify": true,
                    "delete": true,
                    "_id": "65faf9c8f9b73ae413443620"
                },
                "createdDate": "2024-03-20T14:59:20.695Z",
                "approvedDate": null,
                "isActive": false,
                "revokedDate": null,
                "expirationDate": null,
                "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjVmYWY5YzhmOWI3M2FlNDEzNDQzNjFmIiwiYXBwSWQiOiI2NWY4NWQ4ZjcyZDNjYjVhMTQ4YTk2ZjYiLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhaG9qLmNvbS9maXJzdF9wcm9maWxlIiwicmVhZCI6dHJ1ZSwiY3JlYXRlIjp0cnVlLCJtb2RpZnkiOnRydWUsImRlbGV0ZSI6dHJ1ZX0sImNyZWF0ZWREYXRlIjoiMjAyNC0wMy0yMFQxNDo1OToyMC42OTVaIiwiYXBwcm92ZWREYXRlIjpudWxsLCJleHBpcmF0aW9uRGF0ZSI6bnVsbCwiaWF0IjoxNzEwOTQ2NzYwLCJleHAiOjExMTc4MjI2NzYwfQ.yHg2A8plYpxhusRTqTFXwmhNj3sz0722mB5pRJCKyqY",
                "__v": 0
            },
            {
                // highlight-start
                "_id": "65fafb2f1b27b4161459426f",
                // highlight-end
                "app": {
                    "_id": "65f85d8f72d3cb5a148a96f6",
                    "nameDefinedByUser": "My New App",
                    "dateOfAssociationByApp": "2024-03-18T15:28:29.331Z",
                    "jwtTokenForPermissionRequestsAndProfiles": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjY1Zjg1ZDhmNzJkM2NiNWExNDhhOTZmNiIsIm5hbWVEZWZpbmVkQnlVc2VyIjoiTXkgTmV3IEFwcCIsIm5hbWVEZWZpbmVkQnlBcHAiOiJhaG9qLmNvbSIsImlhdCI6MTcxMDc3NTcwOSwiZXhwIjoxMTE3ODA1NTcwOX0.EKgX4SevCgdCUq3QbpWbSahb47sbJL9o9hGGtfQIY10",
                    "dateOfRegistration": "2024-03-18T15:28:15.541Z",
                    "__v": 0,
                    "nameDefinedByApp": "ahoj.com"
                },
                "optionalMessage": "This is optional message for the permission from the app",
                "permission": {
                    "profile": "application.com/first_profile",
                    "read": true,
                    "create": true,
                    "modify": true,
                    "delete": true,
                    "_id": "65fafb2f1b27b41614594270"
                },
                "createdDate": "2024-03-20T15:05:19.114Z",
                "approvedDate": null,
                "isActive": false,
                "revokedDate": null,
                "expirationDate": null,
                "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjVmYWZiMmYxYjI3YjQxNjE0NTk0MjZmIiwiYXBwSWQiOiI2NWY4NWQ4ZjcyZDNjYjVhMTQ4YTk2ZjYiLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhcHBsaWNhdGlvbi5jb20vZmlyc3RfcHJvZmlsZSIsInJlYWQiOnRydWUsImNyZWF0ZSI6dHJ1ZSwibW9kaWZ5Ijp0cnVlLCJkZWxldGUiOnRydWV9LCJjcmVhdGVkRGF0ZSI6IjIwMjQtMDMtMjBUMTU6MDU6MTkuMTE0WiIsImFwcHJvdmVkRGF0ZSI6bnVsbCwiZXhwaXJhdGlvbkRhdGUiOm51bGwsImlhdCI6MTcxMDk0NzExOSwiZXhwIjoxMTE3ODIyNzExOX0.xKHy4xRcK-Kwysesp9wh7YdgBucAvrJgRiuZDW9QoHY",
                "__v": 0
            }
        ],
        "totalItems": 2,
        "totalPages": 1,
        "currentPage": 0
    }
}
```

This endpoint, as mentioned before, is utilised by the **Control Centre**.

## Getting Unapproved Permissions Requests For Given App *(admin part)*

For getting a full list of unapproved permissions for a given app, admin can hit this endpoint (it is paginated): **/admin/api/permissions/getUnapprovedPermissionsRequests/:appHolderId** *(GET)*

`appHolderId` is the id you get when you register a new app holder [(look here)](/docs/main-system/auth-service/new-app-setup).

For this request `/admin/api/permissions/getUnapprovedPermissionsRequests/65f85d8f72d3cb5a148a96f6` the following is the response:

```js title="response - 200"
{
    "status": "success",
    "permissions": [
        {
            // highlight-start
            "_id": "65f85e6e72d3cb5a148a971f",
            // highlight-end
            "app": {
                "_id": "65f85d8f72d3cb5a148a96f6",
                "nameDefinedByUser": "My New App",
                "dateOfAssociationByApp": "2024-03-18T15:28:29.331Z",
                "jwtTokenForPermissionRequestsAndProfiles": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjY1Zjg1ZDhmNzJkM2NiNWExNDhhOTZmNiIsIm5hbWVEZWZpbmVkQnlVc2VyIjoiTXkgTmV3IEFwcCIsIm5hbWVEZWZpbmVkQnlBcHAiOiJhaG9qLmNvbSIsImlhdCI6MTcxMDc3NTcwOSwiZXhwIjoxMTE3ODA1NTcwOX0.EKgX4SevCgdCUq3QbpWbSahb47sbJL9o9hGGtfQIY10",
                "dateOfRegistration": "2024-03-18T15:28:15.541Z",
                "__v": 0,
                "nameDefinedByApp": "ahoj.com"
            },
            "permission": {
                "profile": "ahoj.com/first_profile",
                "read": true,
                "create": true,
                "modify": true,
                "delete": true,
                "_id": "65f85e6e72d3cb5a148a9720"
            },
            "createdDate": "2024-03-18T15:31:58.115Z",
            "approvedDate": "2024-03-18T15:32:24.954Z",
            "isActive": true,
            "revokedDate": null,
            "expirationDate": null,
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjVmODVlNmU3MmQzY2I1YTE0OGE5NzFmIiwiYXBwSWQiOiI2NWY4NWQ4ZjcyZDNjYjVhMTQ4YTk2ZjYiLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhaG9qLmNvbS9maXJzdF9wcm9maWxlIiwicmVhZCI6dHJ1ZSwiY3JlYXRlIjp0cnVlLCJtb2RpZnkiOnRydWUsImRlbGV0ZSI6dHJ1ZX0sImNyZWF0ZWREYXRlIjoiMjAyNC0wMy0xOFQxNTozMTo1OC4xMTVaIiwiYXBwcm92ZWREYXRlIjpudWxsLCJleHBpcmF0aW9uRGF0ZSI6bnVsbCwiaWF0IjoxNzEwNzc1OTE4LCJleHAiOjExMTc4MDU1OTE4fQ.YxSUEYNCVRRRT-h7bmKrEULWyXgimd8W9-zFSLINknI",
            "optionalMessage": "This is optional message for the permission from the app",
            "__v": 0
        },
        {
            // highlight-start
            "_id": "65faf9c8f9b73ae41344361f",
            // highlight-end
            "app": {
                "_id": "65f85d8f72d3cb5a148a96f6",
                "nameDefinedByUser": "My New App",
                "dateOfAssociationByApp": "2024-03-18T15:28:29.331Z",
                "jwtTokenForPermissionRequestsAndProfiles": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjY1Zjg1ZDhmNzJkM2NiNWExNDhhOTZmNiIsIm5hbWVEZWZpbmVkQnlVc2VyIjoiTXkgTmV3IEFwcCIsIm5hbWVEZWZpbmVkQnlBcHAiOiJhaG9qLmNvbSIsImlhdCI6MTcxMDc3NTcwOSwiZXhwIjoxMTE3ODA1NTcwOX0.EKgX4SevCgdCUq3QbpWbSahb47sbJL9o9hGGtfQIY10",
                "dateOfRegistration": "2024-03-18T15:28:15.541Z",
                "__v": 0,
                "nameDefinedByApp": "ahoj.com"
            },
            "permission": {
                "profile": "ahoj.com/first_profile",
                "read": true,
                "create": true,
                "modify": true,
                "delete": true,
                "_id": "65faf9c8f9b73ae413443620"
            },
            "createdDate": "2024-03-20T14:59:20.695Z",
            "approvedDate": null,
            "isActive": false,
            "revokedDate": null,
            "expirationDate": null,
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjVmYWY5YzhmOWI3M2FlNDEzNDQzNjFmIiwiYXBwSWQiOiI2NWY4NWQ4ZjcyZDNjYjVhMTQ4YTk2ZjYiLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhaG9qLmNvbS9maXJzdF9wcm9maWxlIiwicmVhZCI6dHJ1ZSwiY3JlYXRlIjp0cnVlLCJtb2RpZnkiOnRydWUsImRlbGV0ZSI6dHJ1ZX0sImNyZWF0ZWREYXRlIjoiMjAyNC0wMy0yMFQxNDo1OToyMC42OTVaIiwiYXBwcm92ZWREYXRlIjpudWxsLCJleHBpcmF0aW9uRGF0ZSI6bnVsbCwiaWF0IjoxNzEwOTQ2NzYwLCJleHAiOjExMTc4MjI2NzYwfQ.yHg2A8plYpxhusRTqTFXwmhNj3sz0722mB5pRJCKyqY",
            "optionalMessage": "This is optional message for the permission from the app",
            "__v": 0
        }
    ]
}
```

## Approving Permission Request *(admin part)*

To approve a permission, there is **/admin/api/permissions/approvePermissionRequest** *(PUT)* endpoint for it.

You specify which permission request to approve by specifying `permissionId`. As you can see, each `permission` object in the `permissions` list in the responses above contains `_id`. This is the needed id.

```js title="Body of the request"
{
    "permissionId": "65ec875616c7c86638272a48"
}
```

And there are multiple responses types:

- permission was approved

```js title="response - 200"
{
    "message": "Permission request approved successfully",
    "data": {
        "_id": "65faf9c8f9b73ae41344361f",
        "app": "65f85d8f72d3cb5a148a96f6",
        "permission": {
            "profile": "ahoj.com/first_profile",
            "read": true,
            "create": true,
            "modify": true,
            "delete": true,
            "_id": "65faf9c8f9b73ae413443620"
        },
        "createdDate": "2024-03-20T14:59:20.695Z",
        "approvedDate": "2024-03-20T15:58:55.477Z",
        "isActive": true,
        "revokedDate": null,
        "expirationDate": null,
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjVmYWY5YzhmOWI3M2FlNDEzNDQzNjFmIiwiYXBwSWQiOiI2NWY4NWQ4ZjcyZDNjYjVhMTQ4YTk2ZjYiLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhaG9qLmNvbS9maXJzdF9wcm9maWxlIiwicmVhZCI6dHJ1ZSwiY3JlYXRlIjp0cnVlLCJtb2RpZnkiOnRydWUsImRlbGV0ZSI6dHJ1ZX0sImNyZWF0ZWREYXRlIjoiMjAyNC0wMy0yMFQxNDo1OToyMC42OTVaIiwiYXBwcm92ZWREYXRlIjpudWxsLCJleHBpcmF0aW9uRGF0ZSI6bnVsbCwiaWF0IjoxNzEwOTQ2NzYwLCJleHAiOjExMTc4MjI2NzYwfQ.yHg2A8plYpxhusRTqTFXwmhNj3sz0722mB5pRJCKyqY",
        "optionalMessage": "This is optional message for the permission from the app",
        "__v": 0
    }
}
```

- `permissionId` not found
```js title="404 - not found"
{
    "message": "Permission request not found"
}
```

## Revokig Permission Request *(admin part)*

If you find yourself in need of revoking a permission, this endpoint **/admin/api/permissions/revokePermission** *(PUT)* is there to save you.

Interface is similar to [approving of permission request](#approving-permission-request-admin-part)

```js title="body of the request"
{
    "permissionId": "65c634fd1b6deae674c26af1"
}
```

And responses are similar as well.

---

Congratulations! Your app has now all permissions it needs! 🎉🎉🎉
