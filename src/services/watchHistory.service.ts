import clientAPI from "./http.service";

export interface WatchHistoryPayload {
  usuarioId: number;
  animeId: number;
  episodioId: number;
  tiempoReproducido: number;
  completado: boolean;
}

export interface WatchHistoryEntry {
  _id?: number;
  fechaVisualizacion?: string;
  tiempoReproducido: number;
  completado: boolean;
  usuarioId: number;
  animeId?: number;
  episodioId: number;
  tituloAnime?: string;
  tituloEpisodio?: string;
  numeroEpisodio?: number;
  duracionTotal?: number;
}

export interface EpisodeProgress {
  tiempoReproducido: number;
  completado: boolean;
}

const watchHistoryService = {
  saveProgress: async (payload: WatchHistoryPayload) => {
    return clientAPI.post("/HistorialVisualizaciones", payload);
  },

  getEpisodeProgress: async (usuarioId: number, episodioId: number): Promise<EpisodeProgress | null> => {
    try {
      const response = await clientAPI.get(`/HistorialVisualizaciones/usuario/${usuarioId}/episodio/${episodioId}`);
      
      // Si es un array, tomar el primer elemento
      if (Array.isArray(response.data) && response.data.length > 0) {
        const entry = response.data[0];
        return {
          tiempoReproducido: entry.tiempoReproducido,
          completado: entry.completado,
        };
      }
      
      // Si es un objeto directo
      if (response.data && typeof response.data === "object") {
        return {
          tiempoReproducido: response.data.tiempoReproducido ?? 0,
          completado: response.data.completado ?? false,
        };
      }
      
      return null;
    } catch (error: any) {
      // 404 es esperado cuando no hay progreso guardado (primera vez viendo)
      if (error?.response?.status === 404) {
        return null;
      }
      console.error("Error obteniendo progreso del episodio:", error);
      return null;
    }
  },

  getUserHistory: async (usuarioId: number): Promise<WatchHistoryEntry[]> => {
    try {
      const response = await clientAPI.get(`/HistorialVisualizaciones/usuario/${usuarioId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error obteniendo historial del usuario:", error);
      return [];
    }
  },
};

export default watchHistoryService;
