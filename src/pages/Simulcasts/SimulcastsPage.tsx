import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useEffect, useState } from "react";
import clientAPI from "../../services/http.service";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import AnimeCard from "../../components/AnimeCard";

interface Anime {
  _id: number;
  titulo: string;
  imagenUrl: string;
  descripcion?: string;
  sinopsis?: string;
  fechaEstreno: string;
  fechaRegistro: string;
  isActive?: boolean;
  estudio?: {
    _id: number;
    nombre: string;
  };
  generos?: Array<{
    _id: number;
    nombre: string;
  }>;
}

interface SeasonGroup {
  season: string;
  year: number;
  animes: Anime[];
}

const SEASONS = ["Invierno", "Primavera", "Verano", "Otoño"];

const getSeasonAndYear = (dateString: string): { season: string; year: number; monthIndex: number } => {
  const date = new Date(dateString);
  const month = date.getMonth();
  const year = date.getFullYear();

  let season = "";
  let seasonMonth = 0;

  if (month === 11 || month <= 2) {
    season = "Invierno";
    seasonMonth = month === 11 ? 11 : month;
  } else if (month >= 3 && month <= 5) {
    season = "Primavera";
    seasonMonth = month;
  } else if (month >= 6 && month <= 8) {
    season = "Verano";
    seasonMonth = month;
  } else {
    season = "Otoño";
    seasonMonth = month;
  }

  return { season, year, monthIndex: seasonMonth };
};

const groupAndSortBySeasons = (animes: Anime[]): SeasonGroup[] => {
  const groupedBySeasonMap = new Map<string, { season: string; year: number; animes: Anime[] }>();

  animes.forEach((anime) => {
    const { season, year } = getSeasonAndYear(anime.fechaEstreno);
    const key = `${year}-${season}`;

    if (!groupedBySeasonMap.has(key)) {
      groupedBySeasonMap.set(key, {
        season,
        year,
        animes: [],
      });
    }

    groupedBySeasonMap.get(key)!.animes.push(anime);
  });

  const grouped = Array.from(groupedBySeasonMap.values());
  grouped.sort((a, b) => {
    if (b.year !== a.year) {
      return b.year - a.year;
    }

    const seasonOrder = ["Invierno", "Otoño", "Verano", "Primavera"];
    return seasonOrder.indexOf(a.season) - seasonOrder.indexOf(b.season);
  });

  grouped.forEach((group) => {
    group.animes.sort(
      (a, b) =>
        new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()
    );
  });

  return grouped;
};

function SimulcastsPage() {
  const [seasonGroups, setSeasonGroups] = useState<SeasonGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [selectedSeason, setSelectedSeason] = useState<string>("");

  const fetchAnimes = async () => {
    setLoading(true);
    try {
      const response = await clientAPI.get("/Animes");
      // Filtrar solo animes activos
      const activeAnimes = response.data.filter((anime: Anime) => anime.isActive === true);
      const grouped = groupAndSortBySeasons(activeAnimes);
      setSeasonGroups(grouped);
      
      // Establecer la primera temporada (más reciente) como seleccionada por defecto
      if (grouped.length > 0) {
        setSelectedSeason(`${grouped[0].year}-${grouped[0].season}`);
      }
    } catch (error) {
      console.error("Error al cargar animes:", error);
      toast.error("Error al cargar los simulcasts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimes();
  }, []);

  const handleImageError = (animeId: number) => {
    setImageErrors((prev) => new Set(prev).add(animeId));
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            <p className="mt-4 text-slate-300">Cargando simulcasts...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Encabezado */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simulcasts
            </h1>
            <p className="text-slate-300 text-lg mb-6">
              Explora los animes por temporada. Cada temporada dura aproximadamente 3 meses.
            </p>

            {/* Select de Temporadas */}
            {seasonGroups.length > 0 && (
              <div className="flex items-center gap-4 flex-wrap">
                <label htmlFor="season-select" className="text-white font-semibold">
                  Selecciona una temporada:
                </label>
                <select
                  id="season-select"
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all cursor-pointer"
                >
                  {seasonGroups.map((group) => (
                    <option
                      key={`${group.year}-${group.season}`}
                      value={`${group.year}-${group.season}`}
                    >
                      {group.season} {group.year}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Grupos por temporada */}
          {seasonGroups.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">No hay animes disponibles en este momento.</p>
            </div>
          ) : (
            <section>
              {/* Obtener el grupo seleccionado */}
              {(() => {
                const selectedGroup = seasonGroups.find(
                  (g) => `${g.year}-${g.season}` === selectedSeason
                );

                if (!selectedGroup) {
                  return (
                    <div className="text-center py-20">
                      <p className="text-slate-400 text-lg">
                        Selecciona una temporada para ver los animes.
                      </p>
                    </div>
                  );
                }

                return (
                  <div>
                    {/* Título de temporada actual */}
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="inline-block w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                        {selectedGroup.season} {selectedGroup.year}
                      </h2>
                      <p className="text-slate-400 mt-2">
                        {selectedGroup.animes.length}{" "}
                        {selectedGroup.animes.length === 1 ? "anime" : "animes"}
                      </p>
                    </div>

                    {/* Grid de animes */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {selectedGroup.animes.map((anime) => (
                        <AnimeCard
                          key={anime._id}
                          animeId={anime._id}
                          titulo={anime.titulo}
                          imagenUrl={anime.imagenUrl}
                          estudio={anime.estudio}
                          generos={anime.generos}
                          fechaRegistro={anime.fechaRegistro}
                          hasImageError={imageErrors.has(anime._id)}
                          onImageError={() => handleImageError(anime._id)}
                          showInfo={true}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default SimulcastsPage;
