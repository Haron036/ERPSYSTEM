import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  dashboardApi,
  employeesApi,
  customersApi,
  suppliersApi,
  productsApi,
  salesOrdersApi,
  purchaseOrdersApi,
  ledgerApi,
  projectsApi,
  leadsApi,
  ticketsApi,
} from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
//  QUERY KEYS
//  Centralised so invalidation is consistent across all hooks
// ─────────────────────────────────────────────────────────────────────────────
export const QK = {
  kpis:           ["kpis"],
  employees:      ["employees"],
  employee:       (id) => ["employees", id],
  customers:      ["customers"],
  customer:       (id) => ["customers", id],
  suppliers:      ["suppliers"],
  supplier:       (id) => ["suppliers", id],
  products:       ["products"],
  product:        (id) => ["products", id],
  productBySku:   (sku) => ["products", "sku", sku],
  lowStock:       ["products", "low-stock"],
  salesOrders:    ["sales-orders"],
  salesOrder:     (id) => ["sales-orders", id],
  purchaseOrders: ["purchase-orders"],
  purchaseOrder:  (id) => ["purchase-orders", id],
  ledger:         ["ledger"],
  projects:       ["projects"],
  project:        (id) => ["projects", id],
  leads:          ["leads"],
  lead:           (id) => ["leads", id],
  tickets:        ["tickets"],
  ticket:         (id) => ["tickets", id],
};

// ─────────────────────────────────────────────────────────────────────────────
//  MUTATION FACTORY
//  Wraps useMutation and auto-invalidates the given query keys on success
// ─────────────────────────────────────────────────────────────────────────────
function useMut(mutFn, invalidateKeys = [], options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mutFn,
    onSuccess: (data, variables) => {
      invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      if (options.onSuccess) options.onSuccess(data, variables);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
    },
  });
}

// =============================================================================
//  DASHBOARD
// =============================================================================

/**
 * Fetches live KPI summary from /dashboard/kpis
 * Returns: { ytdRevenue, totalOrders, activeCustomers,
 *            totalInventoryUnits, lowStockCount,
 *            overdueInvoices, pendingApprovals, openTickets }
 */
