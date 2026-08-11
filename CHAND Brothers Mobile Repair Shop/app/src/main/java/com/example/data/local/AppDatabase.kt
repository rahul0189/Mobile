package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.data.model.ProductItem
import com.example.data.model.RepairStatus
import com.example.data.model.RepairTicket
import com.example.data.model.SmsTemplate
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [RepairTicket::class, SmsTemplate::class, ProductItem::class],
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun repairDao(): RepairDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "fixtrack_repair_database"
                )
                    .fallbackToDestructiveMigration()
                    .addCallback(DatabaseCallback(context))
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback(
            private val context: Context
        ) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    CoroutineScope(Dispatchers.IO).launch {
                        populateInitialData(database.repairDao())
                    }
                }
            }

            private suspend fun populateInitialData(dao: RepairDao) {
                // Populate SMS Templates
                for (status in RepairStatus.entries) {
                    dao.insertSmsTemplate(
                        SmsTemplate(
                            statusKey = status.key,
                            templateText = status.defaultSmsTemplate
                        )
                    )
                }

                val now = System.currentTimeMillis()
                val hour = 3600000L
                val day = 86400000L

                // Populate Realistic Sample Mobile Repair Tickets
                val sampleTickets = listOf(
                    RepairTicket(
                        ticketNumber = "REP-1001",
                        dateCreatedMillis = now - (2 * day),
                        dateUpdatedMillis = now - (1 * day),
                        customerName = "David Miller",
                        customerPhone = "+15550192834",
                        mobileBrand = "Apple",
                        mobileModel = "iPhone 14 Pro",
                        serialOrImei = "358921098471201",
                        issueCategory = "Screen Replacement",
                        issueDescription = "Front OLED display cracked after drop. Touch screen unresponsive on top left corner.",
                        deviceCondition = "Slight bezel scratch on bottom right. Back glass intact.",
                        customerPasscode = "8492",
                        estimatedCost = 180.0,
                        advancePaid = 50.0,
                        partsCost = 110.0,
                        laborCost = 70.0,
                        status = RepairStatus.READY_FOR_PICKUP.key,
                        technicianNotes = "Original OLED display installed. TrueTone calibrated. All touch sensors tested OK.",
                        isPriority = true
                    ),
                    RepairTicket(
                        ticketNumber = "REP-1002",
                        dateCreatedMillis = now - (1 * day + 4 * hour),
                        dateUpdatedMillis = now - (3 * hour),
                        customerName = "Sarah Jenkins",
                        customerPhone = "+15550129876",
                        mobileBrand = "Samsung",
                        mobileModel = "Galaxy S23 Ultra",
                        serialOrImei = "351098234712908",
                        issueCategory = "Battery Replacement",
                        issueDescription = "Battery draining rapidly (lasts only 2 hours). Phone overheating during charging.",
                        deviceCondition = "Clean condition, clear TPU case included.",
                        customerPasscode = "Pattern: L-shape",
                        estimatedCost = 75.0,
                        advancePaid = 20.0,
                        partsCost = 40.0,
                        laborCost = 35.0,
                        status = RepairStatus.IN_PROGRESS.key,
                        technicianNotes = "New 5000mAh OEM battery installed. Performing thermal stress test.",
                        isPriority = false
                    ),
                    RepairTicket(
                        ticketNumber = "REP-1003",
                        dateCreatedMillis = now - (5 * hour),
                        dateUpdatedMillis = now - (1 * hour),
                        customerName = "Marcus Vance",
                        customerPhone = "+15550173629",
                        mobileBrand = "Google",
                        mobileModel = "Pixel 8 Pro",
                        serialOrImei = "354910293847120",
                        issueCategory = "Charging Port",
                        issueDescription = "USB-C charging cable loose. Charges only when held at specific angle.",
                        deviceCondition = "Dust inside port noticed.",
                        customerPasscode = "1234",
                        estimatedCost = 60.0,
                        advancePaid = 0.0,
                        partsCost = 25.0,
                        laborCost = 35.0,
                        status = RepairStatus.RECEIVED.key,
                        technicianNotes = "Port booked for deep cleaning & pin inspection.",
                        isPriority = false
                    ),
                    RepairTicket(
                        ticketNumber = "REP-1004",
                        dateCreatedMillis = now - (3 * day),
                        dateUpdatedMillis = now - (2 * day),
                        customerName = "Elena Rostova",
                        customerPhone = "+15550148293",
                        mobileBrand = "Xiaomi",
                        mobileModel = "Redmi Note 12",
                        serialOrImei = "869201928374129",
                        issueCategory = "Water Damage",
                        issueDescription = "Dropped in water. Device won't turn on. Red LED blinks when connected to charger.",
                        deviceCondition = "Moisture indicator tripped inside SIM tray.",
                        customerPasscode = "7721",
                        estimatedCost = 120.0,
                        advancePaid = 30.0,
                        partsCost = 60.0,
                        laborCost = 60.0,
                        status = RepairStatus.WAITING_FOR_PARTS.key,
                        technicianNotes = "Motherboard ultrasound cleaned. PMIC chip replacement part ordered.",
                        isPriority = true
                    ),
                    RepairTicket(
                        ticketNumber = "REP-1005",
                        dateCreatedMillis = now - (4 * day),
                        dateUpdatedMillis = now - (1 * day),
                        customerName = "Robert Chen",
                        customerPhone = "+15550183726",
                        mobileBrand = "OnePlus",
                        mobileModel = "OnePlus 11",
                        serialOrImei = "861928304918273",
                        issueCategory = "Camera Repair",
                        issueDescription = "Main camera lens glass shattered and optical stabilization vibrating.",
                        deviceCondition = "Camera bump scratched.",
                        customerPasscode = "0000",
                        estimatedCost = 95.0,
                        advancePaid = 95.0,
                        partsCost = 55.0,
                        laborCost = 40.0,
                        status = RepairStatus.DELIVERED.key,
                        technicianNotes = "Camera module replaced & lens glass installed. Tested video recording OK.",
                        isPriority = false
                    )
                )

                for (ticket in sampleTickets) {
                    dao.insertTicket(ticket)
                }

                // Populate Realistic Sample Products & Inventory Stock
                val sampleProducts = listOf(
                    ProductItem(
                        name = "iPhone 14 Pro OLED Screen Assembly",
                        category = "Screen",
                        sku = "SCR-IP14P",
                        sellingPrice = 120.0,
                        costPrice = 75.0,
                        quantity = 8,
                        lowStockThreshold = 5,
                        description = "High grade OEM Super Retina XDR OLED replacement screen panel."
                    ),
                    ProductItem(
                        name = "Samsung Galaxy S23 Ultra Battery (5000mAh)",
                        category = "Battery",
                        sku = "BAT-S23U",
                        sellingPrice = 45.0,
                        costPrice = 20.0,
                        quantity = 12,
                        lowStockThreshold = 5,
                        description = "Original lithium-ion replacement battery pack."
                    ),
                    ProductItem(
                        name = "USB-C Fast Charging Cable (2m Nylon Braided)",
                        category = "Charger & Cable",
                        sku = "CBL-USBC-2M",
                        sellingPrice = 18.0,
                        costPrice = 4.5,
                        quantity = 28,
                        lowStockThreshold = 10,
                        description = "60W Power Delivery braided USB-C to USB-C cable."
                    ),
                    ProductItem(
                        name = "20W USB-C PD Wall Fast Charger",
                        category = "Charger & Cable",
                        sku = "CHG-20W-PD",
                        sellingPrice = 22.0,
                        costPrice = 7.0,
                        quantity = 15,
                        lowStockThreshold = 5,
                        description = "Compact fast charging adapter for iPhone & Android."
                    ),
                    ProductItem(
                        name = "Universal 9H Tempered Glass Guard",
                        category = "Accessory",
                        sku = "ACC-TMP-GLS",
                        sellingPrice = 10.0,
                        costPrice = 1.5,
                        quantity = 3, // LOW STOCK ALERT
                        lowStockThreshold = 5,
                        description = "Anti-scratch 9H clear tempered glass protection."
                    ),
                    ProductItem(
                        name = "Google Pixel 8 Pro USB-C Charging Port Module",
                        category = "Spare Part",
                        sku = "PRT-PX8P-CHG",
                        sellingPrice = 35.0,
                        costPrice = 12.0,
                        quantity = 2, // LOW STOCK ALERT
                        lowStockThreshold = 4,
                        description = "OEM replacement dock connector ribbon flex."
                    )
                )

                for (product in sampleProducts) {
                    dao.insertProduct(product)
                }
            }
        }
    }
}
