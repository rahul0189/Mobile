package com.example.data.model

import androidx.compose.ui.graphics.Color
import com.example.ui.theme.AccentAmber
import com.example.ui.theme.AccentEmerald
import com.example.ui.theme.AccentIndigo
import com.example.ui.theme.AccentRose
import com.example.ui.theme.ElectricCyan

enum class RepairStatus(
    val key: String,
    val displayName: String,
    val description: String,
    val stepOrder: Int,
    val badgeColor: Color,
    val defaultSmsTemplate: String
) {
    RECEIVED(
        key = "RECEIVED",
        displayName = "Received",
        description = "Device received & booked for repair",
        stepOrder = 1,
        badgeColor = ElectricCyan,
        defaultSmsTemplate = "Hello {NAME}, your device ({MODEL}) has been received at CHAND Brothers Mobile Repair Shop (Ticket #{TICKET}). Estimated quote: ₹{ESTIMATED_COST}. Status: Received."
    ),
    DIAGNOSING(
        key = "DIAGNOSING",
        displayName = "Diagnosing",
        description = "Technician checking hardware & software",
        stepOrder = 2,
        badgeColor = AccentIndigo,
        defaultSmsTemplate = "Hello {NAME}, technician is currently diagnosing your {MODEL} (Ticket #{TICKET}). We will notify you once diagnosis is complete."
    ),
    IN_PROGRESS(
        key = "IN_PROGRESS",
        displayName = "In Repair",
        description = "Active repair work on device",
        stepOrder = 3,
        badgeColor = AccentAmber,
        defaultSmsTemplate = "Hello {NAME}, repair work is actively IN PROGRESS for your {MODEL} (Ticket #{TICKET}). Thank you for your patience!"
    ),
    WAITING_FOR_PARTS(
        key = "WAITING_FOR_PARTS",
        displayName = "Parts Ordered",
        description = "Waiting for replacement components",
        stepOrder = 4,
        badgeColor = Color(0xFFE11D48),
        defaultSmsTemplate = "Hello {NAME}, spare parts have been ordered for your {MODEL} (Ticket #{TICKET}). Expected delay: 24-48 hours. We'll update you as soon as parts arrive."
    ),
    READY_FOR_PICKUP(
        key = "READY_FOR_PICKUP",
        displayName = "Ready for Pickup",
        description = "Repair completed & tested. Ready for customer",
        stepOrder = 5,
        badgeColor = AccentEmerald,
        defaultSmsTemplate = "GREAT NEWS! Hello {NAME}, your {MODEL} (Ticket #{TICKET}) is fully REPAIRED & READY FOR PICKUP! Remaining balance: ₹{BALANCE_DUE}. See you soon!"
    ),
    DELIVERED(
        key = "DELIVERED",
        displayName = "Delivered / Paid",
        description = "Device picked up by customer & ticket closed",
        stepOrder = 6,
        badgeColor = Color(0xFF64748B),
        defaultSmsTemplate = "Thank you {NAME}! Your device {MODEL} (Ticket #{TICKET}) has been delivered. Thank you for choosing CHAND Brothers Mobile Repair Shop!"
    ),
    CANCELLED(
        key = "CANCELLED",
        displayName = "Cancelled",
        description = "Job cancelled or unrepairable",
        stepOrder = 0,
        badgeColor = AccentRose,
        defaultSmsTemplate = "Hello {NAME}, ticket #{TICKET} for {MODEL} has been CANCELLED. Please visit the shop to collect your device."
    );

    companion object {
        fun fromKey(key: String): RepairStatus {
            return entries.find { it.key.equals(key, ignoreCase = true) } ?: RECEIVED
        }

        val activeStatuses = listOf(RECEIVED, DIAGNOSING, IN_PROGRESS, WAITING_FOR_PARTS, READY_FOR_PICKUP)
    }
}
