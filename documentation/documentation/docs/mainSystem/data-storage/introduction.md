---
sidebar_position: 0
---

# Introduction

This component is the heart of the whole system. It allows any general event to be stored as long as the event contains `payload` and `metadata`. In the `metadata` object, `profile` and `source` needs to be set (it can be seen from the schema).

Any component having access to this component can do anything with the data. Therefore, access to this component cannot be directly provided to users' apps. That's why `Auth Service` is put between a user to authenticate and authorise any actions it comes across.

It allows these operations as of now:

```js title="EventsRoutes.js"
router.post('/uploadNewEvents', eventsController.uploadNewEvents);

router.post('/get_filtered_events', eventsController.getFilteredEvents);

router.put('/events/:eventId', eventsController.modifyGivenEvent);

router.delete('/events/:eventId', eventsController.deleteGivenEvent);
```

### /uploadNewEvents (POST)

```js title="Example body in the request"
{
    "events": [
        {
            "metadata": {
                "source": "some source",
                "profile": "Some profile"
            },
            "payload": {
                "message": "Some random event"
            }
        }
    ]
}
```

And this is the response from the server:

```js title="Response"
{
    "message": "Events were created successfully",
    "events": [
        {
            "metadata": {
                "profile": "Some profile",
                "source": "some source",
                "createdDate": "2024-03-19T20:39:45.339Z",
                "acceptedDate": "2024-03-19T20:39:45.339Z"
            },
            "payload": {
                "message": "Some random event"
            },
            "_id": "65f9f8117ace27615f794bd3",
            "__v": 0
        }
    ]
}
```

In case, one of the events does not contain required metadata such as `source`, `400` code is returned.

```js title="Wrong Response"
{
    "events": [
        {
            "metadata": {
                "source": "some source"
            },
            "payload": {
                "message": "Some random event"
            }
        }
    ]
}
```

### /get_filtered_events (POST)

:::danger[TODO]

This endpoint returns all events as of now, pagination is being considered. It's not entirely necessary as this endpoint is used only internally between `Auth Service` and `Data Storage`.

:::

```js title="Example body in the request"
{
    "metadataMustContain": {
        "profile": "CalendarPro.com_CalendarEventProfile"
    }
}
```

And this is the response from the server:
```js title="Response"
{
    "success": true,
    "count": 1,
    "data": [
        {
            "metadata": {
                "profile": "Some profile",
                "source": "some source",
                "createdDate": "2024-03-19T20:39:45.339Z",
                "acceptedDate": "2024-03-19T20:39:45.339Z"
            },
            "_id": "65f9f8117ace27615f794bd3",
            "payload": {
                "message": "Some random event"
            },
            "__v": 0
        }
    ]
}
```

### /events/:eventId (PUT)

Example request needs to look like this: `{{DATA_STORAGE_URL}}/app/api/events/65f9f8117ace27615f794bd3`

```js title="Example body in the request"
{
    "modifiedEvent": {
        "metadata": {
            "source": "some source",
            "profile": "Some profile"
        },
        "payload": {
            "message": "Modified text"
        }
    }
}
```

And this is the response from the server:

```js title="Response"
{
    "message": "Event updated successfully.",
    "event": {
        "metadata": {
            "source": "some source",
            "profile": "Some profile",
            "createdDate": "2024-03-19T20:43:53.272Z",
            "acceptedDate": "2024-03-19T20:43:53.272Z"
        },
        "_id": "65f9f8117ace27615f794bd3",
        "payload": {
            "message": "Modified text"
        },
        "__v": 0
    }
}
```

In case, the event is not found, `400` is returned:

```js title="Wrong Response"
{
    "message": "Event not found."
}
```

### /events/:eventId (DELETE)

Example request needs to look like this: `{{DATA_STORAGE_URL}}/app/api/events/65f9f8117ace27615f794bd3` and body does not contain anything.

And this is the response from the server (status `200`):

```js title="Response"
{
    "message": "Event deleted successfully."
}
```

In case the event is not found, `404` status is returned: 

```js title="Wrong Response"
{
    "message": "Event not found."
}
```