---
sidebar_position: 5
---

# Events Handling

Even though you probably know that **Data Storage** component is responsible for handling events, this **Auth Service** component adds additional layer of security by introducing authentication and authorisation for events handling.

When everything's fine, this component delegates your request to save the events to the **Data Storage** component.

A new 3rd app's developer doesn't have to understand the endpoints of **Data Storage** but it's these components that are of crucial importance for them. 

## Events Uploading

To upload a new set of events, you need to hit this endpoint of auth service: **/app/api/uploadNewEvents** *(POST)*.

```js title="Example request body"
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjYwNDc5YTBjMzAyMGY4NzdjMWFiMWQxIiwiYXBwSWQiOiI2NjA0MmU5MGMzMDIwZjg3N2MxYWIxMzkiLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhcHBsaWNhdGlvbi5jb20vZmlyc3RfcHJvZmlsZSIsInJlYWQiOnRydWUsImNyZWF0ZSI6dHJ1ZSwibW9kaWZ5Ijp0cnVlLCJkZWxldGUiOnRydWV9LCJjcmVhdGVkRGF0ZSI6IjIwMjQtMDMtMjdUMTk6NTU6MTIuMjA5WiIsImFwcHJvdmVkRGF0ZSI6bnVsbCwiZXhwaXJhdGlvbkRhdGUiOm51bGwsImlhdCI6MTcxMTU2OTMxMiwiZXhwIjoxMTE3ODg0OTMxMn0.QohWLv3Ez2yK4SYsKtFmCSx2bny7y9jhXiZOGfmsEZc",
    "profileCommonForAllEventsBeingUploaded": "application.com/first_profile",
    "events": [
        {
            "metadata": {
                "profile": "application.com/first_profile"
            },
            "payload": {
                "latitude": 50.08804,
                "longitude": 14.42076
            }
            
        }
    ]
    
}
```

When the app hasn't been approved the permission request, `403 - Forbidden` response is returned.

```js title="403 - Forbidden response"
{
    "message": "Access permission is not active or has been revoked"
}
```

:::tip 

To get more information about what happend, the third party app can query more information about that token using endpoint introduced in [permissions](./permissions)

:::

When the token is active, this is the response body:

```js title="201 - Created response"
{
    "message": "Events were created successfully",
    "events": [
        {
            "metadata": {
                "identifier": "a52034d9-263e-422a-9774-eeb9f01a3abf",
                "profile": "application.com/first_profile",
                "source": "testing",
                "createdDate": "2024-04-02T22:08:28.551Z",
                "acceptedDate": "2024-04-02T22:08:28.551Z"
            },
            "payload": {
                "latitude": 50.08804,
                "longitude": 14.42076
            },
            "_id": "660c81dccba57a70e98c1120",
            "__v": 0
        }
    ]
}
```

As you can see, `events` field is returned, now containing `_id` as well.

## Modification of Event

To modify a particular event, you can use **/app/api/modifyEvent** *(PUT)* endpoint.

The request body needs to contain `accessToken`. 

```js title=""
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjYwNDc5YTBjMzAyMGY4NzdjMWFiMWQxIiwiYXBwSWQiOiI2NjA0MmU5MGMzMDIwZjg3N2MxYWIxMzkiLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhcHBsaWNhdGlvbi5jb20vZmlyc3RfcHJvZmlsZSIsInJlYWQiOnRydWUsImNyZWF0ZSI6dHJ1ZSwibW9kaWZ5Ijp0cnVlLCJkZWxldGUiOnRydWV9LCJjcmVhdGVkRGF0ZSI6IjIwMjQtMDMtMjdUMTk6NTU6MTIuMjA5WiIsImFwcHJvdmVkRGF0ZSI6bnVsbCwiZXhwaXJhdGlvbkRhdGUiOm51bGwsImlhdCI6MTcxMTU2OTMxMiwiZXhwIjoxMTE3ODg0OTMxMn0.QohWLv3Ez2yK4SYsKtFmCSx2bny7y9jhXiZOGfmsEZc",
    "eventId": "660c81dccba57a70e98c1120",
    "modifiedEvent": {
            "metadata": {
                "profile": "application.com/first_profile"
            },
            "payload": {
                "latitude": 50.0880433333,
                "longitude": 14.42076
            }
            
        }
}
```

That's because when the app wants to modify the event, but uses access token which does not allow modifying a given event, this is returned:

```js title="403 - Forbidden response"
{
    "message": "No modify permission for this event"
}
```

Otherwise `200 - OK` response is returned.

