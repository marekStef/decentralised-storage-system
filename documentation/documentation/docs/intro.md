---
sidebar_position: 0
---

# Introduction

Welcome to the dataStorage project.

## Why

The reason this project exists is simply because there is unlimited amount of information being constantly gathered around us.

The only problem is that the data do not belong to us but rather to the companies gathering it. This leads to the creation of large data silos.

However, it wasn't meant to be like this. Data should belong to users. Hence, this project.

This project consists of a decentralised system used for storing data events, manipulating them, authorisation, authentication, registering views and so on.

We will dive into each important aspect of this system in detail.

## Important aspects of the system and vocabulary

### Event
Event is a very general single unit of data (only textual as of now).

Event consists of `metadata` and `payload`. Metadata consists of some predefined values such as when the event was created, by whom, which profile (described below) it abides to and so on. Payload is in the given app's hands and can contain basically anything since even binary data can be encoded to text (we are aware this form of saving a binary data is highly inefficient).

This is what event looks like in database:

```js title="Event"
{
  "_id": { // db specific
    "$oid": "65f873d9b9d71eb79545adc4"
  },
  "metadata": {
    "identifier": "f42c444f-0c09-46c3-af72-50a77c0a5282",
    "createdDate": {
      "$date": "2024-03-18T17:03:21.011Z"
    },
    "profile": "CalendarPro.com_CalendarEventProfile",
    "source": "kalendar",
    "acceptedDate": {
      "$date": "2024-03-18T17:03:21.086Z"
    }
  },
  "payload": {
    "startTime": "2024-03-19T14:10:00.000Z",
    "endTime": "2024-03-19T17:15:00.000Z",
    "title": "ahoj",
    "description": "ako sa mas",
    "color": "#9b2226"
  },
  "__v": 0 // db specific
}
```

### Profile

Each event needs to have its internal structure formally defined. Before any app can start handling events, it needs to take care of profiles and permissions.

If the app wants to upload some event, it needs to register a profile for that event beforehand. Profile contains json schema of the future events.

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

### DataAccessPermission

Not only is app required to create a profile ( if a given profile does not exist already or the app is not interested in uploading events of that profile) but the app needs to ask for permission to access the events ( specifying access rights such as `read`, `write`, `modify`, `delete`)

### Views

`View` is a custom client code registered in the system that can be reached from the client and returns some data. More about them in `ViewManager` component and `AuthService` component.

#### View Templates

View template holds source code, metadata such as runtime (javascript / python as of now) and profiles and permissions so that when a view instance is created later, access permissions are sent automatically based on that profiles config.

#### View Instances

View instance is instantiated from the `View Template` and is created to be used by some app. That token may be shared to the other app.

[TODO - View Instances can be shared over the internet ? ]

### Listeners 

[TODO - not implemented]

## Parts of the project

The project is divided into mostly two parts: 
- main system for handling data
- demo apps highlighting the possibilities of the main system

## Main System for handling data

Main system consists of multiple individual runtime components:
- Data Storage
- Auth Service
- View Manager
- Javascript Execution Service
- Python Execution Service

These components communicate on their own private network created by a docker and only `Auth Service` is open for outside world requests.

(TODO - ADD IMAGE HERE)

## Demo Apps

Each demo app is thoroughly described in the module [Apps](./category/apps)

### Location Tracker
`Android app (kotlin, java)`

### Windows Activity Tracker
`C++ windows desktop app`

### Calendar app
`Desktop browser app (React, Js)`
