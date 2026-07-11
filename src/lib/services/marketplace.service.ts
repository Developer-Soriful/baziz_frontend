import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface MarketplaceListing {
  id?: string;
  _id?: string;
  title: string;
  price: number;
  location: string;
  type: string;
  size: string;
  yield: string;
  listedDays: string;
  imageUrl: string;
  epcRating: string;
  description: string;
}

export interface JointVenture {
  id?: string;
  _id?: string;
  title: string;
  location: string;
  projectType: string;
  totalProjectCost: number;
  investmentNeeded: number;
  expectedReturn: number;
  timeline: string;
  risk: string;
  investmentModel: string;
  partners: string;
  imageUrl: string;
  views: number;
  inquiries: number;
  daysOnMarket: string;
  description: string;
  leadPartnerName: string;
  leadPartnerContact: string;
}

export const marketplaceService = {
  getListings: () =>
    apiClient.get<any>(`${ENDPOINTS.MARKETPLACE.BASE}/listings`).then((r) => r.data.data.listings || r.data.data),
    
  getJointVentures: () =>
    apiClient.get<any>(`${ENDPOINTS.MARKETPLACE.BASE}/joint-ventures`).then((r) => r.data.data.jointVentures || r.data.data),
};
