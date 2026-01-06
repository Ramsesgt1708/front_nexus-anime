import clientAPI from "./http.service";

export const rolesService = {
  getAll: () => clientAPI.get("/Roles"),
  getById: (id: string) => clientAPI.get(`/Roles/${id}`),
  create: (data: any) => clientAPI.post("/Roles", data),
  update: (id: string, data: any) => clientAPI.put(`/Roles/${id}`, data),
  delete: (id: string) => clientAPI.delete(`/Roles/${id}`),
  toggleStatus: (id: string) => clientAPI.patch(`/Roles/${id}/toggle-status`),
};
