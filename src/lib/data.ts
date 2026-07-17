// ============================================================
// PROPERTERA WEB — Mock data mirroring the Flutter app
// ============================================================

export type StatusTone = "success" | "warning" | "danger" | "info" | "primary" | "neutral";

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}`;

/* ---------------- Properties ---------------- */
export interface Property {
  id: string;
  name: string;
  type: string;
  address: string;
  image: string;
  price: string;
  value: string;
  status: "Occupied" | "Vacant";
  yield: string;
  size: string;
  tenants: string;
}
export const properties: Property[] = [
  { id: "prop_1", name: "Sunset Apartments", type: "Apartment", address: "123 Main St, Anytown, CA", image: img("photo-1545324418-cc1a3fa10c00"), price: "£1,850/mo", value: "£500,000", status: "Occupied", yield: "13.32%", size: "1.2k sqft", tenants: "3 Active" },
  { id: "prop_2", name: "Oak Avenue Property", type: "Studio", address: "789 Oak Ave, Anytown, CA", image: img("photo-1512917774080-9991f1c4c750"), price: "£1,200/mo", value: "£285,000", status: "Vacant", yield: "9.10%", size: "620 sqft", tenants: "0 Active" },
  { id: "prop_3", name: "Skyline View Condos", type: "Condo", address: "456 Market St, San Francisco, CA", image: img("photo-1600585154340-be6199f7e009"), price: "£2,500/mo", value: "£720,000", status: "Occupied", yield: "6.50%", size: "1.45k sqft", tenants: "2 Active" },
];

/* ---------------- Tenants ---------------- */
export interface Tenant {
  id: string; name: string; property: string; status: "Active" | "Expiring" | "Overdue"; rent: string; deposit: string; leaseStart: string; leaseEnd: string; email: string; phone: string;
}
export const tenants: Tenant[] = [
  { id: "ten_1", name: "Alice Johnson", property: "Sunset Apartments, Unit 4B", status: "Active", rent: "£1,850", deposit: "£2,000", leaseStart: "2024-01-01", leaseEnd: "2024-12-31", email: "alice.j@example.com", phone: "+44 7700 900121" },
  { id: "ten_2", name: "Mark Smith", property: "Oakridge Estate, Unit 12", status: "Expiring", rent: "£1,200", deposit: "£1,500", leaseStart: "2023-03-01", leaseEnd: "2024-02-28", email: "mark.s@example.com", phone: "+44 7700 900456" },
  { id: "ten_3", name: "Sarah Williams", property: "Skyline View Condos, Apt 9A", status: "Active", rent: "£2,500", deposit: "£3,000", leaseStart: "2024-06-01", leaseEnd: "2025-05-31", email: "sarah.w@example.com", phone: "+44 7700 900789" },
  { id: "ten_4", name: "James Bond", property: "Lakeside Villas, No. 7", status: "Overdue", rent: "£3,000", deposit: "£4,000", leaseStart: "2023-01-01", leaseEnd: "2023-12-31", email: "james.b@example.com", phone: "+44 7700 900099" },
];

/* ---------------- Payments ---------------- */
export interface Payment { id: string; label: string; amount: string; date: string; status: "Paid" | "Pending" | "Overdue"; tenant: string; property: string; }
export const payments: Payment[] = [
  { id: "pay_1", label: "April 2025 Rent", amount: "£1,850.00", date: "1 Apr 2025", status: "Paid", tenant: "Alice Johnson", property: "Sunset Apartments" },
  { id: "pay_2", label: "March 2025 Rent", amount: "£1,850.00", date: "1 Mar 2025", status: "Paid", tenant: "Mark Smith", property: "Oak Avenue Property" },
  { id: "pay_3", label: "February 2025 Rent", amount: "£1,850.00", date: "1 Feb 2025", status: "Paid", tenant: "Sarah Williams", property: "Skyline View Condos" },
];
// Tenant-facing payment history
export const tenantPayments: Payment[] = [
  { id: "tp_1", label: "April 2024 Rent", amount: "£1,850.00", date: "1 Apr 2024", status: "Paid", tenant: "You", property: "Sunset Apartments" },
  { id: "tp_2", label: "March 2024 Rent", amount: "£1,850.00", date: "1 Mar 2024", status: "Paid", tenant: "You", property: "Sunset Apartments" },
  { id: "tp_3", label: "February 2024 Rent", amount: "£1,850.00", date: "1 Feb 2024", status: "Paid", tenant: "You", property: "Sunset Apartments" },
];

/* ---------------- Maintenance ---------------- */
export interface MaintenanceTicket { id: string; title: string; description: string; property: string; tenant: string; priority: string; status: "scheduled" | "active" | "completed" | "cancelled"; cost: number; category: string; date: string; }
export const maintenance: MaintenanceTicket[] = [
  { id: "mnt_1", title: "HVAC System Service", description: "Annual servicing of the HVAC system at 123 Main St", property: "Sunset Apartments", tenant: "Alice Johnson", priority: "Normal", status: "scheduled", cost: 200, category: "Heating", date: "15/1/2025" },
  { id: "mnt_2", title: "Plumbing Inspection", description: "Monthly plumbing check at Oak Avenue Property", property: "Oak Avenue Property", tenant: "Mark Smith", priority: "Normal", status: "scheduled", cost: 100, category: "Plumbing", date: "15/1/2025" },
  { id: "mnt_3", title: "Emergency Leak Repair", description: "Tenant reported leaky kitchen sink - urgent fix required", property: "Skyline View Condos", tenant: "Sarah Williams", priority: "Urgent", status: "active", cost: 350, category: "Plumbing", date: "15/8/2025" },
  { id: "mnt_4", title: "Roof Leak Repair", description: "Fixed leak in master bedroom ceiling", property: "Sunset Apartments", tenant: "Alice Johnson", priority: "High", status: "completed", cost: 750, category: "Structural", date: "20/12/2024" },
  { id: "mnt_5", title: "Garbage Disposal Replacement", description: "Replaced faulty garbage disposal unit", property: "Oak Avenue Property", tenant: "Mark Smith", priority: "Normal", status: "completed", cost: 320, category: "Appliance", date: "15/12/2024" },
];
export const maintenanceCategories = ["Plumbing", "Electrical", "Heating", "Structural", "Appliance", "Pest Control", "Security", "Cleaning", "Other"];
export const maintenancePriorities = ["Low", "Normal", "High", "Urgent", "Emergency"];

/* ---------------- Contacts ---------------- */
export interface Contact { id: string; company: string; badge: string; person: string; phone: string; email: string; notes: string; added: string; }
export const contacts: Contact[] = [
  { id: "cont_1", company: "Swift Plumbing Ltd", badge: "Plumber", person: "John Swift", phone: "555-123-4567", email: "john@swiftplumbing.com", notes: "Good for emergency calls", added: "15/1/2025" },
  { id: "cont_2", company: "Bright Spark Electrical", badge: "Electrician", person: "Sarah Johnson", phone: "555-987-6543", email: "sarah@brightspark.com", notes: "Specializes in rewiring", added: "22/9/2022" },
  { id: "cont_3", company: "Prime Landscaping Co.", badge: "Landscaper", person: "Tom Green", phone: "555-246-8100", email: "tom@primelandscaping.com", notes: "Monthly garden maintenance", added: "5/3/2024" },
];

/* ---------------- Documents ---------------- */
export interface DocItem { id: string; name: string; type: string; size: string; date: string; property?: string; shared?: boolean; }
export const documents: DocItem[] = [
  { id: "doc_1", name: "Mortgage Agreement - Mountain View", type: "Mortgage", size: "3.2 MB", date: "1 Apr 2023", property: "Mountain View Estate" },
  { id: "doc_2", name: "Lease Agreement - Unit 4B", type: "Leases", size: "1.1 MB", date: "5 Jan 2024", property: "Sunset Apartments", shared: true },
  { id: "doc_3", name: "Insurance Policy 2024", type: "Insurance", size: "812 KB", date: "12 Mar 2024" },
  { id: "doc_4", name: "Inspection Report Q1", type: "Inspections", size: "2.4 MB", date: "20 Feb 2024", property: "Sunset Apartments" },
];

/* ---------------- Inspections ---------------- */
export interface Inspection { id: string; title: string; tag: "Routine" | "Move In" | "Move Out"; description: string; property: string; inspector: string; date: string; status: "Scheduled" | "Overdue" | "Valid"; }
export const inspections: Inspection[] = [
  { id: "insp_1", title: "Quarterly Property Inspection", tag: "Routine", description: "Routine quarterly inspection of property condition", property: "123 Main St, Apt 2A", inspector: "John Smith", date: "15/1/2025", status: "Scheduled" },
  { id: "insp_2", title: "Move-In Inspection", tag: "Move In", description: "Pre-tenancy inspection for new tenant", property: "456 Oak Ave, Unit 1", inspector: "Sarah Jones", date: "1/2/2025", status: "Scheduled" },
  { id: "insp_3", title: "Annual Safety Inspection", tag: "Routine", description: "Overdue annual safety and compliance check", property: "321 Elm Drive", inspector: "Tom Brown", date: "15/12/2024", status: "Overdue" },
  { id: "insp_4", title: "Move-Out Inspection", tag: "Move Out", description: "Final inspection after tenant move-out", property: "789 Pine Street", inspector: "Mike Wilson", date: "28/12/2024", status: "Valid" },
];

/* ---------------- Marketplace + JV ---------------- */
export interface MarketplaceListing { id: string; title: string; location: string; price: number; type: string; size: string; yield: number; listedDays: string; description: string; imageUrl: string; epcRating: string; ownershipPercent: number; }
export const marketplace: MarketplaceListing[] = [
  { id: "mkt_1", title: "Sunset Apartments", location: "Anytown, CA", price: 285000, type: "Apartment", size: "1,200 sq ft", yield: 6.2, listedDays: "12d", description: "Modern flat in excellent condition with high rental demand.", imageUrl: img("photo-1522708323590-d24dbb6b0267"), epcRating: "A", ownershipPercent: 50 },
  { id: "mkt_2", title: "Downtown Office Space", location: "Metropolis, NY", price: 1250000, type: "Commercial", size: "4,500 sq ft", yield: 8.5, listedDays: "3d", description: "Prime commercial real estate in the heart of the business district.", imageUrl: img("photo-1497366216548-37526070297c"), epcRating: "B", ownershipPercent: 100 },
  { id: "mkt_3", title: "Riverside Townhouse", location: "Leeds, UK", price: 420000, type: "House", size: "1,850 sq ft", yield: 5.4, listedDays: "8d", description: "Contemporary townhouse with river views and private parking.", imageUrl: img("photo-1568605114967-8130f3a36994"), epcRating: "A", ownershipPercent: 100 },
];
export interface JointVenture { id: string; title: string; projectType: string; investmentModel: string; risk: string; location: string; description: string; investmentNeeded: number; expectedReturn: number; timeline: string; partners: string; views: number; inquiries: number; daysOnMarket: string; totalProjectCost: number; imageUrl: string; leadPartnerName: string; leadPartnerContact: string; }
export const jointVentures: JointVenture[] = [
  { id: "jv1", title: "Central Manchester Development Project", projectType: "Development", investmentModel: "equity based", risk: "MEDIUM Risk", location: "Manchester City Centre", description: "Premium residential development in the heart of Manchester city centre. 24-unit luxury apartment complex with commercial space on the ground floor.", investmentNeeded: 1500000, expectedReturn: 25, timeline: "24 months", partners: "2 partners needed", views: 24, inquiries: 6, daysOnMarket: "5 days on market", totalProjectCost: 2500000, imageUrl: img("photo-1486406146926-c627a92ad1ab"), leadPartnerName: "Sarah Mitchell", leadPartnerContact: "sarah.mitchell@buildmcr.com" },
  { id: "jv2", title: "Victorian HMO Refurbishment Portfolio", projectType: "Refurbishment", investmentModel: "profit sharing", risk: "LOW Risk", location: "Sheffield, South Yorkshire", description: "Acquisition and comprehensive retrofitting of three Victorian terraced houses into high-end HMO properties targeting postgraduate students.", investmentNeeded: 350000, expectedReturn: 18, timeline: "8 months", partners: "3 partners needed", views: 42, inquiries: 12, daysOnMarket: "12 days on market", totalProjectCost: 650000, imageUrl: img("photo-1512917774080-9991f1c4c750"), leadPartnerName: "James Carter", leadPartnerContact: "j.carter@shefproperties.co.uk" },
];

/* ---------------- Chats ---------------- */
export interface Chat { id: string; name: string; preview: string; time: string; unread: number; category: "Tenant" | "Marketplace" | "Group"; address: string; }
export const chats: Chat[] = [
  { id: "chat_1", name: "Stephen Yustionio", preview: "Nice. I don't know why I ...", time: "9:30 am", unread: 1, category: "Tenant", address: "Flat 3, Riverside Court, London" },
  { id: "chat_2", name: "Sarah Johnson", preview: "The property is ready for ...", time: "9:30 am", unread: 1, category: "Tenant", address: "12 Highland Ave, Manchester" },
  { id: "chat_3", name: "Marketplace Support", preview: "Your listing is now live!", time: "8:45 am", unread: 0, category: "Marketplace", address: "Propertera Support Team" },
  { id: "chat_4", name: "London View Tenants", preview: "Tom: Does anyone know...", time: "Yesterday", unread: 3, category: "Group", address: "London View Apartments" },
  { id: "chat_5", name: "Maintenance Team", preview: "Mike: I will be there at 10...", time: "2 days ago", unread: 0, category: "Group", address: "All Properties" },
];

/* ---------------- Tenant notifications ---------------- */
export interface Notif { id: string; title: string; body: string; time: string; unread: boolean; tone: StatusTone; }
export const tenantNotifications: Notif[] = [
  { id: "n1", title: "Rent Payment Confirmed", body: "Your rent payment of £1,850.00 for May has been received.", time: "2 hours ago", unread: true, tone: "info" },
  { id: "n2", title: "Maintenance Update", body: "Your report 'Leaky Kitchen Faucet' has been scheduled for 28 Apr.", time: "1 day ago", unread: true, tone: "warning" },
  { id: "n3", title: "Lease Renewal Reminder", body: "Your lease expires in 60 days. Please review the renewal terms.", time: "3 days ago", unread: false, tone: "primary" },
  { id: "n4", title: "Issue Resolved", body: "Your report 'Broken Light Switch' has been marked as completed.", time: "5 days ago", unread: false, tone: "success" },
  { id: "n5", title: "Building Notice", body: "Scheduled water maintenance on 2 May between 10:00-14:00.", time: "1 week ago", unread: false, tone: "neutral" },
  { id: "n6", title: "Upcoming Rent Due", body: "Your rent of £1,850.00 is due on 1 May. Ensure funds are available.", time: "1 week ago", unread: false, tone: "danger" },
];

/* ---------------- Tenant bills ---------------- */
export interface Bill { id: string; type: string; supplier: string; ref: string; amount: number; dueDay: string; status: "Paid" | "Pending" | "Overdue"; phone: string; website: string; color: string; }
export const tenantBills: Bill[] = [
  { id: "b1", type: "Water", supplier: "Thames Water", ref: "TW-12345-67", amount: 45, dueDay: "1st", status: "Pending", phone: "0800 980 8800", website: "thameswater.co.uk", color: "#2196F3" },
  { id: "b2", type: "Electricity", supplier: "Octopus Energy", ref: "OE-99887-AB", amount: 78.5, dueDay: "15th", status: "Paid", phone: "0808 164 1088", website: "octopus.energy", color: "#F59E0B" },
  { id: "b3", type: "Gas", supplier: "British Gas", ref: "BG-77665-CC", amount: 55, dueDay: "15th", status: "Pending", phone: "0333 202 9802", website: "britishgas.co.uk", color: "#EF6C00" },
  { id: "b4", type: "Council Tax", supplier: "Kensington & Chelsea Council", ref: "KC-220-4B", amount: 180, dueDay: "1st", status: "Paid", phone: "020 7361 3000", website: "rbkc.gov.uk", color: "#7C3AED" },
];

/* ---------------- Complaints ---------------- */
export interface Complaint { id: string; tenant: string; property: string; category: string; title: string; description: string; urgency: "Low" | "Medium" | "High"; status: "Open" | "In Review" | "Resolved"; date: string; }
export const complaints: Complaint[] = [
  { id: "c1", tenant: "Alice Johnson", property: "Sunset Apartments, Unit 4B", category: "Property Condition", title: "Mould in Bathroom Ceiling", description: "There is visible mould growing on the bathroom ceiling near the extractor fan. It has been present for several weeks despite regular cleaning.", urgency: "High", status: "In Review", date: "12 May 2026" },
];

/* ---------------- Landlord dashboard ---------------- */
export const portfolioStats = [
  { label: "Properties", value: "433", sub: "9 Vacant units", accent: "#007aff" },
  { label: "Rent Collected", value: "£48,300", sub: "9 pending payments", accent: "#008577" },
  { label: "Active Tenants", value: "104", sub: "4 occupied units", accent: "#10b981" },
  { label: "Overdue", value: "£456", sub: "0 Action Required", accent: "#ff9500" },
];
export const revenueByMonth = [
  { month: "Jan", revenue: 11200, expenses: 4100 },
  { month: "Feb", revenue: 11800, expenses: 3800 },
  { month: "Mar", revenue: 12450, expenses: 4200 },
  { month: "Apr", revenue: 12100, expenses: 5100 },
  { month: "May", revenue: 13400, expenses: 4400 },
  { month: "Jun", revenue: 14050, expenses: 4700 },
];
export const analyticsBars = [
  { label: "Overall Occupancy", value: 92, color: "#10b981" },
  { label: "Average Rental Yield", value: 68, display: "6.8%", color: "#007aff" },
  { label: "Maintenance Output", value: 14, color: "#ff9500" },
];
export const upcomingSchedule = [
  { title: "Pipe Leak Inspection", sub: "Apt 4B, Skyline Towers", time: "Today, 2:00 PM", tone: "warning" as StatusTone },
  { title: "Lease Renewal", sub: "Tenant: Sarah Jenkins", time: "Tomorrow, 10:00 AM", tone: "info" as StatusTone },
];
export const propertyMatches = [
  { title: "Modern Apartment", location: "Mayfair, London", price: "€1,250,000", meta: "Apartment · 1,450 sq ft · 5.8% · EPC A", image: "https://picsum.photos/seed/prop1/400" },
  { title: "Sunset Villa", location: "Malibu, CA", price: "€2,800,000", meta: "House · 3,200 sq ft · 4.5% · EPC B", image: "https://picsum.photos/seed/prop2/400" },
  { title: "Urban Loft", location: "Berlin, DE", price: "€850,000", meta: "Apartment · 950 sq ft · 6.1% · EPC A", image: "https://picsum.photos/seed/prop3/400" },
];
export const recentPayments = [
  { name: "John Smith", date: "28/11/2024", amount: "£1,500.00" },
  { name: "Alice Johnson", date: "15/12/2024", amount: "£1,900.00" },
  { name: "Bob Williams", date: "9/01/2025", amount: "£2,200.00" },
];
export const propertyPins = [
  { name: "London View Apts", lat: 51.5074, lng: -0.1278, status: "Occupied" },
  { name: "Harbor Terrace", lat: 51.4995, lng: -0.1248, status: "Occupied" },
  { name: "Manchester Studio", lat: 53.4808, lng: -2.2426, status: "Vacant" },
];

/* ---------------- Tenant dashboard ---------------- */
export const tenantHome = {
  unit: "Unit 4B",
  address: "24 Kensington Gardens, London, W8 4PT",
  rent: "£1,850.00",
  leaseEnds: "Dec 2025",
};
export const tenantRecentPayments = [
  { label: "April 2024 Rent", amount: "£1,850.00", date: "1 Apr 2024" },
  { label: "March 2024 Rent", amount: "£1,850.00", date: "1 Mar 2024" },
  { label: "February 2024 Rent", amount: "£1,850.00", date: "1 Feb 2024" },
];

/* ---------------- Tone helpers ---------------- */
export function paymentTone(status: Payment["status"]): StatusTone { return status === "Paid" ? "success" : status === "Pending" ? "warning" : "danger"; }
export function tenantTone(status: Tenant["status"]): StatusTone { return status === "Active" ? "success" : status === "Expiring" ? "warning" : "danger"; }
export function maintTone(status: MaintenanceTicket["status"]): StatusTone { return status === "completed" ? "success" : status === "active" ? "info" : status === "scheduled" ? "warning" : "danger"; }
export function inspectionTone(status: Inspection["status"]): StatusTone { return status === "Valid" ? "success" : status === "Scheduled" ? "primary" : "danger"; }
export function priorityTone(p: string): StatusTone { const v = p.toLowerCase(); if (["high", "urgent", "emergency"].includes(v)) return "danger"; if (["medium", "normal"].includes(v)) return "warning"; if (v === "low") return "success"; return "neutral"; }
export function complaintTone(s: Complaint["status"]): StatusTone { return s === "Resolved" ? "success" : s === "In Review" ? "info" : "warning"; }
export function billTone(s: Bill["status"]): StatusTone { return s === "Paid" ? "success" : s === "Pending" ? "warning" : "danger"; }
