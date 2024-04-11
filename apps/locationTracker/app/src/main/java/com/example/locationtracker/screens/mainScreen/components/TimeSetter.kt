package com.example.locationtracker.screens.mainScreen.components

import android.app.TimePickerDialog
import android.content.Context
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.example.locationtracker.R
import java.time.LocalTime
import java.util.Calendar

@Composable
fun TimeSetter(context: Context, time: LocalTime?, onUpdate: (LocalTime) -> Unit) {
    Button(
        onClick = {
            val calendar = Calendar.getInstance()
            TimePickerDialog(
                context,
                { _, hourOfDay, minute -> onUpdate(LocalTime.of(hourOfDay, minute)) },
                time?.hour ?: Calendar.HOUR,
                time?.minute ?: Calendar.MINUTE,
                true
            ).show()
        },
        modifier = Modifier.padding(1.dp),
        shape = RoundedCornerShape(4.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = colorResource(id = R.color.gray_light1),
            contentColor = colorResource(id = R.color.gray_light7),
        ),
        contentPadding = PaddingValues(
            start = 13.dp,
            top = 0.dp,
            end = 13.dp,
            bottom = 0.dp
        ),
    ) {
        Text(
            text = time.toString()
                ?: stringResource(id = R.string.set_time)
        )
    }
}