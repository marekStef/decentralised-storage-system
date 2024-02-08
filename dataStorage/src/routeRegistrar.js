const dataViewStoreRoutes = require("./routes/DataViewStore/dataViewStoreRoutes");

// Admin Only
const appsRoutesAdmin = require("./routes/AdminOnly/adminRoutes");

module.exports = function(app) {
    app.use('/api/dataviewstore', dataViewStoreRoutes);
    app.use('/admin/api', appsRoutesAdmin);

};
