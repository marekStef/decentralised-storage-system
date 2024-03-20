---
sidebar_position: 1
---

# Schemas

### ProfilePermissionSchema

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

### ViewTemplateMetadataSchema

```js title="ViewTemplateMetadataSchema.js"

const ProfilePermissionSchema = require('./ProfilePermissionSchema');

const ViewTemplateMetadataSchema = new mongoose.Schema({
	runtime: {
		type: String,
		required: true
	},
}, {_id: false}); // _id is set to false so that Mongoose does not create an _id for the nested object

const ViewTemplateSchema = new mongoose.Schema({
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
	// source: { // who registered this template (this should be a unique app name)
	// 	type: String
	// },
});

const ViewTemplate = mongoose.model('ViewTemplate', ViewTemplateSchema);
```

### ViewInstanceSchema

```js title="ViewInstanceSchema.js"

const ViewInstanceSchema = new mongoose.Schema({
    viewTemplate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ViewTemplate',
        required: true
    },
    // identifier: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    createdDate: {
        type: Date,
        default: Date.now
    },
    // source: {
    //     type: String,
    //     required: true
    // },
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
```