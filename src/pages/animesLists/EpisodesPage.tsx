import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useEffect, useState } from "react";
import DataTable from "../../components/datatable/DataTable";
import ActionMenu, { type ActionMenuItem } from "../../components/datatable/ActionsMenu";
import clientAPI from "../../services/http.service";
import { getErrors } from "../../utilities/getErrors";
import { formatDateLocal } from "../../utilities/date";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { SweetWarning } from "../../utilities/sweetAlerts";
import AddEpisodesForm from "./addEpisodesForm";
import episodesService from "../../services/episodes.service";
import type { Episode } from "../../services/episodes.service";
import useHasAccess from "../../customHooks/useHasAccess";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import { useParams } from "react-router-dom";

function EpisodesPage() {
  const { animeId } = useParams<{ animeId: string }>();
  const hasAccess = useHasAccess();
  const [rows, setRows] = useState<Episode[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<{
    show: boolean;
    data: any | null;
  }>({
    show: false,
    data: null,
  });
  const [animeName, setAnimeName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const handleShowModal = async (refresh: boolean) => {
    if (refresh) {
      await fetchData();
    }
    setShowModal({ show: false, data: null });
  };

  const fetchData = async () => {
    if (!animeId) {
      toast.error("ID del anime no encontrado");
      return;
    }
    try {
      setLoading(true);
      // Obtener episodios
      const episodios = await episodesService.getEpisodesByAnimeId(
        parseInt(animeId)
      );
      setRows(episodios);

      // Obtener nombre del anime
      const animeRes = await clientAPI.get(`/Animes/${animeId}`);
      setAnimeName(animeRes.data.titulo);
    } catch (error) {
      console.error("Error al cargar datos", error);
      toast.error("Error al cargar episodios");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, numeroEpisodio: number) => {
    const result = await SweetWarning.fire({
      title: "¿Deseas eliminar este episodio?",
      text: `Episodio ${numeroEpisodio}`,
      confirmButtonText: "Eliminar",
      icon: "warning",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await clientAPI.delete(`/Episodios/${id}`);
      toast.success("Episodio eliminado correctamente");
      await fetchData();
    } catch (error) {
      const err = error as AxiosError;
      const messages = getErrors(err);
      toast.error(messages[0]);
    }
  };

  const toggleStatus = async (id: number, numeroEpisodio: number) => {
    const episode = rows.find((e) => e._id === id);
    if (!episode) return;

    try {
      const updatedEpisode = {
        ...episode,
        isActive: !episode.isActive,
      };

      await clientAPI.put(`/Episodios/${id}`, updatedEpisode);
      toast.success(
        `Episodio ${numeroEpisodio} ${
          updatedEpisode.isActive ? "activado" : "desactivado"
        }`
      );
      await fetchData();
    } catch (error) {
      const err = error as AxiosError;
      const messages = getErrors(err);
      toast.error(messages[0]);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchData();
    }
  }, [animeId, hasAccess]);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Acceso Denegado</h1>
            <p className="text-slate-400 text-lg">
              No tienes permisos para acceder a esta sección. Solo los administradores pueden ver esta página.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  const columns = [
    {
      name: "Numero",
      selector: (row: Episode) => row.numero,
      sortable: true,
      width: 100,
    },
    {
      name: "Titulo",
      selector: (row: Episode) => row.titulo,
      sortable: true,
    },
    {
      name: "Descripcion",
      selector: (row: Episode) => row.descripcion || "N/A",
      sortable: true,
    },
    {
      name: "Duracion (min)",
      selector: (row: Episode) => row.duracion,
      sortable: true,
      width: 130,
    },
    {
      name: "Registro",
      selector: (row: Episode) =>
          formatDateLocal(row.fechaRegistro),
      sortable: true,
    },
    {
      name: "Estado",
      sortable: true,
      selector: (row: Episode) => row.isActive,
      cell: (row: Episode) => (
        <button
          onClick={() => toggleStatus(row._id, row.numero)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            row.isActive
              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
          }`}
        >
          {row.isActive ? "Activo" : "Inactivo"}
        </button>
      ),
    },
    {
      name: "Acciones",
      width: 100,
      right: true,
      cell: (row: Episode) => {
        const actions: ActionMenuItem[] = [
          {
            label: "Editar",
            icon: <HiOutlinePencil className="text-[#2affd6]" />,
            onClick: () => {
              setOpenMenuId(null);
              setShowModal({ show: true, data: row });
            },
            color: "text-[#c7fff4]",
            iconColor: "text-[#2affd6]",
          },
          {
            label: row.isActive ? "Desactivar" : "Activar",
            icon: row.isActive ? (
              <HiOutlineEyeOff className="text-[#ffa500]" />
            ) : (
              <HiOutlineEye className="text-[#90ee90]" />
            ),
            onClick: () => {
              setOpenMenuId(null);
              toggleStatus(row._id, row.numero);
            },
            color: "text-[#ffd700]",
          },
          {
            label: "Eliminar",
            icon: <HiOutlineTrash className="text-[#ff4d4d]" />,
            onClick: () => {
              setOpenMenuId(null);
              handleDelete(row._id, row.numero);
            },
            color: "text-[#ffc7c7]",
            iconColor: "text-[#ff4d4d]",
          },
        ];

        return (
          <ActionMenu
            isOpen={openMenuId === row._id}
            onToggle={() =>
              setOpenMenuId((prev) => (prev === row._id ? null : row._id))
            }
            onClose={() => setOpenMenuId(null)}
            actions={actions}
          />
        );
      },
    },
  ];

  const activeCount = rows.filter((r) => r.isActive).length;
  const inactiveCount = rows.filter((r) => !r.isActive).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Episodios - {animeName}
          </h1>
          <p className="mt-2 text-slate-400">
            Gestión de episodios del anime seleccionado.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex gap-4 items-start">
          <div className="p-2 bg-cyan-900/30 rounded-lg text-cyan-400 mt-1">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-300">
              Total de episodios:{" "}
              <span className="font-bold text-cyan-400">{rows.length}</span>
            </p>
            <p className="text-sm text-slate-300 mt-1">
              Activos:{" "}
              <span className="font-bold text-emerald-400">{activeCount}</span> |
              Inactivos:{" "}
              <span className="font-bold text-red-400">{inactiveCount}</span>
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Listado de Episodios</h2>
          <button
            onClick={() => setShowModal({ show: true, data: null })}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Agregar Episodio
          </button>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No hay episodios disponibles</p>
          </div>
        ) : (
          <DataTable columns={columns} data={rows} />
        )}
      </main>

      <AddEpisodesForm
        show={showModal.show}
        initialData={showModal.data}
        animeId={animeId ? parseInt(animeId) : 0}
        onClose={() => handleShowModal(false)}
        onSuccess={() => handleShowModal(true)}
      />

      <Footer />
    </div>
  );
}

export default EpisodesPage;
