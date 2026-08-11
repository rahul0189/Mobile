package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.model.ProductItem
import com.example.data.model.RepairStatus
import com.example.data.model.RepairTicket
import com.example.data.model.SmsTemplate
import com.example.data.repository.RepairRepository
import com.example.data.sync.GoogleAccountInfo
import com.example.data.sync.GoogleCloudSyncManager
import com.example.ui.components.AppNavDestination
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

@OptIn(ExperimentalCoroutinesApi::class)
class RepairViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: RepairRepository

    init {
        val database = AppDatabase.getDatabase(application)
        repository = RepairRepository(database.repairDao())
    }

    private val _isLoggedIn = MutableStateFlow(false)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    private val _currentUserName = MutableStateFlow("Chand Tech")
    val currentUserName: StateFlow<String> = _currentUserName.asStateFlow()

    private val _currentUserEmail = MutableStateFlow("chand.brothers.shop@gmail.com")
    val currentUserEmail: StateFlow<String> = _currentUserEmail.asStateFlow()

    private val _authProvider = MutableStateFlow("Guest")
    val authProvider: StateFlow<String> = _authProvider.asStateFlow()

    private val _currentDestination = MutableStateFlow(AppNavDestination.REPAIR_TICKETS)
    val currentDestination: StateFlow<AppNavDestination> = _currentDestination.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedStatusFilter = MutableStateFlow("ALL")
    val selectedStatusFilter: StateFlow<String> = _selectedStatusFilter.asStateFlow()

    val tickets: StateFlow<List<RepairTicket>> = _searchQuery.flatMapLatest { query ->
        if (query.isNotBlank()) {
            repository.searchTickets(query)
        } else {
            _selectedStatusFilter.flatMapLatest { filter ->
                repository.getTicketsByStatus(filter)
            }
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    private val _productSearchQuery = MutableStateFlow("")
    val productSearchQuery: StateFlow<String> = _productSearchQuery.asStateFlow()

    private val _selectedProductCategory = MutableStateFlow("ALL")
    val selectedProductCategory: StateFlow<String> = _selectedProductCategory.asStateFlow()

    val products: StateFlow<List<ProductItem>> = combine(
        _productSearchQuery,
        _selectedProductCategory
    ) { query, category ->
        Pair(query, category)
    }.flatMapLatest { (query, category) ->
        repository.searchProducts(query, category)
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val lowStockCount: StateFlow<Int> = repository.lowStockCount.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = 0
    )

    val allSmsTemplates: StateFlow<List<SmsTemplate>> = repository.allSmsTemplates.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    private val _selectedTicket = MutableStateFlow<RepairTicket?>(null)
    val selectedTicket: StateFlow<RepairTicket?> = _selectedTicket.asStateFlow()

    private val _showAddEditDialog = MutableStateFlow(false)
    val showAddEditDialog: StateFlow<Boolean> = _showAddEditDialog.asStateFlow()

    private val _editingTicket = MutableStateFlow<RepairTicket?>(null)
    val editingTicket: StateFlow<RepairTicket?> = _editingTicket.asStateFlow()

    private val _showAddEditProductDialog = MutableStateFlow(false)
    val showAddEditProductDialog: StateFlow<Boolean> = _showAddEditProductDialog.asStateFlow()

    private val _editingProduct = MutableStateFlow<ProductItem?>(null)
    val editingProduct: StateFlow<ProductItem?> = _editingProduct.asStateFlow()

    private val _showSmsTemplateDialog = MutableStateFlow(false)
    val showSmsTemplateDialog: StateFlow<Boolean> = _showSmsTemplateDialog.asStateFlow()

    private val _receiptTicket = MutableStateFlow<RepairTicket?>(null)
    val receiptTicket: StateFlow<RepairTicket?> = _receiptTicket.asStateFlow()

    private val _pendingSmsAlert = MutableStateFlow<PendingSmsAlert?>(null)
    val pendingSmsAlert: StateFlow<PendingSmsAlert?> = _pendingSmsAlert.asStateFlow()

    data class PendingSmsAlert(
        val ticket: RepairTicket,
        val newStatus: RepairStatus,
        val formattedMessage: String
    )

    fun navigateToDestination(destination: AppNavDestination) {
        _currentDestination.value = destination
    }

    fun onSearchQueryChanged(query: String) {
        _searchQuery.value = query
    }

    fun onStatusFilterSelected(statusKey: String) {
        _selectedStatusFilter.value = statusKey
    }

    fun onProductSearchQueryChanged(query: String) {
        _productSearchQuery.value = query
    }

    fun onProductCategorySelected(category: String) {
        _selectedProductCategory.value = category
    }

    fun openAddProductDialog() {
        _editingProduct.value = null
        _showAddEditProductDialog.value = true
    }

    fun openEditProductDialog(product: ProductItem) {
        _editingProduct.value = product
        _showAddEditProductDialog.value = true
    }

    fun closeAddEditProductDialog() {
        _showAddEditProductDialog.value = false
        _editingProduct.value = null
    }

    fun saveProduct(product: ProductItem) {
        viewModelScope.launch {
            repository.saveProduct(product)
            closeAddEditProductDialog()
            autoSyncDataIfEnabled()
        }
    }

    fun deleteProduct(product: ProductItem) {
        viewModelScope.launch {
            repository.deleteProduct(product)
            autoSyncDataIfEnabled()
        }
    }

    fun adjustProductQuantity(productId: Long, delta: Int) {
        viewModelScope.launch {
            repository.adjustProductQuantity(productId, delta)
            autoSyncDataIfEnabled()
        }
    }

    fun selectTicket(ticket: RepairTicket?) {
        _selectedTicket.value = ticket
    }

    private val _prefillCustomerName = MutableStateFlow("")
    val prefillCustomerName: StateFlow<String> = _prefillCustomerName.asStateFlow()

    private val _prefillCustomerPhone = MutableStateFlow("")
    val prefillCustomerPhone: StateFlow<String> = _prefillCustomerPhone.asStateFlow()

    fun openAddTicketDialog() {
        _editingTicket.value = null
        _prefillCustomerName.value = ""
        _prefillCustomerPhone.value = ""
        _showAddEditDialog.value = true
    }

    fun openAddTicketDialogForCustomer(name: String, phone: String) {
        _editingTicket.value = null
        _prefillCustomerName.value = name
        _prefillCustomerPhone.value = phone
        _showAddEditDialog.value = true
    }

    fun openEditTicketDialog(ticket: RepairTicket) {
        _editingTicket.value = ticket
        _showAddEditDialog.value = true
    }

    fun closeAddEditDialog() {
        _showAddEditDialog.value = false
        _editingTicket.value = null
        _prefillCustomerName.value = ""
        _prefillCustomerPhone.value = ""
    }

    fun saveTicket(ticket: RepairTicket) {
        viewModelScope.launch {
            if (ticket.id == 0L) {
                val newId = repository.insertTicket(ticket)
                val createdTicket = ticket.copy(id = newId)
                prepareSmsNotification(createdTicket, createdTicket.currentStatusEnum)
            } else {
                repository.updateTicket(ticket)
                if (_selectedTicket.value?.id == ticket.id) {
                    _selectedTicket.value = ticket
                }
            }
            closeAddEditDialog()
            autoSyncDataIfEnabled()
        }
    }

    fun updateTicketStatus(ticket: RepairTicket, newStatus: RepairStatus, technicianNotes: String = "") {
        viewModelScope.launch {
            repository.updateTicketStatus(ticket.id, newStatus, technicianNotes)
            val updatedTicket = ticket.copy(
                status = newStatus.key,
                technicianNotes = if (technicianNotes.isNotBlank()) technicianNotes else ticket.technicianNotes
            )
            if (_selectedTicket.value?.id == ticket.id) {
                _selectedTicket.value = updatedTicket
            }
            prepareSmsNotification(updatedTicket, newStatus)
            autoSyncDataIfEnabled()
        }
    }

    fun deleteTicket(ticket: RepairTicket) {
        viewModelScope.launch {
            repository.deleteTicket(ticket)
            if (_selectedTicket.value?.id == ticket.id) {
                _selectedTicket.value = null
            }
            autoSyncDataIfEnabled()
        }
    }

    fun prepareSmsNotification(ticket: RepairTicket, status: RepairStatus) {
        viewModelScope.launch {
            val rawTemplate = repository.getSmsTemplate(status.key)
            val formattedMsg = repository.generateFormattedSms(ticket, rawTemplate)
            _pendingSmsAlert.value = PendingSmsAlert(ticket, status, formattedMsg)
        }
    }

    fun dismissSmsAlert() {
        _pendingSmsAlert.value = null
    }

    fun openSmsTemplateManager() {
        _showSmsTemplateDialog.value = true
    }

    fun closeSmsTemplateManager() {
        _showSmsTemplateDialog.value = false
    }

    fun saveSmsTemplate(statusKey: String, templateText: String) {
        viewModelScope.launch {
            repository.saveSmsTemplate(SmsTemplate(statusKey, templateText))
        }
    }

    fun showReceipt(ticket: RepairTicket) {
        _receiptTicket.value = ticket
    }

    fun closeReceipt() {
        _receiptTicket.value = null
    }

    private val context = application.applicationContext

    private val _googleAccountState = MutableStateFlow(GoogleCloudSyncManager.getAccountInfo(context))
    val googleAccountState: StateFlow<GoogleAccountInfo> = _googleAccountState.asStateFlow()

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing.asStateFlow()

    private val _syncStatusMessage = MutableStateFlow("")
    val syncStatusMessage: StateFlow<String> = _syncStatusMessage.asStateFlow()

    fun loginWithGoogle(email: String, displayName: String) {
        _currentUserName.value = displayName
        _currentUserEmail.value = email
        _authProvider.value = "Google"
        _isLoggedIn.value = true
        signInGmail(email, displayName)
    }

    fun loginWithPhone(phone: String, techName: String) {
        _currentUserName.value = techName
        _currentUserEmail.value = "+91 $phone"
        _authProvider.value = "Phone"
        _isLoggedIn.value = true
    }

    fun loginAsGuest() {
        _currentUserName.value = "Guest Technician"
        _currentUserEmail.value = "guest@chandrepair.local"
        _authProvider.value = "Guest"
        _isLoggedIn.value = true
    }

    fun logout() {
        _isLoggedIn.value = false
        signOutGmail()
    }

    fun signInGmail(email: String, displayName: String) {
        GoogleCloudSyncManager.signInGmail(context, email, displayName)
        refreshGoogleAccountInfo()
    }

    fun signOutGmail() {
        GoogleCloudSyncManager.signOutGmail(context)
        refreshGoogleAccountInfo()
    }

    fun toggleAutoSync(enabled: Boolean) {
        GoogleCloudSyncManager.setAutoSync(context, enabled)
        refreshGoogleAccountInfo()
    }

    fun refreshGoogleAccountInfo() {
        val currentT = tickets.value.size
        val currentP = products.value.size
        _googleAccountState.value = GoogleCloudSyncManager.getAccountInfo(context, currentT, currentP)
    }

    fun performGoogleDriveBackup() {
        viewModelScope.launch {
            _isSyncing.value = true
            _syncStatusMessage.value = "Backing up tickets & inventory to Google Drive..."
            kotlinx.coroutines.delay(600)
            
            val tList = repository.getAllTicketsDirect()
            val pList = repository.getAllProductsDirect()
            val sList = repository.getAllSmsTemplatesDirect()

            val success = GoogleCloudSyncManager.saveBackupToDriveCloud(context, tList, pList, sList)
            if (success) {
                _syncStatusMessage.value = "Backup successfully saved to Google Drive!"
            } else {
                _syncStatusMessage.value = "Backup completed."
            }
            refreshGoogleAccountInfo()
            kotlinx.coroutines.delay(400)
            _isSyncing.value = false
        }
    }

    fun performGoogleDriveRestore() {
        viewModelScope.launch {
            _isSyncing.value = true
            _syncStatusMessage.value = "Searching for backup in Google Drive & phone storage..."
            kotlinx.coroutines.delay(800)

            val payload = GoogleCloudSyncManager.loadBackupFromDriveCloud(context)
            if (payload != null && (payload.tickets.isNotEmpty() || payload.products.isNotEmpty())) {
                _syncStatusMessage.value = "Restoring ${payload.tickets.size} tickets, ${payload.products.size} products, & templates..."
                
                repository.restoreDatabase(payload.tickets, payload.products, payload.smsTemplates)

                _syncStatusMessage.value = "Restore complete! ${payload.tickets.size} tickets restored."
            } else {
                _syncStatusMessage.value = "No previous backup file found or backup is empty."
            }
            refreshGoogleAccountInfo()
            kotlinx.coroutines.delay(400)
            _isSyncing.value = false
        }
    }

    fun restoreFromCustomJson(jsonStr: String, onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            _isSyncing.value = true
            _syncStatusMessage.value = "Verifying JSON backup payload..."
            val payload = GoogleCloudSyncManager.parseJsonPayload(jsonStr)
            if (payload != null && (payload.tickets.isNotEmpty() || payload.products.isNotEmpty())) {
                _syncStatusMessage.value = "Restoring ${payload.tickets.size} tickets and ${payload.products.size} inventory items..."
                
                repository.restoreDatabase(payload.tickets, payload.products, payload.smsTemplates)

                GoogleCloudSyncManager.saveBackupToDriveCloud(context, payload.tickets, payload.products, payload.smsTemplates)
                refreshGoogleAccountInfo()
                _isSyncing.value = false
                onResult(true, "Successfully restored ${payload.tickets.size} tickets and ${payload.products.size} products!")
            } else {
                _isSyncing.value = false
                onResult(false, "Invalid JSON backup structure or no data found in backup string.")
            }
        }
    }

    private fun autoSyncDataIfEnabled() {
        val info = _googleAccountState.value
        if (info.isAutoSyncEnabled && info.isSignedIn) {
            viewModelScope.launch {
                val tList = repository.getAllTicketsDirect()
                val pList = repository.getAllProductsDirect()
                val sList = repository.getAllSmsTemplatesDirect()
                GoogleCloudSyncManager.saveBackupToDriveCloud(context, tList, pList, sList)
                refreshGoogleAccountInfo()
            }
        }
    }
}