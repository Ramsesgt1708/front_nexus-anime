// src/App.tsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import authService from "./services/auth.service";
import useHasAccess from "./customHooks/useHasAccess";

import AuthPage from "./pages/auth/authPage";
import DashBoard from "./pages/dashboard/DashBoard";
import NotFound from "./components/layout/NotFound";
import GenresPage from "./pages/genres/GenresPage";
import AnimesPage from "./pages/animesLists/AnimesPage";
import StudiosPage from "./pages/studios/StudiosPage";
import PlayerPage from "./components/player/playerPage";
import HomePage from "./pages/home/homePage";
import AnimeDetailsPage from "./pages/animesLists/AnimeDetailsPage";
import EpisodePlayerPage from "./pages/player/EpisodePlayerPage";
import EpisodesPage from "./pages/animesLists/EpisodesPage";
import SimulcastsPage from "./pages/Simulcasts/SimulcastsPage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import UsuariosPage from "./pages/usuarios/UsuariosPage";
import RolesPage from "./pages/roles/RolesPage";
import PlanesPage from "./pages/planes/PlanesPage";

const PrivateRoute = () => {
  const [checking, setChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validate = async () => {
      if (window.location.pathname.startsWith("/recovery-password")) {
        setIsValid(true);
        setChecking(false);
        return;
      }

      if (!authService.isAuthenticated()) {
        setIsValid(false);
        setChecking(false);
        return;
      }

      setIsValid(true);
      setChecking(false);
    };

    validate();
  }, []);

  if (checking) return null;

  if (!isValid) return <Navigate to="/auth/login" replace />;

  return <Outlet />;
};

const AdminRoute = () => {
  const hasAccess = useHasAccess();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [hasAccess]);

  if (checking) return null;

  if (!hasAccess) return <Navigate to="/404" replace />;

  return <Outlet />;
};

const LayoutRoute = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

const App = () => {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#334155",
            color: "#fff",
          },
        }}
      />
      <Routes>
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth">
          <Route path="login" element={<AuthPage />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route element={<LayoutRoute />}>
            <Route path="/Home" element={<HomePage />} />
            <Route path="/simulcasts" element={<SimulcastsPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/anime/:id" element={<AnimeDetailsPage />} />
            <Route
              path="/watch/:animeId/episode/:episodeId"
              element={<EpisodePlayerPage />}
            />
            <Route path="/anime/:animeId/episodes" element={<EpisodesPage />} />
            <Route path="/player" element={<PlayerPage />} />
            <Route element={<AdminRoute />}>
              <Route path="admin/animes" element={<AnimesPage />} />
              <Route path="admin/generos" element={<GenresPage />} />
              <Route path="admin/estudios" element={<StudiosPage />} />
              <Route path="admin/dashboard" element={<DashBoard />} />
              <Route path="admin/users" element={<UsuariosPage />} />
              <Route path="admin/roles" element={<RolesPage />} />
              <Route path="admin/planes" element={<PlanesPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
