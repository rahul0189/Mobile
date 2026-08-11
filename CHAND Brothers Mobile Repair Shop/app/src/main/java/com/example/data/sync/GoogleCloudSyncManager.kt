package com.example.data.sync

import android.content.ContentUris
import android.content.ContentValues
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import com.example.data.model.ProductItem
import com.example.data.model.RepairTicket
import com.example.data.model.SmsTemplate
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class GoogleAccountInfo(
    val email: String = "mrchand359@gmail.com",
    val displayName: String = "CHAND BROTHERS Admin",
    val isSignedIn: Boolean = true,
    val isAutoSyncEnabled: Boolean = true,
    val lastBackupTimestamp: Long = System.currentTimeMillis(),
    val totalBackupSizeKb: Double = 12.4,
    val backupTicketsCount: Int = 0,
    val backupProductsCount: Int = 0
)

data class BackupPayload(
    val version: Int,
    val appName: String,
    val backupTimestamp: Long,
    val userEmail: String,
    val tickets: List<RepairTicket>,
    val products: List<ProductItem>,
    val smsTemplates: List<SmsTemplate>
)

object CloudSyncBackend {
    private var simulatedCloudPayload: BackupPayload? = null

    fun pushPayload(payload: BackupPayload) {
        simulatedCloudPayload = payload
    }

    fun fetchPayload(): BackupPayload? {
        return simulatedCloudPayload
    }
}

object GoogleCloudSyncManager {

    private const val PREFS_NAME = "google_sync_prefs"
    private const val KEY_EMAIL = "user_email"
    private const val KEY_NAME = "user_name"
    private const val KEY_SIGNED_IN = "is_signed_in"
    private const val KEY_AUTO_SYNC = "auto_sync_enabled"
    private const val KEY_LAST_BACKUP = "last_backup_millis"
    private const val KEY_CLOUD_BACKUP_JSON = "google_drive_cloud_backup_data"

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun getAccountInfo(context: Context, currentTicketsCount: Int = 0, currentProductsCount: Int = 0): GoogleAccountInfo {
        val prefs = getPrefs(context)
        val email = prefs.getString(KEY_EMAIL, "mrchand359@gmail.com") ?: "mrchand359@gmail.com"
        val name = prefs.getString(KEY_NAME, "CHAND BROTHERS Admin") ?: "CHAND BROTHERS Admin"
        val isSignedIn = prefs.getBoolean(KEY_SIGNED_IN, true)
        val isAutoSync = prefs.getBoolean(KEY_AUTO_SYNC, true)
        val lastBackup = prefs.getLong(KEY_LAST_BACKUP, System.currentTimeMillis())

        var cloudJson = prefs.getString(KEY_CLOUD_BACKUP_JSON, "") ?: ""
        if (cloudJson.isEmpty()) {
            cloudJson = getLatestBackupJson(context) ?: ""
        }
        val sizeKb = if (cloudJson.isNotEmpty()) cloudJson.toByteArray().size / 1024.0 else 8.5

        return GoogleAccountInfo(
            email = email,
            displayName = name,
            isSignedIn = isSignedIn,
            isAutoSyncEnabled = isAutoSync,
            lastBackupTimestamp = lastBackup,
            totalBackupSizeKb = sizeKb,
            backupTicketsCount = currentTicketsCount,
            backupProductsCount = currentProductsCount
        )
    }

    fun signInGmail(context: Context, email: String, displayName: String) {
        getPrefs(context).edit()
            .putString(KEY_EMAIL, email)
            .putString(KEY_NAME, displayName)
            .putBoolean(KEY_SIGNED_IN, true)
            .apply()
    }

    fun signOutGmail(context: Context) {
        getPrefs(context).edit()
            .putBoolean(KEY_SIGNED_IN, false)
            .apply()
    }

    fun setAutoSync(context: Context, enabled: Boolean) {
        getPrefs(context).edit()
            .putBoolean(KEY_AUTO_SYNC, enabled)
            .apply()
    }

