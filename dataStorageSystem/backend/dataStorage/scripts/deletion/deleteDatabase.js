/**
 * This script connects to a MongoDB database, drops the database and disconnects.
 * It uses environment variable MONGO_DB_URI.
*/

require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_DB_URI, {})
    .then(async () => {
        console.log('MongoDB connected. Now, dropping the database.');

        const result = await mongoose.connection.db.dropDatabase();
        console.log('Database dropped:', result);

        mongoose.disconnect();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        mongoose.disconnect();
    });
