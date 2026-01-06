import { useEffect, useState } from "react";
import { useParams, useNavigate} from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import clientAPI from "../../services/http.service";
import type { Episode } from "../../services/episodes.service";
import episodesService from "../../services/episodes.service";

interface Anime {
  _id: number;
  titulo: string;
  sinopsis: string;
  imagenUrl: string;
  generos?: any[];
  estudioNombre?: string;
}

const AnimeDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          setError("ID del anime no encontrado");
          return;
        }
        const animeResponse = await clientAPI.get(`/Animes/${id}`);
        setAnime(animeResponse.data);
        const episodesData = await episodesService.getEpisodesByAnimeId(
          parseInt(id)
        );
        setEpisodes(episodesData);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("Error cargando el anime o sus episodios");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-slate-200 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-slate-200 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-400">{error || "Anime no encontrado"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-sm transition-transform hover:scale-105"
          >
            Volver al inicio
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 flex flex-col">
      <Header />
      <button
        onClick={() => navigate("/Home")}
        className="px-6 py-2 text-cyan-500 font-bold rounded-sm hover:text-cyan-400 transition-colors"
      >
        ← Volver al inicio
      </button>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-8 group">
          <img
            src={anime.imagenUrl}
            alt={anime.titulo}
            className="w-full h-full object-cover object-center opacity-70 group-hover:opacity-80 transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-[#0a0a0c] via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {anime.titulo}
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl line-clamp-3 ">
              {anime.sinopsis}
            </p>
            {anime.estudioNombre && (
              <p className="text-cyan-400 text-sm mt-3">
                Estudio: {anime.estudioNombre || "N/A"}
              </p>
            )}
            {anime.generos && anime.generos.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {anime.generos.map((genero: any) => (
                  <span
                    key={genero._id}
                    className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full"
                  >
                    {genero.nombre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Episodios</h2>

          {episodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No hay episodios disponibles</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {episodes.map((episode) => (
                <EpisodeCard
                  key={episode._id}
                  episode={episode}
                  onPlay={() =>
                    navigate(`/watch/${anime._id}/episode/${episode._id}`)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

interface EpisodeCardProps {
  episode: Episode;
  onPlay: () => void;
}

const EpisodeCard = ({ episode, onPlay }: EpisodeCardProps) => {
  return (
    <div className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 rounded-lg p-4 transition-colors group cursor-pointer">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-cyan-400 font-bold">
              Episodio {episode.numero}
            </span>
            {episode.duracion && (
              <span className="text-slate-400 text-sm">
                {episode.duracion} min
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {episode.titulo}
          </h3>
          {episode.descripcion && (
            <p className="text-slate-400 text-sm line-clamp-2">
              {episode.descripcion}
            </p>
          )}
          <p className="text-xs text-slate-500 mt-2">
            Agregado:{" "}
            {new Date(episode.fechaRegistro).toLocaleDateString("es-ES")}
          </p>
        </div>

        <button
          onClick={onPlay}
          className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-sm transition-all hover:scale-105 whitespace-nowrap flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Reproducir
        </button>
      </div>
    </div>
  );
};

export default AnimeDetailsPage;