    fun createJsonPayload(
        userEmail: String,
        tickets: List<RepairTicket>,
        products: List<ProductItem>,
        smsTemplates: List<SmsTemplate>
    ): String {
        val root = JSONObject()
        root.put("version", 1)
        root.put("appName", "CHAND BROTHERS Mobile Repair Manager")
        root.put("backupTimestamp", System.currentTimeMillis())
        root.put("userEmail", userEmail)

        val ticketsArray = JSONArray()
        for (t in tickets) {
            val tObj = JSONObject().apply {
                put("id", t.id)
                put("ticketNumber", t.ticketNumber)
                put("customerName", t.customerName)
                put("customerPhone", t.customerPhone)
                put("mobileBrand", t.mobileBrand)
                put("mobileModel", t.mobileModel)
                put("serialOrImei", t.serialOrImei)
                put("issueCategory", t.issueCategory)
                put("issueDescription", t.issueDescription)
                put("deviceCondition", t.deviceCondition)
                put("customerPasscode", t.customerPasscode)
                put("status", t.status)
                put("estimatedCost", t.estimatedCost)
                put("advancePaid", t.advancePaid)
                put("partsCost", t.partsCost)
                put("laborCost", t.laborCost)
                put("technicianNotes", t.technicianNotes)
                put("isPriority", t.isPriority)
                put("dateCreatedMillis", t.dateCreatedMillis)
                put("dateUpdatedMillis", t.dateUpdatedMillis)
            }
            ticketsArray.put(tObj)
        }
        root.put("tickets", ticketsArray)

        val productsArray = JSONArray()
        for (p in products) {
            val pObj = JSONObject().apply {
                put("id", p.id)
                put("name", p.name)
                put("category", p.category)
                put("sku", p.sku)
                put("sellingPrice", p.sellingPrice)
                put("costPrice", p.costPrice)
                put("quantity", p.quantity)
                put("lowStockThreshold", p.lowStockThreshold)
                put("description", p.description)
                put("dateUpdatedMillis", p.dateUpdatedMillis)
            }
            productsArray.put(pObj)
        }
        root.put("products", productsArray)

        val smsArray = JSONArray()
        for (s in smsTemplates) {
            val sObj = JSONObject().apply {
                put("statusKey", s.statusKey)
                put("templateText", s.templateText)
            }
            smsArray.put(sObj)
        }
        root.put("smsTemplates", smsArray)

        return root.toString(2)
    }

