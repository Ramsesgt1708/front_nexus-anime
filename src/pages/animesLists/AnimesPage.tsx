import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useEffect, useState } from "react";
import DataTable from "../../components/datatable/DataTable";
import { useNavigate } from "react-router-dom";
import ActionMenu, { type ActionMenuItem } from "../../components/datatable/ActionsMenu";
import clientAPI from "../../services/http.service";
import { getErrors } from "../../utilities/getErrors";
import { formatDateLocal } from "../../utilities/date";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { SweetWarning } from "../../utilities/sweetAlerts";
import AddAnimeForm from "./addAnimesForm";
import useHasAccess from "../../customHooks/useHasAccess";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";

function AnimesPage() {
  const hasAccess = useHasAccess();
  const [rows, setRows] = useState<any[]>([]);
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<{
    show: boolean;
    data: any | null;
  }>({
    show: false,
    data: null,
  });

  const [imagePreview, setImagePreview] = useState<{
    open: boolean;
    src: string;
    alt: string;
  }>({ open: false, src: "", alt: "" });

  const openImagePreview = (src: string, alt: string) =>
    setImagePreview({ open: true, src, alt });
  const closeImagePreview = () =>
    setImagePreview({ open: false, src: "", alt: "" });

  const handleShowModal = async (refresh: boolean) => {
    if (refresh) {
      await fetchData();
    }
    setShowModal({ show: false, data: null });
  };

  const fetchData = async () => {
    try {
      const response = await clientAPI.get("/Animes");
      setRows(response.data);
    } catch (error) {
      console.error("Error al cargar datos", error);
    }
  };

  const handleDelete = async (id: number, nombreRegistro: string) => {
    const result = await SweetWarning.fire({
      title: "¿Estás seguro?",
      html: `Vas a eliminar anime <strong>"${nombreRegistro}"</strong>. <br>Esta acción es irreversible.`,
      confirmButtonText: "Sí, borrarlo",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await clientAPI.delete(`/Animes/${id}`);
        toast.success(`¡Anime eliminado con éxito!`);
        await fetchData();
      } catch (error: any) {
        console.error(error);
        const errores = getErrors(error as AxiosError);
        if (errores && errores.length > 0) {
          errores.forEach((err) => toast.error(err));
        } else {
          toast.error(error?.response?.data?.message || "Error al eliminar.");
        }
      }
    }
  };

  const toggleStatus = async (id: number, titulo: string) => {
    try {
      await clientAPI.patch(`/Animes/${id}/toggle-status`);
      toast.success(`¡Estatus de "${titulo}" actualizado!`);
      await fetchData();
    } catch (error: any) {
      console.error(error);
      const errores = getErrors(error as AxiosError);
      if (errores && errores.length > 0) {
        errores.forEach((err) => toast.error(err));
      } else {
        toast.error(error?.response?.data?.message || "Error al cambiar estatus.");
      }
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchData();
    }
  }, [hasAccess]);

  const getPosterSrc = (row: any) => {
    if (!row?.imagenUrl) return "";
    const url = row.imagenUrl as string;
    return url.startsWith("http")
      ? url
      : `${import.meta.env.VITE_API_URL || ""}${url}`;
  };

  const columns = [
    {
      name: "Poster",
      sortable: false,
      cell: (row: any) => (
        <div className="flex">
          <img 
            src={getPosterSrc(row)} 
            alt={row.titulo}
            className="h-[150px] w-[100px] object-cover rounded border border-slate-700 hover:border-cyan-500 transition cursor-zoom-in"
            onClick={(e) => {
              e.stopPropagation();
              const src = getPosterSrc(row);
              if (src) openImagePreview(src, row.titulo);
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/36x54?text=No+Img";
            }}
          />
        </div>
      ),
    },
    {
      name: "Título",
      sortable: true,
      selector: (row: any) => row.titulo,
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-100 text-sm">
            {row.titulo}
          </span>
          <span className="text-xs text-slate-500">#{row._id}</span>
        </div>
      ),
    },
    {
      name: "Estudio",
      sortable: true,
      selector: (row: any) => row.estudioNombre || "N/A",
      cell: (row: any) => (
        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold border border-purple-500/30">
          {row.estudioNombre || "Sin Estudio"}
        </span>
      ),
    },
    {
      name: "Géneros",
      sortable: false,
      cell: (row: any) => (
        <div className="flex flex-wrap gap-2">
          {row.generos && row.generos.length > 0 ? (
            row.generos.map((genero: any) => (
              <span 
                key={genero._id}
                className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs font-medium border border-cyan-500/30"
              >
                {genero.nombre}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">Sin géneros</span>
          )}
        </div>
      ),
    },
    {
      name: "Estreno",
      sortable: true,
      selector: (row: any) => row.fechaEstreno,
      cell: (row: any) => (
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {row.fechaEstreno ? formatDateLocal(row.fechaEstreno) : "N/A"}
        </span>
      ),
    },
    {
      name: "Estado",
      sortable: true,
      selector: (row: any) => row.isActive,
      cell: (row: any) => (
        <button
          onClick={() => toggleStatus(row._id, row.titulo)}
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
      width: 2,
      right: true,
      cell: (row: any) => {
        const actions: ActionMenuItem[] = [
          {
            label: "Ver Episodios ",
            icon: <HiOutlineEye className="text-[#90ee90]" />,
            onClick: () => {
              setOpenMenuId(null);
                navigate(`/anime/${row._id}/episodes`);
            },
            color: "text-[#c7fff4]",
            iconColor: "text-[#90ee90]",
          },
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
              toggleStatus(row._id, row.titulo);
            },
            color: "text-[#ffd700]",
          },
          {
            label: "Eliminar",
            icon: <HiOutlineTrash className="text-[#ff4d4d]" />,
            onClick: () => {
              setOpenMenuId(null);
              handleDelete(row._id, row?.titulo);
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

  const activeCount = rows.filter(r => r.isActive).length;
  const inactiveCount = rows.filter(r => !r.isActive).length;

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Administración de Animes
          </h1>
          <p className="mt-2 text-slate-400">
            Gestión del catálogo maestro de Animes en la plataforma.
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
            <h3 className="text-white font-semibold text-sm mb-1">
              Especificaciones del Módulo
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Utilice este panel para crear, editar o eliminar registros de los
              animes de la plataforma. Los cambios realizados aquí se reflejarán
              inmediatamente en la aplicación de usuario.
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mt-5">
          <div className="flex w-full md:w-auto gap-4">
            <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl flex items-center gap-4 min-w-[140px]">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Total
                </p>
                <p className="text-xl font-bold text-white">{rows.length}</p>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl flex items-center gap-4 min-w-[140px]">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Activos
                </p>
                <p className="text-xl font-bold text-white">{activeCount}</p>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl flex items-center gap-4 min-w-[140px]">
              <div className="p-2 bg-slate-700/30 rounded-lg text-slate-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Inactivos
                </p>
                <p className="text-xl font-bold text-white">{inactiveCount}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModal({ show: true, data: null })}
            className="group flex items-center gap-2 px-6 py-3 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02]"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Agregar Anime
          </button>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl mt-10">
          <DataTable
            columns={columns}
            data={rows}
            order={{ columnIndex: 0, direction: "asc" }}
          />
        </div>

        {imagePreview.open && (
          <>
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity"
              onClick={closeImagePreview}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-6 md:p-10 overflow-y-auto">
              <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_40px_rgba(8,145,178,0.2)] w-full max-w-4xl transform transition-all my-10">
                <button
                  onClick={closeImagePreview}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="p-4 md:p-6">
                  <img
                    src={imagePreview.src}
                    alt={imagePreview.alt}
                    className="w-full max-h-[80vh] object-contain rounded-lg border border-slate-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x1200?text=No+Img";
                    }}
                  />
                  <div className="text-center text-slate-300 text-sm mt-3 truncate">
                    {imagePreview.alt}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <AddAnimeForm
          show={showModal.show}
          payload={showModal.data}
          onRequestClose={(refresh = false) => handleShowModal(refresh)}
        />
      </main>
      <Footer />
    </div>
  );
}

export default AnimesPage;
