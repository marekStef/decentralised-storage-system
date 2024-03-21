---
sidebar_position: 1
---

# Schemas

Auth Service component needs to have access to the database and it registers multiple schemas:

### Application Related Schemas

#### ApplicationSchema

This is basically a schema for holding individiual apps. It's one of the first schemas you'll come across in the system.

```js title="ApplicationSchema.js"
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

`ApplicationSchema` needs to have a unique `nameDefinedByUser`. That's because this name appears as a `source` in the event's metadata. `nameDefinedByApp` is (as the name says) a way of the actual app saying what's the name of it.

`jwtTokenForPermissionRequestsAndProfiles` is a token used for asking for new permissions and registering new profiles. This token is obtained after the app is successfully associated.

:::tip

Look at the actual association request to see when it's exactly obtained.

:::

#### OneTimeAssociationTokenSchema

```js title="OneTimeAssociationTokenSchema.js"
const OneTimeAssociationTokenSchema = new mongoose.Schema({
    app: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
}, {collection: 'AssociationTokensForApplication'});
```

After the admin user creates a new `appHolder` (which is basically `ApplicationSchema` record with `dateOfAssocationByApp` and `jwtTokenForPermissionRequestsAndProfiles` being null) the actual app does not know about it.

That's why `/generateOneTimeAssociationToken` endpoint needs to be hit to obtain this association token which needs to be passed to the app manually. This new app then uses this `association token` to associate itself.

### Data Access Related Schemas

#### DataAccessPermissionSchema

```js title="DataAccessPermissionSchema.js"
const DataAccessPermissionSchema = new mongoose.Schema({
  app: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  permission: EventPermissionSchema,
  createdDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  approvedDate: {
    type: Date,
    default: null
  },
  isActive: { // whether the token is still good to use ( can be revoked from the admin user interface )
    type: Boolean,
    default: false
  },
  revokedDate: {
    type: Date,
    default: null
  },
  expirationDate: {
    type: Date,
    default: null
  },
  accessToken: {
    type: String,
    default: null
  }
});
```

:::caution

`revokedDate` and `expirationDate` are not used at the moment and cannot be set. This is prepared only for the future possible use.

:::

#### EventPermissionSchema

```js title="EventPermissionSchema.js"
const EventPermissionSchema = new mongoose.Schema({
  profile: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  create: {
    type: Boolean,
    default: false
  },
  modify: {
    type: Boolean,
    default: false
  },
  delete: {
    type: Boolean,
    default: false
  }
});
```

### Views Related Schemas

```js title="ViewAccessSchema.js"
const ViewAccessSchema = new mongoose.Schema({
  app: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  viewInstanceId: {
    type: String
  },
  createdDate: {
    type: Date,
    required: true,
    default: Date.now
  },
});
```

The actual `View Instance` is saved and managed in `View Manager` component as well as `View Template`. 
`viewInstanceId` is the id of the actual `View Instance` 

:::tip

Read about `View Manager` to get to know more about Views.

:::