package com.example.locationtracker.viewModel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope

import com.example.locationtracker.data.DatabaseLogsManager
import com.example.locationtracker.model.SyncInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainViewModel(private val dbManager: DatabaseLogsManager) : ViewModel() {

    private val _syncInfo = MutableLiveData<SyncInfo>()
    val syncInfo: LiveData<SyncInfo> = _syncInfo

    init {
        loadSyncInfo()
    }

    private fun loadSyncInfo() {
        // Load data from SharedPreferences asynchronously
        viewModelScope.launch(Dispatchers.IO) {
            _syncInfo.postValue(dbManager.getSyncInfo())
        }
    }

    fun updateSyncInfo(newSyncInfo: SyncInfo) {
        viewModelScope.launch {
            dbManager.saveSyncInfo(newSyncInfo)
            _syncInfo.value = newSyncInfo
        }
    }
}