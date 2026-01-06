import clientAPI from "./http.service";

export interface Episode {
  _id: number;
  numero: number;
  titulo: string;
  descripcion: string | null;
  videoUrl: string;
  duracion: number;
  fechaRegistro: string;
  fechaModificacion: string | null;
  isActive: boolean;
  animeId: number;
  animeTitulo: string;
}

const episodesService = {
  getEpisodesByAnimeId: async (animeId: number): Promise<Episode[]> => {
    try {
      const response = await clientAPI.get(`/Episodios/anime/${animeId}`);
      // Filtrar solo episodios activos para usuarios
      return response.data.filter((episode: Episode) => episode.isActive === true);
    } catch (error) {
      console.error(`Error obteniendo episodios del anime ${animeId}:`, error);
      throw error;
    }
  },

  getEpisodeById: async (episodeId: number): Promise<Episode> => {
    try {
      const response = await clientAPI.get(`/Episodios/${episodeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo episodio ${episodeId}:`, error);
      throw error;
    }
  },
};

export default episodesService;
