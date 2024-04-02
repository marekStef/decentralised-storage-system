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
- **/admin/api/permissions/getUnapprovedPermissionsRequests?pageIndex=2&limit=100** *(GET)*
- **/admin/api/permissions/getUnapprovedPermissionsRequests /:appHolderId** *(GET)*
- **/admin/api/permissions/approvePermissionRequest** *(PUT)*
- **/admin/api/permissions/revokePermission** *(PUT)*

### Endpoints meant to be used by applications themselves

`association, registration, permissions`

- **/app/api/associateWithStorageAppHolder** *(POST)*
- **/app/api/registerNewProfile** *(POST)*
- **/app/api/requestNewPermission** *(POST)*
- **/app/api/checkAccessTokenStatus?accessToken=[token]** *(GET)*

<!-- ```js title="association, registration, permissions"
// const applicationController = require("../../controllers/applicationController");

// router.post('/associateWithStorageAppHolder', applicationController.associateAppWithStorageAppHolder);

// router.post('/registerNewProfile', applicationController.registerNewProfile);

// router.get('/checkAccessTokenStatus', applicationController.isAccessTokenForGivenPermissionRequestActive);

// router.post('/requestNewPermission', applicationController.requestNewPermission);
``` -->

`events related`

- **/app/api/uploadNewEvents** *(POST)*
- **/app/api/modifyEvent** *(PUT)*
- **/app/api/deleteEvent** *(DELETE)*
- **/app/api/getAllEventsForGivenAccessToken** *(GET)*

<!-- ```js title="events related"
// router.post('/uploadNewEvents', applicationController.uploadNewEvents);

// router.put('/modifyEvent', applicationController.modifyEvent);

// router.delete('/deleteEvent', applicationController.deleteEvent);

// router.get('/getAllEventsForGivenAccessToken', applicationController.getAllEventsOfGivenProfile);
``` -->

`views related`

- **/app/api/registerNewViewInstance** *(POST)*
- **/app/api/runViewInstance** *(POST)*

<!-- ```js title="views related"
router.post('/registerNewViewInstance', applicationController.registerNewViewInstance);

router.post('/runViewInstance', applicationController.runViewInstace);
``` -->

:::caution

Registering a new `View Template` needs to be done manually through `View Manager API`.

:::

### Status info routes

- **/status_info/checks/check_auth_service_presence** *(GET)*