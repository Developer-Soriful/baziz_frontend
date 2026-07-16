import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskCategory = 'inspection' | 'compliance' | 'maintenance' | 'financial' | 'administrative' | 'tenant_management' | 'other';

export interface Subtask {
  title: string;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface TaskRecurrence {
  pattern: 'none' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  endDate?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  property?: {
    id: string;
    propertyName: string;
    address?: string | null;
  } | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate: string; // ISO String
  completedAt?: string | null;
  subtasks: Subtask[];
  recurrence: TaskRecurrence;
  recurrenceParentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetTasksParams {
  status?: TaskStatus | 'today' | 'upcoming';
  priority?: TaskPriority;
  propertyId?: string;
  category?: TaskCategory;
  assignedTo?: string;
  q?: string;
  sortBy?: 'dueDate' | 'priority' | 'category' | 'property' | 'createdAt';
  page?: number;
  limit?: number;
}

export interface AISuggestedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string; // YYYY-MM-DD
  reason: string;
  propertyName?: string;
}

export interface TaskPayload {
  title: string;
  description?: string;
  propertyId?: string | null;
  assignedTo?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate: string;
  subtasks?: Array<{ title: string; isCompleted: boolean }>;
  recurrence?: TaskRecurrence;
}

export const taskService = {
  getAll: (params?: GetTasksParams) =>
    apiClient
      .get<any>(ENDPOINTS.TASKS.BASE, { params })
      .then((r) => ({
        tasks: (r.data.data || r.data) as Task[],
        meta: r.data.meta || {},
        summary: r.data.meta?.summary || {},
      })),

  getById: (id: string) =>
    apiClient
      .get<any>(ENDPOINTS.TASKS.BY_ID(id))
      .then((r) => (r.data.data?.task || r.data.data) as Task),

  create: (data: TaskPayload) =>
    apiClient
      .post<any>(ENDPOINTS.TASKS.BASE, data)
      .then((r) => (r.data.data?.task || r.data.data) as Task),

  update: (id: string, data: Partial<TaskPayload>) =>
    apiClient
      .patch<any>(ENDPOINTS.TASKS.BY_ID(id), data)
      .then((r) => (r.data.data?.task || r.data.data) as Task),

  complete: (id: string) =>
    apiClient
      .patch<any>(`${ENDPOINTS.TASKS.BY_ID(id)}/complete`)
      .then((r) => (r.data.data?.task || r.data.data) as Task),

  delete: (id: string) =>
    apiClient.delete(ENDPOINTS.TASKS.BY_ID(id)).then((r) => r.data),

  getStats: () =>
    apiClient
      .get<any>(`${ENDPOINTS.TASKS.BASE}/stats`)
      .then((r) => r.data.data?.stats),

  getAISuggestions: () =>
    apiClient
      .get<any>(ENDPOINTS.TASKS.AI_SUGGESTIONS)
      .then((r) => (r.data.data?.suggestions || []) as AISuggestedTask[]),
};
