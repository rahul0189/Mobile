// State and Local Storage Persistence Logic for CHAND Brothers

const STORAGE_KEYS = {
  TICKETS: 'chand_repair_tickets',
  PRODUCTS: 'chand_products',
  SMS_TEMPLATES: 'chand_sms_templates',
  AUTH: 'chand_auth_user',
};

// Initial data if storage is empty
const INITIAL_TICKETS = [
  {
    id: 1,
    ticketNumber: "REP-1001",
    dateCreatedMillis: Date.now() - 3 * 24 * 60 * 60 * 1000,
    dateUpdatedMillis: Date.now() - 2 * 24 * 60 * 60 * 1000,
    customerName: "Rahul Sharma",
    customerPhone: "9876543210",
    mobileBrand: "OnePlus",
    mobileModel: "Nord CE 3 Lite",
    serialOrImei: "863498061234567",
    issueCategory: "Screen",
    issueDescription: "Display glass cracked. Touch works, but needs assembly replacement.",
    deviceCondition: "Scratched back cover, screen cracked",
    customerPasscode: "4321",
    estimatedCost: 3500.0,
    advancePaid: 500.0,
    partsCost: 1800.0,
    laborCost: 800.0,
    status: "READY_FOR_PICKUP",
    technicianNotes: "Replaced assembly. Tested touch and brightness. All OK.",
    isPriority: true
  },
  {
    id: 2,
    ticketNumber: "REP-1002",
    dateCreatedMillis: Date.now() - 2 * 24 * 60 * 60 * 1000,
    dateUpdatedMillis: Date.now() - 1 * 24 * 60 * 60 * 1000,
    customerName: "Pooja Patel",
    customerPhone: "9898989898",
    mobileBrand: "Samsung",
    mobileModel: "Galaxy S23 Ultra",
    serialOrImei: "351234098765432",
    issueCategory: "Battery",
    issueDescription: "Battery draining very fast. Recharging multiple times a day.",
    deviceCondition: "Mint condition",
    customerPasscode: "POOJA99",
    estimatedCost: 4500.0,
    advancePaid: 0.0,
    partsCost: 2500.0,
    laborCost: 1000.0,
    status: "IN_PROGRESS",
    technicianNotes: "Original Samsung battery ordered. Screen removal in progress.",
    isPriority: false
  },
  {
    id: 3,
    ticketNumber: "REP-1003",
    dateCreatedMillis: Date.now() - 24 * 60 * 60 * 1000,
    dateUpdatedMillis: Date.now() - 12 * 60 * 60 * 1000,
    customerName: "Amit Kumar",
    customerPhone: "9560123456",
    mobileBrand: "Xiaomi",
    mobileModel: "Redmi Note 12 Pro",
    serialOrImei: "869911223344556",
    issueCategory: "Charging Port",
    issueDescription: "Not charging. Charging port loose and only works at specific angles.",
    deviceCondition: "Dirty port, minor scuffs",
    customerPasscode: "No lock code",
    estimatedCost: 1200.0,
    advancePaid: 200.0,
    partsCost: 350.0,
    laborCost: 550.0,
    status: "RECEIVED",
    technicianNotes: "Needs CC Board replacement.",
    isPriority: false
  },
  {
    id: 4,
    ticketNumber: "REP-1004",
    dateCreatedMillis: Date.now() - 4 * 24 * 60 * 60 * 1000,
    dateUpdatedMillis: Date.now() - 4 * 24 * 60 * 60 * 1000,
    customerName: "Vikram Singh",
    customerPhone: "9001122334",
    mobileBrand: "Apple",
    mobileModel: "iPhone 13 Pro",
    serialOrImei: "359988776655443",
    issueCategory: "Water Damage",
    issueDescription: "Dropped in sink. Refuses to turn on. Red liquid indicators tripped.",
    deviceCondition: "Water indicators showing red inside SIM slot",
    customerPasscode: "8899",
    estimatedCost: 15000.0,
    advancePaid: 2000.0,
    partsCost: 8000.0,
    laborCost: 3000.0,
    status: "WAITING_FOR_PARTS",
    technicianNotes: "Board dry-cleaning done. IC ordered for power management section.",
    isPriority: true
  },
  {
    id: 5,
    ticketNumber: "REP-1005",
    dateCreatedMillis: Date.now() - 10 * 24 * 60 * 60 * 1000,
    dateUpdatedMillis: Date.now() - 9 * 24 * 60 * 60 * 1000,
    customerName: "Sandeep Verma",
    customerPhone: "9414012345",
    mobileBrand: "Vivo",
    mobileModel: "V27 Pro",
    serialOrImei: "864455009988776",
    issueCategory: "Camera",
    issueDescription: "Rear camera glass broken and blur image issues.",
    deviceCondition: "Back glass cracked around camera bump",
    customerPasscode: "123456",
    estimatedCost: 2800.0,
    advancePaid: 500.0,
    partsCost: 1200.0,
    laborCost: 800.0,
    status: "DELIVERED",
    technicianNotes: "Replaced back glass camera lens and tested focus. Perfect.",
    isPriority: false
  }
];

