---
sidebar_position: 2
---

# New App Registering

## Registering a new `app holder`

`Auth Service` is responsible for creating new `app holders`. These can be understood as some handles for the apps.

After the `app holder` is created, the app which the holder was created for needs to be associated. That's why `Auth Service` has an endpoint for generating `Authorisation Token`. When the new app associates itself with the provided token, it also appends its unique name to the association request. Unique name can be for instance a website domain.

This is the `Application Schema`:

```js title="Application Schema" 
const ApplicationSchema = new mongoose.Schema({
  nameDefinedByUser: { // this is just for displaying purposes
    type: String,
    required: true,
    unique: true
  },
  nameDefinedByApp: { // this is the main name which will be referenced in profiles and events
    type: String,
    unique: true,
    trim: true,
    index: true,
    sparse: true // so that there can be multiple itemss with nameDefinedByApp set to null
  },
  dateOfRegistration: { // date when the user created this new app. This is not date when the actual app associated itself with this
    type: Date,
    default: Date.now
  },
  dateOfAssociationByApp: { // date when the user actually connected the actual app with this
    type: Date,
    default: null
  },
  jwtTokenForPermissionRequestsAndProfiles: {
    type: String,
    default: null
  }
});

```