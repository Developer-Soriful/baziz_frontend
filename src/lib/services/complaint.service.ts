import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export type ComplaintCategory = 'property_condition' | 'noise' | 'neighbour_dispute' | 'billing' | 'communication' | 'other';
export type ComplaintUrgency = 'low' | 'medium' | 'high';
export type ComplaintStatus = 'in_review' | 'in_progress' | 'resolved' | 'closed';

export interface Complaint {
  _id: string;
  id?: string;
  leaseId: string;
  propertyId: string;
  unitId: string;
  tenantId: string | any;
  landlordId: string | any;
  category: ComplaintCategory;
  title: string;
  description: string;
  urgency: ComplaintUrgency;
  status: ComplaintStatus;
  resolvedAt: string | null;
  closedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintInput {
  category: ComplaintCategory;
  title: string;
  description: string;
  urgency: ComplaintUrgency;
}

export interface UpdateComplaintStatusInput {
  status: ComplaintStatus;
}

export interface ListComplaintsQuery {
  status?: ComplaintStatus;
  urgency?: ComplaintUrgency;
  category?: ComplaintCategory;
  propertyId?: string;
  page?: number;
  limit?: number;
}

export const complaintService = {
  submitComplaint: async (data: CreateComplaintInput) => {
    const response = await apiClient.post<{ data: { complaint: Complaint } }>(ENDPOINTS.COMPLAINTS.BASE, data);
    return response.data.data.complaint;
  },

  listComplaints: async (params?: ListComplaintsQuery) => {
    const response = await apiClient.get<{ data: { complaints: Complaint[], pagination: any } }>(ENDPOINTS.COMPLAINTS.BASE, { params });
    return response.data.data;
  },

  getComplaintById: async (complaintId: string) => {
    const response = await apiClient.get<{ data: { complaint: Complaint } }>(ENDPOINTS.COMPLAINTS.BY_ID(complaintId));
    return response.data.data.complaint;
  },

  updateStatus: async (complaintId: string, data: UpdateComplaintStatusInput) => {
    const response = await apiClient.patch<{ data: { complaint: Complaint } }>(`${ENDPOINTS.COMPLAINTS.BY_ID(complaintId)}/status`, data);
    return response.data.data.complaint;
  },

  deleteComplaint: async (complaintId: string) => {
    const response = await apiClient.delete(ENDPOINTS.COMPLAINTS.BY_ID(complaintId));
    return response.data;
  }
};
