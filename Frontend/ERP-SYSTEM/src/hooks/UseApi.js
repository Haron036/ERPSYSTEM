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
  notificationsApi,
  leaveRequestsApi,
  api,
} from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
//  QUERY KEYS
// ─────────────────────────────────────────────────────────────────────────────
export const QK = {
  kpis:             ["kpis"],
  employees:        ["employees"],
  employee:         (id) => ["employees", id],
  customers:        ["customers"],
  customer:         (id) => ["customers", id],
  suppliers:        ["suppliers"],
  supplier:         (id) => ["suppliers", id],
  products:         ["products"],
  product:          (id) => ["products", id],
  productBySku:     (sku) => ["products", "sku", sku],
  lowStock:         ["products", "low-stock"],
  salesOrders:      ["sales-orders"],
  salesOrder:       (id) => ["sales-orders", id],
  purchaseOrders:   ["purchase-orders"],
  purchaseOrder:    (id) => ["purchase-orders", id],
  ledger:           ["ledger"],
  projects:         ["projects"],
  project:          (id) => ["projects", id],
  leads:            ["leads"],
  lead:             (id) => ["leads", id],
  tickets:          ["tickets"],
  ticket:           (id) => ["tickets", id],
  approvalsPending: ["approvals-pending"],
  leaveRequests:    ["leave-requests"], 
};

// ─────────────────────────────────────────────────────────────────────────────
//  MUTATION FACTORY
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

