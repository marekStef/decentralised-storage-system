const dataViewStoreRoutes = require("./routes/dataViewStoreRoutes");

// Admin Only
const appsRoutesAdmin = require("./routes/AdminOnly/appsRoutes");

module.exports = function(app) {
    app.use('/api/dataviewstore', dataViewStoreRoutes);
    app.use('/admin/api', appsRoutesAdmin);

};
