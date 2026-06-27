import { createRouter, createRoute, createRootRoute, redirect } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { token } from "./lib/api";

// Page imports
import LoginPage        from "./routes/login";
import RegisterPage     from "./routes/register";
import Dashboard        from "./routes/index";
import InventoryPage    from "./routes/inventory";
import SalesPage        from "./routes/sales";
import ProcurementPage  from "./routes/procurement";
import AccountingPage   from "./routes/accounting";
import EmployeesPage    from "./routes/employees";
import CrmPage          from "./routes/crm";
import ProjectsPage     from "./routes/projects";
import ReportsPage      from "./routes/reports";
import ApprovalsPage    from "./routes/approvals";
import MyAttendancePage from "./routes/my-attendance";   // ← new

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Guard helpers ─────────────────────────────────────────────────────────────

// Any logged-in user — redirects to login if no token
function requireAuth() {
  if (!token.get()) {
    throw redirect({ to: "/login" });
  }
}

// ADMIN or MANAGER only — VIEWERs get redirected to their attendance page
function requireManager() {
  if (!token.get()) {
    throw redirect({ to: "/login" });
  }
  const user = token.user();
  if (user?.role === "VIEWER") {
    throw redirect({ to: "/my-attendance" });
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

// ── VIEWER-accessible route ───────────────────────────────────────────────────
const myAttendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-attendance",
  beforeLoad: requireAuth,          // any logged-in user can reach this
  component: MyAttendancePage,
});

// ── ADMIN / MANAGER only routes ───────────────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: requireManager,
  component: Dashboard,
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory",
  beforeLoad: requireManager,
  component: InventoryPage,
});

const salesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sales",
  beforeLoad: requireManager,
  component: SalesPage,
});

const procurementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/procurement",
  beforeLoad: requireManager,
  component: ProcurementPage,
});

const accountingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accounting",
  beforeLoad: requireManager,
  component: AccountingPage,
});

const employeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/employees",
  beforeLoad: requireManager,
  component: EmployeesPage,
});

const crmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm",
  beforeLoad: requireManager,
  component: CrmPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  beforeLoad: requireManager,
  component: ProjectsPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  beforeLoad: requireManager,
  component: ReportsPage,
});

const approvalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/approvals",
  beforeLoad: requireManager,
  component: ApprovalsPage,
});

// ── Route tree ────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  myAttendanceRoute,
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