---
sidebar_position: 1
---

# Schemas


`DataStorage` component needs to have access to the database and it registers exactly one schema:

### Event Schema

As we already mentioned previously, we didn't want to put a lot of constraints on the structure of the event (as a unit of data).

Therefore the only needed fields in the event are:

- metadata.source (can be any string) - to know whose event this is
- metadata.profile (can be any string) - to know what's the structure of the event
- payload (as long as it's an object it can contain anything and is in the 3rd party app's hands)

```js title="EventSchema"
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  metadata: {
    identifier: {
      type: String,
    },
    createdDate: {
      type: Date,
      default: Date.now
    },
    profile: {
        type: String,
        // highlight-start
        required: true
        // highlight-end
    },
    source: {
      type: String,
        // highlight-start
        required: true
        // highlight-end
    },
    acceptedDate: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  payload: {
    type: Object,
    // highlight-start
    required: true
    // highlight-end
  }
});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
```

Event consists of `metadata` and `payload`. Metadata consists of some predefined values such as when the event was created, by whom, which profile (described below) it abides to and so on. Payload is in the given app's hands and can contain basically anything since even binary data can be encoded to text (we are aware this form of saving a binary data is highly inefficient).

This is what event looks like in the database:

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

--- 

Now that you know about this schema and have a thorough understanding of what a unit of data in the system looks like, have a look on the endpoints (very short reading).