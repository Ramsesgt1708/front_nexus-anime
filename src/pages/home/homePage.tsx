import { useEffect, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import clientAPI from "../../services/http.service"; 
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import AnimeCard from "../../components/AnimeCard";
import { HiChevronLeft, HiChevronRight, HiX } from "react-icons/hi";
import watchHistoryService, { type WatchHistoryEntry } from "../../services/watchHistory.service";
import authService from "../../services/auth.service";
import episodesService from "../../services/episodes.service";
import type { ContinueWatchingItem } from "../../services/continueWatching.service";

// Definimos la interfaz
interface Anime {
  _id: number;
  titulo: string;
  sinopsis: string;
  imagenUrl: string;
  generos?: Array<{
    _id: number;
    nombre: string;
  }>;
  estudio?: {
    _id: number;
    nombre: string;
  };
  fechaRegistro: string;
  fechaEstreno: string;
}

interface Genre {
  _id: number;
  nombre: string;
  isActive: boolean;
}

const HomePage = () => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [heroAnime, setHeroAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [userId] = useState<number | null>(() => authService.getUsuario()?._id ?? null);

  const getAnimes = async () => {
    try {
      const [animesRes, genresRes] = await Promise.all([
        clientAPI.get("/Animes"),
        clientAPI.get("/Generos"),
      ]);

      // Filtrar solo animes y géneros activos
      const animesData = animesRes.data.filter((a: Anime) => a.isActive === true);
      const genresData = genresRes.data.filter((g: Genre) => g.isActive === true);

      if (animesData && animesData.length > 0) {
        setAnimes(animesData);
        const random = Math.floor(Math.random() * animesData.length);
        setHeroAnime(animesData[random]);
      }

      setGenres(genresData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAnimes();
    // Cargar historial de visualización desde la API si hay usuario
    const fetchContinueWatching = async () => {
      if (!userId) {
        setContinueWatching([]);
        return;
      }

      try {
        const history = await watchHistoryService.getUserHistory(userId);

        if (!Array.isArray(history) || history.length === 0) {
          setContinueWatching([]);
          return;
        }

        const mapped = await Promise.all(
          history.map(async (entry) => {
            try {
              const episode = await episodesService.getEpisodeById(entry.episodioId);
              const animeResponse = await clientAPI.get(`/Animes/${episode.animeId}`);
              const animeData = animeResponse.data as Anime;

              // Convertir duración de minutos a segundos, con fallback a duracionTotal del backend
              const durationSeconds = episode.duracion 
                ? episode.duracion * 60 
                : (entry.duracionTotal || 0);

              return {
                animeId: animeData._id,
                animeTitulo: animeData.titulo,
                animeImagenUrl: animeData.imagenUrl,
                episodeId: episode._id,
                episodeNumero: episode.numero,
                episodeTitulo: episode.titulo,
                currentTime: entry.tiempoReproducido ?? 0,
                duration: durationSeconds > 0 ? durationSeconds : undefined,
                estudio: animeData.estudio,
              } as ContinueWatchingItem;
            } catch (itemErr) {
              console.error(`Error mapeando entrada del historial:`, itemErr);
              return null;
            }
          })
        );

        setContinueWatching(mapped.filter((item) => item !== null) as ContinueWatchingItem[]);
      } catch (err) {
        console.error("Error cargando el historial de visualización:", err);
        setContinueWatching([]);
      }
    };

    fetchContinueWatching();
  }, [userId]);

  const handleImageError = (animeId: number) => {
    setImageErrors((prev) => new Set(prev).add(animeId));
  };

  // Obtener los 3 géneros más populares (aquellos que tienen más animes)
  const getTopGenres = (): Genre[] => {
    return genres
      .map((genre) => ({
        ...genre,
        count: animes.filter((a) => a.generos?.some((g) => g._id === genre._id))
          .length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(({ count, ...genre }) => genre);
  };

  // Obtener animes de un género específico
  const getAnimesByGenre = (genreId: number): Anime[] => {
    return animes
      .filter((a) => a.generos?.some((g) => g._id === genreId))
      .sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime())
      .slice(0, 12); // Máximo 12 animes por carrusel
  };

  // Obtener animes nuevos (ordenados por ID descendente - más recientes)
  const getNewReleases = (): Anime[] => {
    return [...animes]
      .sort((a, b) => b._id - a._id)
      .slice(0, 12);
  };

  const topGenres = getTopGenres();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Header />

      {/* ================= HERO SECTION (BANNER GRANDE) ================= */}
      <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-[80vh] overflow-hidden group">
        {loading ? (
          <div className="w-full h-full bg-slate-900 animate-pulse" />
        ) : heroAnime ? (
          <>
            {/* Fondo con imagen */}
            <div className="absolute inset-0">
              <img
                src={heroAnime.imagenUrl}
                alt={heroAnime.titulo}
                className="w-full h-full object-cover object-center opacity-50 group-hover:opacity-60 transition-opacity duration-700"
              />
              {/* Degradado inferior para el texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent" />
            </div>

            {/* Texto del Banner */}
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 md:pb-24">
              <div className="max-w-2xl space-y-4">
                <span className="text-cyan-400 font-bold tracking-widest uppercase text-xs">
                  Anime Destacado
                </span>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-none drop-shadow-xl">
                  {heroAnime.titulo}
                </h1>
                <p className="text-slate-300 text-sm md:text-base line-clamp-3 md:line-clamp-2 max-w-xl drop-shadow-md">
                  {heroAnime.sinopsis}
                </p>

                <div className="flex gap-3 pt-2">
                  <a
                    href={`/anime/${heroAnime._id}`}
                    className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase text-sm tracking-wide rounded transition-transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    Ver Ahora
                  </a>
                  <button className="px-6 py-2.5 border border-slate-500 hover:border-white text-cyan-400 hover:text-white font-bold uppercase text-sm tracking-wide rounded transition-colors">
                    + Mi Lista
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <main className="relative z-10 pb-20 space-y-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* SECCIÓN: CONTINÚA VIENDO (si hay historial) */}
          {continueWatching.length > 0 && (
            <ContinueWatchingSection
              items={continueWatching}
              onRemoveItem={(animeId) => {
                setContinueWatching((prev) =>
                  prev.filter((item) => item.animeId !== animeId)
                );
              }}
              imageErrors={imageErrors}
              onImageError={handleImageError}
            />
          )}

          {/* SECCIÓN: NUEVOS LANZAMIENTOS */}
          <AnimeCarousel
            title="Nuevos Lanzamientos"
            description="Los animes más recientemente agregados"
            animes={getNewReleases()}
            imageErrors={imageErrors}
            onImageError={handleImageError}
          />

          {/* SECCIONES POR GÉNERO (máx 3) */}
          {topGenres.map((genre) => (
            <AnimeCarousel
              key={genre._id}
              title={genre.nombre}
              animes={getAnimesByGenre(genre._id)}
              imageErrors={imageErrors}
              onImageError={handleImageError}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

// --- COMPONENTE CONTINÚA VIENDO ---
interface ContinueWatchingSectionProps {
  items: ContinueWatchingItem[];
  onRemoveItem: (animeId: number) => void;
  imageErrors: Set<number>;
  onImageError: (animeId: number) => void;
}

const ContinueWatchingSection = ({
  items,
  onRemoveItem,
  imageErrors,
  onImageError,
}: ContinueWatchingSectionProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 400;
    const newPosition =
      direction === "left"
        ? Math.max(scrollPosition - scrollAmount, 0)
        : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setScrollPosition(newPosition);
  };

  const handleContinueWatching = (animeId: number, episodeId: number) => {
    navigate(`/watch/${animeId}/episode/${episodeId}`);
  };

  return (
    <div className="space-y-4 mb-6 pb-6 border-b border-slate-800">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Continúa Viendo
          </h2>
          <p className="text-sm text-slate-400">
            Retoma desde donde lo dejaste
          </p>
        </div>
      </div>

      {/* Carrusel */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth pl-0"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingLeft: "1.5rem",
          }}
        >
          {items.map((item) => (
            <div
              key={`${item.animeId}-${item.episodeId}`}
              onClick={() => handleContinueWatching(item.animeId, item.episodeId)}
              className="group/card flex-none w-64 relative text-left cursor-pointer p-0"
            >
              {/* Card con imagen y overlay */}
              <div className="relative rounded-lg overflow-hidden bg-slate-800 aspect-video mb-3 shadow-lg">
                <img
                  src={item.animeImagenUrl}
                  alt={item.animeTitulo}
                  className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300"
                  onError={() => onImageError(item.animeId)}
                />

                {/* Overlay con botón play y info */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white fill-current ml-1"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-white font-semibold text-sm">
                    Continuar
                  </span>
                </div>

                {/* Badge de episodio */}
                <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded">
                  Ep. {item.episodeNumero}
                </div>

                {/* Botón eliminar */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(item.animeId);
                  }}
                  className="absolute top-2 left-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 cursor-pointer"
                >
                  <HiX className="w-4 h-4" />
                </div>

                {/* Barra de progreso */}
                {item.duration && item.duration > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                    <div
                      className="h-full bg-cyan-500 transition-all"
                      style={{
                        width: `${((item.currentTime || 0) / (item.duration || 1)) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover/card:text-cyan-400 transition-colors">
                  {item.animeTitulo}
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  {item.episodeTitulo}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Botones de navegación */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/3 -translate-y-1/2 z-10 bg-black/70 hover:bg-black p-2 rounded-full transition-all duration-300 hidden md:block shadow-lg"
        >
          <HiChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/3 -translate-y-1/2 z-10 bg-black/70 hover:bg-black p-2 rounded-full transition-all duration-300 hidden md:block shadow-lg"
        >
          <HiChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTE CARRUSEL: ESTILO CRUNCHYROLL ---
interface AnimeCarouselProps {
  title: string;
  description?: string;
  animes: Anime[];
  imageErrors: Set<number>;
  onImageError: (animeId: number) => void;
}

const AnimeCarousel = ({
  title,
  description,
  animes,
  imageErrors,
  onImageError,
}: AnimeCarouselProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  if (!animes || animes.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 400;
    const newPosition =
      direction === "left"
        ? Math.max(scrollPosition - scrollAmount, 0)
        : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setScrollPosition(newPosition);
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-slate-400">{description}</p>
          )}
        </div>
        <a href="#" className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm uppercase transition-colors">
          Ver Todo →
        </a>
      </div>

      {/* Carrusel */}
      <div className="relative">
        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth pl-0"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingLeft: "1.5rem",
          }}
        >
          {animes.map((anime) => (
            <div key={anime._id} className="flex-none w-48">
              <AnimeCard
                animeId={anime._id}
                titulo={anime.titulo}
                imagenUrl={anime.imagenUrl}
                estudio={anime.estudio}
                generos={anime.generos}
                fechaRegistro={anime.fechaRegistro}
                hasImageError={imageErrors.has(anime._id)}
                onImageError={() => onImageError(anime._id)}
                showInfo={true}
              />
            </div>
          ))}
        </div>

        {/* Botones de navegación */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black p-2 rounded-full transition-all duration-300 hidden md:block shadow-lg"
        >
          <HiChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black p-2 rounded-full transition-all duration-300 hidden md:block shadow-lg"
        >
          <HiChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default HomePage;