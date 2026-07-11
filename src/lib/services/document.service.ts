import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface PropertyDocument {
  _id: string;
  documentName: string;
  documentType: string;
  documentUrl: string;
  fileSize: number;
  uploadedBy: string;
  sharedWithTenant: boolean;
  createdAt: string;
}

export const documentService = {
  getMyDocuments: () =>
    apiClient.get<any>(ENDPOINTS.TENANT_DASHBOARD.MY_DOCUMENTS)
      .then((r) => r.data.data.documents as PropertyDocument[])
      .catch((e) => {
        if (e.response?.status === 404) return [];
        throw e;
      }),
};
