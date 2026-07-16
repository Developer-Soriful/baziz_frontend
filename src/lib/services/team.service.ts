import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: "active" | "invited" | "removed" | string;
  roleId: string;
  roleKey: string | null;
  roleName: string | null;
  propertyScope: string[];
  joinedAt?: string | null;
  createdAt: string;
}

export const teamService = {
  getMembers: () =>
    apiClient
      .get<{ data: { members: TeamMember[] } }>(`${ENDPOINTS.TEAM.BASE}/members`)
      .then((res) => res.data.data.members || []),
};
