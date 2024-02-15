package com.example.locationtracker

import android.util.Log;

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable

import androidx.navigation.compose.rememberNavController
import com.example.locationtracker.data.DatabaseLogsManager
import com.example.locationtracker.viewModel.MainViewModel
import com.google.accompanist.systemuicontroller.rememberSystemUiController

class MainActivity : ComponentActivity() {
    private val dbManager = DatabaseLogsManager(this)

    private val viewModelFactory = object : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return MainViewModel(dbManager) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }



    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d("TAG", "Debug message");
        val mainViewModel = ViewModelProvider(this, viewModelFactory)[MainViewModel::class.java]

        setContent {
            MyApp(mainViewModel)
        }
    }
}

@Composable
fun MyApp(mainViewModel: MainViewModel) {
    val systemUiController = rememberSystemUiController()
    SideEffect {
        systemUiController.setStatusBarColor(
            color = Color.Blue, // Set your desired color here
            darkIcons = true
        )

        systemUiController.setNavigationBarColor(
            color = Color.White,
            darkIcons = true
        )
    }

    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "mainScreen") {
        composable("mainScreen") { MainScreen(navController, mainViewModel) }
        composable("logScreen") { LogScreen(navController) }
    }
}