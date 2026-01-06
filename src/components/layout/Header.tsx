import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import authService from "../../services/auth.service";
import { canAccessAdminPanel, isRoot } from "../../utilities/contsants";

const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [userName, setUserName] = useState("Usuario");
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [isRootUser, setIsRootUser] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const adminTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUserName(authService.getUserName());
    const userRole = authService.getUserRole();
    setHasAdminAccess(canAccessAdminPanel(userRole));
    setIsRootUser(isRoot(userRole));
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (adminTimeoutRef.current) {
        clearTimeout(adminTimeoutRef.current);
        adminTimeoutRef.current = null;
      }
    };
  }, []);

  const logout = () => {
    authService.clearAuthData();
    navigate("/auth/login");
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-700">
      <div className="w-full flex items-center justify-between px-6 py-3">
        {/* ============ LOGO IZQUIERDA ============ */}
        <div className="flex items-center gap-3">
          <Link to="/Home" className="flex items-center">
            <img
              src="/media/LogoNexus.png"
              alt="LogoNexus"
              className="h-20 w-auto"
            />
          </Link>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/Home"
            className=" hover:bg-slate-800 font-semibold py-4 px-2 hover:text-cyan-400 rounded-3xl"
          >
            Inicio
          </Link>
          <Link
            to="/categorias"
            className="hover:bg-slate-800 font-semibold py-4 px-2 hover:text-cyan-400 rounded-3xl"
          >
            Categorias
          </Link>
          <Link
            to="/simulcasts"
            className="hover:bg-slate-800 font-semibold py-4 px-2 hover:text-cyan-400 rounded-3xl"
          >
            Simulcast
          </Link>

          {hasAdminAccess && (
            <div
              className="relative"
              onMouseEnter={() => {
              if (adminTimeoutRef.current) {
                clearTimeout(adminTimeoutRef.current);
                adminTimeoutRef.current = null;
              }
              setIsAdminOpen(true);
            }}
            onMouseLeave={() => {
              adminTimeoutRef.current = setTimeout(
                () => setIsAdminOpen(false),
                180
              );
            }}
          >
            <button className="hover:bg-slate-800 font-semibold py-4 px-2 hover:text-cyan-400 rounded-3xl flex items-center gap-1">
              Administrar Animes
              <svg
                className={`w-4 h-4 transition-transform ${
                  isAdminOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            <div
              className={
                `absolute top-full mt-2 left-0 w-[200px] bg-slate-900 border border-slate-700 rounded-lg shadow-lg transition-all duration-150 ease-out z-50 ` +
                (isAdminOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 translate-y-1 pointer-events-none")
              }
            >
              <div className="py-2 px-0 text-sm">
                <Link
                  to="/admin/dashboard"
                  className="block px-4 py-2 hover:bg-slate-800 text-slate-200"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/animes"
                  className="block px-4 py-2 hover:bg-slate-800 text-slate-200"
                >
                  Animes
                </Link>
                <Link
                  to="/admin/generos"
                  className="block px-4 py-2 hover:bg-slate-800 text-slate-200"
                >
                  Géneros
                </Link>
                <Link
                  to="/admin/estudios"
                  className="block px-4 py-2 hover:bg-slate-800 text-slate-200"
                >
                  Estudios
                </Link>
                <div className="border-t border-slate-700 my-1" />
                {isRootUser && (
                  <>
                    <Link
                      to="/admin/users"
                      className="block px-4 py-2 hover:bg-slate-800 text-slate-200"
                    >
                      Usuarios
                    </Link>
                    <Link
                      to="/admin/roles"
                      className="block px-4 py-2 hover:bg-slate-800 text-slate-200"
                    >
                      Roles
                    </Link>
                    <Link
                      to="/admin/planes"
                      className="block px-4 py-2 hover:bg-slate-800 text-slate-200"
                    >
                      Planes
                    </Link>
                  </>
                )}
              </div>
            </div>
            </div>
          )}
        </nav>
        <div
          className="relative"
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            setIsOpen(true);
          }}
          onMouseLeave={() => {
            timeoutRef.current = setTimeout(() => setIsOpen(false), 180);
          }}
        >
          {/* Avatar */}
          <div
            className="flex items-center gap-2 border border-slate-600 rounded-full pr-3 py-1 cursor-pointer"
            tabIndex={0}
            onFocus={() => {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              setIsOpen(true);
            }}
            onBlur={() => {
              timeoutRef.current = setTimeout(() => setIsOpen(false), 180);
            }}
          >
            <img
              src="/media/icons/user.png"
              alt="profile picture"
              className="rounded-full w-10 h-10 object-cover"
            />
            <span className="text-sm font-semibold hidden sm:inline">
              {userName}
            </span>
          </div>

          <div
            className={
              `absolute top-full mt-2 right-0 w-[250px] bg-slate-900 border border-slate-700 rounded-lg shadow-lg transition-all duration-150 ease-out z-50 ` +
              (isOpen
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-95 translate-y-1 pointer-events-none")
            }
          >
            <div className="py-4 px-4 text-sm">
              <Link
                to="/profile"
                className="block px-4 py-2 hover:bg-slate-800"
              >
                Ver perfil
              </Link>

              <Link
                to="/account"
                className="block px-4 py-2 hover:bg-slate-800"
              >
                Configuración de cuenta
              </Link>

              <Link
                to="/notifications"
                className="block px-4 py-2 hover:bg-slate-800"
              >
                Notificaciones
              </Link>

              <div className="border-t border-slate-700 my-1" />
              <button
                type="button"
                onClick={logout}
                className="
                  block w-full text-left p-2.5
                  text-red-500 hover:bg-slate-800 hover:text-red-600
                  bg-transparent border-0
                  focus:outline-none
                "
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