const INITIAL_PRODUCTS = [
  { id: 1, name: "OnePlus Nord CE 3 Screen Replacement Assembly", category: "Screen", sku: "SCR-1PL-CE3", sellingPrice: 2200.0, costPrice: 1500.0, quantity: 4, lowStockThreshold: 3, description: "OG quality LCD + Touch digitizer bundle" },
  { id: 2, name: "iPhone 13 Pro Battery replacement (3095 mAh)", category: "Battery", sku: "BAT-APL-IP13P", sellingPrice: 3200.0, costPrice: 2000.0, quantity: 8, lowStockThreshold: 5, description: "Premium grade battery with cell decoding support" },
  { id: 3, name: "Samsung S23 Ultra Curved Display Assembly", category: "Screen", sku: "SCR-SAM-S23U", sellingPrice: 18500.0, costPrice: 14000.0, quantity: 2, lowStockThreshold: 3, description: "Original Service Pack Curved Amoled display" },
  { id: 4, name: "Type-C CC Board for Redmi Note 12 Pro", category: "Spare Part", sku: "CCB-XIA-RN12P", sellingPrice: 450.0, costPrice: 180.0, quantity: 15, lowStockThreshold: 5, description: "Charging sub-board with IC support fast charge" },
  { id: 5, name: "SuperVOOC 80W Charger Adapter & Cable Kit", category: "Accessory", sku: "ACC-VOOC-80W", sellingPrice: 1999.0, costPrice: 1100.0, quantity: 2, lowStockThreshold: 5, description: "Genuine VOOC flash charger kit" },
  { id: 6, name: "iPhone Tempered Glass Protector 9H D+ clear", category: "Accessory", sku: "ACC-TMP-IPH", sellingPrice: 199.0, costPrice: 35.0, quantity: 40, lowStockThreshold: 10, description: "High-grade alignment framed tempered glass" },
  { id: 7, name: "Universal Liquid Glue T-7000 Black (110ml)", category: "Spare Part", sku: "GLU-T7000-B", sellingPrice: 350.0, costPrice: 120.0, quantity: 1, lowStockThreshold: 3, description: "Multi-purpose industrial frame bonding adhesive" }
];

const INITIAL_TEMPLATES = {
  RECEIVED: "Hello {NAME}, your device ({MODEL}) has been received at CHAND Brothers Mobile Repair Shop (Ticket #{TICKET}). Estimated quote: ₹{ESTIMATED_COST}. Status: Received.",
  DIAGNOSING: "Hello {NAME}, technician is currently diagnosing your {MODEL} (Ticket #{TICKET}). We will notify you once diagnosis is complete.",
  IN_PROGRESS: "Hello {NAME}, repair work is actively IN PROGRESS for your {MODEL} (Ticket #{TICKET}). Thank you for your patience!",
  WAITING_FOR_PARTS: "Hello {NAME}, spare parts have been ordered for your {MODEL} (Ticket #{TICKET}). Expected delay: 24-48 hours. We'll update you as soon as parts arrive.",
  READY_FOR_PICKUP: "GREAT NEWS! Hello {NAME}, your {MODEL} (Ticket #{TICKET}) is fully REPAIRED & READY FOR PICKUP! Remaining balance: ₹{BALANCE_DUE}. See you soon!",
  DELIVERED: "Thank you {NAME}! Your device {MODEL} (Ticket #{TICKET}) has been delivered. Thank you for choosing CHAND Brothers Mobile Repair Shop!",
  CANCELLED: "Hello {NAME}, ticket #{TICKET} for {MODEL} has been CANCELLED. Please visit the shop to collect your device."
};

