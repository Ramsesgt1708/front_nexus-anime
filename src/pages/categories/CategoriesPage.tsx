import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useEffect, useState } from "react";
import clientAPI from "../../services/http.service";
import toast from "react-hot-toast";
import { HiChevronRight } from "react-icons/hi";
import AnimeCard from "../../components/AnimeCard";

interface Genre {
  _id: number;
  nombre: string;
  descripcion?: string;
  isActive: boolean;
}

interface Anime {
  _id: number;
  titulo: string;
  imagenUrl: string;
  sinopsis?: string;
  fechaEstreno: string;
  fechaRegistro: string;
  estudio?: {
    _id: number;
    nombre: string;
  };
  generos?: Array<{
    _id: number;
    nombre: string;
  }>;
}

function CategoriesPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [genresRes, animesRes] = await Promise.all([
        clientAPI.get("/Generos"),
        clientAPI.get("/Animes"),
      ]);

      // Filtrar solo géneros y animes activos
      const activeGenres = genresRes.data.filter((g: Genre) => g.isActive === true);
      const activeAnimes = animesRes.data.filter((a: Anime) => a.isActive === true);
      setGenres(activeGenres);
      setAnimes(activeAnimes);

      // Seleccionar el primer género por defecto
      if (activeGenres.length > 0) {
        setSelectedGenreId(activeGenres[0]._id);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrar animes por género y búsqueda
  const filteredAnimes = animes.filter((anime) => {
    const matchesGenre =
      !selectedGenreId ||
      anime.generos?.some((g) => g._id === selectedGenreId);
    const matchesSearch = anime.titulo
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const selectedGenre = genres.find((g) => g._id === selectedGenreId);

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
            <p className="mt-4 text-slate-300">Cargando categorías...</p>
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
        <div className="flex h-full">
          {/* SIDEBAR - Géneros */}
          <aside className="w-full sm:w-64 bg-slate-900 border-r border-slate-800 p-4 sm:p-6 sticky top-0 sm:relative h-max sm:h-screen overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
              Géneros
            </h2>

            {/* Buscador en sidebar */}
            <div className="mb-6 hidden sm:block">
              <input
                type="text"
                placeholder="Buscar género..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
              />
            </div>

            {/* Lista de géneros */}
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
              {genres.map((genre) => (
                <button
                  key={genre._id}
                  onClick={() => setSelectedGenreId(genre._id)}
                  className={`px-4 py-3 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 flex items-center justify-between group ${
                    selectedGenreId === genre._id
                      ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <span>{genre.nombre}</span>
                  {selectedGenreId === genre._id && (
                    <HiChevronRight className="w-5 h-5 ml-2 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* CONTENIDO PRINCIPAL */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
            {/* Encabezado con búsqueda */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl sm:text-5xl font-bold text-white">
                    {selectedGenre?.nombre || "Categorías"}
                  </h1>
                  <p className="text-slate-400 mt-2">
                    {filteredAnimes.length}{" "}
                    {filteredAnimes.length === 1 ? "anime" : "animes"} disponibles
                  </p>
                </div>
              </div>

              {/* Buscador de animes */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Busca un anime..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                />
                <svg
                  className="w-5 h-5 text-slate-400 absolute right-3 top-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Grid de animes */}
            {filteredAnimes.length === 0 ? (
              <div className="text-center py-20">
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 mx-auto text-slate-500 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-slate-400 text-lg">
                  No hay animes en esta categoría aún.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {filteredAnimes.map((anime) => (
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
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default CategoriesPage;
