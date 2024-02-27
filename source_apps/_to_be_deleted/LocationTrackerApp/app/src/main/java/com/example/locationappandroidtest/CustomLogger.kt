import android.content.Context
import android.util.Log
import java.io.File
import java.io.FileWriter
import java.io.IOException

object CustomLogger {
    private var writer: FileWriter? = null
    fun init(context: Context) {
        try {
            // Use the app's specific external directory, which does not require any permissions.
            val logFile = File(context.getExternalFilesDir(null), "my_app_logs7.txt")
            val filePath = logFile.getAbsolutePath();
            Log.i("FileLogger", "Log file path: " + filePath);
            // Open the file in append mode.
            writer = FileWriter(logFile, true)
        } catch (e: IOException) {
            Log.e("FileLogger", "Error opening log file", e)
        }
    }

    fun log(tag: String?, message: String?) {
        try {
            if (writer != null) {
                writer!!.append(tag).append(": ").append(message).append("\n")
                writer!!.flush() // Make sure to flush after each write
            }
        } catch (e: IOException) {
            Log.e("FileLogger", "Error writing to log file", e)
        }
    }

    fun close() {
        try {
            if (writer != null) {
                writer!!.close()
            }
        } catch (e: IOException) {
            Log.e("FileLogger", "Error closing log file", e)
        }
    }
}
