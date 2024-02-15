package com.example.locationtracker.data

import android.content.Context
import android.content.Context.MODE_PRIVATE
import androidx.core.content.edit
import com.example.locationtracker.constants.SharedPreferences.LOCATION_TRACKER_SERVICE_RUNNING_FLAG
import com.example.locationtracker.constants.SharedPreferences.LOCATION_TRACKER_SERVICE_SHARED_PREFERENCES
import com.example.locationtracker.data.database.Database
import com.example.locationtracker.model.SyncInfo

class PreferencesManager constructor(private val context: Context) {
    fun setIsLocationTrackerServiceRunning(isActive: Boolean) {
        val prefs = context.getSharedPreferences(LOCATION_TRACKER_SERVICE_SHARED_PREFERENCES, MODE_PRIVATE)
        prefs.edit().putBoolean(LOCATION_TRACKER_SERVICE_RUNNING_FLAG, isActive).apply()
    }

    fun isLocationTrackerServiceRunning(): Boolean {
        val prefs = context.getSharedPreferences(LOCATION_TRACKER_SERVICE_SHARED_PREFERENCES, Context.MODE_PRIVATE)
        return prefs.getBoolean(LOCATION_TRACKER_SERVICE_RUNNING_FLAG, false)
    }
}