export function useKpis() {
  return useQuery({
    queryKey: QK.kpis,
    queryFn:  dashboardApi.getKpis,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// =============================================================================
//  EMPLOYEES
// =============================================================================

/** Fetch all employees */
export function useEmployees() {
  return useQuery({
    queryKey: QK.employees,
    queryFn:  employeesApi.getAll,
  });
}

/** Fetch a single employee by ID */
export function useEmployee(id) {
  return useQuery({
    queryKey: QK.employee(id),
    queryFn:  () => employeesApi.getById(id),
    enabled:  !!id,
  });
}

/**
 * Create a new employee
 * Expects: { name, role, department, email, status, joinedDate }
 * Backend enums for status: ACTIVE | ON_LEAVE | TERMINATED
 */
export function useCreateEmployee(options) {
  return useMut(
    (body) => employeesApi.create(body),
    [QK.employees, QK.kpis],
    options,
  );
}

/**
 * Update an existing employee
 * Expects: { id, name, role, department, email, status, joinedDate }
 */
export function useUpdateEmployee(options) {
  return useMut(
    ({ id, ...body }) => employeesApi.update(id, body),
    [QK.employees],
    options,
  );
}

/** Delete employee by ID */
export function useDeleteEmployee(options) {
  return useMut(
    (id) => employeesApi.delete(id),
    [QK.employees, QK.kpis],
    options,
  );
}

// =============================================================================
//  CUSTOMERS
// =============================================================================

/** Fetch all customers */
export function useCustomers() {
  return useQuery({
    queryKey: QK.customers,
    queryFn:  customersApi.getAll,
  });
}

/** Fetch a single customer by ID */
export function useCustomer(id) {
  return useQuery({
    queryKey: QK.customer(id),
    queryFn:  () => customersApi.getById(id),
    enabled:  !!id,
  });
}

/**
 * Create a new customer
 * Expects: { name, contactPerson, email, country, status }
 * Backend enums for status: ACTIVE | OVERDUE | INACTIVE
 */
export function useCreateCustomer(options) {
  return useMut(
    (body) => customersApi.create(body),
    [QK.customers, QK.kpis],
    options,
  );
}

/**
 * Update an existing customer
 * Expects: { id, name, contactPerson, email, country, status }
 */
export function useUpdateCustomer(options) {
  return useMut(
    ({ id, ...body }) => customersApi.update(id, body),
    [QK.customers],
    options,
  );
}

/** Delete customer by ID */
export function useDeleteCustomer(options) {
  return useMut(
    (id) => customersApi.delete(id),
    [QK.customers, QK.kpis],
    options,
  );
}

// =============================================================================
//  SUPPLIERS
// =============================================================================

/** Fetch all suppliers */
export function useSuppliers() {
  return useQuery({
    queryKey: QK.suppliers,
    queryFn:  suppliersApi.getAll,
  });
}

/** Fetch a single supplier by ID */
export function useSupplier(id) {
  return useQuery({
    queryKey: QK.supplier(id),
    queryFn:  () => suppliersApi.getById(id),
    enabled:  !!id,
  });
}

/**
 * Create a new supplier
 * Expects: { name, contactPerson, country, rating, leadTime }
 */
export function useCreateSupplier(options) {
  return useMut(
    (body) => suppliersApi.create(body),
    [QK.suppliers],
    options,
  );
}

/**
 * Update an existing supplier
 * Expects: { id, name, contactPerson, country, rating, leadTime }
 */
export function useUpdateSupplier(options) {
  return useMut(
    ({ id, ...body }) => suppliersApi.update(id, body),
    [QK.suppliers],
    options,
  );
}

/** Delete supplier by ID */
export function useDeleteSupplier(options) {
  return useMut(
    (id) => suppliersApi.delete(id),
    [QK.suppliers],
    options,
  );
}

// =============================================================================
//  PRODUCTS / INVENTORY
// =============================================================================

/** Fetch all products */
export function useProducts() {
  return useQuery({
    queryKey: QK.products,
    queryFn:  productsApi.getAll,
  });
}

/** Fetch a single product by database ID */
export function useProduct(id) {
  return useQuery({
    queryKey: QK.product(id),
    queryFn:  () => productsApi.getById(id),
    enabled:  !!id,
  });
}

/**
 * Fetch a product by SKU string — used by the barcode scanner
 * Automatically enabled only when sku is a non-empty string
 */
export function useProductBySku(sku) {
  return useQuery({
    queryKey: QK.productBySku(sku),
    queryFn:  () => productsApi.getBySku(sku),
    enabled:  typeof sku === "string" && sku.trim().length > 0,
  });
}

/** Fetch only products below their reorder point */
export function useLowStockProducts() {
  return useQuery({
    queryKey: QK.lowStock,
    queryFn:  productsApi.getLowStock,
  });
}

/**
 * Create a new product
 * Expects: { sku, name, category, supplierId, stockQuantity, reorderPoint, unitPrice }
 */
export function useCreateProduct(options) {
  return useMut(
    (body) => productsApi.create(body),
    [QK.products, QK.lowStock, QK.kpis],
    options,
  );
}

/**
 * Update an existing product
 * Expects: { id, sku, name, category, supplierId, stockQuantity, reorderPoint, unitPrice }
 */
export function useUpdateProduct(options) {
  return useMut(
    ({ id, ...body }) => productsApi.update(id, body),
    [QK.products, QK.lowStock, QK.kpis],
    options,
  );
}

/** Delete product by ID */
export function useDeleteProduct(options) {
  return useMut(
    (id) => productsApi.delete(id),
    [QK.products, QK.lowStock, QK.kpis],
    options,
  );
}

// =============================================================================
//  SALES ORDERS
// =============================================================================

/** Fetch all sales orders */
export function useSalesOrders() {
  return useQuery({
    queryKey: QK.salesOrders,
    queryFn:  salesOrdersApi.getAll,
  });
}

/** Fetch a single sales order by ID */
export function useSalesOrder(id) {
  return useQuery({
    queryKey: QK.salesOrder(id),
    queryFn:  () => salesOrdersApi.getById(id),
    enabled:  !!id,
  });
}

/**
 * Create a new sales order
 * Expects: { customerId, orderDate, total, status?, paymentStatus?, notes? }
 * Backend enums for status:        QUOTED | PROCESSING | PICKING | FULFILLED | CANCELLED
 * Backend enums for paymentStatus: PENDING | PARTIAL | PAID
 */
export function useCreateSalesOrder(options) {
  return useMut(
    (body) => salesOrdersApi.create(body),
    [QK.salesOrders, QK.kpis],
    options,
  );
}

/**
 * Update only the status of a sales order
 * Expects: { id, status }
 */
export function useUpdateSalesOrderStatus(options) {
  return useMut(
    ({ id, status }) => salesOrdersApi.updateStatus(id, status),
    [QK.salesOrders, QK.kpis],
    options,
  );
}

/** Delete sales order by ID */
export function useDeleteSalesOrder(options) {
  return useMut(
    (id) => salesOrdersApi.delete(id),
    [QK.salesOrders, QK.kpis],
    options,
  );
}

// =============================================================================
//  PURCHASE ORDERS
// =============================================================================

/** Fetch all purchase orders */
export function usePurchaseOrders() {
  return useQuery({
    queryKey: QK.purchaseOrders,
    queryFn:  purchaseOrdersApi.getAll,
  });
}

/** Fetch a single purchase order by ID */
export function usePurchaseOrder(id) {
  return useQuery({
    queryKey: QK.purchaseOrder(id),
    queryFn:  () => purchaseOrdersApi.getById(id),
    enabled:  !!id,
  });
}

/**
 * Create a new purchase order
 * Expects: { supplierId, orderDate, total, notes? }
 * Backend always creates with status PENDING_APPROVAL
 */
export function useCreatePurchaseOrder(options) {
  return useMut(
    (body) => purchaseOrdersApi.create(body),
    [QK.purchaseOrders, QK.kpis],
    options,
  );
}

/**
 * Update only the status of a purchase order
 * Expects: { id, status }
 * Backend enums: PENDING_APPROVAL | APPROVED | IN_TRANSIT | RECEIVED | CANCELLED
 */
export function useUpdatePurchaseOrderStatus(options) {
  return useMut(
    ({ id, status }) => purchaseOrdersApi.updateStatus(id, status),
    [QK.purchaseOrders, QK.kpis],
    options,
  );
}

/** Delete purchase order by ID */
export function useDeletePurchaseOrder(options) {
  return useMut(
    (id) => purchaseOrdersApi.delete(id),
    [QK.purchaseOrders, QK.kpis],
    options,
  );
}

// =============================================================================
//  LEDGER / ACCOUNTING
// =============================================================================

/** Fetch all ledger (journal) entries */
export function useLedger() {
  return useQuery({
    queryKey: QK.ledger,
    queryFn:  ledgerApi.getAll,
  });
}

/**
 * Post a new journal entry
 * Expects: { entryDate, account, debit?, credit?, reference?, memo?, entryType? }
 * Backend enums for entryType: REVENUE | EXPENSE | TRANSFER | JOURNAL
 */
export function useCreateLedgerEntry(options) {
  return useMut(
    (body) => ledgerApi.create(body),
    [QK.ledger, QK.kpis],
    options,
  );
}

/** Delete a ledger entry by ID — ADMIN only */
export function useDeleteLedgerEntry(options) {
  return useMut(
    (id) => ledgerApi.delete(id),
    [QK.ledger, QK.kpis],
    options,
  );
}

// =============================================================================
//  PROJECTS
// =============================================================================

/** Fetch all projects */
export function useProjects() {
  return useQuery({
    queryKey: QK.projects,
    queryFn:  projectsApi.getAll,
  });
}

/** Fetch a single project by ID */
export function useProject(id) {
  return useQuery({
    queryKey: QK.project(id),
    queryFn:  () => projectsApi.getById(id),
    enabled:  !!id,
  });
}

/**
 * Create a new project
 * Expects: { name, leadName, progressPercent?, deadline, status? }
 * Backend enums for status: ON_TRACK | AT_RISK | DELAYED | COMPLETED
 */
export function useCreateProject(options) {
  return useMut(
    (body) => projectsApi.create(body),
    [QK.projects],
    options,
  );
}

/**
 * Update an existing project
 * Expects: { id, name, leadName, progressPercent, deadline, status }
 */
export function useUpdateProject(options) {
  return useMut(
    ({ id, ...body }) => projectsApi.update(id, body),
    [QK.projects],
    options,
  );
}

/** Delete project by ID */
export function useDeleteProject(options) {
  return useMut(
    (id) => projectsApi.delete(id),
    [QK.projects],
    options,
  );
}

// =============================================================================
//  LEADS  (CRM)
// =============================================================================

/** Fetch all leads */
export function useLeads() {
  return useQuery({
    queryKey: QK.leads,
    queryFn:  leadsApi.getAll,
  });
}

/** Fetch a single lead by ID */
export function useLead(id) {
  return useQuery({
    queryKey: QK.lead(id),
    queryFn:  () => leadsApi.getById(id),
    enabled:  !!id,
  });
}

/**
 * Create a new lead
 * Expects: { companyName, source, stage, estimatedValue, ownerName }
 * Backend enums for source: INBOUND | OUTBOUND | REFERRAL | TRADE_SHOW | WEBINAR
 * Backend enums for stage:  DISCOVERY | QUALIFIED | PROPOSAL | NEGOTIATION | CLOSED_WON | CLOSED_LOST
 */
export function useCreateLead(options) {
  return useMut(
    (body) => leadsApi.create(body),
    [QK.leads, QK.kpis],
    options,
  );
}

/**
 * Update an existing lead
 * Expects: { id, companyName, source, stage, estimatedValue, ownerName }
 */
export function useUpdateLead(options) {
  return useMut(
    ({ id, ...body }) => leadsApi.update(id, body),
    [QK.leads, QK.kpis],
    options,
  );
}

/** Delete lead by ID */
export function useDeleteLead(options) {
  return useMut(
    (id) => leadsApi.delete(id),
    [QK.leads, QK.kpis],
    options,
  );
}

// =============================================================================
//  SUPPORT TICKETS  (CRM)
// =============================================================================

/** Fetch all support tickets */
export function useTickets() {
  return useQuery({
    queryKey: QK.tickets,
    queryFn:  ticketsApi.getAll,
  });
}

/** Fetch a single ticket by ID */
export function useTicket(id) {
  return useQuery({
    queryKey: QK.ticket(id),
    queryFn:  () => ticketsApi.getById(id),
    enabled:  !!id,
  });
}

/**
 * Create a new support ticket
 * Expects: { customerId, subject, priority }
 * Backend enums for priority: LOW | MEDIUM | HIGH
 * Backend always creates with status OPEN
 */
export function useCreateTicket(options) {
  return useMut(
    (body) => ticketsApi.create(body),
    [QK.tickets, QK.kpis],
    options,
  );
}

/**
 * Update only the status of a ticket
 * Expects: { id, status }
 * Backend enums for status: OPEN | IN_PROGRESS | RESOLVED | CLOSED
 */
export function useUpdateTicketStatus(options) {
  return useMut(
    ({ id, status }) => ticketsApi.updateStatus(id, status),
    [QK.tickets, QK.kpis],
    options,
  );
}

/** Delete ticket by ID */
export function useDeleteTicket(options) {
  return useMut(
    (id) => ticketsApi.delete(id),
    [QK.tickets],
    options,
  );
}