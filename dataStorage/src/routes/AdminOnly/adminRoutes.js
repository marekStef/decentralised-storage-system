const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/adminController");

router.post('/register_new_app', adminController.createNewAppConnection);

router.get('/generate_one_time_association_token', adminController.generateOneTimeTokenForAssociatingRealAppWithAppConnection);

// ----- PERMISSIONS

router.get('/permissions/get_unapproved_permissions_requests', adminController.getUnapprovedPermissionsRequests);

router.put('/permissions/approve_permission_request', adminController.approvePermissionRequest);

router.put('/permissions/revoke_permission', adminController.revokeApprovedPermission);

module.exports = router;