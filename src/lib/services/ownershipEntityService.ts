import { apiClient } from "../api/client";

export interface OwnershipEntity {
  id: string;
  _id?: string;
  name: string;
  type: "personal" | "limited_company" | "partnership" | "trust" | "other";
  registrationNumber?: string;
  address?: string;
  taxReference?: string;
  contactEmail?: string;
  color?: string;
  description?: string;
  properties?: any[]; // Will be populated with Property IDs or objects
  createdAt: string;
  updatedAt?: string;
}

export const ownershipEntityService = {
  getAll: () =>
    apiClient
      .get<any>("/ownership-entities")
      .then((r) => r.data?.data ?? r.data ?? [])
      .catch(() => []),

  getById: (id: string) =>
    apiClient
      .get<any>(`/ownership-entities/${id}`)
      .then((r) => r.data?.data ?? r.data),

  create: (data: Partial<OwnershipEntity>) =>
    apiClient
      .post<any>("/ownership-entities", data)
      .then((r) => r.data?.data ?? r.data),

  update: (id: string, data: Partial<OwnershipEntity>) =>
    apiClient
      .patch<any>(`/ownership-entities/${id}`, data)
      .then((r) => r.data?.data ?? r.data),

  delete: (id: string) =>
    apiClient
      .delete<any>(`/ownership-entities/${id}`)
      .then((r) => r.data?.data ?? r.data),
};
