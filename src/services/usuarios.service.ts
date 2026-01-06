import clientAPI from "./http.service";

export const usuariosService = {
  getAll: () => clientAPI.get("/Usuarios"),
  getById: (id: string) => clientAPI.get(`/Usuarios/${id}`),
  create: (data: any) => clientAPI.post("/Usuarios", data),
  update: (id: string, data: any) => clientAPI.put(`/Usuarios/${id}`, data),
  delete: (id: string) => clientAPI.delete(`/Usuarios/${id}`),
  toggleStatus: (id: string) => clientAPI.patch(`/Usuarios/${id}/toggle-status`),
};
