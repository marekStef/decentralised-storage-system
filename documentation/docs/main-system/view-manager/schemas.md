---
sidebar_position: 1
---

# Schemas

View Manager component needs to have access to the database and it registers multiple schemas:

### ProfilePermission Schema

Each `View Template` needs to have profiles specified so that when `View Instance` is created out of it, `View Manager` can request permissions from the `Auth Service` for the given `View Instance`. 

`View Template` therefore holds which profiles future instances will have access to but also what kind of access. This cannot be changed after the `View Template` is created.

```js title="ProfilePermissionSchema.js"

const ProfilePermissionSchema = new mongoose.Schema({
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

### ViewTemplateMetadata Schema

This schema is pretty straightforward. One thing to point out is `sourceCodeId`. This is the id of the uploaded source code from the given execution service such as `Javascript Execution Service`.

```js title="ViewTemplateMetadataSchema.js"

const ProfilePermissionSchema = require('./ProfilePermissionSchema');

const ViewTemplateMetadataSchema = new mongoose.Schema({
  runtime: {
    type: String,
    required: true
  },
}, {_id: false}); // _id is set to false so that Mongoose does not create an _id for the nested object

const ViewTemplateSchema = new mongoose.Schema({
  templateName: {
    type: String,
    required: true,
    unique: true
  },
  sourceCodeId: { // id for the uploaded code. this is because the uploaded code will be saved directly in the services so the view manager needs to know which code to call
    type: String,
    required: true
  },
  metadata: {
    type: ViewTemplateMetadataSchema,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  profiles: { // a list of needed profiles. When a ViewInstance is created, permissions for these profiles are created. Tokens to these profiles
    type: [ProfilePermissionSchema],
    required: true
  },
});

const ViewTemplate = mongoose.model('ViewTemplate', ViewTemplateSchema);

module.exports = {
  ViewTemplateMetadataSchema,
  ViewTemplate
};

```

### ViewInstance Schema

```js title="ViewInstanceSchema.js"

const ViewInstanceSchema = new mongoose.Schema({
  viewTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ViewTemplate',
      required: true
  },
  createdDate: {
      type: Date,
      default: Date.now
  },
  accessTokensToProfiles: { // tokens to profiles defined in ViewTemplate ( keys must be the profile names defined in "profiles" in ViewTemplateSchema)
      type: Object
  },
  configuration: {
    type: Object,
    required: true,
        default: {}
  }
});

const ViewInstance = mongoose.model('ViewInstance', ViewInstanceSchema);

module.exports = ViewInstance;

```

Now that you have a general idea of what kind of db access this component requires, you can move on to Requirements imposed on the View Template's source code.