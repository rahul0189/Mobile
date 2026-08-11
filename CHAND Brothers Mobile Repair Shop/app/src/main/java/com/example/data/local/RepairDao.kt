package com.example.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.ProductItem
import com.example.data.model.RepairTicket
import com.example.data.model.SmsTemplate
import kotlinx.coroutines.flow.Flow

@Dao
interface RepairDao {

    @Query("SELECT * FROM repair_tickets ORDER BY dateCreatedMillis DESC")
    fun getAllTickets(): Flow<List<RepairTicket>>

    @Query("SELECT * FROM repair_tickets WHERE status = :status ORDER BY dateCreatedMillis DESC")
    fun getTicketsByStatus(status: String): Flow<List<RepairTicket>>

    @Query("""
        SELECT * FROM repair_tickets 
        WHERE customerName LIKE '%' || :query || '%' 
           OR customerPhone LIKE '%' || :query || '%' 
           OR ticketNumber LIKE '%' || :query || '%' 
           OR mobileModel LIKE '%' || :query || '%'
           OR mobileBrand LIKE '%' || :query || '%'
        ORDER BY dateCreatedMillis DESC
    """)
    fun searchTickets(query: String): Flow<List<RepairTicket>>

    @Query("SELECT * FROM repair_tickets ORDER BY dateCreatedMillis DESC")
    suspend fun getAllTicketsDirect(): List<RepairTicket>

    @Query("DELETE FROM repair_tickets")
    suspend fun deleteAllTickets()

    @Query("SELECT * FROM repair_tickets WHERE id = :id LIMIT 1")
    fun getTicketById(id: Long): Flow<RepairTicket?>

    @Query("SELECT * FROM repair_tickets WHERE id = :id LIMIT 1")
    suspend fun getTicketByIdDirect(id: Long): RepairTicket?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTicket(ticket: RepairTicket): Long

    @Update
    suspend fun updateTicket(ticket: RepairTicket)

    @Delete
    suspend fun deleteTicket(ticket: RepairTicket)

    @Query("DELETE FROM repair_tickets WHERE id = :id")
    suspend fun deleteTicketById(id: Long)

    @Query("SELECT COUNT(*) FROM repair_tickets")
    suspend fun getTicketCount(): Int

    // SMS Templates
    @Query("SELECT * FROM sms_templates")
    fun getAllSmsTemplates(): Flow<List<SmsTemplate>>

    @Query("SELECT * FROM sms_templates")
    suspend fun getAllSmsTemplatesDirect(): List<SmsTemplate>

    @Query("DELETE FROM sms_templates")
    suspend fun deleteAllSmsTemplates()

    @Query("SELECT * FROM sms_templates WHERE statusKey = :statusKey LIMIT 1")
    suspend fun getSmsTemplate(statusKey: String): SmsTemplate?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSmsTemplate(template: SmsTemplate)

    // Product & Inventory Stock Management
    @Query("SELECT * FROM products ORDER BY name ASC")
    fun getAllProducts(): Flow<List<ProductItem>>

    @Query("SELECT * FROM products ORDER BY name ASC")
    suspend fun getAllProductsDirect(): List<ProductItem>

    @Query("DELETE FROM products")
    suspend fun deleteAllProducts()

    @Query("SELECT * FROM products WHERE category = :category ORDER BY name ASC")
    fun getProductsByCategory(category: String): Flow<List<ProductItem>>

    @Query("""
        SELECT * FROM products 
        WHERE name LIKE '%' || :query || '%' 
           OR sku LIKE '%' || :query || '%' 
           OR category LIKE '%' || :query || '%'
        ORDER BY name ASC
    """)
    fun searchProducts(query: String): Flow<List<ProductItem>>

    @Query("SELECT * FROM products WHERE id = :id LIMIT 1")
    suspend fun getProductByIdDirect(id: Long): ProductItem?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: ProductItem): Long

    @Update
    suspend fun updateProduct(product: ProductItem)

    @Delete
    suspend fun deleteProduct(product: ProductItem)

    @Query("UPDATE products SET quantity = :newQuantity, dateUpdatedMillis = :updatedAt WHERE id = :id")
    suspend fun updateProductQuantity(id: Long, newQuantity: Int, updatedAt: Long = System.currentTimeMillis())

    @Query("SELECT COUNT(*) FROM products WHERE quantity <= lowStockThreshold")
    fun getLowStockCount(): Flow<Int>
}