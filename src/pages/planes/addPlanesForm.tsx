import { useEffect, useRef } from "react";
import useModal from "../../customHooks/useForm";
import { useForm } from "react-hook-form";
import Input from "../../components/forms/input";
import { planesService } from "../../services/planes.service";
import toast from "react-hot-toast";
import { getErrors } from "../../utilities/getErrors";
import type { AxiosError } from "axios";

interface AddPlanesProps {
  show: boolean;
  onRequestClose: (refresh: boolean) => void;
  payload?: any;
}

export default function AddPlanesForm({
  show,
  onRequestClose,
  payload,
}: AddPlanesProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useModal(modalRef, show);
  const defaultValues = {
    _id: "" as string | undefined,
    nombre: "",
    precio: 0,
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues,
  });

  const onSubmit = async (data: typeof defaultValues) => {
    delete data._id;
    try {
      if (payload) {
        await planesService.update(payload._id, data);
      } else {
        await planesService.create(data);
      }
      reset(defaultValues);
      onRequestClose(true);
      toast.success(payload ? "¡Plan actualizado con éxito!" : "¡Plan creado con éxito!");
    } catch (error: any) {
      console.error(error);
      const errores = getErrors(error as AxiosError);
      if (errores && errores.length > 0) {
        errores.forEach((err) => toast.error(err));
      } else {
        toast.error(
          error?.response?.data?.message || "Error al guardar el plan."
        );
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
        _id: payload._id || defaultValues._id,
        nombre: payload.nombre || defaultValues.nombre,
        precio: payload.precio || defaultValues.precio,
      });
    } else {
      reset(defaultValues);
    }
  }, [payload, reset, setValue]);

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
              {payload?._id ? "Editar" : "Agregar"} Plan
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
                  label="Nombre del Plan"
                  placeholder="Ej: Plan Básico, Plan Premium, Plan Pro..."
                  requiredIndicator="required"
                  errors={errors.nombre}
                  {...register("nombre", {
                    required: "El nombre es obligatorio",
                    setValueAs: (value) => value.trim(),
                  })}
                />
              </div>
              <div className="mb-4">
                <Input
                  label="Precio"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  requiredIndicator="required"
                  errors={errors.precio}
                  {...register("precio", {
                    required: "El precio es obligatorio",
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "El precio no puede ser negativo",
                    },
                    validate: (value) => {
                      const decimals = value.toString().split('.')[1];
                      if (decimals && decimals.length > 2) {
                        return "El precio solo puede tener máximo 2 decimales";
                      }
                      return true;
                    }
                  })}
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
                disabled={!isValid || isSubmitting}
                className="px-6 py-2 rounded-md bg-cyan-500 text-white hover:bg-cyan-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!payload?._id ? "Guardar" : "Editar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
