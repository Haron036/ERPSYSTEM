// ─────────────────────────────────────────────────────────────────────────────
//  API CLIENT
//  Base URL: http://localhost:8080
//  All protected endpoints require: Authorization: Bearer <token>
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:8080/api";

// ── Token helpers ─────────────────────────────────────────────────────────────
export const token = {
  get:    ()      => localStorage.getItem("erp_token"),
  set:    (t)     => localStorage.setItem("erp_token", t),
  remove: ()      => localStorage.removeItem("erp_token"),
  user:   ()      => {
    const raw = localStorage.getItem("erp_user");
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (u)    => localStorage.setItem("erp_user", JSON.stringify(u)),
  clearAll: ()    => {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");
  },
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const t = token.get();
  if (t) headers["Authorization"] = `Bearer ${t}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // 401 → session expired, force logout
  if (res.status === 401) {
    token.clearAll();
    window.location.href = "/login";
    return;
  }

  // 204 No Content
  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    // Server returns { status, error, message } shape from GlobalExceptionHandler
    const msg =
      typeof data.message === "string"
        ? data.message
        : JSON.stringify(data.message ?? data.error ?? "Request failed");
    throw new Error(msg);
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // 🛠️ Modified to safely extract properties from a form payload object
  register: ({ fullName, email, password, role = "VIEWER" }) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password, role }),
    }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getKpis: () => apiFetch("/dashboard/kpis"),
};

// ── Employees ─────────────────────────────────────────────────────────────────
export const employeesApi = {
  getAll:  ()           => apiFetch("/employees"),
  getById: (id)         => apiFetch(`/employees/${id}`),
  create:  (body)       => apiFetch("/employees",     { method: "POST", body: JSON.stringify(body) }),
  update:  (id, body)   => apiFetch(`/employees/${id}`, { method: "PUT",  body: JSON.stringify(body) }),
  delete:  (id)         => apiFetch(`/employees/${id}`, { method: "DELETE" }),
};

// ── Customers ─────────────────────────────────────────────────────────────────
export const customersApi = {
  getAll:  ()           => apiFetch("/customers"),
  getById: (id)         => apiFetch(`/customers/${id}`),
  create:  (body)       => apiFetch("/customers",     { method: "POST", body: JSON.stringify(body) }),
  update:  (id, body)   => apiFetch(`/customers/${id}`, { method: "PUT",  body: JSON.stringify(body) }),
  delete:  (id)         => apiFetch(`/customers/${id}`, { method: "DELETE" }),
};

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const suppliersApi = {
  getAll:  ()           => apiFetch("/suppliers"),
  getById: (id)         => apiFetch(`/suppliers/${id}`),
  create:  (body)       => apiFetch("/suppliers",     { method: "POST", body: JSON.stringify(body) }),
  update:  (id, body)   => apiFetch(`/suppliers/${id}`, { method: "PUT",  body: JSON.stringify(body) }),
  delete:  (id)         => apiFetch(`/suppliers/${id}`, { method: "DELETE" }),
};

// ── Products / Inventory ──────────────────────────────────────────────────────
export const productsApi = {
  getAll:     ()        => apiFetch("/products"),
  getById:    (id)      => apiFetch(`/products/${id}`),
  getBySku:   (sku)     => apiFetch(`/products/sku/${sku}`),
  getLowStock: ()       => apiFetch("/products/low-stock"),
  create:  (body)       => apiFetch("/products",      { method: "POST", body: JSON.stringify(body) }),
  update:  (id, body)   => apiFetch(`/products/${id}`, { method: "PUT",  body: JSON.stringify(body) }),
  delete:  (id)         => apiFetch(`/products/${id}`, { method: "DELETE" }),
};

// ── Sales Orders ──────────────────────────────────────────────────────────────
export const salesOrdersApi = {
  getAll:  ()                   => apiFetch("/sales-orders"),
  getById: (id)                 => apiFetch(`/sales-orders/${id}`),
  create:  (body)               => apiFetch("/sales-orders", { method: "POST", body: JSON.stringify(body) }),
  updateStatus: (id, status)    => apiFetch(`/sales-orders/${id}/status?status=${status}`, { method: "PATCH" }),
  delete:  (id)                 => apiFetch(`/sales-orders/${id}`, { method: "DELETE" }),
};

// ── Purchase Orders ───────────────────────────────────────────────────────────
export const purchaseOrdersApi = {
  getAll:  ()                   => apiFetch("/purchase-orders"),
  getById: (id)                 => apiFetch(`/purchase-orders/${id}`),
  create:  (body)               => apiFetch("/purchase-orders", { method: "POST", body: JSON.stringify(body) }),
  updateStatus: (id, status)    => apiFetch(`/purchase-orders/${id}/status?status=${status}`, { method: "PATCH" }),
  delete:  (id)                 => apiFetch(`/purchase-orders/${id}`, { method: "DELETE" }),
};

// ── Ledger / Accounting ───────────────────────────────────────────────────────
export const ledgerApi = {
  getAll:  ()     => apiFetch("/ledger"),
  create:  (body) => apiFetch("/ledger", { method: "POST", body: JSON.stringify(body) }),
  delete:  (id)   => apiFetch(`/ledger/${id}`, { method: "DELETE" }),
};

// ── Projects ──────────────────────────────────────────────────────────────────
export const projectsApi = {
  getAll:  ()           => apiFetch("/projects"),
  getById: (id)         => apiFetch(`/projects/${id}`),
  create:  (body)       => apiFetch("/projects",      { method: "POST", body: JSON.stringify(body) }),
  update:  (id, body)   => apiFetch(`/projects/${id}`, { method: "PUT",  body: JSON.stringify(body) }),
  delete:  (id)         => apiFetch(`/projects/${id}`, { method: "DELETE" }),
};

// ── Leads ─────────────────────────────────────────────────────────────────────
export const leadsApi = {
  getAll:  ()           => apiFetch("/leads"),
  getById: (id)         => apiFetch(`/leads/${id}`),
  create:  (body)       => apiFetch("/leads",         { method: "POST", body: JSON.stringify(body) }),
  update:  (id, body)   => apiFetch(`/leads/${id}`,   { method: "PUT",  body: JSON.stringify(body) }),
  delete:  (id)         => apiFetch(`/leads/${id}`,   { method: "DELETE" }),
};

// ── Support Tickets ───────────────────────────────────────────────────────────
export const ticketsApi = {
  getAll:  ()                   => apiFetch("/tickets"),
  create:  (body)               => apiFetch("/tickets", { method: "POST", body: JSON.stringify(body) }),
  updateStatus: (id, status)    => apiFetch(`/tickets/${id}/status?status=${status}`, { method: "PATCH" }),
  delete:  (id)                 => apiFetch(`/tickets/${id}`, { method: "DELETE" }),
};