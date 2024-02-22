package com.example.locationtracker.utils

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

fun convertDateToFormattedString(date: Date): String {
    val format = SimpleDateFormat("dd.MM.yyyy HH:mm:ss", Locale.getDefault())
    return format.format(date)
}
fun convertLongToTime(time: Long?, defaultValue: String): String {
    if (time == null) return defaultValue
    val date = Date(time)
    return convertDateToFormattedString(date)
}