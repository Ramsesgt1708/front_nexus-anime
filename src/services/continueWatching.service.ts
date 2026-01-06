/**
 * Servicio para gestionar el historial de visualización local
 * Usa localStorage para guardar qué animes/episodios ha visto el usuario
 */

export interface ContinueWatchingItem {
  animeId: number;
  animeTitulo: string;
  animeImagenUrl: string;
  episodeId: number;
  episodeNumero: number;
  episodeTitulo: string;
  currentTime: number; // Tiempo en segundos
  duration?: number; // Duración total del video
  lastWatchedAt: string; // ISO timestamp
  estudio?: {
    _id: number;
    nombre: string;
  };
}

const STORAGE_KEY = "continueWatching";
const MAX_ITEMS = 10; // Máximo de animes en "Continúa viendo"

const continueWatchingService = {
  /**
   * Guardar un episodio como visto
   */
  addToHistory: (item: Omit<ContinueWatchingItem, "lastWatchedAt">) => {
    try {
      const history = continueWatchingService.getHistory();

      // Remover si ya existe (para ponerlo al inicio)
      const filtered = history.filter(
        (h) => !(h.animeId === item.animeId && h.episodeId === item.episodeId)
      );

      // Agregar al inicio con timestamp actual
      const newItem: ContinueWatchingItem = {
        ...item,
        lastWatchedAt: new Date().toISOString(),
      };

      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return newItem;
    } catch (error) {
      console.error("Error saving to continue watching:", error);
      return null;
    }
  },

  /**
   * Obtener el historial de visualización
   */
  getHistory: (): ContinueWatchingItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading continue watching history:", error);
      return [];
    }
  },

  /**
   * Obtener solo los animes únicos (un anime por último episodio visto)
   */
  getUniqueAnimes: (): ContinueWatchingItem[] => {
    try {
      const history = continueWatchingService.getHistory();
      const unique = new Map<number, ContinueWatchingItem>();

      history.forEach((item) => {
        // Mantener solo el más reciente de cada anime
        if (!unique.has(item.animeId)) {
          unique.set(item.animeId, item);
        }
      });

      return Array.from(unique.values());
    } catch (error) {
      console.error("Error getting unique animes:", error);
      return [];
    }
  },

  /**
   * Remover un anime del historial
   */
  removeFromHistory: (animeId: number) => {
    try {
      const history = continueWatchingService.getHistory();
      const filtered = history.filter((h) => h.animeId !== animeId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error removing from continue watching:", error);
    }
  },

  /**
   * Limpiar todo el historial
   */
  clearHistory: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing continue watching history:", error);
    }
  },

  /**
   * Actualizar el tiempo de reproducción de un episodio
   */
  updateWatchTime: (animeId: number, episodeId: number, currentTime: number, duration?: number) => {
    try {
      const history = continueWatchingService.getHistory();
      
      const existingIndex = history.findIndex(
        (h) => h.animeId === animeId && h.episodeId === episodeId
      );

      if (existingIndex !== -1) {
        // Actualizar el existente
        history[existingIndex].currentTime = currentTime;
        if (duration) {
          history[existingIndex].duration = duration;
        }
        history[existingIndex].lastWatchedAt = new Date().toISOString();
        
        // Mover al inicio
        const [updated] = history.splice(existingIndex, 1);
        history.unshift(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_ITEMS)));
      }
    } catch (error) {
      console.error("Error updating watch time:", error);
    }
  },

  /**
   * Obtener el progreso de un episodio específico
   */
  getEpisodeProgress: (animeId: number, episodeId: number): { currentTime: number; duration?: number } | null => {
    try {
      const history = continueWatchingService.getHistory();
      const found = history.find(
        (h) => h.animeId === animeId && h.episodeId === episodeId
      );
      
      if (found) {
        return {
          currentTime: found.currentTime,
          duration: found.duration,
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting episode progress:", error);
      return null;
    }
  },
  getLastEpisodeOfAnime: (
    animeId: number
  ): ContinueWatchingItem | null => {
    try {
      const history = continueWatchingService.getHistory();
      const found = history.find((h) => h.animeId === animeId);
      return found || null;
    } catch (error) {
      console.error("Error getting last episode:", error);
      return null;
    }
  },
};

export default continueWatchingService;
