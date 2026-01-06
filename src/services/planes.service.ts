import clientAPI from "./http.service";

export const planesService = {
  getAll: () => clientAPI.get("/Planes"),
  getById: (id: string) => clientAPI.get(`/Planes/${id}`),
  create: (data: any) => clientAPI.post("/Planes", data),
  update: (id: string, data: any) => clientAPI.put(`/Planes/${id}`, data),
  delete: (id: string) => clientAPI.delete(`/Planes/${id}`),
  toggleStatus: (id: string) => clientAPI.patch(`/Planes/${id}/toggle-status`),
};
