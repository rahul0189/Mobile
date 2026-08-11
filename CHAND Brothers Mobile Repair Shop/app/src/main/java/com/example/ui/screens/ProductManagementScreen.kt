package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ProductItem
import com.example.ui.components.PRODUCT_CATEGORIES
import com.example.ui.theme.AccentEmerald
import com.example.ui.theme.AccentRose
import com.example.ui.theme.SkyBluePrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductManagementScreen(
    products: List<ProductItem>,
    searchQuery: String,
    onSearchQueryChanged: (String) -> Unit,
    selectedCategory: String,
    onCategorySelected: (String) -> Unit,
    onOpenDrawer: () -> Unit,
    onNewProductClick: () -> Unit,
    onEditProductClick: (ProductItem) -> Unit,
    onDeleteProductClick: (ProductItem) -> Unit,
    onAdjustQuantity: (productId: Long, delta: Int) -> Unit
) {
    val categoriesWithAll = listOf("ALL") + PRODUCT_CATEGORIES

    val totalProductsCount = products.size
    val totalStockQty = products.sumOf { it.quantity }
    val totalInventoryValue = products.sumOf { it.totalValue }
    val lowStockCount = products.count { it.isLowStock }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Product Inventory",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "$totalProductsCount products • $totalStockQty total units in stock",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(
                        onClick = onOpenDrawer,
                        modifier = Modifier.testTag("open_nav_drawer_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Menu,
                            contentDescription = "Open Drawer",
                            tint = SkyBluePrimary
                        )
                    }
                },
                actions = {
                    IconButton(
                        onClick = onNewProductClick,
                        modifier = Modifier.testTag("add_product_top_btn")
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = SkyBluePrimary,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = "Add Product",
                                tint = Color.White,
                                modifier = Modifier
                                    .padding(6.dp)
                                    .fillMaxSize()
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNewProductClick,
                containerColor = SkyBluePrimary,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier.testTag("add_product_fab")
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "Add Product")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp)
        ) {
            // Inventory Summary Metrics Cards
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Total Stock Value
                Surface(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    color = SkyBluePrimary.copy(alpha = 0.1f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SkyBluePrimary.copy(alpha = 0.3f))
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text("CATALOG VALUE", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = SkyBluePrimary)
                        Text(
                            text = "₹${String.format("%.2f", totalInventoryValue)}",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(text = "$totalStockQty Total Units", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }

                // Low Stock Alerts
                Surface(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    color = if (lowStockCount > 0) AccentRose.copy(alpha = 0.12f) else AccentEmerald.copy(alpha = 0.12f),
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (lowStockCount > 0) AccentRose.copy(alpha = 0.3f) else AccentEmerald.copy(alpha = 0.3f)
                    )
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text(
                            text = if (lowStockCount > 0) "LOW STOCK ALERT" else "STOCK STATUS",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (lowStockCount > 0) AccentRose else AccentEmerald
                        )
                        Text(
                            text = if (lowStockCount > 0) "$lowStockCount Items Low" else "Healthy Stock",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (lowStockCount > 0) AccentRose else AccentEmerald
                        )
                        Text(
                            text = if (lowStockCount > 0) "Needs Restock" else "All items sufficient",
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // Search Field
            OutlinedTextField(
                value = searchQuery,
                onValueChange = onSearchQueryChanged,
                placeholder = { Text("Search by product name, SKU, category...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = SkyBluePrimary) },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { onSearchQueryChanged("") }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear")
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("product_search_input"),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = SkyBluePrimary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline
                )
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Category Filter Chips
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(categoriesWithAll) { category ->
                    val isSelected = category == selectedCategory
                    Surface(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .clickable { onCategorySelected(category) }
                            .border(
                                width = 1.dp,
                                color = if (isSelected) SkyBluePrimary else MaterialTheme.colorScheme.outline,
                                shape = RoundedCornerShape(20.dp)
                            ),
                        color = if (isSelected) SkyBluePrimary else MaterialTheme.colorScheme.surfaceVariant,
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Text(
                            text = if (category == "ALL") "All Products" else category,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Product Items List
            if (products.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.Inventory2,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "No products found",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Tap '+' above to add a new inventory item",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = PaddingValues(bottom = 80.dp)
                ) {
                    items(products, key = { it.id }) { product ->
                        ProductItemCard(
                            product = product,
                            onEditClick = { onEditProductClick(product) },
                            onDeleteClick = { onDeleteProductClick(product) },
                            onAdjustQuantity = { delta -> onAdjustQuantity(product.id, delta) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ProductItemCard(
    product: ProductItem,
    onEditClick: () -> Unit,
    onDeleteClick: () -> Unit,
    onAdjustQuantity: (delta: Int) -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("product_card_${product.id}"),
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 2.dp,
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            if (product.isLowStock) AccentRose.copy(alpha = 0.4f) else MaterialTheme.colorScheme.outlineVariant
        )
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Header Row: Category Badge, Name, Low Stock Warning
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = SkyBluePrimary.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = product.category.uppercase(),
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = SkyBluePrimary,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }

                        if (product.sku.isNotBlank()) {
                            Text(
                                text = "SKU: ${product.sku}",
                                fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = product.name,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                if (product.isLowStock) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = AccentRose.copy(alpha = 0.15f)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                tint = AccentRose,
                                modifier = Modifier.size(12.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "LOW STOCK",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = AccentRose
                            )
                        }
                    }
                }
            }

            if (product.description.isNotBlank()) {
                Text(
                    text = product.description,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                    modifier = Modifier.padding(vertical = 4.dp)
                )
            }

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 8.dp),
                color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
            )

            // Price & Stock Quantity Counter Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Price & Cost Info
                Column {
                    Text(
                        text = "₹${product.formattedPrice}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = SkyBluePrimary
                    )
                    if (product.costPrice > 0) {
                        Text(
                            text = "Cost: ₹${product.formattedCost}",
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Quantity Control Pill with Quick +/- Buttons
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = if (product.isLowStock) AccentRose.copy(alpha = 0.1f) else MaterialTheme.colorScheme.surfaceVariant,
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (product.isLowStock) AccentRose.copy(alpha = 0.3f) else MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
                    )
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                    ) {
                        IconButton(
                            onClick = { onAdjustQuantity(-1) },
                            modifier = Modifier
                                .size(28.dp)
                                .testTag("qty_minus_${product.id}")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Remove,
                                contentDescription = "Minus Qty",
                                modifier = Modifier.size(14.dp),
                                tint = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        Text(
                            text = "${product.quantity} in stock",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (product.isLowStock) AccentRose else MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.padding(horizontal = 6.dp)
                        )

                        IconButton(
                            onClick = { onAdjustQuantity(1) },
                            modifier = Modifier
                                .size(28.dp)
                                .testTag("qty_plus_${product.id}")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = "Plus Qty",
                                modifier = Modifier.size(14.dp),
                                tint = SkyBluePrimary
                            )
                        }
                    }
                }

                // Action Menu (Edit / Delete)
                Row {
                    IconButton(
                        onClick = onEditClick,
                        modifier = Modifier
                            .size(32.dp)
                            .testTag("edit_product_${product.id}")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Edit",
                            tint = SkyBluePrimary,
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    IconButton(
                        onClick = onDeleteClick,
                        modifier = Modifier
                            .size(32.dp)
                            .testTag("delete_product_${product.id}")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Delete",
                            tint = AccentRose,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}
