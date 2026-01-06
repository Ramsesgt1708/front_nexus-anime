import axios from "axios";
import type { AnimePoint } from "../components/dashboard/TopAnimesChart";
import type { GenrePoint } from "../components/dashboard/GenreConsumptionChart";

const jikanAPI = axios.create({
  baseURL: "https://api.jikan.moe/v4",
  headers: {
    "Content-Type": "application/json",
  },
});

// Mapeo de meses en español a números
const MONTH_MAP: Record<string, number> = {
  Enero: 1,
  Febrero: 2,
  Marzo: 3,
  Abril: 4,
  Mayo: 5,
  Junio: 6,
  Julio: 7,
  Agosto: 8,
  Septiembre: 9,
  Octubre: 10,
  Noviembre: 11,
  Diciembre: 12,
};

// Mapeo de temporadas (español a inglés)
const SEASON_NAME_MAP: Record<string, string> = {
  "Invierno": "winter",
  "Primavera": "spring",
  "Verano": "summer",
  "Otoño": "fall",
};

// Función para extraer temporada y año del label
function parseSeasonLabel(seasonLabel: string): { season: string; year: number } {
  // Formato esperado: "Invierno 2025" o solo "Invierno"
  const parts = seasonLabel.trim().split(' ');
  const seasonName = parts[0];
  const year = parts[1] ? parseInt(parts[1]) : new Date().getFullYear();
  const season = SEASON_NAME_MAP[seasonName] || "winter";
  return { season, year };
}

interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  score: number | null;
  scored_by: number | null;
  members: number;
  popularity: number;
  genres: Array<{
    mal_id: number;
    name: string;
  }>;
}

interface JikanSeasonResponse {
  data: JikanAnime[];
}

const jikanService = {
  /**
   * Obtiene los animes más populares de una temporada específica
   * @param seasonLabel - Ejemplo: "Invierno 2025"
   * @param year - Año de la temporada
   * @returns Array de AnimePoint para las gráficas
   */
  getTopAnimesBySeason: async (
    seasonLabel: string,
    year: number = 2025
  ): Promise<AnimePoint[]> => {
    try {
      const { season } = parseSeasonLabel(seasonLabel);
      
      // Endpoint: /seasons/{year}/{season}
      const response = await jikanAPI.get<JikanSeasonResponse>(
        `/seasons/${year}/${season}`,
        {
          params: {
            filter: "tv", // Solo series de TV
            limit: 25, // Obtener más para tener un mejor top
          },
        }
      );

      // Ordenar por popularidad (members) y tomar top 15
      const topAnimes = response.data.data
        .sort((a, b) => b.members - a.members)
        .slice(0, 15)
        .map((anime) => ({
          anime: anime.title_english || anime.title,
          views: anime.members, // Usamos members como "views"
        }));

      return topAnimes;
    } catch (error) {
      console.error("Error obteniendo animes de la temporada:", error);
      // Si falla, retorna un array vacío
      return [];
    }
  },

  /**
   * Obtiene los géneros más populares basados en los animes de la temporada
   * @param seasonLabel - Ejemplo: "Invierno 2025"
   * @param year - Año de la temporada
   * @returns Array de GenrePoint para las gráficas
   */
  getGenresBySeasonPopularity: async (
    seasonLabel: string,
    year: number = 2025
  ): Promise<GenrePoint[]> => {
    try {
      const { season } = parseSeasonLabel(seasonLabel);
      
      const response = await jikanAPI.get<JikanSeasonResponse>(
        `/seasons/${year}/${season}`,
        {
          params: {
            filter: "tv",
            limit: 50, // Más animes para mejor análisis de géneros
          },
        }
      );

      // Contar frecuencia de géneros
      const genreCount: Record<string, number> = {};
      
      response.data.data.forEach((anime) => {
        anime.genres.forEach((genre) => {
          if (genreCount[genre.name]) {
            genreCount[genre.name] += anime.members; // Peso por popularidad
          } else {
            genreCount[genre.name] = anime.members;
          }
        });
      });

      // Convertir a array y ordenar
      const genrePoints: GenrePoint[] = Object.entries(genreCount)
        .map(([genre, value]) => ({
          genre,
          value: Math.round(value / 1000), // Escalar para mejor visualización
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6 géneros

      return genrePoints;
    } catch (error) {
      console.error("Error obteniendo géneros populares:", error);
      return [];
    }
  },

  /**
   * Obtiene los top animes actualmente en emisión
   * @returns Array de AnimePoint para las gráficas
   */
  getCurrentSeasonTopAnimes: async (): Promise<AnimePoint[]> => {
    try {
      const response = await jikanAPI.get<JikanSeasonResponse>(
        `/seasons/now`,
        {
          params: {
            filter: "tv",
            limit: 10,
          },
        }
      );

      const topAnimes = response.data.data
        .sort((a, b) => b.members - a.members)
        .slice(0, 5)
        .map((anime) => ({
          anime: anime.title_english || anime.title,
          views: anime.members,
        }));

      return topAnimes;
    } catch (error) {
      console.error("Error obteniendo temporada actual:", error);
      return [];
    }
  },

  /**
   * Obtiene los animes más populares de todos los tiempos
   * @returns Array de AnimePoint
   */
  getTopAnimesAllTime: async (): Promise<AnimePoint[]> => {
    try {
      const response = await jikanAPI.get("/top/anime", {
        params: {
          filter: "bypopularity",
          limit: 5,
        },
      });

      return response.data.data.map((anime: JikanAnime) => ({
        anime: anime.title_english || anime.title,
        views: anime.members,
      }));
    } catch (error) {
      console.error("Error obteniendo top animes:", error);
      return [];
    }
  },
};

export default jikanService;
