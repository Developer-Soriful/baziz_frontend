"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageTitle } from "@/components/page-title";
import { Card, Button, Badge } from "@/components/ui/primitives";
import { PillTabs, EmptyState, SearchInput, Skeleton } from "@/components/ui/misc";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { taskService, Task, TaskPriority, TaskStatus, TaskCategory, Subtask, AISuggestedTask } from "@/lib/services/task.service";
import { propertyService } from "@/lib/services/property.service";
import { teamService } from "@/lib/services/team.service";
import { CalendarView } from "@/components/tasks/CalendarView";
import {
  Plus, Check, CircleCheck, Calendar, Filter, Sparkles, AlertTriangle,
  ChevronDown, ListTodo, Wrench, Receipt, FileText, Users, ClipboardCheck,
  ShieldAlert, Trash2, CalendarDays, RefreshCw, CheckCircle2, X
} from "lucide-react";

// Categorization helper functions
const getCategoryIcon = (category: TaskCategory) => {
  switch (category) {
    case "inspection": return ClipboardCheck;
    case "compliance": return ShieldAlert;
    case "maintenance": return Wrench;
    case "financial": return Receipt;
    case "administrative": return FileText;
    case "tenant_management": return Users;
    default: return ListTodo;
  }
};

const getCategoryStyles = (category: TaskCategory) => {
  switch (category) {
    case "inspection": return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/40";
    case "compliance": return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/40";
    case "maintenance": return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40";
    case "financial": return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/40";
    case "administrative": return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/50";
    case "tenant_management": return "bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800/40";
    default: return "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/50";
  }
};

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case "high": return "#ff3b30";
    case "medium": return "#ff9500";
    default: return "#007aff";
  }
};

interface ComplianceAlert {
  key: string;
  type: "gas" | "electricity" | "smoke" | "hmo" | "insurance" | "lease";
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  category: TaskCategory;
  propertyId: string;
  propertyName: string;
}

