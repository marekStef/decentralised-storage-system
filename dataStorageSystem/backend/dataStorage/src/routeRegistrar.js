// const dataViewStoreRoutes = require("./routes/DataViewStore/dataViewStoreRoutes");

// Admin Only
const eventsRoutes = require("./routes/Application/eventsRoutes");
const statusInfoRoutes = require("./routes/StatusInfo/statusInfoRoutes")

module.exports = function(app) {
    // app.use('/api/dataviewstore', dataViewStoreRoutes);
    app.use('/app/api', eventsRoutes);
    app.use('/status_info', statusInfoRoutes)
};
