package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "products")
data class ProductItem(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val category: String, // e.g., "Screen", "Battery", "Charger & Cable", "Accessory", "Spare Part"
    val sku: String,
    val sellingPrice: Double,
    val costPrice: Double,
    val quantity: Int,
    val lowStockThreshold: Int = 5,
    val description: String = "",
    val dateUpdatedMillis: Long = System.currentTimeMillis()
) {
    val isLowStock: Boolean
        get() = quantity <= lowStockThreshold

    val totalValue: Double
        get() = sellingPrice * quantity

    val formattedPrice: String
        get() = String.format("%.2f", sellingPrice)

    val formattedCost: String
        get() = String.format("%.2f", costPrice)
}
