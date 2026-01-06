import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import type { Episode } from "../../services/episodes.service";
import episodesService from "../../services/episodes.service";
import clientAPI from "../../services/http.service";
import continueWatchingService from "../../services/continueWatching.service";

import Swal from "sweetalert2";

interface Anime {
  _id: number;
  titulo: string;
  imagenUrl: string;
  estudio?: {
    _id: number;
    nombre: string;
  };
}

const EpisodePlayerPage = () => {
  const { animeId, episodeId } = useParams<{
    animeId: string;
    episodeId: string;
  }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveTimeoutRef = useRef<any | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasShownAlert, setHasShownAlert] = useState(false);
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]);
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null);
  const [prevEpisode, setPrevEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!animeId || !episodeId) {
          setError("Parámetros inválidos");
          return;
        }

        // Resetear estados de navegación
        setNextEpisode(null);
        setPrevEpisode(null);

        // Obtener episodio
        const episodeData = await episodesService.getEpisodeById(
          parseInt(episodeId)
        );
        setEpisode(episodeData);

        // Obtener datos del anime
        const animeResponse = await clientAPI.get(`/Animes/${animeId}`);
        setAnime(animeResponse.data);

        // Obtener todos los episodios del anime para navegación
        const episodes = await episodesService.getEpisodesByAnimeId(parseInt(animeId));
        setAllEpisodes(episodes);

        // Encontrar episodio anterior y siguiente
        const currentIndex = episodes.findIndex(ep => ep._id === episodeData._id);
        if (currentIndex > 0) {
          setPrevEpisode(episodes[currentIndex - 1]);
        }
        if (currentIndex < episodes.length - 1) {
          setNextEpisode(episodes[currentIndex + 1]);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("Error cargando el episodio");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [animeId, episodeId]);

  // Guardar en localStorage cuando se reproduce el video y guardar tiempo periódicamente
  useEffect(() => {
    if (episode && anime && videoRef.current) {
      const videoElement = videoRef.current;

      // Guardar en historial cuando comienza a reproducir
      const handlePlay = () => {
        continueWatchingService.addToHistory({
          animeId: anime._id,
          animeTitulo: anime.titulo,
          animeImagenUrl: anime.imagenUrl,
          episodeId: episode._id,
          episodeNumero: episode.numero,
          episodeTitulo: episode.titulo,
          currentTime: videoElement.currentTime,
          duration: videoElement.duration,
          estudio: anime.estudio,
        });
      };

      // Guardar tiempo cada 10 segundos
      const handleTimeUpdate = () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
          continueWatchingService.updateWatchTime(
            anime._id,
            episode._id,
            videoElement.currentTime,
            videoElement.duration
          );
        }, 1000);
      };

      videoElement.addEventListener("play", handlePlay);
      videoElement.addEventListener("timeupdate", handleTimeUpdate);

      return () => {
        videoElement.removeEventListener("play", handlePlay);
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [episode, anime]);

  // Mostrar alerta y cargar progreso guardado
  useEffect(() => {
    if (
      episode &&
      anime &&
      videoRef.current &&
      !hasShownAlert &&
      !loading
    ) {
      const progress = continueWatchingService.getEpisodeProgress(
        anime._id,
        episode._id
      );

      if (progress && progress.currentTime > 120 && progress.currentTime < (progress.duration || 0) - 5) {
        // Solo mostrar si ha visto más de 2 minutos y no está casi al final
        setHasShownAlert(true);

        Swal.fire({
          title: "¿Continuar viendo?",
          html: `<p>Dejaste este episodio en el minuto <strong>${formatTime(progress.currentTime)}</strong></p>`,
          icon: "question",
          confirmButtonText: "Continuar desde ahí",
          cancelButtonText: "Desde el principio",
          showCancelButton: true,
          confirmButtonColor: "#06b6d4",
          cancelButtonColor: "#64748b",
          background: "#1e293b",
          color: "#fff",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then((result) => {
          if (result.isConfirmed) {
            // Continuar desde donde se quedó
            videoRef.current!.currentTime = progress.currentTime;
          } else {
            // Comenzar desde el principio
            videoRef.current!.currentTime = 0;
          }
          // Reproducir después de elegir
          videoRef.current!.play();
        });
      } else {
        // Si no hay progreso, reproducir automáticamente desde el principio
        setHasShownAlert(true);
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          // Algunos navegadores requieren interacción del usuario
          console.log("Autoplay no permitido, esperar interacción");
        });
      }
    }
  }, [episode, anime, loading, hasShownAlert]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  const goToEpisode = (targetEpisodeId: number) => {
    if (animeId) {
      navigate(`/watch/${animeId}/episode/${targetEpisodeId}`);
    }
  };

  if (error || !episode) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-400">{error || "Episodio no encontrado"}</p>
          <button
            onClick={() => navigate(`/anime/${animeId}`)}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-sm transition-transform hover:scale-105"
          >
            Volver a episodios
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const videoUrl = `https://localhost:7062/videos/${episode.videoUrl}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        {/* Reproductor de video */}
        {anime && (
          <button
            onClick={() => navigate(`/anime/${anime._id}`)}
            className="text-cyan-400 hover:text-cyan-300 text-2xl flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <h1 className="">Volver a {anime.titulo}</h1>
          </button>
        )}
        <div className="mb-8 mt-8">
          <div className="aspect-video w-full bg-black border border-slate-800 rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              controls
              controlsList="nodownload"
              className="w-full h-full"
              src={videoUrl}
              crossOrigin="anonymous"
            />
          </div>

          {/* Botones de navegación entre episodios */}
          <div className="flex gap-3 mt-4 justify-between">
            {prevEpisode ? (
              <button
                onClick={() => goToEpisode(prevEpisode._id)}
                className="flex items-center gap-2 px-4 py-2 rounded font-semibold transition-colors bg-slate-800 hover:bg-slate-700 text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Ep. {prevEpisode.numero}: {prevEpisode.titulo}
              </button>
            ) : (
              <div></div>
            )}

            {nextEpisode && (
              <button
                onClick={() => goToEpisode(nextEpisode._id)}
                className="flex items-center gap-2 px-4 py-2 rounded font-semibold transition-colors bg-cyan-500 hover:bg-cyan-400 text-black"
              >
                Ep. {nextEpisode.numero}: {nextEpisode.titulo}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Información del episodio */}
        <div className="space-y-4">
          <div className="border-t border-slate-800 pt-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Episodio {episode.numero}: {episode.titulo}
            </h1>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Duración:</span>
                <span className="text-white font-semibold">
                  {episode.duracion} min
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Agregado:</span>
                <span className="text-white font-semibold">
                  {new Date(episode.fechaRegistro).toLocaleDateString("es-ES")}
                </span>
              </div>
            </div>

            {episode.descripcion && (
              <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">
                  Descripción
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {episode.descripcion}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nota sobre CORS */}
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-200 text-sm">
          <p>
            <strong>Nota:</strong> Si el video no se reproduce, verifique que el
            servidor de videos esté funcionando y que los certificados HTTPS
            sean válidos.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Función auxiliar para convertir segundos a formato MM:SS
const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export default EpisodePlayerPage;
