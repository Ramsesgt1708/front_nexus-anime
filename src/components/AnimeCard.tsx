import { Link } from "react-router-dom";

interface AnimeCardProps {
  animeId: number;
  titulo: string;
  imagenUrl: string;
  estudio?: {
    _id: number;
    nombre: string;
  };
  generos?: Array<{
    _id: number;
    nombre: string;
  }>;
  fechaRegistro?: string;
  hasImageError?: boolean;
  onImageError?: () => void;
  apiBaseURL?: string;
  showInfo?: boolean; // Si muestra info en hover o no
}

const isRecentlyAdded = (dateString?: string): boolean => {
  if (!dateString) return false;
  const registroDate = new Date(dateString);
  const ahora = new Date();
  const diasTranscurridos =
    (ahora.getTime() - registroDate.getTime()) / (1000 * 60 * 60 * 24);
  return diasTranscurridos <= 7;
};

function AnimeCard({
  animeId,
  titulo,
  imagenUrl,
  estudio,
  generos,
  fechaRegistro,
  hasImageError = false,
  onImageError,
  apiBaseURL = import.meta.env.VITE_API_URL || "",
  showInfo = true,
}: AnimeCardProps) {
  const getPosterSrc = () => {
    if (!imagenUrl) return "";
    return imagenUrl.startsWith("http")
      ? imagenUrl
      : `${apiBaseURL}${imagenUrl}`;
  };

  const posterSrc = getPosterSrc();

  return (
    <Link to={`/anime/${animeId}`} className="group flex flex-col">
      {/* Tarjeta de imagen */}
      <div className="relative overflow-hidden rounded-xl bg-slate-800 aspect-[9/13] transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
        {hasImageError || !posterSrc ? (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <span className="text-slate-400 text-center px-2 text-sm">
              Sin imagen
            </span>
          </div>
        ) : (
          <img
            src={posterSrc}
            alt={titulo}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={onImageError}
          />
        )}

        {/* Overlay oscuro en hover */}
        {showInfo && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}

        {/* Badge de "Nuevo" */}
        {fechaRegistro && isRecentlyAdded(fechaRegistro) && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Nuevo
            </span>
          </div>
        )}

        {/* Icono play en hover */}
        {showInfo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-current ml-1"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Información en hover */}
        {showInfo && (
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-slate-950 to-transparent">
            {estudio && (
              <p className="text-cyan-400 text-xs mb-2">{estudio.nombre}</p>
            )}
            {generos && generos.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {generos.slice(0, 2).map((genero) => (
                  <span
                    key={genero._id}
                    className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded"
                  >
                    {genero.nombre}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Título debajo de la tarjeta */}
      <div className="mt-3 flex flex-col">
        <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {titulo}
        </h3>
        {estudio && !showInfo && (
          <p className="text-cyan-400 text-xs mt-1">{estudio.nombre}</p>
        )}
      </div>
    </Link>
  );
}

export default AnimeCard;