export const REPAIR_STATUSES = {
  RECEIVED: { key: "RECEIVED", displayName: "Received", badgeColor: "#06b6d4" },
  DIAGNOSING: { key: "DIAGNOSING", displayName: "Diagnosing", badgeColor: "#6366f1" },
  IN_PROGRESS: { key: "IN_PROGRESS", displayName: "In Repair", badgeColor: "#f59e0b" },
  WAITING_FOR_PARTS: { key: "WAITING_FOR_PARTS", displayName: "Parts Ordered", badgeColor: "#f43f5e" },
  READY_FOR_PICKUP: { key: "READY_FOR_PICKUP", displayName: "Ready for Pickup", badgeColor: "#10b981" },
  DELIVERED: { key: "DELIVERED", displayName: "Delivered / Paid", badgeColor: "#64748b" },
  CANCELLED: { key: "CANCELLED", displayName: "Cancelled", badgeColor: "#f43f5e" }
};

// Database Initialization helper
export function initDb() {
  if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SMS_TEMPLATES)) {
    localStorage.setItem(STORAGE_KEYS.SMS_TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
  }
}

// Global state fetchers
export function getTickets() {
  initDb();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS)) || [];
}

export function saveTickets(tickets) {
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  // Dispatch custom event to notify listeners
  window.dispatchEvent(new Event('chand_db_update'));
}

export function getProducts() {
  initDb();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || [];
}

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  window.dispatchEvent(new Event('chand_db_update'));
}

export function getSmsTemplates() {
  initDb();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SMS_TEMPLATES)) || INITIAL_TEMPLATES;
}

export function saveSmsTemplates(templates) {
  localStorage.setItem(STORAGE_KEYS.SMS_TEMPLATES, JSON.stringify(templates));
  window.dispatchEvent(new Event('chand_db_update'));
}

// Ticket Operations
export function createOrUpdateTicket(ticket) {
  const tickets = getTickets();
  let updatedTicket = { ...ticket };

  if (!ticket.id) {
    // Generate new ticket
    const maxId = tickets.reduce((max, t) => t.id > max ? t.id : max, 0);
    updatedTicket.id = maxId + 1;
    updatedTicket.ticketNumber = `REP-${1000 + updatedTicket.id}`;
    updatedTicket.dateCreatedMillis = Date.now();
    updatedTicket.dateUpdatedMillis = Date.now();
    updatedTicket.status = ticket.status || 'RECEIVED';
    tickets.push(updatedTicket);
  } else {
    // Edit existing ticket
    updatedTicket.dateUpdatedMillis = Date.now();
    const idx = tickets.findIndex(t => t.id === ticket.id);
    if (idx !== -1) {
      tickets[idx] = updatedTicket;
    }
  }

  saveTickets(tickets);
  return updatedTicket;
}

export function updateTicketStatus(ticketId, newStatus, technicianNotes = "") {
  const tickets = getTickets();
  const idx = tickets.findIndex(t => t.id === ticketId);
  if (idx !== -1) {
    tickets[idx].status = newStatus;
    tickets[idx].dateUpdatedMillis = Date.now();
    if (technicianNotes.trim() !== "") {
      tickets[idx].technicianNotes = technicianNotes;
    }
    saveTickets(tickets);
  }
}

export function deleteTicket(ticketId) {
  const tickets = getTickets();
  const filtered = tickets.filter(t => t.id !== ticketId);
  saveTickets(filtered);
}

