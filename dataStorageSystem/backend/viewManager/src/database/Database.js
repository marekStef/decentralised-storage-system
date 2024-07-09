const mongoose = require('mongoose');

/**
 * Custom error class for handling database connection errors.
 */
class DatabaseConnectionError extends Error {
    constructor(message) {
        super(message);
        this.date = new Date();
        this.name = 'DatabaseConnectionError';
    }
}

/**
 * Class for managing database connections using Mongoose.
 */
class Database {
    /**
     * Connects to the MongoDB database using the URI from environment variables.
     * @throws {DatabaseConnectionError} - If the connection fails.
     */
    async connect() {
        try {
            await mongoose.connect(process.env.MONGO_DB_URI);
            console.log('Database connected successfully');
        } catch (error) {
            console.error('Database connection failed:', error);
            throw new DatabaseConnectionError("");
        }
    }

    /**
     * Disconnects from the MongoDB database.
     */
    async disconnect() {
        try {
            await mongoose.disconnect();
            console.log('Database disconnected successfully');
        } catch (error) {
            console.error('Database disconnection failed:', error);
        }
    }
}

module.exports = new Database();