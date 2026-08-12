// State and Local Storage Persistence Logic for CHAND Brothers

const STORAGE_KEYS = {
  TICKETS: 'chand_repair_tickets',
  PRODUCTS: 'chand_products',
  SMS_TEMPLATES: 'chand_sms_templates',
  AUTH: 'chand_auth_user',
};

// Initial data if storage is empty (started fresh)
const INITIAL_TICKETS = [];
const INITIAL_PRODUCTS = [];

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
  // Clear out old dummy data from the browser cache
  if (!localStorage.getItem('chand_db_cleared_mock_v3')) {
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.setItem('chand_db_cleared_mock_v3', 'true');
  }

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
  const idx = tickets.findIndex(t => t.id == ticketId);
  if (idx !== -1) {
    tickets[idx].status = newStatus;
    tickets[idx].dateUpdatedMillis = Date.now();
    const notes = technicianNotes || "";
    if (notes.trim() !== "") {
      tickets[idx].technicianNotes = notes.trim();
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