// Product Operations
export function createOrUpdateProduct(product) {
  const products = getProducts();
  let updatedProduct = { ...product };

  if (!product.id) {
    const maxId = products.reduce((max, p) => p.id > max ? p.id : max, 0);
    updatedProduct.id = maxId + 1;
    updatedProduct.dateUpdatedMillis = Date.now();
    products.push(updatedProduct);
  } else {
    updatedProduct.dateUpdatedMillis = Date.now();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      products[idx] = updatedProduct;
    }
  }

  saveProducts(products);
  return updatedProduct;
}

export function adjustProductQuantity(productId, delta) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1) {
    products[idx].quantity = Math.max(0, products[idx].quantity + delta);
    products[idx].dateUpdatedMillis = Date.now();
    saveProducts(products);
  }
}

export function deleteProduct(productId) {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);
  saveProducts(filtered);
}

// SMS Templates Operations
export function saveSmsTemplate(statusKey, text) {
  const templates = getSmsTemplates();
  templates[statusKey] = text;
  saveSmsTemplates(templates);
}

export function generateSmsMessage(ticket, templateText) {
  const balanceDue = (ticket.estimatedCost > 0 ? ticket.estimatedCost : (ticket.partsCost + ticket.laborCost)) - ticket.advancePaid;
  const totalCost = ticket.estimatedCost > 0 ? ticket.estimatedCost : (ticket.partsCost + ticket.laborCost);

  return templateText
    .replace(/{NAME}/g, ticket.customerName)
    .replace(/{MODEL}/g, `${ticket.mobileBrand} ${ticket.mobileModel}`)
    .replace(/{TICKET}/g, ticket.ticketNumber)
    .replace(/{STATUS}/g, REPAIR_STATUSES[ticket.status]?.displayName || ticket.status)
    .replace(/{ESTIMATED_COST}/g, Number(ticket.estimatedCost).toFixed(2))
    .replace(/{BALANCE_DUE}/g, Math.max(0, balanceDue).toFixed(2))
    .replace(/{TOTAL_COST}/g, Number(totalCost).toFixed(2));
}

// Customer Profile Calculations
export function getCustomerProfiles() {
  const tickets = getTickets();
  const customerMap = {};

  tickets.forEach(ticket => {
    const phone = ticket.customerPhone.trim();
    if (!phone) return;

    if (!customerMap[phone]) {
      customerMap[phone] = {
        customerPhone: phone,
        customerName: ticket.customerName,
        tickets: []
      };
    }
    customerMap[phone].tickets.push(ticket);
  });

  return Object.values(customerMap).map(customer => {
    const totalJobsCount = customer.tickets.length;
    const totalAmountSpent = customer.tickets.reduce((sum, t) => {
      const cost = t.estimatedCost > 0 ? t.estimatedCost : (t.partsCost + t.laborCost);
      return sum + cost;
    }, 0);
    const totalAdvancePaid = customer.tickets.reduce((sum, t) => sum + t.advancePaid, 0);
    const totalPendingBalance = customer.tickets.reduce((sum, t) => {
      const cost = t.estimatedCost > 0 ? t.estimatedCost : (t.partsCost + t.laborCost);
      const balance = cost - t.advancePaid;
      return sum + (balance > 0 ? balance : 0);
    }, 0);
    const lastVisitMillis = customer.tickets.reduce((max, t) => t.dateCreatedMillis > max ? t.dateCreatedMillis : max, 0);
    const completedJobsCount = customer.tickets.filter(t => t.status === 'DELIVERED' || t.status === 'READY_FOR_PICKUP').length;
    const activeJobsCount = customer.tickets.filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED').length;

    return {
      ...customer,
      totalJobsCount,
      totalAmountSpent,
      totalAdvancePaid,
      totalPendingBalance,
      lastVisitMillis,
      completedJobsCount,
      activeJobsCount
    };
  });
}

// Auth Helper Functions
export function getAuthUser() {
  const user = localStorage.getItem(STORAGE_KEYS.AUTH);
  return user ? JSON.parse(user) : null;
}

export function setAuthUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
  window.dispatchEvent(new Event('chand_auth_update'));
}
