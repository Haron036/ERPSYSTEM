// Centralized mock data for the ERP UI shell.

export const kpis = {
  revenue: { value: 2_487_320, change: 12.4 },
  orders: { value: 1_842, change: 8.1 },
  customers: { value: 3_209, change: 4.7 },
  inventory: { value: 18_402, change: -2.3 },
};

export const revenueSeries = [
  { month: "Jan", revenue: 142000, expenses: 98000, profit: 44000 },
  { month: "Feb", revenue: 168000, expenses: 102000, profit: 66000 },
  { month: "Mar", revenue: 189000, expenses: 121000, profit: 68000 },
  { month: "Apr", revenue: 205000, expenses: 128000, profit: 77000 },
  { month: "May", revenue: 221000, expenses: 134000, profit: 87000 },
  { month: "Jun", revenue: 248000, expenses: 142000, profit: 106000 },
  { month: "Jul", revenue: 267000, expenses: 155000, profit: 112000 },
  { month: "Aug", revenue: 281000, expenses: 162000, profit: 119000 },
  { month: "Sep", revenue: 298000, expenses: 171000, profit: 127000 },
  { month: "Oct", revenue: 312000, expenses: 178000, profit: 134000 },
  { month: "Nov", revenue: 334000, expenses: 189000, profit: 145000 },
  { month: "Dec", revenue: 361000, expenses: 201000, profit: 160000 },
];

export const salesByRegion = [
  { name: "North America", value: 42 },
  { name: "Europe", value: 28 },
  { name: "Asia Pacific", value: 18 },
  { name: "Latin America", value: 8 },
  { name: "MEA", value: 4 },
];

export const inventoryStatus = [
  { category: "Raw Materials", inStock: 1240, lowStock: 18, outOfStock: 3 },
  { category: "WIP", inStock: 482, lowStock: 12, outOfStock: 1 },
  { category: "Finished Goods", inStock: 2105, lowStock: 24, outOfStock: 6 },
  { category: "Packaging", inStock: 890, lowStock: 9, outOfStock: 0 },
  { category: "Spare Parts", inStock: 312, lowStock: 14, outOfStock: 2 },
];

export const recentActivities = [
  { id: 1, user: "Sarah Chen", action: "approved purchase order PO-2847", time: "2m ago", type: "approval" },
  { id: 2, user: "Marcus Wei", action: "created invoice INV-10293 for Globex Corp", time: "12m ago", type: "invoice" },
  { id: 3, user: "Priya Nair", action: "received shipment SH-4421 (1,200 units)", time: "27m ago", type: "inventory" },
  { id: 4, user: "Daniel Ortiz", action: "closed support ticket #8821", time: "48m ago", type: "crm" },
  { id: 5, user: "System", action: "auto-generated payroll for November", time: "1h ago", type: "system" },
  { id: 6, user: "Hana Suzuki", action: "added new supplier Apex Components Ltd.", time: "2h ago", type: "procurement" },
];

export const notifications = [
  { id: 1, title: "Low stock alert", body: "SKU #A-2204 below reorder point (8 left)", severity: "warning" },
  { id: 2, title: "Invoice overdue", body: "INV-10198 — Acme Industries, 14 days", severity: "destructive" },
  { id: 3, title: "Approval required", body: "PR-3391 awaiting your sign-off", severity: "info" },
  { id: 4, title: "Period close", body: "October books ready for review", severity: "info" },
];

export const employees = [
  { id: "EMP-001", name: "Sarah Chen", role: "Operations Manager", dept: "Operations", email: "sarah.c@northforge.co", status: "Active", joined: "2019-03-12" },
  { id: "EMP-002", name: "Marcus Wei", role: "Senior Accountant", dept: "Finance", email: "marcus.w@northforge.co", status: "Active", joined: "2020-07-21" },
  { id: "EMP-003", name: "Priya Nair", role: "Warehouse Lead", dept: "Logistics", email: "priya.n@northforge.co", status: "Active", joined: "2021-01-08" },
  { id: "EMP-004", name: "Daniel Ortiz", role: "CRM Specialist", dept: "Sales", email: "daniel.o@northforge.co", status: "On Leave", joined: "2018-11-03" },
  { id: "EMP-005", name: "Hana Suzuki", role: "Procurement Officer", dept: "Procurement", email: "hana.s@northforge.co", status: "Active", joined: "2022-05-19" },
  { id: "EMP-006", name: "Liam O'Brien", role: "Production Engineer", dept: "Manufacturing", email: "liam.o@northforge.co", status: "Active", joined: "2017-09-30" },
  { id: "EMP-007", name: "Aisha Khan", role: "HR Officer", dept: "Human Resources", email: "aisha.k@northforge.co", status: "Active", joined: "2020-02-14" },
  { id: "EMP-008", name: "Tomás García", role: "QA Inspector", dept: "Manufacturing", email: "tomas.g@northforge.co", status: "Active", joined: "2023-04-02" },
];

