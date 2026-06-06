import { createRouter, createRoute, createRootRoute } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";

// Page imports
import Dashboard from "./routes/index";
import InventoryPage from "./routes/inventory";
import SalesPage from "./routes/sales";
import ProcurementPage from "./routes/procurement";
import AccountingPage from "./routes/accounting";
import EmployeesPage from "./routes/employees";
import CrmPage from "./routes/crm";
import ProjectsPage from "./routes/projects";
import ReportsPage from "./routes/reports";

const queryClient = new QueryClient();

// Root route
const rootRoute = createRootRoute();

// Child routes
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: Dashboard });
const inventoryRoute = createRoute({ getParentRoute: () => rootRoute, path: "/inventory", component: InventoryPage });
const salesRoute = createRoute({ getParentRoute: () => rootRoute, path: "/sales", component: SalesPage });
const procurementRoute = createRoute({ getParentRoute: () => rootRoute, path: "/procurement", component: ProcurementPage });
const accountingRoute = createRoute({ getParentRoute: () => rootRoute, path: "/accounting", component: AccountingPage });
const employeesRoute = createRoute({ getParentRoute: () => rootRoute, path: "/employees", component: EmployeesPage });
const crmRoute = createRoute({ getParentRoute: () => rootRoute, path: "/crm", component: CrmPage });
const projectsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/projects", component: ProjectsPage });
const reportsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/reports", component: ReportsPage });

const routeTree = rootRoute.addChildren([
  indexRoute,
  inventoryRoute,
  salesRoute,
  procurementRoute,
  accountingRoute,
  employeesRoute,
  crmRoute,
  projectsRoute,
  reportsRoute,
]);

export function getRouter() {
  return createRouter({
    routeTree,
    context: { queryClient },
  });
}