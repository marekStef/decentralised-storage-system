const dataViewStoreRoutes = require("./routes/DataViewStore/dataViewStoreRoutes");

// Admin Only
const applicationRoutes = require("./routes/Application/applicationRoutes");
const statusInfoRoutes = require("./routes/StatusInfo/statusInfoRoutes")

module.exports = function(app) {
    // app.use('/api/dataviewstore', dataViewStoreRoutes);
    app.use('/app/api', applicationRoutes);
    app.use('/status_info', statusInfoRoutes)

};
