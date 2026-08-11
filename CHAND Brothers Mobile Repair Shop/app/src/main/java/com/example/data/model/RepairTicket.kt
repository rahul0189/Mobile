package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "repair_tickets")
data class RepairTicket(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val ticketNumber: String,
    val dateCreatedMillis: Long = System.currentTimeMillis(),
    val dateUpdatedMillis: Long = System.currentTimeMillis(),
    val customerName: String,
    val customerPhone: String,
    val mobileBrand: String,
    val mobileModel: String,
    val serialOrImei: String = "",
    val issueCategory: String,
    val issueDescription: String,
    val deviceCondition: String = "Normal wear & tear",
    val customerPasscode: String = "",
    val estimatedCost: Double = 0.0,
    val advancePaid: Double = 0.0,
    val partsCost: Double = 0.0,
    val laborCost: Double = 0.0,
    val status: String = RepairStatus.RECEIVED.key,
    val technicianNotes: String = "",
    val isPriority: Boolean = false
) {
    val balanceDue: Double
        get() = (if (estimatedCost > 0) estimatedCost else (partsCost + laborCost)) - advancePaid

    val formattedTotalCost: Double
        get() = if (estimatedCost > 0) estimatedCost else (partsCost + laborCost)

    val currentStatusEnum: RepairStatus
        get() = RepairStatus.fromKey(status)
}
