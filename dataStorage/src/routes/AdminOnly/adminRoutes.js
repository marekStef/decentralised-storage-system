const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/adminController");

router.post('/register_new_app', adminController.createNewAppConnection);

router.get('/generate_one_time_association_token', adminController.generateOneTimeTokenForAssociatingRealAppWithAppConnection);

router.get('/get_unapproved_permissions_requests', adminController.getUnapprovedPermissionsRequests);

router.put('/approve_permission_request', adminController.approvePermissionRequest);

module.exports = router;