```js title="200 - OK respose"
{
    "message": "Event updated successfully.",
    "event": {
        "metadata": {
            "profile": "application.com/first_profile",
            "source": "testing",
            "createdDate": "2024-04-02T22:17:53.515Z",
            "acceptedDate": "2024-04-02T22:17:53.515Z"
        },
        "_id": "660c81dccba57a70e98c1120",
        "payload": {
            "latitude": 50.0880433333,
            "longitude": 14.42076
        },
        "__v": 0
    }
}
```

## Deletion of Event

To completely cover CRUD operations, **/app/api/deleteEvent** *(DELETE)* endpoint comes to help you.

This is the request body:

```js title="Request body of the delete event"
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjVmODVlNmU3MmQzY2I1YTE0OGE5NzFmIiwiYXBwSWQiOiI2NWY4NWQ4ZjcyZDNjYjVhMTQ4YTk2ZjYiLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhaG9qLmNvbS9maXJzdF9wcm9maWxlIiwicmVhZCI6dHJ1ZSwiY3JlYXRlIjp0cnVlLCJtb2RpZnkiOnRydWUsImRlbGV0ZSI6dHJ1ZX0sImNyZWF0ZWREYXRlIjoiMjAyNC0wMy0xOFQxNTozMTo1OC4xMTVaIiwiYXBwcm92ZWREYXRlIjpudWxsLCJleHBpcmF0aW9uRGF0ZSI6bnVsbCwiaWF0IjoxNzEwNzc1OTE4LCJleHAiOjExMTc4MDU1OTE4fQ.YxSUEYNCVRRRT-h7bmKrEULWyXgimd8W9-zFSLINknI",
    "eventId": "65f8682db9d71eb79545adbf"
}
```

Again, `accessToken` is checked to see, whether it has necessary permission to delete such event.

```js title="200 - Ok response"
{
    "message": "Event deleted successfully."
}
```

Or the token hasn't been activated ( permission approved ):

```js title="403 - Forbidden response"
{
    "message": "Access permission is not active or has been revoked"
}
```

Or the event is not found:

```js title="404 - Event Not Found"
{
    "message": "Event not found."
}
```

## Fetching All Events For Given Access Token

To fetch all events for a given access token, you can use the following auth service endpoint: **/app/api/getAllEventsForGivenAccessToken?accessToken=[token]** *(GET)*.

For this example request `{{AUTH_SERVER_URL}}/app/api/getAllEventsForGivenAccessToken?accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhQWNjZXNzUGVybWlzc2lvbklkIjoiNjYwNDc5YTBjMzAyMGY4NzdjMWFiMWQxIiwiYXBwSWQiOiI2NjA0MmU5MGMzMDIwZjg3N2MxYWIxMzkiLCJwZXJtaXNzaW9uIjp7InByb2ZpbGUiOiJhcHBsaWNhdGlvbi5jb20vZmlyc3RfcHJvZmlsZSIsInJlYWQiOnRydWUsImNyZWF0ZSI6dHJ1ZSwibW9kaWZ5Ijp0cnVlLCJkZWxldGUiOnRydWV9LCJjcmVhdGVkRGF0ZSI6IjIwMjQtMDMtMjdUMTk6NTU6MTIuMjA5WiIsImFwcHJvdmVkRGF0ZSI6bnVsbCwiZXhwaXJhdGlvbkRhdGUiOm51bGwsImlhdCI6MTcxMTU2OTMxMiwiZXhwIjoxMTE3ODg0OTMxMn0.QohWLv3Ez2yK4SYsKtFmCSx2bny7y9jhXiZOGfmsEZc`

we get this response:

```js title="200 - OK - Fetching events response"
{
    "events": [
        {
            "metadata": {
                "identifier": "5a76865a-ba90-4483-9b2c-c6f9962dbadd",
                "profile": "application.com/first_profile",
                "source": "testing",
                "createdDate": "2024-04-02T22:26:40.220Z",
                "acceptedDate": "2024-04-02T22:26:40.220Z"
            },
            "_id": "660c8620cba57a70e98c1127",
            "payload": {
                "latitude": 50.08804,
                "longitude": 14.42076
            },
            "__v": 0
        }
    ],
    "count": 1
}
```

:::tip

If you wish to avoid overburdening the network with an excessively large data flow of events, you can create a `View` which the app will access through endpoint and this `View` will basically be your custom code running in the system and returning data it wants to return. To read an intro to views, head [here](/docs/intro/#) and to look at `View`s in more detail, head over [here](../view-manager/introduction)

:::