package com.example.locationtracker.utils

import android.app.Activity
import android.app.AlertDialog
import android.content.Context

fun showAlertDialogWithOkButton(context: Activity, title: String, message: String) {
    AlertDialog.Builder(context)
        .setTitle(title)
        .setMessage(message)
        .setPositiveButton("OK") { dialog, _ ->
            dialog.dismiss()
        }
        .show()
}

fun showAlertDialogWithOkButton(context: Context, title: String, message: String) {
    AlertDialog.Builder(context)
        .setTitle(title)
        .setMessage(message)
        .setPositiveButton("OK") { dialog, _ ->
            dialog.dismiss()
        }
        .show()
}