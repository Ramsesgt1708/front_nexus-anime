import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <>
      <div className="w-full h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg flex flex-col items-center justify-center">
          <img
            src="/media/404.png"
            alt="404 Not Found"
            className="w-[450px] h-auto object-contain"
          />
          <div className="w-full flex flex-col gap-2 items-center">
            <h2 className="text-4xl font-bold text-center">
              404 - Página No Encontrada
            </h2>
            <p className="text-center text-slate-600">
              Lo sentimos, la página que estás buscando no existe o ha sido
              movida.
            </p>
            <Link
              to="/Home"
              className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
