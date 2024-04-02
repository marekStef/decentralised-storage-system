---
sidebar_position: 0
---

# Important aspects of the system and vocabulary

### Event
Event is a very general single unit of data (only textual as of now).

Event consists of `metadata` and `payload`. Metadata consists of some predefined values such as when the event was created, by whom, which profile (described below) it abides to and so on. Payload is in the given app's hands and can be anything as long as it's a valid object.

### Profile

Each event (mainly its payload ) needs to have its internal structure formally defined. Before any app can start handling events, it needs to take care of profiles and permissions.

If the app wants to upload a brand new event or a set of similar events (by similar we mean the structure of those events), it needs to register a profile for that set of events beforehand. Profile contains json schema of the future events.

Profile processing is handled by `auth service`. This service saves this new profile as a regular event in `data storage` component.

Profile registration request looks like this:

```js
{
    "jwtTokenForPermissionRequestsAndProfiles": "[token]",
    "metadata": {
        "createdDate": "2024-02-08T21:56:18.277Z",
        "profile": "core:profile-registration_v1"
    },
    "payload": {
        "profile_name": "ahoj.com/first_profile",
        "json_schema": {
            "type": "object",
            "properties": {
                "latitude": {
                    "type": "number",
                    "minimum": -90,
                    "maximum": 90
                },
                "longitude": {
                    "type": "number",
                    "minimum": -180,
                    "maximum": 180
                }
            },
            "required": [
                "latitude",
                "longitude"
            ],
            "additionalProperties": false
        }
    }
}
```

### Data Access Permission

Not only is app required to create a profile ( if a given profile does not exist already or the app is not interested in uploading events of that profile) but the app needs to ask for permission to access the events ( specifying access rights such as `read`, `write`, `modify`, `delete`)

After the app requests such a permission, it receives access token for that profile ( i.e. set of events of a type of this profile ). The app can subsequently query information about whether the token is active ( whether it has been approved ) or query for data this token has access to.

As of now, each Data Access Permission is bound to one profile. Therefore, if the given app wants to access different sets of events, it needs to ask for multiple permissions.

### Views

`View` is a custom client code registered in the system that can be reached from the client and returns some data. More about them in `ViewManager` component and `AuthService` component.

#### View Templates

View template holds source code, metadata such as runtime (javascript / python as of now) and profiles and permissions so that when a view instance is created later, access permissions are sent automatically based on that profiles config.

#### View Instances

View instance is instantiated from the `View Template` and is created to be used by some app. That token may be shared to the other app.

