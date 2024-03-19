---
sidebar_position: 0
---

# Introduction

This component is the only component accessible to apps. All other components of the system will be on a hidden private network. This allows all the other components to communicated with each other with http requests instead of setting up https.

## Endpoints

`Auth Service` has extensive set of endpoints divided based on their intended use.

### Endpoints meant to be used by applications themselves

```js title="endpoints for applications"
const applicationController = require("../../controllers/applicationController");

router.post('/associate_with_storage_app_holder', applicationController.associate_app_with_storage_app_holder);

router.post('/register_new_profile', applicationController.register_new_profile);

router.get('/checkAccessTokenStatus', applicationController.isAccessTokenForGivenPermissionRequestActive);

router.post('/request_new_permissions', applicationController.request_new_permissions);

router.post('/upload_new_events', applicationController.uploadNewEvents);

router.put('/modify_event', applicationController.modifyEvent);

router.delete('/delete_event', applicationController.deleteEvent);

router.get('/get_all_events_for_given_access_token', applicationController.getAllEventsOfGivenProfile);

router.post('/register_new_view_instance', applicationController.registerNewViewInstance);

router.post('/run_view_instance', applicationController.runViewInstace);
```

### Endpoints meant to be used from admin control panel

```js title="endpoints for admin"
const adminController = require("../../controllers/adminController");

router.get('/apps', adminController.getAllApps);

router.get('/apps/:appHolderId', adminController.getAppHolderById);

router.post('/register_new_app', adminController.createNewAppConnection);

router.post('/generate_one_time_association_token', adminController.generateOneTimeTokenForAssociatingRealAppWithAppConnection);

// ----- PERMISSIONS

router.get('/permissions/get_unapproved_permissions_requests', adminController.getUnapprovedPermissionsRequests);

router.get('/permissions/get_unapproved_permissions_requests/:appHolderId', adminController.getAllPermissionsForGivenApp);

router.put('/permissions/approve_permission_request', adminController.approvePermissionRequest);

router.put('/permissions/revoke_permission', adminController.revokeApprovedPermission);
```

### Status info routes

```js title="status info routes"
const statusInfoController = require("../../controllers/statusInfoController")

router.get('/checks/check_auth_service_presence', statusInfoController.returnAuthServicePresence);
```