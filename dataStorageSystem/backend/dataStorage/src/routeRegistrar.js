const eventsRoutes = require("./routes/Application/eventsRoutes");
const statusInfoRoutes = require("./routes/StatusInfo/statusInfoRoutes");

module.exports = function(app) {
    app.use('/app/api', eventsRoutes);
    app.use('/status_info', statusInfoRoutes)
};
