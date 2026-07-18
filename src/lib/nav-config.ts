import {
  Home,
  Building2,
  Store,
  MessageSquare,
  Grid3x3,
  CreditCard,
  Wrench,
  FileText,
  Users,
  ListTodo,
  MessageSquareWarning,
  ClipboardCheck,
  Contact,
  Bell,
  Receipt,
  Calculator,
  Sparkles,
  Settings,
  User,
  Car,
  Key,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "./auth";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function primaryNav(role: Role): NavItem[] {
  if (role === "tenant") {
    return [
      { label: "Home", href: "/home", icon: Home },
      // { label: "Parking", href: "/parking", icon: Car },
      { label: "Messages", href: "/messages", icon: MessageSquare },
      { label: "More", href: "/more", icon: Grid3x3 },
    ];
  }
  return [
    { label: "Home", href: "/home", icon: Home },
    { label: "Properties", href: "/properties", icon: Building2 },
    { label: "Market", href: "/marketplace", icon: Store },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "More", href: "/more", icon: Grid3x3 },
  ];
}

export interface MoreGroup {
  title: string;
  items: { label: string; href: string; icon: LucideIcon; desc: string }[];
}

export function moreGroups(role: Role): MoreGroup[] {
  if (role === "tenant") {
    return [
      {
        title: "My Residency",
        items: [
          {
            label: "Parking & Garage",
            href: "/parking",
            icon: Car,
            desc: "View your spot and gate codes",
          },
          {
            label: "Payments",
            href: "/payments",
            icon: CreditCard,
            desc: "Payment history and records",
          },
          {
            label: "Maintenance",
            href: "/maintenance",
            icon: Wrench,
            desc: "Maintenance requests and tracking",
          },
          {
            label: "Documents",
            href: "/documents",
            icon: FileText,
            desc: "View your lease and documents",
          },
          {
            label: "Monthly Bills",
            href: "/bills",
            icon: Receipt,
            desc: "Track your utilities & suppliers",
          },
          {
            label: "Inspections",
            href: "/inspections",
            icon: ClipboardCheck,
            desc: "View upcoming property inspections",
          },
          {
            label: "Make a Complaint",
            href: "/complaints",
            icon: MessageSquareWarning,
            desc: "Submit and track your complaints",
          },
        ],
      },
      {
        title: "Account",
        items: [
          {
            label: "Notifications",
            href: "/notifications",
            icon: Bell,
            desc: "Your alerts and updates",
          },
          {
            label: "Profile & Lease",
            href: "/profile",
            icon: User,
            desc: "Your profile and lease info",
          },
          {
            label: "Settings",
            href: "/settings",
            icon: Settings,
            desc: "App preferences",
          },
        ],
      },
    ];
  }
  return [
    {
      title: "Active Management",
      items: [
        {
          label: "Current Tenants",
          href: "/tenants",
          icon: Users,
          desc: "View and manage all tenants",
        },
        {
          label: "Tasks",
          href: "/tasks",
          icon: ListTodo,
          desc: "Manage your to-do list",
        },
        {
          label: "Payments",
          href: "/payments",
          icon: CreditCard,
          desc: "Payment history and records",
        },
        {
          label: "Maintenance",
          href: "/maintenance",
          icon: Wrench,
          desc: "Maintenance requests and tracking",
        },
        {
          label: "Inspections",
          href: "/inspections",
          icon: ClipboardCheck,
          desc: "Property inspections",
        },
        {
          label: "Parking Portfolio",
          href: "/parking",
          icon: Car,
          desc: "Manage and allocate parking spots",
        },
        {
          label: "Tenant Complaints",
          href: "/complaints",
          icon: MessageSquareWarning,
          desc: "Review and resolve complaints",
        },
        {
          label: "Property Alerts",
          href: "/alerts",
          icon: Bell,
          desc: "Get notified about matching properties",
        },
        {
          label: "AI Assistant",
          href: "/ai-assistant",
          icon: Sparkles,
          desc: "Get help from AI",
        },
      ],
    },
    {
      title: "Investment & Tools",
      items: [
        {
          label: "Documents Vault",
          href: "/documents",
          icon: FileText,
          desc: "Property documents and files",
        },
        {
          label: "Financial Calculators",
          href: "/calculators",
          icon: Calculator,
          desc: "Analyze property deals and ROI",
        },
        {
          label: "Contact Directory",
          href: "/contacts",
          icon: Contact,
          desc: "Manage your contacts",
        },
        {
          label: "Exit Strategy Planning",
          href: "/more/exit-strategy",
          icon: Key,
          desc: "Capital gains, timing, and probate planning",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          label: "Profile",
          href: "/profile",
          icon: User,
          desc: "Your profile information",
        },
        {
          label: "Settings",
          href: "/settings",
          icon: Settings,
          desc: "App preferences and configuration",
        },
      ],
    },
  ];
}
