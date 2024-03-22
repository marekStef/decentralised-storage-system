const express = require("express");
const router = express.Router();

const adminController = require("../../controllers/adminController");

router.get('/apps', adminController.getAllApps);

router.get('/apps/:appHolderId', adminController.getAppHolderById);

router.post('/registerNewApp', adminController.createNewAppConnection);

router.post('/generateOneTimeAssociationToken', adminController.generateOneTimeTokenForAssociatingRealAppWithAppConnection);

// ----- PERMISSIONS

router.get('/permissions/getUnapprovedPermissionsRequests', adminController.getUnapprovedPermissionsRequests);

router.get('/permissions/getPermissionsRequestsForGivenApp/:appHolderId', adminController.getAllPermissionsForGivenApp);

router.put('/permissions/approvePermissionRequest', adminController.approvePermissionRequest);

router.put('/permissions/revokePermission', adminController.revokeApprovedPermission);

// views acccesses

router.get('/views', adminController.getAllViewsAccesses);

router.get('/apps/:appHolderId/views', adminController.getAllViewsAccessesForGivenApp);

module.exports = router;