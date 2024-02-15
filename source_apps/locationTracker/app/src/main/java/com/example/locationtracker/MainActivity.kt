package com.example.locationtracker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Log;

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable

import androidx.navigation.compose.rememberNavController
import com.example.locationtracker.data.LogsManager
import com.example.locationtracker.data.PreferencesManager
import com.example.locationtracker.eventSynchronisation.AppRegisteredToStorageState
import com.example.locationtracker.eventSynchronisation.EventSynchronisationManager
import com.example.locationtracker.screens.registrationScreen.RegistrationScreen
import com.example.locationtracker.utils.requestPostNotificationsPermission
import com.example.locationtracker.viewModel.MainViewModel
import com.google.accompanist.systemuicontroller.rememberSystemUiController



class MainActivity : ComponentActivity() {
    private lateinit var dbManager : LogsManager;
    private lateinit var mainViewModel: MainViewModel

    private val viewModelFactory = object : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return MainViewModel(dbManager, PreferencesManager(applicationContext)) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }

    private val serviceStatusReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val isRunning = intent.getBooleanExtra("isRunning", false)
            mainViewModel.serviceRunningLiveData.postValue(isRunning)
        }
    }



    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestPostNotificationsPermission(this)


        Log.d("TAG", "Debug message");
        dbManager = LogsManager.getInstance(this);
        mainViewModel = ViewModelProvider(this, viewModelFactory)[MainViewModel::class.java]

        registerReceiver(serviceStatusReceiver, IntentFilter("SERVICE_STATUS_ACTION")) // Register the broadcast receiver

        setContent {
            MyApp(mainViewModel, dbManager, applicationContext)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(serviceStatusReceiver) // Unregister the broadcast receiver to prevent memory leaks
    }
}

@Composable
fun MyApp(mainViewModel: MainViewModel, logsManager: LogsManager, applicationContext: Context) {
    val systemUiController = rememberSystemUiController()
    val statusBarColor = colorResource(id = R.color.header_background)
    SideEffect {
        systemUiController.setStatusBarColor(
            color = statusBarColor,
            darkIcons = true
        )

        systemUiController.setNavigationBarColor(
            color = Color.White,
            darkIcons = true
        )
    }

    var eventSyncManager = EventSynchronisationManager()
    val startDestination = if (eventSyncManager.isAppRegisteredInStorage() == AppRegisteredToStorageState.NON_REGISTERED) "registrationScreen" else "mainScreen"

    val navController = rememberNavController()
    NavHost(navController = navController, startDestination) {
        composable("mainScreen") { MainScreen(navController, mainViewModel, applicationContext) }
        composable("logScreen") { LogScreen(navController, logsManager) }
        composable("registrationScreen") { RegistrationScreen(navController) }
    }
}