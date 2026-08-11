package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Surface
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.components.AddEditProductDialog
import com.example.ui.components.AppNavDestination
import com.example.ui.components.ReceiptDialog
import com.example.ui.components.ShopDoorShutterSplashScreen
import com.example.ui.components.SideNavDrawerContent
import com.example.ui.components.SmsAlertDialog
import com.example.ui.components.SmsTemplateManagerDialog
import com.example.ui.screens.AddEditTicketDialog
import com.example.ui.screens.CustomerDirectoryScreen
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.GoogleCloudSyncScreen
import com.example.ui.screens.LoginScreen
import com.example.ui.screens.ProductManagementScreen
import com.example.ui.screens.ReportsScreen
import com.example.ui.screens.TicketDetailScreen
import com.example.ui.theme.FixTrackTheme
import com.example.ui.viewmodel.RepairViewModel
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val viewModel: RepairViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            FixTrackTheme(darkTheme = false) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    FixTrackApp(viewModel = viewModel)
                }
            }
        }
    }
}

@Composable
fun FixTrackApp(viewModel: RepairViewModel) {
    var showShopShutter by remember { mutableStateOf(true) }

    val isLoggedIn by viewModel.isLoggedIn.collectAsStateWithLifecycle()
    val currentUserName by viewModel.currentUserName.collectAsStateWithLifecycle()
    val currentUserEmail by viewModel.currentUserEmail.collectAsStateWithLifecycle()
    val authProvider by viewModel.authProvider.collectAsStateWithLifecycle()

    val currentDestination by viewModel.currentDestination.collectAsStateWithLifecycle()

    val tickets by viewModel.tickets.collectAsStateWithLifecycle()
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
    val selectedFilter by viewModel.selectedStatusFilter.collectAsStateWithLifecycle()
    val selectedTicket by viewModel.selectedTicket.collectAsStateWithLifecycle()
    val showAddEditDialog by viewModel.showAddEditDialog.collectAsStateWithLifecycle()
    val editingTicket by viewModel.editingTicket.collectAsStateWithLifecycle()

    val products by viewModel.products.collectAsStateWithLifecycle()
    val productSearchQuery by viewModel.productSearchQuery.collectAsStateWithLifecycle()
    val selectedProductCategory by viewModel.selectedProductCategory.collectAsStateWithLifecycle()
    val lowStockCount by viewModel.lowStockCount.collectAsStateWithLifecycle()
    val showAddEditProductDialog by viewModel.showAddEditProductDialog.collectAsStateWithLifecycle()
    val editingProduct by viewModel.editingProduct.collectAsStateWithLifecycle()

    val pendingSmsAlert by viewModel.pendingSmsAlert.collectAsStateWithLifecycle()
    val showSmsTemplateDialog by viewModel.showSmsTemplateDialog.collectAsStateWithLifecycle()
    val receiptTicket by viewModel.receiptTicket.collectAsStateWithLifecycle()
    val templates by viewModel.allSmsTemplates.collectAsStateWithLifecycle()

    val prefillCustomerName by viewModel.prefillCustomerName.collectAsStateWithLifecycle()
    val prefillCustomerPhone by viewModel.prefillCustomerPhone.collectAsStateWithLifecycle()

    val googleAccountState by viewModel.googleAccountState.collectAsStateWithLifecycle()
    val isSyncing by viewModel.isSyncing.collectAsStateWithLifecycle()
    val syncStatusMessage by viewModel.syncStatusMessage.collectAsStateWithLifecycle()

    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val coroutineScope = rememberCoroutineScope()

    if (!isLoggedIn) {
        LoginScreen(
            onContinueWithGoogle = { email, name ->
                viewModel.loginWithGoogle(email, name)
            },
            onContinueWithPhone = { phone, techName ->
                viewModel.loginWithPhone(phone, techName)
            },
            onContinueAsGuest = {
                viewModel.loginAsGuest()
            }
        )
    } else {
        ModalNavigationDrawer(
            drawerState = drawerState,
            drawerContent = {
                SideNavDrawerContent(
                    currentDestination = currentDestination,
                    totalTicketCount = tickets.size,
                    lowStockCount = lowStockCount,
                    userName = currentUserName,
                    userEmail = currentUserEmail,
                    authProvider = authProvider,
                    onDestinationSelected = { dest ->
                        if (dest == AppNavDestination.SMS_TEMPLATES) {
                            viewModel.openSmsTemplateManager()
                        } else {
                            viewModel.navigateToDestination(dest)
                        }
                    },
                    onLogout = {
                        viewModel.logout()
                    },
                    onCloseDrawer = {
                        coroutineScope.launch { drawerState.close() }
                    }
                )
            }
        ) {
        if (selectedTicket != null) {
            TicketDetailScreen(
                ticket = selectedTicket!!,
                allTickets = tickets,
                onBack = { viewModel.selectTicket(null) },
                onStatusChanged = { newStatus, notes ->
                    viewModel.updateTicketStatus(selectedTicket!!, newStatus, notes)
                },
                onEditTicket = { ticket -> viewModel.openEditTicketDialog(ticket) },
                onShowReceipt = { ticket -> viewModel.showReceipt(ticket) },
                onDeleteTicket = { ticket -> viewModel.deleteTicket(ticket) },
                onSendSmsAlert = { ticket ->
                    viewModel.prepareSmsNotification(ticket, ticket.currentStatusEnum)
                },
                onSelectTicket = { ticket -> viewModel.selectTicket(ticket) },
                onNewTicketForCustomer = { name, phone -> viewModel.openAddTicketDialogForCustomer(name, phone) }
            )
        } else {
            when (currentDestination) {
                AppNavDestination.REPAIR_TICKETS, AppNavDestination.SMS_TEMPLATES -> {
                    DashboardScreen(
                        tickets = tickets,
                        searchQuery = searchQuery,
                        onSearchQueryChanged = { viewModel.onSearchQueryChanged(it) },
                        selectedFilter = selectedFilter,
                        onFilterSelected = { viewModel.onStatusFilterSelected(it) },
                        onTicketClick = { ticket -> viewModel.selectTicket(ticket) },
                        onSendSmsClick = { ticket -> viewModel.prepareSmsNotification(ticket, ticket.currentStatusEnum) },
                        onNewTicketClick = { viewModel.openAddTicketDialog() },
                        onOpenSmsTemplatesClick = { viewModel.openSmsTemplateManager() },
                        onOpenCloudSyncClick = { viewModel.navigateToDestination(AppNavDestination.GOOGLE_CLOUD_SYNC) },
                        onOpenDrawer = {
                            coroutineScope.launch { drawerState.open() }
                        }
                    )
                }
                AppNavDestination.PRODUCT_INVENTORY -> {
                    ProductManagementScreen(
                        products = products,
                        searchQuery = productSearchQuery,
                        onSearchQueryChanged = { viewModel.onProductSearchQueryChanged(it) },
                        selectedCategory = selectedProductCategory,
                        onCategorySelected = { viewModel.onProductCategorySelected(it) },
                        onOpenDrawer = {
                            coroutineScope.launch { drawerState.open() }
                        },
                        onNewProductClick = { viewModel.openAddProductDialog() },
                        onEditProductClick = { product -> viewModel.openEditProductDialog(product) },
                        onDeleteProductClick = { product -> viewModel.deleteProduct(product) },
                        onAdjustQuantity = { id, delta -> viewModel.adjustProductQuantity(id, delta) }
                    )
                }
                AppNavDestination.CUSTOMERS -> {
                    CustomerDirectoryScreen(
                        tickets = tickets,
                        onSelectTicket = { ticket -> viewModel.selectTicket(ticket) },
                        onNewTicketForCustomer = { name, phone -> viewModel.openAddTicketDialogForCustomer(name, phone) },
                        onOpenDrawer = {
                            coroutineScope.launch { drawerState.open() }
                        }
                    )
                }
                AppNavDestination.REPORTS -> {
                    ReportsScreen(
                        tickets = tickets,
                        products = products,
                        onOpenDrawer = {
                            coroutineScope.launch { drawerState.open() }
                        }
                    )
                }
                AppNavDestination.GOOGLE_CLOUD_SYNC -> {
                    GoogleCloudSyncScreen(
                        accountInfo = googleAccountState,
                        isSyncing = isSyncing,
                        syncStatusMessage = syncStatusMessage,
                        onSignIn = { email, name -> viewModel.signInGmail(email, name) },
                        onSignOut = { viewModel.signOutGmail() },
                        onToggleAutoSync = { enabled -> viewModel.toggleAutoSync(enabled) },
                        onPerformBackup = { viewModel.performGoogleDriveBackup() },
                        onPerformRestore = { viewModel.performGoogleDriveRestore() },
                        onRestoreCustomJson = { jsonStr, callback ->
                            viewModel.restoreFromCustomJson(jsonStr, callback)
                        },
                        onOpenDrawer = {
                            coroutineScope.launch { drawerState.open() }
                        }
                    )
                }
            }
        }
    }

    // Animated Shop Door Shutter Splash Overlay on Wake Up
    if (showShopShutter) {
        ShopDoorShutterSplashScreen(
            onShopOpened = {
                showShopShutter = false
            }
        )
    }

    // Modal Dialog Overlays
    if (showAddEditDialog) {
        AddEditTicketDialog(
            ticket = editingTicket,
            initialCustomerName = prefillCustomerName,
            initialCustomerPhone = prefillCustomerPhone,
            onSave = { ticket -> viewModel.saveTicket(ticket) },
            onDismiss = { viewModel.closeAddEditDialog() }
        )
    }

    if (showAddEditProductDialog) {
        AddEditProductDialog(
            product = editingProduct,
            onSave = { product -> viewModel.saveProduct(product) },
            onDismiss = { viewModel.closeAddEditProductDialog() }
        )
    }

    if (pendingSmsAlert != null) {
        SmsAlertDialog(
            ticket = pendingSmsAlert!!.ticket,
            initialMessage = pendingSmsAlert!!.formattedMessage,
            onDismiss = { viewModel.dismissSmsAlert() }
        )
    }

    if (showSmsTemplateDialog) {
        SmsTemplateManagerDialog(
            templates = templates,
            onSaveTemplate = { statusKey, text ->
                viewModel.saveSmsTemplate(statusKey, text)
            },
            onDismiss = { viewModel.closeSmsTemplateManager() }
        )
    }

    if (receiptTicket != null) {
        ReceiptDialog(
            ticket = receiptTicket!!,
            onDismiss = { viewModel.closeReceipt() }
        )
    }
}
