package com.example.locationtracker

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.util.Log;

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContract
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.locationtracker.constants.ScreensNames

import com.example.locationtracker.constants.Services
import com.example.locationtracker.data.LogsManager
import com.example.locationtracker.data.PreferencesManager
import com.example.locationtracker.screens.ProfilesAndPermissionsScreen.ProfilesAndPermissionsScreen
import com.example.locationtracker.screens.SettingsScreenForRegisteredApp.SettingsScreenForRegisteredApp
import com.example.locationtracker.screens.registrationScreen.RegistrationScreen
import com.example.locationtracker.utils.*
import com.example.locationtracker.viewModel.DataStorageRegistrationViewModel
import com.example.locationtracker.viewModel.MainViewModel
import com.google.accompanist.systemuicontroller.rememberSystemUiController
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers.IO
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private lateinit var dbManager : LogsManager;
    private lateinit var mainViewModel: MainViewModel
    private lateinit var dataStorageRegistrationViewModel: DataStorageRegistrationViewModel

    private lateinit var createDocumentLauncher: ActivityResultLauncher<String>

    private val viewModelFactory = object : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return MainViewModel(application, dbManager, PreferencesManager(applicationContext)) as T
            } else if (modelClass.isAssignableFrom(DataStorageRegistrationViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return DataStorageRegistrationViewModel(application, PreferencesManager(applicationContext)) as T
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

    private val requestBatteryOptimisationPermission = {
        Log.d("TAG", "aaaaaaare optimisations turned offff?  ${isAppExemptFromBatteryOptimizations(this)}");
        requestDisableBatteryOptimization(this)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestPostNotificationsPermission(this)

        dbManager = LogsManager.getInstance(this);
        mainViewModel = ViewModelProvider(this, viewModelFactory)[MainViewModel::class.java]
        Log.d("still here", "heeere---")
        dataStorageRegistrationViewModel = ViewModelProvider(this, viewModelFactory)[DataStorageRegistrationViewModel::class.java]

        requestBatteryOptimisationPermission()

        registerReceiver(serviceStatusReceiver, IntentFilter(Services.LOCATION_TRACKER_SERVICE_BROADCAST)) // Register the broadcast receiver

        initCreateDocumentLauncher()

        mainViewModel.tempFilePath.observe(this) { filePath ->
            if (filePath != null) {
                // Launch the file picker
                createDocumentLauncher.launch("new_file_name.csv")
            }
        }

        setContent {
            MyApp(mainViewModel, dataStorageRegistrationViewModel, dbManager, applicationContext, this)
        }
    }

    private fun initCreateDocumentLauncher() {
        createDocumentLauncher = registerForActivityResult(createDocumentContract) { uri ->
            Log.d("MainActivity", "${mainViewModel.tempFilePath.value} Received URI: $uri")
            if (uri != null) {
                val tempFilePath = mainViewModel.tempFilePath.value
                if (tempFilePath != null) {
                    CoroutineScope(IO).launch {
                        copyFileToSelectedLocation(applicationContext, this@MainActivity, tempFilePath, uri)
                    }
                    mainViewModel.resetTempFilePath()
                }
            } else {
                Log.d("MainActivity", "The URI is null. User cancelled the picker.")
            }
        }
    }

    val createDocumentContract = object : ActivityResultContract<String, Uri?>() {
        override fun createIntent(context: Context, input: String): Intent {
            return Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "text/csv"
                putExtra(Intent.EXTRA_TITLE, input) // The default name for the saved file
            }
        }

        override fun parseResult(resultCode: Int, intent: Intent?): Uri? {
            if (resultCode == Activity.RESULT_OK) {
                return intent?.data
            }
            return null
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(serviceStatusReceiver) // Unregister the broadcast receiver to prevent memory leaks
    }

    override fun onStop() {
        super.onStop()
        mainViewModel.saveViewModel()
        dataStorageRegistrationViewModel.saveViewModel()
    }
}

@Composable
fun MyApp(mainViewModel: MainViewModel, dataStorageRegistrationViewModel: DataStorageRegistrationViewModel, logsManager: LogsManager, applicationContext: Context, activity: Activity) {
    val systemUiController = rememberSystemUiController()
    val statusBarColor = colorResource(id = R.color.header_background)
    SideEffect {
        systemUiController.setStatusBarColor(
            color = statusBarColor,
            darkIcons = false
        )

        systemUiController.setNavigationBarColor(
            color = Color.White,
            darkIcons = true
        )
    }

    var preferencesManager = PreferencesManager(applicationContext)

    val startDestination = if (preferencesManager.isAppProperlyRegistered()) ScreensNames.MAIN_SCREEN else ScreensNames.REGISTRATION_SCREEN

    val navController = rememberNavController()
    NavHost(navController = navController, startDestination, modifier = Modifier.fillMaxSize()) {
        composable(ScreensNames.MAIN_SCREEN) { MainScreen(navController, mainViewModel, dataStorageRegistrationViewModel, applicationContext, activity) }

        composable(ScreensNames.LOG_SCREEN) { LogScreen(navController, logsManager, applicationContext) }

        composable(ScreensNames.PROFILES_AND_PERMISSIONS_SCREEN) { ProfilesAndPermissionsScreen(navController, dataStorageRegistrationViewModel, preferencesManager, activity) }

        composable(ScreensNames.REGISTRATION_SCREEN) { RegistrationScreen(navController, dataStorageRegistrationViewModel, activity) }

        composable(ScreensNames.SETTINGS_SCREEN_FOR_REGISTERED_APP) { SettingsScreenForRegisteredApp(applicationContext, navController, mainViewModel, dataStorageRegistrationViewModel, activity) }
    }
}

