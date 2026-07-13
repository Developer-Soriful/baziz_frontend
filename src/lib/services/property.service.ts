import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { Property } from "../data";

export const propertyService = {
  getAll: () =>
    apiClient.get<any>(ENDPOINTS.PROPERTIES.BASE).then((r) => r.data.data || r.data),

  getById: (id: string) =>
    apiClient.get<any>(ENDPOINTS.PROPERTIES.BY_ID(id)).then((r) => r.data.data || r.data),

  create: (data: Partial<Property>) =>
    apiClient
      .post<any>(ENDPOINTS.PROPERTIES.BASE, data)
      .then((r) => r.data.data || r.data),

  update: (id: string, data: Partial<Property>) =>
    apiClient
      .put<any>(ENDPOINTS.PROPERTIES.BY_ID(id), data)
      .then((r) => r.data.data || r.data),

  delete: (id: string) =>
    apiClient.delete(ENDPOINTS.PROPERTIES.BY_ID(id)).then((r) => r.data),
};