export const products = [
  { sku: "A-2201", name: "Hex Bolt M12 x 60mm", category: "Fasteners", stock: 4820, reorder: 1000, price: 0.42, supplier: "Apex Components" },
  { sku: "A-2204", name: "Steel Bearing 6204-ZZ", category: "Bearings", stock: 8, reorder: 200, price: 3.85, supplier: "TorqueWorks" },
  { sku: "B-1102", name: "Aluminum Sheet 2mm 1x2m", category: "Raw Materials", stock: 312, reorder: 80, price: 48.0, supplier: "MetalCore" },
  { sku: "B-1108", name: "Copper Wire 14AWG (300m)", category: "Raw Materials", stock: 96, reorder: 40, price: 122.5, supplier: "MetalCore" },
  { sku: "C-3001", name: "PCB Assembly Rev.4", category: "Electronics", stock: 1240, reorder: 250, price: 19.9, supplier: "Volt&Co" },
  { sku: "C-3014", name: "LCD Module 7\"", category: "Electronics", stock: 64, reorder: 100, price: 84.0, supplier: "Volt&Co" },
  { sku: "D-4400", name: "Industrial Lubricant 5L", category: "Consumables", stock: 220, reorder: 60, price: 28.5, supplier: "ChemPlus" },
  { sku: "E-5501", name: "Packaging Box L (200pk)", category: "Packaging", stock: 1820, reorder: 400, price: 0.18, supplier: "BoxLine" },
];

export const customers = [
  { id: "C-1001", name: "Globex Corp", contact: "Eleanor Moore", email: "e.moore@globex.com", country: "USA", lifetime: 482000, status: "Active" },
  { id: "C-1002", name: "Acme Industries", contact: "Rajesh Patel", email: "r.patel@acme.io", country: "USA", lifetime: 318500, status: "Overdue" },
  { id: "C-1003", name: "Initech Manufacturing", contact: "Bill Lumberg", email: "b.l@initech.com", country: "Canada", lifetime: 192300, status: "Active" },
  { id: "C-1004", name: "Soylent Ltd.", contact: "Marta Kovacs", email: "marta@soylent.eu", country: "Hungary", lifetime: 127400, status: "Active" },
  { id: "C-1005", name: "Hooli Systems", contact: "Gavin Belson", email: "gavin@hooli.com", country: "USA", lifetime: 901200, status: "Active" },
  { id: "C-1006", name: "Massive Dynamic", contact: "Nina Sharp", email: "n.sharp@md.com", country: "USA", lifetime: 612800, status: "Active" },
];

export const salesOrders = [
  { id: "SO-10293", customer: "Globex Corp", date: "2026-06-02", total: 18420.0, status: "Fulfilled", payment: "Paid" },
  { id: "SO-10294", customer: "Acme Industries", date: "2026-06-02", total: 9430.5, status: "Processing", payment: "Pending" },
  { id: "SO-10295", customer: "Hooli Systems", date: "2026-06-03", total: 42180.0, status: "Fulfilled", payment: "Paid" },
  { id: "SO-10296", customer: "Initech Manufacturing", date: "2026-06-03", total: 5120.0, status: "Quoted", payment: "—" },
  { id: "SO-10297", customer: "Massive Dynamic", date: "2026-06-04", total: 28900.0, status: "Picking", payment: "Partial" },
  { id: "SO-10298", customer: "Soylent Ltd.", date: "2026-06-05", total: 7820.0, status: "Processing", payment: "Pending" },
];

export const suppliers = [
  { id: "S-201", name: "Apex Components Ltd.", contact: "Jules Verne", country: "France", rating: 4.8, leadTime: "7 days" },
  { id: "S-202", name: "TorqueWorks", contact: "Hiroshi Tanaka", country: "Japan", rating: 4.6, leadTime: "14 days" },
  { id: "S-203", name: "MetalCore", contact: "Anya Petrov", country: "Germany", rating: 4.4, leadTime: "10 days" },
  { id: "S-204", name: "Volt&Co", contact: "Ming Zhao", country: "China", rating: 4.2, leadTime: "21 days" },
  { id: "S-205", name: "ChemPlus", contact: "Sofía Reyes", country: "Mexico", rating: 4.5, leadTime: "8 days" },
  { id: "S-206", name: "BoxLine", contact: "Owen Walsh", country: "Ireland", rating: 4.9, leadTime: "5 days" },
];

