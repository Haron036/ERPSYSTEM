import { createRouter, createRoute, createRootRoute, redirect } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { token } from "./lib/api";

// Page imports
import LoginPage       from "./routes/login";
import RegisterPage    from "./routes/register"; 
import Dashboard       from "./routes/index";
import InventoryPage   from "./routes/inventory";
import SalesPage       from "./routes/sales";
import ProcurementPage from "./routes/procurement";
import AccountingPage  from "./routes/accounting";
import EmployeesPage   from "./routes/employees";
import CrmPage         from "./routes/crm";
import ProjectsPage    from "./routes/projects";
import ReportsPage     from "./routes/reports";
import ApprovalsPage   from "./routes/approvals";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,          // ← was 30_000; each hook now controls its own
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Auth guard ────────────────────────────────────────────────────────────────
function requireAuth() {
  if (!token.get()) {
    throw redirect({ to: "/login" });
  }
}

// ── Root route ────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute();

// ── Public routes ─────────────────────────────────────────────────────────────
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

// ── Protected routes ──────────────────────────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: requireAuth,
  component: Dashboard,
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory",
  beforeLoad: requireAuth,
  component: InventoryPage,
});

const salesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sales",
  beforeLoad: requireAuth,
  component: SalesPage,
});

const procurementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/procurement",
  beforeLoad: requireAuth,
  component: ProcurementPage,
});

const accountingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accounting",
  beforeLoad: requireAuth,
  component: AccountingPage,
});

const employeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/employees",
  beforeLoad: requireAuth,
  component: EmployeesPage,
});

const crmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm",
  beforeLoad: requireAuth,
  component: CrmPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  beforeLoad: requireAuth,
  component: ProjectsPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  beforeLoad: requireAuth,
  component: ReportsPage,
});

const approvalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/approvals",
  beforeLoad: requireAuth,
  component: ApprovalsPage,
});

// ── Route tree ────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  indexRoute,
  inventoryRoute,
  salesRoute,
  procurementRoute,
  accountingRoute,
  employeesRoute,
  crmRoute,
  projectsRoute,
  reportsRoute,
  approvalsRoute,
]);

export function getRouter() {
  return createRouter({
    routeTree,
    context: { queryClient },
  });
}