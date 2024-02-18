package com.example.locationtracker.eventSynchronisation

import android.content.Context

enum class AppRegisteredToStorageState {
    REGISTERED,
    NON_REGISTERED
}
class EventSynchronisationManager (){
    fun isAppRegisteredInStorage(): AppRegisteredToStorageState {
        return AppRegisteredToStorageState.NON_REGISTERED
    }
}