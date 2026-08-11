package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.ProductItem
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.SkyBluePrimary

val PRODUCT_CATEGORIES = listOf(
    "Screen",
    "Battery",
    "Charger & Cable",
    "Accessory",
    "Spare Part",
    "Other"
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AddEditProductDialog(
    product: ProductItem? = null,
    onSave: (ProductItem) -> Unit,
    onDismiss: () -> Unit
) {
    var name by remember { mutableStateOf(product?.name ?: "") }
    var selectedCategory by remember { mutableStateOf(product?.category ?: PRODUCT_CATEGORIES.first()) }
    var sku by remember { mutableStateOf(product?.sku ?: "") }
    var sellingPriceStr by remember { mutableStateOf(product?.sellingPrice?.let { if (it > 0) it.toString() else "" } ?: "") }
    var costPriceStr by remember { mutableStateOf(product?.costPrice?.let { if (it > 0) it.toString() else "" } ?: "") }
    var quantity by remember { mutableIntStateOf(product?.quantity ?: 10) }
    var lowStockThresholdStr by remember { mutableStateOf((product?.lowStockThreshold ?: 5).toString()) }
    var description by remember { mutableStateOf(product?.description ?: "") }

    var errorMessage by remember { mutableStateOf<String?>(null) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
                .testTag("add_edit_product_dialog"),
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 8.dp,
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Header Title
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = if (product == null) Icons.Default.AddShoppingCart else Icons.Default.Edit,
                            contentDescription = null,
                            tint = SkyBluePrimary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (product == null) "New Inventory Product" else "Edit Product",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 12.dp),
                    color = MaterialTheme.colorScheme.outlineVariant
                )

                if (errorMessage != null) {
                    Text(
                        text = errorMessage!!,
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                }

                // Product Name
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it; errorMessage = null },
                    label = { Text("Product Name *") },
                    placeholder = { Text("e.g. iPhone 14 Pro Screen") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("product_name_input"),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Product Category Chips
                Text(
                    text = "Category *",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))

                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    PRODUCT_CATEGORIES.forEach { category ->
                        val isSelected = category == selectedCategory
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .clickable { selectedCategory = category }
                                .border(
                                    width = 1.dp,
                                    color = if (isSelected) SkyBluePrimary else MaterialTheme.colorScheme.outline,
                                    shape = RoundedCornerShape(20.dp)
                                ),
                            color = if (isSelected) SkyBluePrimary else MaterialTheme.colorScheme.surfaceVariant,
                            shape = RoundedCornerShape(20.dp)
                        ) {
                            Text(
                                text = category,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // SKU Code
                OutlinedTextField(
                    value = sku,
                    onValueChange = { sku = it.uppercase() },
                    label = { Text("SKU / Item Code") },
                    placeholder = { Text("e.g. SCR-IP14P") },
                    leadingIcon = { Icon(Icons.Default.QrCode, contentDescription = null) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("product_sku_input"),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Selling Price & Cost Price
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = sellingPriceStr,
                        onValueChange = { sellingPriceStr = it },
                        label = { Text("Selling Price (₹) *") },
                        placeholder = { Text("0.00") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("product_price_input"),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = costPriceStr,
                        onValueChange = { costPriceStr = it },
                        label = { Text("Cost Price (₹)") },
                        placeholder = { Text("0.00") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("product_cost_input"),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Quantity in Stock (+ / - counter & text)
                Text(
                    text = "Stock Quantity & Threshold",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(8.dp))

                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "In Stock Quantity", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            Text(text = "$quantity units available", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = { if (quantity > 0) quantity-- },
                                modifier = Modifier
                                    .size(36.dp)
                                    .background(MaterialTheme.colorScheme.surface, CircleShape)
                            ) {
                                Icon(Icons.Default.Remove, contentDescription = "Decrease", tint = MaterialTheme.colorScheme.onSurface)
                            }

                            Text(
                                text = "$quantity",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 12.dp)
                            )

                            IconButton(
                                onClick = { quantity++ },
                                modifier = Modifier
                                    .size(36.dp)
                                    .background(SkyBluePrimary, CircleShape)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = "Increase", tint = Color.White)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = lowStockThresholdStr,
                    onValueChange = { lowStockThresholdStr = it },
                    label = { Text("Low Stock Warning Alert Level") },
                    placeholder = { Text("5") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Product Notes / Description") },
                    placeholder = { Text("Enter specifications or warranty info...") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    maxLines = 3
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Submit Button
                Button(
                    onClick = {
                        if (name.isBlank()) {
                            errorMessage = "Please enter a product name"
                            return@Button
                        }
                        val sellingPrice = sellingPriceStr.toDoubleOrNull() ?: 0.0
                        val costPrice = costPriceStr.toDoubleOrNull() ?: 0.0
                        val threshold = lowStockThresholdStr.toIntOrNull() ?: 5

                        val newProduct = ProductItem(
                            id = product?.id ?: 0L,
                            name = name.trim(),
                            category = selectedCategory,
                            sku = if (sku.isBlank()) "PRD-${(100..999).random()}" else sku.trim(),
                            sellingPrice = sellingPrice,
                            costPrice = costPrice,
                            quantity = quantity,
                            lowStockThreshold = threshold,
                            description = description.trim()
                        )
                        onSave(newProduct)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                        .testTag("save_product_btn"),
                    colors = ButtonDefaults.buttonColors(containerColor = SkyBluePrimary, contentColor = Color.White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(imageVector = Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (product == null) "Add Product to Inventory" else "Update Product Details",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                }
            }
        }
    }
}
