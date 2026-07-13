import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface PropertyDocument {
  _id: string;
  title: string;
  fileName: string;
  documentType: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  propertyId?: any;
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
  
  getLandlordDocuments: () =>
    apiClient.get<any>(ENDPOINTS.DOCUMENTS.BASE)
      .then((r) => r.data.data.documents as PropertyDocument[])
      .catch((e) => {
        if (e.response?.status === 404) return [];
        throw e;
      }),

  uploadLandlordDocument: (formData: FormData) =>
    apiClient.post<any>(ENDPOINTS.DOCUMENTS.BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data.document as PropertyDocument),

  deleteLandlordDocument: (id: string) =>
    apiClient.delete<any>(ENDPOINTS.DOCUMENTS.BY_ID(id))
      .then((r) => r.data),
};
