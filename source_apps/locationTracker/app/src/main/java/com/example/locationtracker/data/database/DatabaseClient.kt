package com.example.locationtracker.data.database

import android.content.Context
import android.util.Log
import androidx.room.Room

object DatabaseClient {
    @Volatile
    private var INSTANCE: Database? = null

    fun getDatabase(context: Context): Database {
        Log.d("hey", "here")
        return INSTANCE ?: synchronized(this) {
            val instance = Room.databaseBuilder(
                context.applicationContext,
                Database::class.java,
                "location_database"
            ).build()
            INSTANCE = instance
            instance
        }
    }
}