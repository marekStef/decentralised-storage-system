const mongoose = require('mongoose');

/**
 * Custom error class for handling database connection errors.
 * @extends Error
 */
class DatabaseConnectionError extends Error {
    constructor(message) {
        super(message);
        this.date = new Date();
        this.name = 'DatabaseConnectionError';
    }
}

/**
 * Class representing a database connection.
 */
class Database {
    /**
     * Connects to the MongoDB database.
     * Resolves when the connection is successful.
     * @throws {DatabaseConnectionError} Throws a custom error if the connection fails.
     */
    async connect() {
        try {
            await mongoose.connect(process.env.MONGO_DB_URI);
            console.log('Database connected successfully');
        } catch (error) {
            console.error('Database connection failed:', error);
            throw new DatabaseConnectionError("Database connection failed");
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