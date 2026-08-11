package com.example.data.model

data class CustomerProfile(
    val customerPhone: String,
    val customerName: String,
    val tickets: List<RepairTicket> = emptyList()
) {
    val totalJobsCount: Int get() = tickets.size
    val totalAmountSpent: Double get() = tickets.sumOf { it.formattedTotalCost }
    val totalAdvancePaid: Double get() = tickets.sumOf { it.advancePaid }
    val totalPendingBalance: Double get() = tickets.sumOf { if (it.balanceDue > 0) it.balanceDue else 0.0 }
    val lastVisitMillis: Long get() = tickets.maxOfOrNull { it.dateCreatedMillis } ?: 0L
    val completedJobsCount: Int get() = tickets.count { it.currentStatusEnum == RepairStatus.DELIVERED || it.currentStatusEnum == RepairStatus.READY_FOR_PICKUP }
    val activeJobsCount: Int get() = tickets.count { it.currentStatusEnum != RepairStatus.DELIVERED && it.currentStatusEnum != RepairStatus.CANCELLED }
}
