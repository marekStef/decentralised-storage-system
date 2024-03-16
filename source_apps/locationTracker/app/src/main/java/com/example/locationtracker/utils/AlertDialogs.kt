package com.example.locationtracker.utils

import android.app.AlertDialog
import android.content.Context

fun showAlertDialogWithOkButton(context: Context, title: String, message: String) {
    AlertDialog.Builder(context)
        .setTitle(title)
        .setMessage(message)
        .setPositiveButton("OK") { dialog, _ ->
            dialog.dismiss()
        }
        .show()
}