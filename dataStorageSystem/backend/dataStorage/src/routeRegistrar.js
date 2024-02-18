const dataViewStoreRoutes = require("./routes/DataViewStore/dataViewStoreRoutes");

// Admin Only
const adminRoutes = require("./routes/AdminOnly/adminRoutes");
const applicationRoutes = require("./routes/Application/applicationRoutes");
const statusInfoRoutes = require("./routes/StatusInfo/statusInfoRoutes")

module.exports = function(app) {
    app.use('/api/dataviewstore', dataViewStoreRoutes);
    app.use('/admin/api', adminRoutes);
    app.use('/app/api', applicationRoutes);
    app.use('/status_info', statusInfoRoutes)

};
