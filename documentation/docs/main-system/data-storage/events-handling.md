---
sidebar_position: 2
---

# Events Handling

### Uploading New Events

This endpoint is a primary way of storing large quantities of data in the system.

To upload a list of events (or just one), a request to **/app/api/uploadNewEvents** *(POST)* needs to be made.

This is what a request body should look like:

```js title="Example body of the request"
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

If any event in the request lacks required metadata, such as `source`, the server responds with a `400 Bad Request` status code.

```js title="Source missing in the event"
{
    "events": [
        {
            "metadata": {
                "profile": "some_example_profile"
            },
            "payload": {
                "message": "Some random event"
            }
        }
    ]
}
```

```js title="400 Bad Request"
{
    "message": "Event does not contain correct metadata"
}
```

### Getting filtered events

Once the data has been uploaded and stored, the need arises to retrieve it. This is where the **/app/api/getFilteredEvents** *(POST)* endpoint comes in handy.

User of this endpoint can specify the following in the request body:

- payloadMustContain (this needs to be a proper object having keys and values that are desired to be found in the retrieved events)
- metadataMustContain (the same as with *payloadMustContain*)

:::danger Current Implementation and Considerations
This endpoint currently returns all events without pagination. While the introduction of pagination is under consideration, it has not been deemed immediately necessary due to the specific use case of this endpoint. It serves exclusively for internal communication between the Auth Service and Data Storage components, thereby only affecting internal network traffic.

The lack of pagination and the returning of all events in a single response could raise concerns regarding efficiency, especially as the volume of events grows. However, given that this endpoint is utilized solely for internal data exchanges, the impact is confined to our internal network. This context significantly mitigates potential drawbacks, such as increased data transfer times and resource consumption.

:::

This is the example body:

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

### Modification Of a Specific Event

To modify a specific event, a request to **/app/api/events/:eventId** *(PUT)* needs to be initiated.

Example request needs to look like this: `{{DATA_STORAGE_URL}}/app/api/events/65f9f8117ace27615f794bd3`

```js title="Example body of the request"
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

In case, the event is not found, `400 - Bad Response` is returned:

```js title="400 - Bad Response"
{
    "message": "Event not found."
}
```
### Deleting a Specific Event

We already know how to create a new event, modify it, fetch it, and, to complete the last piece of the CRUD puzzle, we need to know how to delete it. Hence, we use the **/app/api/events/:eventId** *(DELETE)* endpoint.

Example request needs to look like this: `{{DATA_STORAGE_URL}}/app/api/events/65f9f8117ace27615f794bd3` and body does not contain anything (it can but it will be ignored of course).

And this is the response from the server (status `200 - OK`):

```js title="200 - OK Response"
{
    "message": "Event deleted successfully."
}
```

In case the event is not found, `404` status is returned: 

```js title="404 - Not Found Response"
{
    "message": "Event not found."
}
```