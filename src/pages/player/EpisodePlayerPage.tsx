import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import type { Episode } from "../../services/episodes.service";
import episodesService from "../../services/episodes.service";
import clientAPI from "../../services/http.service";
import continueWatchingService from "../../services/continueWatching.service";
import watchHistoryService from "../../services/watchHistory.service";
import authService from "../../services/auth.service";

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
  const listenersAttachedRef = useRef(false);
  const lastProgressRef = useRef<{ time: number; duration: number }>({ time: 0, duration: 0 });
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasShownAlert, setHasShownAlert] = useState(false);
  const [allEpisodes,setAllEpisodes] = useState<Episode[]>([]);
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null);
  const [prevEpisode, setPrevEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!animeId || !episodeId) {
          setError("Parámetros inválidos");
          return;
        }
        setNextEpisode(null);
        setPrevEpisode(null);
        const episodeData = await episodesService.getEpisodeById(
          parseInt(episodeId)
        );
        setEpisode(episodeData);

        const animeResponse = await clientAPI.get(`/Animes/${animeId}`);
        setAnime(animeResponse.data);

        const episodes = await episodesService.getEpisodesByAnimeId(parseInt(animeId));
        setAllEpisodes(episodes);

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

  const sendProgress = async (currentTime: number, duration: number) => {
    const usuario = authService.getUsuario();

    if (usuario?._id && anime && episode) {
      const completado = duration > 0 && (currentTime / duration) >= 0.9;

      const payload = {
        usuarioId: usuario._id,
        animeId: anime._id,
        episodioId: episode._id,
        tiempoReproducido: Math.floor(currentTime),
        completado: completado,
      };

      try {
        await watchHistoryService.saveProgress(payload);
      } catch (err: any) {
        console.error("❌ Error guardando progreso:", err);
        console.error("❌ Detalles del error:", err?.response?.data);
      }
    } else {
      // Usuario no disponible; no se guarda
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      flushProgress();
    };
  }, []);

  // Configurar eventos cuando el video se carga
  const setupVideoListeners = () => {
    if (!episode || !anime || !videoRef.current || listenersAttachedRef.current) {
      return;
    }

    const videoElement = videoRef.current;
    listenersAttachedRef.current = true;

    const handlePlay = () => {
      if (!anime || !episode) return;

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

    const handleTimeUpdate = () => {
      if (!anime || !episode) return;

      lastProgressRef.current = { time: videoElement.currentTime, duration: videoElement.duration };

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        const currentTime = videoElement.currentTime;
        const duration = videoElement.duration;

        continueWatchingService.updateWatchTime(
          anime._id,
          episode._id,
          currentTime,
          duration
        );

        void sendProgress(currentTime, duration);
      }, 1500);
    };

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
  };

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
            videoRef.current!.currentTime = progress.currentTime;
          } else {
            videoRef.current!.currentTime = 0;
          }
          videoRef.current!.play();
        });
      } else {
        setHasShownAlert(true);
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          /* Autoplay no permitido */
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

  function flushProgress() {
    const { time, duration } = lastProgressRef.current;
    if (time > 0) {
      void sendProgress(time, duration);
    }
  }

  const goToEpisode = (targetEpisodeId: number) => {
    if (animeId) {
      flushProgress();
      navigate(`/watch/${animeId}/episode/${targetEpisodeId}`);
    }
  };

  const handleBackToAnime = () => {
    if (anime?._id) {
      flushProgress();
      navigate(`/anime/${anime._id}`);
    }
  };

  if (error || !episode) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-400">{error || "Episodio no encontrado"}</p>
          <button
            onClick={() => {
              flushProgress();
              navigate(`/anime/${animeId}`);
            }}
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
            onClick={handleBackToAnime}
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
                             onLoadedMetadata={setupVideoListeners}
              onPause={flushProgress}
              onEnded={flushProgress}
              controls
              controlsList="nodownload"
              className="w-full h-full"
              src={videoUrl}
              crossOrigin="anonymous"
            />
          </div>
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
        <div className="space-y-4">
          <div className="border-t border-slate-800 pt-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Ep {episode.numero} - {episode.titulo}
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
      </main>
      <Footer />
    </div>
  );
};

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export default EpisodePlayerPage;
