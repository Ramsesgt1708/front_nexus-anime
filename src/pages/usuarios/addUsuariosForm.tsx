import { useEffect, useRef, useState } from "react";
import useModal from "../../customHooks/useForm";
import { useForm, Controller } from "react-hook-form";
import Input from "../../components/forms/input";
import SelectInput from "../../components/forms/select";
import { usuariosService } from "../../services/usuarios.service";
import { rolesService } from "../../services/roles.service";
import { planesService } from "../../services/planes.service";
import toast from "react-hot-toast";
import { getErrors } from "../../utilities/getErrors";
import type { AxiosError } from "axios";

interface AddUsuariosProps {
  show: boolean;
  onRequestClose: (refresh: boolean) => void;
  payload?: any;
}

export default function AddUsuariosForm({
  show,
  onRequestClose,
  payload,
}: AddUsuariosProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useModal(modalRef, show);
  const [rolesOptions, setRolesOptions] = useState<any[]>([]);
  const [planesOptions, setPlanesOptions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const defaultValues = {
    _id: "" as string | undefined,
    nombre: "",
    email: "",
    password: "",
    rolId: 0,
    planId: 0,
  };
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues,
  });

  // Cargar roles y planes
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [rolesRes, planesRes] = await Promise.all([
          rolesService.getAll(),
          planesService.getAll(),
        ]);
        
        // Filtrar solo los roles activos
        setRolesOptions(
          rolesRes.data
            .filter((role: any) => role.isActive)
            .map((role: any) => ({
              value: role._id,
              label: role.nombre,
            }))
        );
        
        // Filtrar solo los planes activos
        setPlanesOptions(
          planesRes.data
            .filter((plan: any) => plan.isActive)
            .map((plan: any) => ({
              value: plan._id,
              label: plan.nombre,
            }))
        );
      } catch (error) {
        console.error("Error cargando opciones:", error);
        toast.error("Error al cargar roles y planes");
      } finally {
        setLoadingOptions(false);
      }
    };

    if (show) {
      loadOptions();
    }
  }, [show]);

  const onSubmit = async (data: typeof defaultValues) => {
    delete data._id;
    // Si es edición y la password está vacía, no la incluimos
    if (payload && !data.password) {
      const { password, ...dataWithoutPassword } = data;
      try {
        await usuariosService.update(payload._id, dataWithoutPassword);
        reset(defaultValues);
        onRequestClose(true);
        toast.success("¡Usuario actualizado con éxito!");
      } catch (error: any) {
        console.error(error);
        const errores = getErrors(error as AxiosError);
        if (errores && errores.length > 0) {
          errores.forEach((err) => toast.error(err));
        } else {
          toast.error(
            error?.response?.data?.message || "Error al guardar el usuario."
          );
        }
      }
    } else {
      try {
        if (payload) {
          await usuariosService.update(payload._id, data);
        } else {
          await usuariosService.create(data);
        }
        reset(defaultValues);
        onRequestClose(true);
        toast.success(payload ? "¡Usuario actualizado con éxito!" : "¡Usuario creado con éxito!");
      } catch (error: any) {
        console.error(error);
        const errores = getErrors(error as AxiosError);
        if (errores && errores.length > 0) {
          errores.forEach((err) => toast.error(err));
        } else {
          toast.error(
            error?.response?.data?.message || "Error al guardar el usuario."
          );
        }
      }
    }
  };

  const handleClose = () => {
    reset(defaultValues);
    onRequestClose(false);
  };

  useEffect(() => {
    if (payload) {
      reset({
        _id: payload._id,
        nombre: payload.nombre || defaultValues.nombre,
        email: payload.email || defaultValues.email,
        password: "",
        rolId: payload.rolId || defaultValues.rolId,
        planId: payload.planId || defaultValues.planId,
      });
    } else {
      reset(defaultValues);
    }
  }, [payload, reset]);

  if (!show) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />
      <div
        ref={modalRef}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">
              {payload?._id ? "Editar" : "Crear"} Usuario
            </h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-6">
              <div className="mb-4">
                <Input
                  label="Nombre de Usuario"
                  placeholder="adminHG"
                  requiredIndicator="required"
                  errors={errors.nombre}
                  {...register("nombre", {
                    required: "El nombre de usuario es obligatorio",
                    setValueAs: (value) => value.trim(),
                  })}
                />
              </div>
              <div className="mb-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  requiredIndicator="required"
                  errors={errors.email}
                  {...register("email", {
                    required: "El email es obligatorio",
                    setValueAs: (value) => value.trim(),
                  })}
                />
              </div>
              <div className="mb-4">
                <Input
                  label={payload ? "Contraseña (dejar vacío para mantener)" : "Contraseña"}
                  type="password"
                  placeholder="••••••••"
                  requiredIndicator={!payload ? "required" : ""}
                  errors={errors.password}
                  {...register("password", {
                    required: payload ? false : "La contraseña es obligatoria",
                    minLength: payload ? undefined : {
                      value: 6,
                      message: "La contraseña debe tener al menos 6 caracteres",
                    },
                  })}
                />
              </div>
              <div className="mb-4">
                <SelectInput
                  name="rolId"
                  control={control}
                  label="Rol"
                  options={rolesOptions}
                  error={errors.rolId}
                  placeholder="Selecciona un rol"
                  isLoading={loadingOptions}
                  isSearcheable={true}
                  rules={{ 
                    required: "El rol es obligatorio",
                    validate: (value:any) => value && value !== 0 ? true : "El rol es obligatorio"
                  }}
                />
              </div>
              <div className="mb-4">
                <SelectInput
                  name="planId"
                  control={control}
                  label="Plan"
                  options={planesOptions}
                  error={errors.planId}
                  placeholder="Selecciona un plan"
                  isLoading={loadingOptions}
                  isSearcheable={true}
                  rules={{ 
                    required: "El plan es obligatorio",
                    validate: (value:any) => value && value !== 0 ? true : "El plan es obligatorio"
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-md text-slate-200 hover:bg-slate-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isValid || isSubmitting || loadingOptions}
                className="px-6 py-2 rounded-md bg-cyan-500 text-white hover:bg-cyan-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Guardando..." : (!payload?._id ? "Guardar" : "Editar")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
