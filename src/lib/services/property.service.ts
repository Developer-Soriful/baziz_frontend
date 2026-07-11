import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { Property } from "../data";

export const propertyService = {
  getAll: () =>
    apiClient.get<Property[]>(ENDPOINTS.PROPERTIES.BASE).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Property>(ENDPOINTS.PROPERTIES.BY_ID(id)).then((r) => r.data),

  create: (data: Partial<Property>) =>
    apiClient
      .post<Property>(ENDPOINTS.PROPERTIES.BASE, data)
      .then((r) => r.data),

  update: (id: string, data: Partial<Property>) =>
    apiClient
      .put<Property>(ENDPOINTS.PROPERTIES.BY_ID(id), data)
      .then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(ENDPOINTS.PROPERTIES.BY_ID(id)).then((r) => r.data),
};
