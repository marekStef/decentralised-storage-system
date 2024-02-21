package com.example.locationtracker.utils

import android.app.Activity
import android.app.AlertDialog

fun showAlertDialogWithOkButton(context: Activity, title: String, message: String) {
    AlertDialog.Builder(context)
        .setTitle(title)
        .setMessage(message) // Use the message from the callback
        .setPositiveButton("OK") { dialog, _ ->
            dialog.dismiss()
        }
        .show()
}