export function useKpis() {
  return useQuery({
    queryKey: QK.kpis,
    queryFn:  dashboardApi.getKpis,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useRevenueSeries() {
  return useQuery({
    queryKey: ["dashboard", "revenue-series"],
    queryFn:  dashboardApi.getRevenueSeries,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSalesByRegion() {
  return useQuery({
    queryKey: ["dashboard", "sales-by-region"],
    queryFn:  dashboardApi.getSalesByRegion,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInventoryStatus() {
  return useQuery({
    queryKey: ["dashboard", "inventory-status"],
    queryFn:  dashboardApi.getInventoryStatus,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecentActivities() {
  return useQuery({
    queryKey: ["dashboard", "recent-activities"],
    queryFn:  dashboardApi.getRecentActivities,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

// =============================================================================
//  APPROVALS
// =============================================================================
export function useApprovalsPending() {
  return useQuery({
    queryKey: QK.approvalsPending,
    queryFn: async () => {
      const res = await api.get("/approvals/pending");
      // res IS the data — your api client unwraps axios response automatically
      const d = res?.data ?? res;
      if (Array.isArray(d)) return d;
      if (d && Array.isArray(d.content)) return d.content;
      return [];
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
}
// =============================================================================
//  EMPLOYEES
// =============================================================================

export function useEmployees() {
  return useQuery({
    queryKey: QK.employees,
    queryFn:  employeesApi.getAll,
  });
}

export function useEmployee(id) {
  return useQuery({
    queryKey: QK.employee(id),
    queryFn:  () => employeesApi.getById(id),
    enabled:  !!id,
  });
}

export function useCreateEmployee(options) {
  return useMut(
    (body) => employeesApi.create(body),
    [QK.employees, QK.kpis],
    options,
  );
}

export function useUpdateEmployee(options) {
  return useMut(
    ({ id, ...body }) => employeesApi.update(id, body),
    [QK.employees],
    options,
  );
}

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

export function useCustomers() {
  return useQuery({
    queryKey: QK.customers,
    queryFn:  customersApi.getAll,
  });
}

export function useCustomer(id) {
  return useQuery({
    queryKey: QK.customer(id),
    queryFn:  () => customersApi.getById(id),
    enabled:  !!id,
  });
}

export function useCreateCustomer(options) {
  return useMut(
    (body) => customersApi.create(body),
    [QK.customers, QK.kpis],
    options,
  );
}

export function useUpdateCustomer(options) {
  return useMut(
    ({ id, ...body }) => customersApi.update(id, body),
    [QK.customers],
    options,
  );
}

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

export function useSuppliers() {
  return useQuery({
    queryKey: QK.suppliers,
    queryFn:  suppliersApi.getAll,
  });
}

export function useSupplier(id) {
  return useQuery({
    queryKey: QK.supplier(id),
    queryFn:  () => suppliersApi.getById(id),
    enabled:  !!id,
  });
}

export function useCreateSupplier(options) {
  return useMut(
    (body) => suppliersApi.create(body),
    [QK.suppliers],
    options,
  );
}

export function useUpdateSupplier(options) {
  return useMut(
    ({ id, ...body }) => suppliersApi.update(id, body),
    [QK.suppliers],
    options,
  );
}

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

export function useProducts() {
  return useQuery({
    queryKey: QK.products,
    queryFn:  productsApi.getAll,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: QK.product(id),
    queryFn:  () => productsApi.getById(id),
    enabled:  !!id,
  });
}

export function useProductBySku(sku) {
  return useQuery({
    queryKey: QK.productBySku(sku),
    queryFn:  () => productsApi.getBySku(sku),
    enabled:  typeof sku === "string" && sku.trim().length > 0,
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: QK.lowStock,
    queryFn:  productsApi.getLowStock,
  });
}

export function useCreateProduct(options) {
  return useMut(
    (body) => productsApi.create(body),
    [QK.products, QK.lowStock, QK.kpis],
    options,
  );
}

export function useUpdateProduct(options) {
  return useMut(
    ({ id, ...body }) => productsApi.update(id, body),
    [QK.products, QK.lowStock, QK.kpis],
    options,
  );
}

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

export function useSalesOrders() {
  return useQuery({
    queryKey: QK.salesOrders,
    queryFn:  salesOrdersApi.getAll,
  });
}

export function useSalesOrder(id) {
  return useQuery({
    queryKey: QK.salesOrder(id),
    queryFn:  () => salesOrdersApi.getById(id),
    enabled:  !!id,
  });
}

export function useCreateSalesOrder(options) {
  return useMut(
    (body) => salesOrdersApi.create(body),
    [QK.salesOrders, QK.kpis],
    options,
  );
}

export function useUpdateSalesOrderStatus(options) {
  return useMut(
    ({ id, status }) => salesOrdersApi.updateStatus(id, status),
    [QK.salesOrders, QK.kpis],
    options,
  );
}

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

export function usePurchaseOrders() {
  return useQuery({
    queryKey: QK.purchaseOrders,
    queryFn:  purchaseOrdersApi.getAll,
  });
}

export function usePurchaseOrder(id) {
  return useQuery({
    queryKey: QK.purchaseOrder(id),
    queryFn:  () => purchaseOrdersApi.getById(id),
    enabled:  !!id,
  });
}

export function useCreatePurchaseOrder(options) {
  return useMut(
    (body) => purchaseOrdersApi.create(body),
    [QK.purchaseOrders, QK.kpis],
    options,
  );
}

export function useUpdatePurchaseOrderStatus(options) {
  return useMut(
    ({ id, status }) => purchaseOrdersApi.updateStatus(id, status),
    [QK.purchaseOrders, QK.kpis],
    options,
  );
}

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

export function useLedger() {
  return useQuery({
    queryKey: QK.ledger,
    queryFn:  ledgerApi.getAll,
  });
}

export function useCreateLedgerEntry(options) {
  return useMut(
    (body) => ledgerApi.create(body),
    [QK.ledger, QK.kpis],
    options,
  );
}

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

export function useProjects() {
  return useQuery({
    queryKey: QK.projects,
    queryFn:  projectsApi.getAll,
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: QK.project(id),
    queryFn:  () => projectsApi.getById(id),
    enabled:  !!id,
  });
}

export function useCreateProject(options) {
  return useMut(
    (body) => projectsApi.create(body),
    [QK.projects],
    options,
  );
}

export function useUpdateProject(options) {
  return useMut(
    ({ id, ...body }) => projectsApi.update(id, body),
    [QK.projects],
    options,
  );
}

export function useDeleteProject(options) {
  return useMut(
    (id) => projectsApi.delete(id),
    [QK.projects],
    options,
  );
}

// =============================================================================
//  LEADS (CRM)
// =============================================================================

export function useLeads() {
  return useQuery({
    queryKey: QK.leads,
    queryFn:  leadsApi.getAll,
  });
}

export function useLead(id) {
  return useQuery({
    queryKey: QK.lead(id),
    queryFn:  () => leadsApi.getById(id),
    enabled:  !!id,
  });
}

export function useCreateLead(options) {
  return useMut(
    (body) => leadsApi.create(body),
    [QK.leads, QK.kpis],
    options,
  );
}

export function useUpdateLead(options) {
  return useMut(
    ({ id, ...body }) => leadsApi.update(id, body),
    [QK.leads, QK.kpis],
    options,
  );
}

export function useDeleteLead(options) {
  return useMut(
    (id) => leadsApi.delete(id),
    [QK.leads, QK.kpis],
    options,
  );
}

// =============================================================================
//  SUPPORT TICKETS (CRM)
// =============================================================================

export function useTickets() {
  return useQuery({
    queryKey: QK.tickets,
    queryFn:  ticketsApi.getAll,
  });
}

export function useTicket(id) {
  return useQuery({
    queryKey: QK.ticket(id),
    queryFn:  () => ticketsApi.getById(id),
    enabled:  !!id,
  });
}

export function useCreateTicket(options) {
  return useMut(
    (body) => ticketsApi.create(body),
    [QK.tickets, QK.kpis],
    options,
  );
}

export function useUpdateTicketStatus(options) {
  return useMut(
    ({ id, status }) => ticketsApi.updateStatus(id, status),
    [QK.tickets, QK.kpis],
    options,
  );
}

export function useDeleteTicket(options) {
  return useMut(
    (id) => ticketsApi.delete(id),
    [QK.tickets],
    options,
  );
}

// =============================================================================
//  NOTIFICATIONS
// =============================================================================

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn:  notificationsApi.getAll,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
export function useLeaveRequests() {
  return useQuery({
    queryKey: QK.leaveRequests,
    queryFn:  leaveRequestsApi.getAll,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
 
export function useCreateLeaveRequest(options) {
  return useMut(
    (body) => leaveRequestsApi.create(body),
    [QK.leaveRequests, QK.approvalsPending, QK.employees],
    options,
  );
}
 
export function useCancelLeaveRequest(options) {
  return useMut(
    (id) => leaveRequestsApi.cancel(id),
    [QK.leaveRequests, QK.approvalsPending, QK.employees],
    options,
  );
}
 