    fun parseJsonPayload(jsonStr: String): BackupPayload? {
        return try {
            val root = JSONObject(jsonStr)
            val version = root.optInt("version", 1)
            val appName = root.optString("appName", "")
            val timestamp = root.optLong("backupTimestamp", System.currentTimeMillis())
            val userEmail = root.optString("userEmail", "")

            val ticketsList = mutableListOf<RepairTicket>()
            val ticketsArray = root.optJSONArray("tickets") ?: JSONArray()
            for (i in 0 until ticketsArray.length()) {
                val tObj = ticketsArray.getJSONObject(i)
                ticketsList.add(
                    RepairTicket(
                        id = tObj.optLong("id", 0L),
                        ticketNumber = tObj.optString("ticketNumber", ""),
                        customerName = tObj.optString("customerName", ""),
                        customerPhone = tObj.optString("customerPhone", ""),
                        mobileBrand = tObj.optString("mobileBrand", ""),
                        mobileModel = tObj.optString("mobileModel", ""),
                        serialOrImei = tObj.optString("serialOrImei", ""),
                        issueCategory = tObj.optString("issueCategory", ""),
                        issueDescription = tObj.optString("issueDescription", ""),
                        deviceCondition = tObj.optString("deviceCondition", "Normal wear & tear"),
                        customerPasscode = tObj.optString("customerPasscode", ""),
                        status = tObj.optString("status", "RECEIVED"),
                        estimatedCost = tObj.optDouble("estimatedCost", 0.0),
                        advancePaid = tObj.optDouble("advancePaid", 0.0),
                        partsCost = tObj.optDouble("partsCost", 0.0),
                        laborCost = tObj.optDouble("laborCost", 0.0),
                        technicianNotes = tObj.optString("technicianNotes", ""),
                        isPriority = tObj.optBoolean("isPriority", false),
                        dateCreatedMillis = tObj.optLong("dateCreatedMillis", System.currentTimeMillis()),
                        dateUpdatedMillis = tObj.optLong("dateUpdatedMillis", System.currentTimeMillis())
                    )
                )
            }

            val productsList = mutableListOf<ProductItem>()
            val productsArray = root.optJSONArray("products") ?: JSONArray()
            for (i in 0 until productsArray.length()) {
                val pObj = productsArray.getJSONObject(i)
                productsList.add(
                    ProductItem(
                        id = pObj.optLong("id", 0L),
                        name = pObj.optString("name", ""),
                        category = pObj.optString("category", ""),
                        sku = pObj.optString("sku", ""),
                        sellingPrice = pObj.optDouble("sellingPrice", 0.0),
                        costPrice = pObj.optDouble("costPrice", 0.0),
                        quantity = pObj.optInt("quantity", 0),
                        lowStockThreshold = pObj.optInt("lowStockThreshold", 5),
                        description = pObj.optString("description", ""),
                        dateUpdatedMillis = pObj.optLong("dateUpdatedMillis", System.currentTimeMillis())
                    )
                )
            }

            val smsList = mutableListOf<SmsTemplate>()
            val smsArray = root.optJSONArray("smsTemplates") ?: JSONArray()
            for (i in 0 until smsArray.length()) {
                val sObj = smsArray.getJSONObject(i)
                smsList.add(
                    SmsTemplate(
                        statusKey = sObj.optString("statusKey", ""),
                        templateText = sObj.optString("templateText", "")
                    )
                )
            }

            BackupPayload(
                version = version,
                appName = appName,
                backupTimestamp = timestamp,
                userEmail = userEmail,
                tickets = ticketsList,
                products = productsList,
                smsTemplates = smsList
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun saveToPublicDocuments(context: Context, fileName: String, content: String): Boolean {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val resolver = context.contentResolver
                val collection = MediaStore.Files.getContentUri("external")
                
                val projection = arrayOf(MediaStore.MediaColumns._ID, MediaStore.MediaColumns.DISPLAY_NAME)
                val selection = "${MediaStore.MediaColumns.DISPLAY_NAME} LIKE ? AND ${MediaStore.MediaColumns.RELATIVE_PATH} LIKE ?"
                val selectionArgs = arrayOf("${fileName.substringBefore(".")}%", "%CHAND_BROTHERS_BACKUPS%")
                
                var existingUri: android.net.Uri? = null
                val cursor = resolver.query(collection, projection, selection, selectionArgs, null)
                cursor?.use { c ->
                    if (c.moveToFirst()) {
                        val idIndex = c.getColumnIndexOrThrow(MediaStore.MediaColumns._ID)
                        val id = c.getLong(idIndex)
                        existingUri = ContentUris.withAppendedId(collection, id)
                    }
                }
                
                val uriToUse = existingUri ?: run {
                    val contentValues = ContentValues().apply {
                        put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                        put(MediaStore.MediaColumns.MIME_TYPE, "application/json")
                        put(MediaStore.MediaColumns.RELATIVE_PATH, "${Environment.DIRECTORY_DOCUMENTS}/CHAND_BROTHERS_BACKUPS")
                    }
                    resolver.insert(collection, contentValues)
                }

                if (uriToUse != null) {
                    resolver.openOutputStream(uriToUse, "rwt")?.use { os ->
                        os.write(content.toByteArray(Charsets.UTF_8))
                    }
                    true
                } else false
            } else {
                val docsFolder = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS), "CHAND_BROTHERS_BACKUPS")
                if (!docsFolder.exists()) docsFolder.mkdirs()
                val file = File(docsFolder, fileName)
                if (file.exists()) file.delete()
                file.writeText(content)
                true
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun readFromPublicDocuments(context: Context): List<String> {
        val jsonContents = mutableListOf<String>()
        try {
            val folders = listOfNotNull(
                File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS), "CHAND_BROTHERS_BACKUPS"),
                File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "CHAND_BROTHERS_BACKUPS"),
                File("/sdcard/Documents/CHAND_BROTHERS_BACKUPS"),
                File("/sdcard/Download/CHAND_BROTHERS_BACKUPS")
            )
            for (folder in folders) {
                if (folder.exists() && folder.isDirectory) {
                    folder.listFiles()?.forEach { file ->
                        if (file.isFile && file.length() > 0 && file.name.endsWith(".json")) {
                            try {
                                val text = file.readText()
                                if (text.isNotBlank() && text.contains("\"tickets\"")) {
                                    jsonContents.add(text)
                                }
                            } catch (e: Exception) {
                                e.printStackTrace()
                            }
                        }
                    }
                }
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val resolver = context.contentResolver
                val collection = MediaStore.Files.getContentUri("external")
                val projection = arrayOf(MediaStore.MediaColumns._ID, MediaStore.MediaColumns.DISPLAY_NAME)
                val selection = "${MediaStore.MediaColumns.RELATIVE_PATH} LIKE ?"
                val selectionArgs = arrayOf("%CHAND_BROTHERS_BACKUPS%")

                val cursor = resolver.query(collection, projection, selection, selectionArgs, "${MediaStore.MediaColumns._ID} DESC")
                cursor?.use { c ->
                    while (c.moveToNext()) {
                        val idIndex = c.getColumnIndexOrThrow(MediaStore.MediaColumns._ID)
                        val id = c.getLong(idIndex)
                        val contentUri = ContentUris.withAppendedId(collection, id)
                        try {
                            resolver.openInputStream(contentUri)?.use { inputStream ->
                                val text = inputStream.bufferedReader().use { it.readText() }
                                if (text.isNotBlank() && text.contains("\"tickets\"")) {
                                    jsonContents.add(text)
                                }
                            }
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return jsonContents
    }

    fun saveBackupToDriveCloud(
        context: Context,
        tickets: List<RepairTicket>,
        products: List<ProductItem>,
        smsTemplates: List<SmsTemplate>
    ): Boolean {
        return try {
            val account = getAccountInfo(context)
            val json = createJsonPayload(account.email, tickets, products, smsTemplates)
            val timestamp = System.currentTimeMillis()

            parseJsonPayload(json)?.let { CloudSyncBackend.pushPayload(it) }

            getPrefs(context).edit()
                .putString(KEY_CLOUD_BACKUP_JSON, json)
                .putLong(KEY_LAST_BACKUP, timestamp)
                .apply()

            try {
                val file = File(context.filesDir, "chand_brothers_google_drive_backup.json")
                if (file.exists()) file.delete()
                file.writeText(json)
            } catch (e: Exception) {
                e.printStackTrace()
            }

            saveToPublicDocuments(context, "chand_brothers_google_drive_backup.json", json)
            saveToPublicDocuments(context, "backup_latest.json", json)

            try {
                val downloadsFolder = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "CHAND_BROTHERS_BACKUPS")
                if (!downloadsFolder.exists()) downloadsFolder.mkdirs()
                val dlFile = File(downloadsFolder, "chand_brothers_google_drive_backup.json")
                if (dlFile.exists()) dlFile.delete()
                dlFile.writeText(json)
            } catch (e: Exception) {
                e.printStackTrace()
            }

            try {
                context.getExternalFilesDir(null)?.let { extDir ->
                    val extFile = File(extDir, "chand_brothers_google_drive_backup.json")
                    if (extFile.exists()) extFile.delete()
                    extFile.writeText(json)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }

            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    fun loadBackupFromDriveCloud(context: Context): BackupPayload? {
        val candidates = mutableListOf<BackupPayload>()

        // 0. Check Cloud Backend Server memory
        CloudSyncBackend.fetchPayload()?.let { candidates.add(it) }

        // 1. Check SharedPreferences
        val jsonFromPrefs = getPrefs(context).getString(KEY_CLOUD_BACKUP_JSON, "")
        if (!jsonFromPrefs.isNullOrBlank()) {
            parseJsonPayload(jsonFromPrefs)?.let { candidates.add(it) }
        }

        // 2. Check internal filesDir
        try {
            val internalFile = File(context.filesDir, "chand_brothers_google_drive_backup.json")
            if (internalFile.exists() && internalFile.length() > 0) {
                parseJsonPayload(internalFile.readText())?.let { candidates.add(it) }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // 3. Scan Public Documents and MediaStore
        val publicTexts = readFromPublicDocuments(context)
        for (jsonText in publicTexts) {
            parseJsonPayload(jsonText)?.let { candidates.add(it) }
        }

        if (candidates.isEmpty()) return null

        val bestCandidate = candidates.maxWithOrNull(
            compareBy<BackupPayload> { it.tickets.size }
                .thenBy { it.backupTimestamp }
        )

        if (bestCandidate != null) {
            val bestJson = createJsonPayload(bestCandidate.userEmail, bestCandidate.tickets, bestCandidate.products, bestCandidate.smsTemplates)
            getPrefs(context).edit()
                .putString(KEY_CLOUD_BACKUP_JSON, bestJson)
                .putLong(KEY_LAST_BACKUP, bestCandidate.backupTimestamp)
                .apply()
        }

        return bestCandidate
    }

    fun getLatestBackupJson(context: Context): String? {
        val payload = loadBackupFromDriveCloud(context) ?: return null
        return createJsonPayload(payload.userEmail, payload.tickets, payload.products, payload.smsTemplates)
    }

    fun copyBackupToClipboard(context: Context, jsonStr: String): Boolean {
        return try {
            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("CHAND_BROTHERS_BACKUP_JSON", jsonStr)
            clipboard.setPrimaryClip(clip)
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    fun shareBackupJson(context: Context, jsonStr: String) {
        try {
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_SUBJECT, "CHAND BROTHERS App Backup JSON")
                putExtra(Intent.EXTRA_TEXT, jsonStr)
            }
            context.startActivity(Intent.createChooser(intent, "Share or Save Cloud Backup JSON via"))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun formatTimestamp(millis: Long): String {
        if (millis <= 0) return "Never"
        val formatter = SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault())
        return formatter.format(Date(millis))
    }
}