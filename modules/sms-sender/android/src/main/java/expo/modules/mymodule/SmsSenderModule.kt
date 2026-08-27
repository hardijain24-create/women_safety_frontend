package expo.modules.mymodule

import android.content.Intent
import android.net.Uri
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SmsSenderModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SmsSender")

    // 📱 Direct SMS via SmsManager (requires SEND_SMS permission — Play Store approved apps)
    AsyncFunction("sendDirectSMS") { phoneNumber: String, message: String ->
      try {
        val smsManager = android.telephony.SmsManager.getDefault()
        smsManager.sendTextMessage(phoneNumber, null, message, null, null)
        true
      } catch (e: Exception) {
        throw Exception("Failed to send SMS: " + e.message)
      }
    }

    // 📲 Open SMS app pre-filled (No permission required — works for all apps)
    AsyncFunction("openSMSIntent") { phoneNumber: String, message: String ->
      try {
        val uri = Uri.parse("smsto:$phoneNumber")
        val intent = Intent(Intent.ACTION_SENDTO, uri).apply {
          putExtra("sms_body", message)
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        appContext.reactContext?.startActivity(intent)
        true
      } catch (e: Exception) {
        throw Exception("Failed to open SMS app: " + e.message)
      }
    }
  }
}
