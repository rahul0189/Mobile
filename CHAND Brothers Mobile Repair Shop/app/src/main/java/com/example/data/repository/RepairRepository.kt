package com.example.data.repository

import com.example.data.local.RepairDao
import com.example.data.model.ProductItem
import com.example.data.model.RepairStatus
import com.example.data.model.RepairTicket
import com.example.data.model.SmsTemplate
import kotlinx.coroutines.flow.Flow

class RepairRepository(private val repairDao: RepairDao) {

    val allTickets: Flow<List<RepairTicket>> = repairDao.getAllTickets()
    val allSmsTemplates: Flow<List<SmsTemplate>> = repairDao.getAllSmsTemplates()
    val allProducts: Flow<List<ProductItem>> = repairDao.getAllProducts()
    val lowStockCount: Flow<Int> = repairDao.getLowStockCount()

    fun getTicketsByStatus(statusKey: String): Flow<List<RepairTicket>> {
        return if (statusKey == "ALL") {
            repairDao.getAllTickets()
        } else {
            repairDao.getTicketsByStatus(statusKey)
        }
    }

    fun searchTickets(query: String): Flow<List<RepairTicket>> {
        return if (query.isBlank()) {
            repairDao.getAllTickets()
        } else {
            repairDao.searchTickets(query.trim())
        }
    }

    // Product & Inventory Stock Management
    fun searchProducts(query: String, category: String = "ALL"): Flow<List<ProductItem>> {
        return when {
            query.isNotBlank() -> repairDao.searchProducts(query.trim())
            category != "ALL" -> repairDao.getProductsByCategory(category)
            else -> repairDao.getAllProducts()
        }
    }

    suspend fun saveProduct(product: ProductItem): Long {
        val updatedProduct = product.copy(dateUpdatedMillis = System.currentTimeMillis())
        return if (product.id == 0L) {
            repairDao.insertProduct(updatedProduct)
        } else {
            repairDao.updateProduct(updatedProduct)
            product.id
        }
    }

    suspend fun deleteProduct(product: ProductItem) {
        repairDao.deleteProduct(product)
    }

    suspend fun adjustProductQuantity(productId: Long, delta: Int) {
        val currentProduct = repairDao.getProductByIdDirect(productId) ?: return
        val newQuantity = (currentProduct.quantity + delta).coerceAtLeast(0)
        repairDao.updateProductQuantity(productId, newQuantity)
    }

    fun getTicketById(id: Long): Flow<RepairTicket?> = repairDao.getTicketById(id)

    suspend fun insertTicket(ticket: RepairTicket): Long {
        var formattedTicket = ticket
        if (ticket.ticketNumber.isBlank()) {
            val count = repairDao.getTicketCount()
            formattedTicket = ticket.copy(ticketNumber = "REP-${1001 + count}")
        }
        return repairDao.insertTicket(formattedTicket)
    }

    suspend fun updateTicket(ticket: RepairTicket) {
        val updated = ticket.copy(dateUpdatedMillis = System.currentTimeMillis())
        repairDao.updateTicket(updated)
    }

    suspend fun updateTicketStatus(id: Long, newStatus: RepairStatus, technicianNotes: String = "") {
        val currentTicket = repairDao.getTicketByIdDirect(id) ?: return
        val updated = currentTicket.copy(
            status = newStatus.key,
            dateUpdatedMillis = System.currentTimeMillis(),
            technicianNotes = if (technicianNotes.isNotBlank()) technicianNotes else currentTicket.technicianNotes
        )
        repairDao.updateTicket(updated)
    }

    suspend fun deleteTicket(ticket: RepairTicket) {
        repairDao.deleteTicket(ticket)
    }

    suspend fun getSmsTemplate(statusKey: String): String {
        val template = repairDao.getSmsTemplate(statusKey)
        return template?.templateText ?: RepairStatus.fromKey(statusKey).defaultSmsTemplate
    }

    suspend fun saveSmsTemplate(template: SmsTemplate) {
        repairDao.insertSmsTemplate(template)
    }

    fun generateFormattedSms(ticket: RepairTicket, rawTemplate: String): String {
        return rawTemplate
            .replace("{NAME}", ticket.customerName)
            .replace("{MODEL}", "${ticket.mobileBrand} ${ticket.mobileModel}")
            .replace("{TICKET}", ticket.ticketNumber)
            .replace("{STATUS}", ticket.currentStatusEnum.displayName)
            .replace("{ESTIMATED_COST}", String.format("%.2f", ticket.estimatedCost))
            .replace("{BALANCE_DUE}", String.format("%.2f", ticket.balanceDue))
            .replace("{TOTAL_COST}", String.format("%.2f", ticket.formattedTotalCost))
    }
}