export const purchaseOrders = [
  { id: "PO-2845", supplier: "Apex Components Ltd.", date: "2026-05-30", total: 14820.0, status: "Approved" },
  { id: "PO-2846", supplier: "MetalCore", date: "2026-05-31", total: 28400.0, status: "Pending Approval" },
  { id: "PO-2847", supplier: "Volt&Co", date: "2026-06-01", total: 62200.0, status: "Approved" },
  { id: "PO-2848", supplier: "BoxLine", date: "2026-06-02", total: 3800.0, status: "Received" },
  { id: "PO-2849", supplier: "TorqueWorks", date: "2026-06-03", total: 19450.0, status: "In Transit" },
];

export const ledgerEntries = [
  { date: "2026-06-04", account: "1000 · Cash", debit: 42180.0, credit: 0, ref: "INV-10295" },
  { date: "2026-06-04", account: "4000 · Sales Revenue", debit: 0, credit: 42180.0, ref: "INV-10295" },
  { date: "2026-06-03", account: "5000 · COGS", debit: 18900.0, credit: 0, ref: "JE-7721" },
  { date: "2026-06-03", account: "1200 · Inventory", debit: 0, credit: 18900.0, ref: "JE-7721" },
  { date: "2026-06-03", account: "6100 · Payroll Expense", debit: 84200.0, credit: 0, ref: "PAY-NOV" },
  { date: "2026-06-03", account: "2100 · Payroll Payable", debit: 0, credit: 84200.0, ref: "PAY-NOV" },
  { date: "2026-06-02", account: "1000 · Cash", debit: 18420.0, credit: 0, ref: "INV-10293" },
  { date: "2026-06-02", account: "4000 · Sales Revenue", debit: 0, credit: 18420.0, ref: "INV-10293" },
];

export const projects = [
  { id: "PRJ-014", name: "Line 3 Automation Retrofit", lead: "Liam O'Brien", progress: 72, deadline: "2026-08-15", status: "On Track" },
  { id: "PRJ-015", name: "ERP Module Rollout — Phase 2", lead: "Sarah Chen", progress: 45, deadline: "2026-09-30", status: "At Risk" },
  { id: "PRJ-016", name: "Warehouse #2 Expansion", lead: "Priya Nair", progress: 18, deadline: "2026-12-01", status: "On Track" },
  { id: "PRJ-017", name: "Q4 Product Launch — Series X", lead: "Daniel Ortiz", progress: 88, deadline: "2026-07-10", status: "On Track" },
  { id: "PRJ-018", name: "ISO 9001 Recertification", lead: "Aisha Khan", progress: 60, deadline: "2026-10-22", status: "On Track" },
];

export const leads = [
  { id: "L-501", name: "Pinnacle Robotics", source: "Trade Show", stage: "Qualified", value: 84000, owner: "Daniel Ortiz" },
  { id: "L-502", name: "Helix BioTech", source: "Inbound", stage: "Proposal", value: 142000, owner: "Daniel Ortiz" },
  { id: "L-503", name: "BlueWave Marine", source: "Referral", stage: "Negotiation", value: 228000, owner: "Sarah Chen" },
  { id: "L-504", name: "Apex Aerospace", source: "Outbound", stage: "Discovery", value: 312000, owner: "Daniel Ortiz" },
  { id: "L-505", name: "GreenGrid Energy", source: "Webinar", stage: "Qualified", value: 98000, owner: "Daniel Ortiz" },
];

export const tickets = [
  { id: "T-8820", customer: "Globex Corp", subject: "Shipment delay on SO-10293", priority: "High", status: "Open", updated: "2h ago" },
  { id: "T-8821", customer: "Hooli Systems", subject: "Invoice discrepancy INV-10295", priority: "Medium", status: "Resolved", updated: "1h ago" },
  { id: "T-8822", customer: "Acme Industries", subject: "Bearing batch quality issue", priority: "High", status: "In Progress", updated: "30m ago" },
  { id: "T-8823", customer: "Soylent Ltd.", subject: "Request return label", priority: "Low", status: "Open", updated: "4h ago" },
];

export const departmentHeadcount = [
  { dept: "Manufacturing", count: 142 },
  { dept: "Logistics", count: 58 },
  { dept: "Sales", count: 34 },
  { dept: "Finance", count: 18 },
  { dept: "HR", count: 9 },
  { dept: "Engineering", count: 41 },
  {dept:"ICT",count:5},
];