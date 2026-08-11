package com.example.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.telephony.SmsManager
import android.widget.Toast
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

object CommunicationHelper {

    fun sendDirectSms(context: Context, phoneNumber: String, message: String): Boolean {
        return try {
            val smsManager: SmsManager = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                context.getSystemService(SmsManager::class.java)
            } else {
                @Suppress("DEPRECATION")
                SmsManager.getDefault()
            }
            val parts = smsManager.divideMessage(message)
            if (parts.size > 1) {
                smsManager.sendMultipartTextMessage(phoneNumber, null, parts, null, null)
            } else {
                smsManager.sendTextMessage(phoneNumber, null, message, null, null)
            }
            Toast.makeText(context, "SMS sent to $phoneNumber successfully!", Toast.LENGTH_SHORT).show()
            true
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "Unable to send direct SMS: ${e.localizedMessage}. Opening Messaging app...", Toast.LENGTH_LONG).show()
            openSmsApp(context, phoneNumber, message)
            false
        }
    }

    fun openSmsApp(context: Context, phoneNumber: String, message: String) {
        try {
            val intent = Intent(Intent.ACTION_SENDTO).apply {
                data = Uri.parse("smsto:${Uri.encode(phoneNumber)}")
                putExtra("sms_body", message)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "No Messaging app found on device.", Toast.LENGTH_SHORT).show()
        }
    }

    fun openWhatsApp(context: Context, phoneNumber: String, message: String) {
        try {
            val cleanPhone = phoneNumber.replace(Regex("[^0-9+]"), "")
            val encodedMsg = URLEncoder.encode(message, StandardCharsets.UTF_8.toString())
            val uri = Uri.parse("https://api.whatsapp.com/send?phone=$cleanPhone&text=$encodedMsg")
            val intent = Intent(Intent.ACTION_VIEW, uri)
            context.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "WhatsApp is not installed. Opening default messaging...", Toast.LENGTH_SHORT).show()
            openSmsApp(context, phoneNumber, message)
        }
    }

    fun makePhoneCall(context: Context, phoneNumber: String) {
        try {
            val intent = Intent(Intent.ACTION_DIAL).apply {
                data = Uri.parse("tel:${Uri.encode(phoneNumber)}")
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "Unable to initiate call.", Toast.LENGTH_SHORT).show()
        }
    }
}
