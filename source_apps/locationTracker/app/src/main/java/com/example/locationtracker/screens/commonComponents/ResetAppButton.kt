package com.example.locationtracker.screens.commonComponents

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.material.AlertDialog
import androidx.compose.material.Text
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.locationtracker.viewModel.MainViewModel
import java.lang.ref.WeakReference

@Composable
fun ResetAppButton(applicationContext: Context, viewModelRef: WeakReference<MainViewModel>, navController: NavController) {
    val viewModel = viewModelRef.get() ?: return

    var showDialog by remember { mutableStateOf(false) }

    // Confirmation Dialog
    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text("Reset App") },
            text = { Text("Are you sure you want to reset the app?") },
            confirmButton = {
                CustomDefaultButton(
                    text = "Yes",
                    backgroundColor = Color.Red,
                    textColor = Color.White
                ) {
                    showDialog = false
                    viewModel.resetApplication(applicationContext, navController);
                    viewModel.showAlertDialogWithOkButton("App Reset", "Your app has been successfully reset")
                }
            },
            dismissButton = { CustomDefaultButton(text = "No", onClick = { showDialog = false }) }
        )
    }

    Button(
        onClick = { showDialog = true },
        colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
        modifier = Modifier
            .background(Color.Red)
            .padding(5.dp)
    ) {
        Text("Reset the app", color = Color.White)
    }
}