export default function TasksPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Navigation and filtering states
  const [tab, setTab] = useState<"today" | "upcoming" | "completed">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Sorting state
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "category" | "property" | "createdAt">("dueDate");

  // Advanced filters state
  const [filterModal, setFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    priority: "all",
    category: "all",
    propertyId: "all",
    assignedTo: "all",
  });

  // Task creation/editing state
  const [createModal, setCreateModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyId: "",
    assignedTo: "",
    priority: "medium" as TaskPriority,
    status: "pending" as TaskStatus,
    category: "compliance" as TaskCategory,
    dueDate: "",
    subtasks: [] as { title: string; isCompleted: boolean }[],
    recurrence: { pattern: "none" as "none" | "weekly" | "monthly" | "quarterly" | "annually", endDate: "" }
  });

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Dismiss states for Suggestions (session-only)
  const [dismissedAlertKeys, setDismissedAlertKeys] = useState<string[]>([]);
  const [dismissedAITasks, setDismissedAITasks] = useState<string[]>([]);

  // ─── API Queries ────────────────────────────────────────────────────────────
  // Filter and search parameters are passed directly to the backend
  const { data: taskResponse, isLoading: loadingTasks } = useQuery({
    queryKey: ["tasks", tab, searchQuery, sortBy, activeFilters],
    queryFn: () => taskService.getAll({
      status: tab,
      q: searchQuery || undefined,
      sortBy: sortBy || undefined,
      priority: activeFilters.priority !== "all" ? activeFilters.priority as TaskPriority : undefined,
      category: activeFilters.category !== "all" ? activeFilters.category as TaskCategory : undefined,
      propertyId: activeFilters.propertyId !== "all" ? activeFilters.propertyId : undefined,
      assignedTo: activeFilters.assignedTo !== "all" ? activeFilters.assignedTo : undefined,
    }),
  });

  // Fetch full list in background for global stats header calculations
  const { data: statsResponse } = useQuery({
    queryKey: ["tasks-stats-raw"],
    queryFn: () => taskService.getAll(),
  });

  const { data: properties } = useQuery({
    queryKey: ["properties"],
    queryFn: propertyService.getAll,
  });

  const { data: teamMembers } = useQuery({
    queryKey: ["team-members"],
    queryFn: teamService.getMembers,
  });

  const { data: aiSuggestions } = useQuery({
    queryKey: ["ai-suggestions"],
    queryFn: taskService.getAISuggestions,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  const tasksList = taskResponse?.tasks || [];
  const rawTasksForStats = statsResponse?.tasks || [];

  // ─── Local Statistics Calculator ─────────────────────────────────────────────
  const computedStats = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const oneWeekLater = new Date(now);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);

    let total = 0;
    let active = 0;
    let completed = 0;
    let overdue = 0;
    let dueThisWeek = 0;
    let todayCount = 0;
    let upcomingCount = 0;

    rawTasksForStats.forEach((t) => {
      total++;
      const isCompleted = t.status === "completed";
      const dueDate = new Date(t.dueDate);

      if (isCompleted) {
        completed++;
      } else {
        active++;
        if (dueDate <= now) {
          todayCount++;
        } else {
          upcomingCount++;
        }

        if (dueDate < now) {
          overdue++;
        }
        if (dueDate >= now && dueDate <= oneWeekLater) {
          dueThisWeek++;
        }
      }
    });

    return { total, active, completed, overdue, dueThisWeek, todayCount, upcomingCount };
  }, [rawTasksForStats]);

  // ─── Local Expiries Scanner ──────────────────────────────────────────────────
  const complianceAlerts = useMemo(() => {
    if (!properties || !Array.isArray(properties)) return [];
    const alerts: ComplianceAlert[] = [];
    const now = new Date();

    properties.forEach((p: any) => {
      // 1. Gas CP12 (60 days)
      if (p.compliance?.gasSafetyExpiry) {
        const diffDays = Math.ceil((new Date(p.compliance.gasSafetyExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 60 && diffDays > -30) {
          alerts.push({
            key: `gas-${p.id || p._id}`,
            type: "gas",
            title: `Gas Safety CP12 Renewal`,
            description: `CP12 certificate expires in ${diffDays} days for ${p.propertyName}.`,
            dueDate: p.compliance.gasSafetyExpiry.split("T")[0],
            priority: "high",
            category: "compliance",
            propertyId: p.id || p._id,
            propertyName: p.propertyName,
          });
        }
      }

      // 2. EICR (60 days)
      if (p.compliance?.electricalSafetyExpiry) {
        const diffDays = Math.ceil((new Date(p.compliance.electricalSafetyExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 60 && diffDays > -30) {
          alerts.push({
            key: `elec-${p.id || p._id}`,
            type: "electricity",
            title: `EICR Inspection Renewal`,
            description: `5-year Electrical Safety Certificate (EICR) expires in ${diffDays} days for ${p.propertyName}.`,
            dueDate: p.compliance.electricalSafetyExpiry.split("T")[0],
            priority: "high",
            category: "compliance",
            propertyId: p.id || p._id,
            propertyName: p.propertyName,
          });
        }
      }

      // 3. Smoke Alarm (60 days)
      if (p.compliance?.smokeAlarmExpiry) {
        const diffDays = Math.ceil((new Date(p.compliance.smokeAlarmExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 60 && diffDays > -30) {
          alerts.push({
            key: `smoke-${p.id || p._id}`,
            type: "smoke",
            title: `Smoke Alarm Certificate`,
            description: `Smoke alarm warranty/inspection expires in ${diffDays} days for ${p.propertyName}.`,
            dueDate: p.compliance.smokeAlarmExpiry.split("T")[0],
            priority: "high",
            category: "compliance",
            propertyId: p.id || p._id,
            propertyName: p.propertyName,
          });
        }
      }

      // 4. HMO Licence (90 days)
      if (p.compliance?.hmoLicenceExpiry) {
        const diffDays = Math.ceil((new Date(p.compliance.hmoLicenceExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 90 && diffDays > -30) {
          alerts.push({
            key: `hmo-${p.id || p._id}`,
            type: "hmo",
            title: `HMO License Renewal`,
            description: `HMO license expires in ${diffDays} days for ${p.propertyName}. Renewals require up to 90 days.`,
            dueDate: p.compliance.hmoLicenceExpiry.split("T")[0],
            priority: "high",
            category: "compliance",
            propertyId: p.id || p._id,
            propertyName: p.propertyName,
          });
        }
      }

      // 5. Landlord Insurance (60 days)
      if (p.insurance?.renewalDate) {
        const diffDays = Math.ceil((new Date(p.insurance.renewalDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 60 && diffDays > -30) {
          alerts.push({
            key: `ins-${p.id || p._id}`,
            type: "insurance",
            title: `Landlord Insurance Renewal`,
            description: `Property insurance policy expires in ${diffDays} days for ${p.propertyName}.`,
            dueDate: p.insurance.renewalDate.split("T")[0],
            priority: "medium",
            category: "financial",
            propertyId: p.id || p._id,
            propertyName: p.propertyName,
          });
        }
      }

      // 6. Tenant Lease End (60 days)
      if (p.compliance?.leaseEnd) {
        const diffDays = Math.ceil((new Date(p.compliance.leaseEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 60 && diffDays > -30) {
          alerts.push({
            key: `lease-${p.id || p._id}`,
            type: "lease",
            title: `Tenant Lease Expiry Review`,
            description: `Lease contract expires in ${diffDays} days for ${p.propertyName}.`,
            dueDate: p.compliance.leaseEnd.split("T")[0],
            priority: "medium",
            category: "tenant_management",
            propertyId: p.id || p._id,
            propertyName: p.propertyName,
          });
        }
      }
    });

    return alerts.filter(a => !dismissedAlertKeys.includes(a.key));
  }, [properties, dismissedAlertKeys]);

  const activeAITasks = useMemo(() => {
    return (aiSuggestions || []).filter(t => !dismissedAITasks.includes(t.title));
  }, [aiSuggestions, dismissedAITasks]);

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const createTaskMutation = useMutation({
    mutationFn: taskService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast("Task created successfully!");
      setCreateModal(false);
    },
    onError: () => toast("Failed to create task", "error")
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => taskService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast("Task updated successfully!");
      setCreateModal(false);
      setEditingTask(null);
    },
    onError: () => toast("Failed to update task", "error")
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast("Task deleted.");
      setDeleteDialog(null);
    },
    onError: () => toast("Failed to delete task", "error")
  });

  const completeTaskMutation = useMutation({
    mutationFn: taskService.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast("Task completed!");
    },
    onError: () => toast("Failed to complete task", "error")
  });

  // ─── Filter & Sort Logic ──────────────────────────────────────────────────────
  const processedTasks = useMemo(() => {
    // List is already filtered, searched, and sorted by the backend API.
    // We only need to filter by calendar date if calendar view is active.
    let list = [...tasksList];
    if (viewMode === "calendar" && selectedCalendarDate) {
      list = list.filter(t => t.dueDate?.split("T")[0] === selectedCalendarDate);
    }
    return list;
  }, [tasksList, selectedCalendarDate, viewMode]);

  // ─── Operations Handlers ──────────────────────────────────────────────────────
  const handleOpenAddModal = () => {
    setEditingTask(null);
    setForm({
      title: "",
      description: "",
      propertyId: "",
      assignedTo: "",
      priority: "medium",
      status: "pending",
      category: "compliance",
      dueDate: new Date().toISOString().split("T")[0],
      subtasks: [],
      recurrence: { pattern: "none", endDate: "" }
    });
    setNewSubtaskTitle("");
    setCreateModal(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      propertyId: task.property?.id || "",
      assignedTo: task.assignee?.id || "",
      priority: task.priority,
      status: task.status,
      category: task.category,
      dueDate: task.dueDate?.split("T")[0] || "",
      subtasks: (task.subtasks || []).map(st => ({ title: st.title, isCompleted: st.isCompleted })),
      recurrence: {
        pattern: task.recurrence?.pattern || "none",
        endDate: task.recurrence?.endDate ? task.recurrence.endDate.split("T")[0] : ""
      }
    });
    setNewSubtaskTitle("");
    setCreateModal(true);
  };

  const handleSaveTask = () => {
    if (!form.title.trim()) return toast("Please enter a title", "error");
    if (!form.dueDate) return toast("Please select a due date", "error");

    const payload = {
      title: form.title,
      description: form.description,
      propertyId: form.propertyId || null,
      assignedTo: form.assignedTo || null,
      priority: form.priority,
      status: form.status,
      category: form.category,
      dueDate: form.dueDate,
      subtasks: form.subtasks,
      recurrence: {
        pattern: form.recurrence.pattern,
        endDate: form.recurrence.endDate || null
      }
    };

    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data: payload as any });
    } else {
      createTaskMutation.mutate(payload as any);
    }
  };

  const handleToggleSubtask = (task: Task, subtaskIdx: number) => {
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIdx].isCompleted = !updatedSubtasks[subtaskIdx].isCompleted;
    updatedSubtasks[subtaskIdx].completedAt = updatedSubtasks[subtaskIdx].isCompleted ? new Date().toISOString() : null;

    updateTaskMutation.mutate({
      id: task.id,
      data: { subtasks: updatedSubtasks }
    });
  };

  const handleAddSubtaskInForm = () => {
    if (!newSubtaskTitle.trim()) return;
    setForm({
      ...form,
      subtasks: [...form.subtasks, { title: newSubtaskTitle.trim(), isCompleted: false }]
    });
    setNewSubtaskTitle("");
  };

  const handleRemoveSubtaskInForm = (idx: number) => {
    setForm({
      ...form,
      subtasks: form.subtasks.filter((_, i) => i !== idx)
    });
  };

  const handleAddComplianceTask = (alert: ComplianceAlert) => {
    createTaskMutation.mutate({
      title: alert.title,
      description: alert.description,
      propertyId: alert.propertyId,
      priority: alert.priority,
      status: "pending",
      category: alert.category,
      dueDate: alert.dueDate,
      subtasks: [
        { title: "Schedule engineer / service", isCompleted: false },
        { title: "Perform inspection / maintenance", isCompleted: false },
        { title: "Obtain and upload certification documents", isCompleted: false }
      ]
    });
    setDismissedAlertKeys([...dismissedAlertKeys, alert.key]);
  };

  const handleAddAIPromotedTask = (item: AISuggestedTask) => {
    const matchedProp = (properties || []).find((p: any) => p.propertyName === item.propertyName);
    createTaskMutation.mutate({
      title: item.title,
      description: item.description,
      propertyId: matchedProp ? (matchedProp.id || matchedProp._id) : null,
      priority: item.priority,
      status: "pending",
      category: item.category,
      dueDate: item.dueDate,
      subtasks: [{ title: "Verify UK compliance documents", isCompleted: false }]
    });
    setDismissedAITasks([...dismissedAITasks, item.title]);
  };

  return (
    <div className="animate-in space-y-6">
      <PageTitle
        title="Tasks Portfolio"
        subtitle="Track safety certifications and regulatory maintenance obligations"
        action={
          <Button onClick={handleOpenAddModal} className="flex gap-2">
            <Plus className="h-4 w-4" /> Schedule Task
          </Button>
        }
      />

      {/* ─── Summary Statistics Header ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-surface border border-border flex flex-col justify-between shadow-sm">
          <span className="text-[10px] uppercase font-bold text-text-faint">Total Tasks</span>
          <span className="text-2xl font-black text-text mt-1">{computedStats.total}</span>
        </Card>
        <Card className="p-4 bg-surface border border-border flex flex-col justify-between shadow-sm">
          <span className="text-[10px] uppercase font-bold text-text-faint">Active Tasks</span>
          <span className="text-2xl font-black text-text mt-1 text-primary">{computedStats.active}</span>
        </Card>
        <Card className="p-4 bg-surface border border-border flex flex-col justify-between shadow-sm">
          <span className="text-[10px] uppercase font-bold text-text-faint">Completed</span>
          <span className="text-2xl font-black text-text mt-1 text-success">{computedStats.completed}</span>
        </Card>
        <Card className={cn("p-4 bg-surface border flex flex-col justify-between shadow-sm", computedStats.overdue > 0 ? "border-danger/30 bg-danger/[0.02]" : "border-border")}>
          <span className="text-[10px] uppercase font-bold text-text-faint">Overdue</span>
          <span className={cn("text-2xl font-black mt-1", computedStats.overdue > 0 ? "text-danger" : "text-text")}>{computedStats.overdue}</span>
        </Card>
        <Card className="p-4 bg-surface border border-border flex flex-col justify-between shadow-sm">
          <span className="text-[10px] uppercase font-bold text-text-faint">Due This Week</span>
          <span className="text-2xl font-black text-text mt-1 text-info">{computedStats.dueThisWeek}</span>
        </Card>
      </div>

      {/* ─── Compliance Alerts & Scanner Panels ─────────────────────────────────── */}
      {complianceAlerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-warning font-bold text-sm">
            <AlertTriangle className="h-4.5 w-4.5" /> Local Compliance Scanner
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {complianceAlerts.map((alert) => (
              <Card key={alert.key} className="border-l-4 border-l-warning p-4 flex gap-3.5 bg-warning/5 shadow-sm">
                <div className="flex-1">
                  <h5 className="font-bold text-sm text-text">{alert.title}</h5>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">{alert.description}</p>
                  <div className="flex gap-4 mt-3 text-[11px] font-bold text-text-faint">
                    <span>Due: {new Date(alert.dueDate).toLocaleDateString("en-GB")}</span>
                    <span>Property: {alert.propertyName}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0 justify-center">
                  <Button size="sm" onClick={() => handleAddComplianceTask(alert)}>Schedule</Button>
                  <Button size="sm" variant="secondary" onClick={() => setDismissedAlertKeys([...dismissedAlertKeys, alert.key])}>
                    Dismiss
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── AI Suggestions Panels ────────────────────────────────────────────── */}
      {activeAITasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Sparkles className="h-4.5 w-4.5 animate-pulse text-indigo-500" /> AI-Powered Compliance Advisor
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {activeAITasks.map((item) => (
              <Card key={item.title} className="w-[310px] shrink-0 border border-primary/20 bg-surface-2/40 p-4 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Badge tone="neutral" className={cn("text-[10px] font-bold border py-0.5", getCategoryStyles(item.category))}>
                      {item.category.replace("_", " ")}
                    </Badge>
                    <button onClick={() => setDismissedAITasks([...dismissedAITasks, item.title])} className="text-text-faint hover:text-text">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h6 className="font-bold text-sm text-text mt-2 truncate">{item.title}</h6>
                  <p className="text-xs text-text-muted mt-1 line-clamp-3">{item.reason}</p>
                  {item.propertyName && <p className="text-[10px] text-text-faint font-bold mt-2">Target: {item.propertyName}</p>}
                </div>
                <Button size="sm" className="mt-4 w-full" onClick={() => handleAddAIPromotedTask(item)}>
                  Add to Checklist
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── Tabs & Filters Controls ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <PillTabs
          value={tab}
          onChange={(v) => { setTab(v); setSelectedCalendarDate(null); }}
          tabs={[
            { value: "today", label: `Today (${computedStats.todayCount})` },
            { value: "upcoming", label: `Upcoming (${computedStats.upcomingCount})` },
            { value: "completed", label: `Completed (${computedStats.completed})` }
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search obligations..." className="w-56" />

          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-40 text-xs">
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="category">Sort: Category</option>
            <option value="property">Sort: Property</option>
            <option value="createdAt">Sort: Created</option>
          </Select>

          <Button variant="secondary" onClick={() => setFilterModal(true)} className="flex gap-2 text-xs">
            <Filter className="h-3.5 w-3.5" /> Filter
            {(activeFilters.priority !== "all" || activeFilters.category !== "all" || activeFilters.propertyId !== "all" || activeFilters.assignedTo !== "all") && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
            className="flex gap-2 text-xs"
          >
            {viewMode === "list" ? <CalendarDays className="h-3.5 w-3.5" /> : <ListTodo className="h-3.5 w-3.5" />}
            {viewMode === "list" ? "Calendar" : "List"}
          </Button>
        </div>
      </div>

      {/* ─── Main Workspace Area ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View Panel */}
        {viewMode === "calendar" && (
          <div className="lg:col-span-1">
            <CalendarView
              tasks={tasksList}
              selectedDate={selectedCalendarDate}
              onSelectDate={setSelectedCalendarDate}
            />
          </div>
        )}

        {/* Tasks List Grid */}
        <div className={cn("space-y-3", viewMode === "calendar" ? "lg:col-span-2" : "lg:col-span-3")}>
          {loadingTasks ? (
            <Card className="p-4 space-y-4 shadow-sm">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </Card>
          ) : processedTasks.length === 0 ? (
            <Card className="shadow-sm">
              <EmptyState
                icon={CircleCheck}
                title="Obligations Clear"
                message={selectedCalendarDate ? `No deadlines scheduled for ${new Date(selectedCalendarDate).toLocaleDateString("en-GB")}.` : "All compliance obligations are resolved."}
              />
            </Card>
          ) : (
            processedTasks.map((task) => {
              const CategoryIcon = getCategoryIcon(task.category);
              const doneSubtasks = task.subtasks?.filter(s => s.isCompleted).length || 0;
              const totalSubtasks = task.subtasks?.length || 0;
              const ratio = totalSubtasks > 0 ? (doneSubtasks / totalSubtasks) * 100 : 0;

              const isOverdue = new Date(task.dueDate).getTime() < new Date().getTime() && task.status !== "completed";
              const isDueSoon = !isOverdue && task.status !== "completed" &&
                (new Date(task.dueDate).getTime() - new Date().getTime()) <= 3 * 24 * 60 * 60 * 1000;

              return (
                <Card
                  key={task.id}
                  className={cn(
                    "flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-l-4 transition hover:bg-surface-2/30 shadow-sm",
                    isOverdue ? "border-l-danger bg-danger/[0.02]" : "border-l-border"
                  )}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => completeTaskMutation.mutate(task.id)}
                      disabled={task.status === "completed"}
                      className={cn(
                        "flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full border-2 transition",
                        task.status === "completed"
                          ? "border-success bg-success text-white cursor-not-allowed"
                          : "border-border-strong hover:border-primary"
                      )}
                    >
                      {task.status === "completed" && <Check className="h-4 w-4" />}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "font-bold text-sm truncate",
                            task.status === "completed" && "text-text-faint line-through"
                          )}
                        >
                          {task.title}
                        </span>

                        <Badge tone="neutral" className={cn("text-[10px] font-bold border py-0.5", getCategoryStyles(task.category))}>
                          <CategoryIcon className="h-2.5 w-2.5 mr-1" />
                          {task.category.replace("_", " ")}
                        </Badge>

                        <Badge tone={task.status === "in-progress" ? "warning" : task.status === "completed" ? "success" : "neutral"} className="text-[10px] py-0.5 font-bold">
                          {task.status.replace("-", " ")}
                        </Badge>

                        {isOverdue && <Badge tone="danger" className="text-[10px] py-0.5 font-bold uppercase">Overdue</Badge>}
                        {isDueSoon && <Badge tone="warning" className="text-[10px] py-0.5 font-bold uppercase">Due soon</Badge>}
                        {task.recurrence?.pattern !== "none" && (
                          <Badge tone="neutral" className="text-[9px] py-0.5 font-semibold">
                            🔁 {task.recurrence.pattern}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-text-muted line-clamp-1">{task.description || "No description provided."}</p>

                      {/* Subtasks Progress Bar */}
                      {totalSubtasks > 0 && (
                        <div className="flex items-center gap-2 max-w-xs">
                          <div className="h-1.5 flex-1 bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${ratio}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-text-faint shrink-0">{doneSubtasks}/{totalSubtasks} Checklist</span>
                        </div>
                      )}

                      {/* Subtask list */}
                      {totalSubtasks > 0 && (
                        <div className="mt-2 pl-1 space-y-1 border-l border-border pl-3">
                          {task.subtasks.map((st, idx) => (
                            <label key={idx} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={st.isCompleted}
                                onChange={() => handleToggleSubtask(task, idx)}
                                className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              <span className={cn(st.isCompleted && "text-text-faint line-through")}>
                                {st.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Details row */}
                      <div className="flex flex-wrap gap-4 pt-1 text-[11px] font-bold text-text-faint">
                        {task.property && <span>🏢 {task.property.propertyName}</span>}
                        {task.assignee && <span>👤 Assignee: {task.assignee.name}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-extrabold" style={{ color: getPriorityColor(task.priority) }}>
                        {task.priority.toUpperCase()}
                      </p>
                      <p className={cn("text-xs mt-0.5 font-bold", isOverdue ? "text-danger" : "text-text-faint")}>
                        🗓️ {new Date(task.dueDate).toLocaleDateString("en-GB")}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleOpenEditModal(task)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteDialog(task.id)}>Delete</Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Task Editor Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title={editingTask ? "Modify Task" : "Schedule New Task"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleSaveTask} loading={createTaskMutation.isPending || updateTaskMutation.isPending}>
              {editingTask ? "Save Changes" : "Create Task"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Task Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Gas Safety CP12 Renewal" />
          </Field>

          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Record inspection results and upload certificate..." />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Linked Property">
              <Select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })}>
                <option value="">General (No Link)</option>
                {(properties || []).map((p: any) => (
                  <option key={p.id || p._id} value={p.id || p._id}>{p.propertyName}</option>
                ))}
              </Select>
            </Field>

            <Field label="Assignee (Team Member)">
              <Select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {(teamMembers || [])
                  .filter((m: any) => m.status === "active")
                  .map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.roleName})</option>
                  ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Field label="Priority">
              <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </Field>

            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TaskCategory })}>
                <option value="compliance">Compliance</option>
                <option value="inspection">Inspection</option>
                <option value="maintenance">Maintenance</option>
                <option value="financial">Financial</option>
                <option value="administrative">Administrative</option>
                <option value="tenant_management">Tenant Management</option>
                <option value="other">Other</option>
              </Select>
            </Field>

            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
            </Field>

            <Field label="Due Date">
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </Field>
          </div>

          {/* Subtask Editor */}
          <div className="border-t border-border pt-4">
            <label className="mb-2 block text-[13px] font-semibold text-text-muted">Task Checklist (Subtasks)</label>
            <div className="flex gap-2 mb-3">
              <Input value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} placeholder="New subtask step..." onKeyDown={(e) => e.key === "Enter" && handleAddSubtaskInForm()} />
              <Button variant="secondary" onClick={handleAddSubtaskInForm}>Add</Button>
            </div>
            {form.subtasks.length > 0 && (
              <div className="space-y-2 bg-surface-2/40 p-3 rounded-xl max-h-40 overflow-y-auto">
                {form.subtasks.map((st, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <span>{idx + 1}. {st.title}</span>
                    <button onClick={() => handleRemoveSubtaskInForm(idx)} className="text-danger hover:text-danger/80">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recurrence Config */}
          <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
            <Field label="Recurrence Pattern">
              <Select value={form.recurrence.pattern} onChange={(e) => setForm({ ...form, recurrence: { ...form.recurrence, pattern: e.target.value as any } })}>
                <option value="none">None (One-off)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </Select>
            </Field>

            {form.recurrence.pattern !== "none" && (
              <Field label="Recurrence End Date (Optional)">
                <Input type="date" value={form.recurrence.endDate} onChange={(e) => setForm({ ...form, recurrence: { ...form.recurrence, endDate: e.target.value } })} />
              </Field>
            )}
          </div>
        </div>
      </Modal>

      {/* ─── Filter Dialog Modal ────────────────────────────────────────────────── */}
      <Modal
        open={filterModal}
        onClose={() => setFilterModal(false)}
        title="Filter Obligations"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setActiveFilters({ priority: "all", category: "all", propertyId: "all", assignedTo: "all" });
              setFilterModal(false);
            }}>
              Clear Filters
            </Button>
            <Button onClick={() => setFilterModal(false)}>Apply Filters</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Filter by Priority">
            <Select value={activeFilters.priority} onChange={(e) => setActiveFilters({ ...activeFilters, priority: e.target.value })}>
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </Field>

          <Field label="Filter by Category">
            <Select value={activeFilters.category} onChange={(e) => setActiveFilters({ ...activeFilters, category: e.target.value })}>
              <option value="all">All Categories</option>
              <option value="compliance">Compliance</option>
              <option value="inspection">Inspection</option>
              <option value="maintenance">Maintenance</option>
              <option value="financial">Financial</option>
              <option value="administrative">Administrative</option>
              <option value="tenant_management">Tenant Management</option>
              <option value="other">Other</option>
            </Select>
          </Field>

          <Field label="Filter by Property">
            <Select value={activeFilters.propertyId} onChange={(e) => setActiveFilters({ ...activeFilters, propertyId: e.target.value })}>
              <option value="all">All Properties</option>
              {(properties || []).map((p: any) => (
                <option key={p.id || p._id} value={p.id || p._id}>{p.propertyName}</option>
              ))}
            </Select>
          </Field>

          <Field label="Filter by Assignee">
            <Select value={activeFilters.assignedTo} onChange={(e) => setActiveFilters({ ...activeFilters, assignedTo: e.target.value })}>
              <option value="all">All Assignees</option>
              {(teamMembers || [])
                .filter((m: any) => m.status === "active")
                .map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
            </Select>
          </Field>
        </div>
      </Modal>

      {/* ─── Delete Confirmation Dialog ────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={() => deleteDialog && deleteTaskMutation.mutate(deleteDialog)}
        title="Remove Task?"
        message="Are you sure you want to remove this obligation from the checklist? This action soft-deletes the record."
        confirmLabel="Remove"
        danger
        loading={deleteTaskMutation.isPending}
      />
    </div>
  );
}
