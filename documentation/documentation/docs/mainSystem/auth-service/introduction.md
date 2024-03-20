---
sidebar_position: 0
---

# Introduction

This component is the only component accessible to apps. All other components of the system will be on a hidden private network. This allows all the other components to communicated with each other with http requests instead of setting up https.

## Endpoints

`Auth Service` has extensive set of endpoints divided based on their intended use.

### Endpoints meant to be used from admin control panel

- **/admin/api/apps** *(GET)*
- **/admin/api/apps/:appHolderId** *(GET)*
- **/admin/api/registerNewApp** *(POST)*
- **/admin/api/generateOneTimeAssociationToken** *(POST)*

#### Permissions
- **/admin/api/permissions/getUnapprovedPermissionsRequests** *(GET)*
- **/admin/api/permissions/getUnapprovedPermissionsRequests /:appHolderId** *(GET)*
- **/admin/api/permissions/approvePermissionRequest** *(PUT)*
- **/admin/api/permissions/revokePermission** *(PUT)*

```js title="endpoints for admin"
```


### Endpoints meant to be used by applications themselves

```js title="association, registration, permissions"
const applicationController = require("../../controllers/applicationController");

router.post('/associate_with_storage_app_holder', applicationController.associateAppWithStorageAppHolder);

router.post('/register_new_profile', applicationController.registerNewProfile);

router.get('/checkAccessTokenStatus', applicationController.isAccessTokenForGivenPermissionRequestActive);

router.post('/request_new_permissions', applicationController.requestNewPermissions);
```

```js title="events related"
router.post('/upload_new_events', applicationController.uploadNewEvents);

router.put('/modify_event', applicationController.modifyEvent);

router.delete('/delete_event', applicationController.deleteEvent);

router.get('/get_all_events_for_given_access_token', applicationController.getAllEventsOfGivenProfile);
```

```js title="views related"
router.post('/register_new_view_instance', applicationController.registerNewViewInstance);

router.post('/run_view_instance', applicationController.runViewInstace);
```

:::caution

Registering a new `View Template` needs to be done manually through `View Manager API`.

:::

### Status info routes

```js title="status info routes"
const statusInfoController = require("../../controllers/statusInfoController")

router.get('/checks/check_auth_service_presence', statusInfoController.returnAuthServicePresence);
```