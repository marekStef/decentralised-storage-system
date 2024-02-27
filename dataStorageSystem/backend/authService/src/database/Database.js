const mongoose = require('mongoose');

class DatabaseConnectionError extends Error {
    constructor(message) {
        super(message);
        this.date = new Date();
        this.name = 'DatabaseConnectionError';
    }
}

class Database {
    async connect() {
        try {
            await mongoose.connect(process.env.MONGO_DB_URI);
            console.log('Database connected successfully');
        } catch (error) {
            console.error('Database connection failed:', error);
            throw new DatabaseConnectionError("");
        }
    }

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