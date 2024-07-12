const path = require('path');
const { createLogger, format, transports } = require('winston');
require('dotenv').config();

const projectRoot = process.env.PROJECT_ROOT;

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'ViewManager' },
    transports: [
        //
        // - Write to all logs with level `info|warning|error` and below to `combined.log`.
        // - Write all logs with level `error` to `error.log`.
        //
        new transports.File({ filename: path.join(projectRoot, 'logs', 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(projectRoot, 'logs', 'combined.log') })
    ]
});

// If we're not in production then also log to the `console`
// with the colorized simple format.
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

module.exports = logger;