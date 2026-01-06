import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useEffect, useState } from "react";
import DataTable from "../../components/datatable/DataTable";
import ActionMenu, { type ActionMenuItem } from "../../components/datatable/ActionsMenu";
import { usuariosService } from "../../services/usuarios.service";
import { getErrors } from "../../utilities/getErrors";
import { formatDateLocal } from "../../utilities/date";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { SweetWarning } from "../../utilities/sweetAlerts";
import AddUsuariosForm from "./addUsuariosForm";
import useIsRoot from "../../customHooks/useIsRoot";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";

function UsuariosPage() {
  const hasAccess = useIsRoot();
  const [rows, setRows] = useState<any[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<{
    show: boolean;
    data: any | null;
  }>({
    show: false,
    data: null,
  });

  const handleShowModal = async (refresh: boolean) => {
    if (refresh) {
      await getUsuarios();
    }
    setShowModal({ show: false, data: null });
  };

  const deleteUsuario = async (id: string, nombre: string) => {
    const result = await SweetWarning.fire({
      title: "¿Estás seguro?",
      html: `Vas a eliminar el usuario <strong>"${nombre}"</strong>. <br>Esta acción es irreversible.`,
      confirmButtonText: "Sí, borrarlo",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await usuariosService.delete(id);
        toast.success("¡Usuario eliminado con éxito!");
        await getUsuarios();
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

  const toggleStatus = async (id: string, nombre: string) => {
    try {
      await usuariosService.toggleStatus(id);
      toast.success(`¡Estatus de "${nombre}" actualizado!`);
      await getUsuarios();
    } catch (error: any) {
      console.error(error);
      const errores = getErrors(error as AxiosError);
      if (errores && errores.length > 0) {
        errores.forEach((err) => toast.error(err));
      } else {
        toast.error(
          error?.response?.data?.message || "Error al cambiar estatus."
        );
      }
    }
  };

  const columns = [
    {
      name: "ID",
      width: 10,
      sortable: true,
      selector: (row: any) => row._id,
      cell: (row: any) => (
        <span className="text-slate-500 font-mono text-xs">#{row._id}</span>
      ),
    },
    {
      name: "Nombre de Usuario",
      sortable: true,
      selector: (row: any) => row.nombre,
      cell: (row: any) => (
        <span className="font-semibold text-slate-200 text-sm">
          {row.nombre}
        </span>
      ),
    },
    {
      name: "Email",
      sortable: true,
      selector: (row: any) => row.email,
      cell: (row: any) => (
        <span className="text-slate-400 text-sm">{row.email}</span>
      ),
    },
    {
      name: "Rol",
      sortable: true,
      selector: (row: any) => row.rolNombre,
      cell: (row: any) => (
        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-md">
          {row.rolNombre}
        </span>
      ),
    },
    {
      name: "Plan",
      sortable: true,
      selector: (row: any) => row.planNombre,
      cell: (row: any) => (
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-md">
          {row.planNombre}
        </span>
      ),
    },
    {
      name: "Registrado",
      sortable: true,
      selector: (row: any) => row.fechaRegistro,
      cell: (row: any) => (
        <div className="flex flex-col text-xs text-slate-400">
          <span className="text-slate-300 text-xs whitespace-nowrap">
            {formatDateLocal(row.fechaRegistro)}
          </span>
        </div>
      ),
    },
    {
      name: "Estatus",
      sortable: true,
      selector: (row: any) => row.isActive,
      cell: (row: any) => (
        <button
          onClick={() => toggleStatus(row._id, row.nombre)}
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
      width: 5,
      right: true,
      cell: (row: any) => {
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
              toggleStatus(row._id, row.nombre);
            },
            color: "text-[#ffd700]",
          },
          {
            label: "Eliminar",
            icon: <HiOutlineTrash className="text-[#ff4d4d]" />,
            onClick: () => {
              setOpenMenuId(null);
              deleteUsuario(row._id, row.nombre);
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

  const getUsuarios = async () => {
    try {
      const response = await usuariosService.getAll();
      setRows(response.data);
    } catch (error: any) {
      console.error(error);
      toast.error("Error al cargar los usuarios.");
    }
  };

  useEffect(() => {
    if (hasAccess) {
      getUsuarios();
    }
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Acceso Denegado</h1>
            <p className="text-slate-400 text-lg">
              No tienes permisos para acceder a esta sección. Solo el administrador root puede ver esta página.
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
            Administración de Usuarios
          </h1>
          <p className="mt-2 text-slate-400">
            Gestiona todos los usuarios registrados en la plataforma.
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
              Especificaciones
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Esta sección solo es visible para administradores. Aquí puedes
              ver, crear, editar y eliminar usuarios de la plataforma. Asegúrate
              de asignar los roles correctamente para mantener la seguridad del
              sistema.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mt-5">
          <div className="flex w-full md:w-auto gap-4">
            {/* Card Total */}
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
                <p className="text-xl font-bold text-white">
                  {rows.filter((row) => row.isActive).length}
                </p>
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
                <p className="text-xl font-bold text-white">
                  {rows.filter((row) => !row.isActive).length}
                </p>
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
            Crear Usuario
          </button>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl mt-10">
          <DataTable
            columns={columns}
            data={rows}
            order={{ columnIndex: 0, direction: "asc" }}
          />
        </div>
        <AddUsuariosForm
          show={showModal.show}
          payload={showModal.data}
          onRequestClose={(refresh = false) => handleShowModal(refresh)}
        />
      </main>
      <Footer />
    </div>
  );
}

export default UsuariosPage;
