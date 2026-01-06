
import { useEffect, useRef } from "react";
import useModal from "../../customHooks/useForm";
import { useForm } from "react-hook-form";
import Input from "../../components/forms/input";
import clientAPI from "../../services/http.service";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import type { Episode } from "../../services/episodes.service";

interface AddEpisodesProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  animeId: number;
  initialData?: Episode | null;
}

type FormValues = {
  _id?: number;
  numero: number;
  titulo: string;
  descripcion: string;
  videoUrl: string;
  duracion: number;
  animeId: number;
};

export default function AddEpisodesForm({
  show,
  onClose,
  onSuccess,
  animeId,
  initialData,
}: AddEpisodesProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useModal(modalRef, show);

  const defaultValues: FormValues = {
    numero: 0,
    titulo: "",
    descripcion: "",
    videoUrl: "",
    duracion: 300,
    animeId: animeId,
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (initialData && show) {
      reset({
        _id: initialData._id,
        numero: initialData.numero,
        titulo: initialData.titulo,
        descripcion: initialData.descripcion || "",
        videoUrl: initialData.videoUrl,
        duracion: initialData.duracion,
        animeId: initialData.animeId,
      });
    } else {
      reset({
        ...defaultValues,
        animeId: animeId,
      });
    }
  }, [initialData, show, reset, animeId]);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      numero: data.numero,
      titulo: data.titulo,
      descripcion: data.descripcion,
      videoUrl: data.videoUrl,
      duracion: data.duracion,
      animeId: animeId,
    };

    try {
      if (initialData?._id) {
        await clientAPI.put(`/Episodios/${initialData._id}`, payload);
        toast.success("¡Episodio actualizado correctamente!");
      } else {
        await clientAPI.post("/Episodios", payload);
        toast.success("¡Episodio creado con éxito!");
      }
      reset(defaultValues);
      onSuccess();
    } catch (error: any) {
      console.error("Error:", error);
      const mensaje = error?.response?.data?.message || "Error desconocido";
      toast.error("Ocurrió un error");
      Swal.fire({
        icon: "error",
        title: "¡Ups!",
        text: mensaje,
        confirmButtonColor: "#06b6d4",
        background: "#1e293b",
        color: "#fff",
      });
    }
  };

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  if (!show) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-6 md:p-10 overflow-y-auto">
        <div
          ref={modalRef}
          className="bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_40px_rgba(8,145,178,0.2)] w-full max-w-2xl transform transition-all my-10"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                {initialData?._id ? "Editar" : "Nuevo"} Episodio
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Completa la información del episodio.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full"
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
            <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-7">
              <div className="md:col-span-1">
                <Input
                  label="Número del Episodio"
                  type="number"
                  placeholder="Ej: 1"
                  errors={errors.numero}
                  {...register("numero", {
                    required: "El número es obligatorio",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "El número debe ser mayor a 0",
                    },
                  })}
                />
              </div>

              <div className="md:col-span-1">
                <Input
                  label="Duración (minutos)"
                  type="number"
                  placeholder="Ej: 24"
                  errors={errors.duracion}
                  {...register("duracion", {
                    required: "La duración es obligatoria",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "La duración debe ser mayor a 0",
                    },
                  })}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Título del Episodio"
                  placeholder="Ej: El comienzo"
                  errors={errors.titulo}
                  {...register("titulo", {
                    required: "El título es obligatorio",
                  })}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Ruta del Video"
                  placeholder="/NombreDelAnime/video.mp4"
                  errors={errors.videoUrl}
                  {...register("videoUrl", {
                    required: "La ruta del video es obligatoria",
                  })}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">
                    Descripción
                  </label>
                  <textarea
                    rows={4}
                    className="block p-3 w-full text-sm md:text-base text-white bg-slate-950 rounded-xl border border-slate-700 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-400"
                    placeholder="Escribe una breve descripción del episodio..."
                    {...register("descripcion")}
                  ></textarea>
                  {errors.descripcion && (
                    <span className="text-red-500 text-xs ml-1">
                      {errors.descripcion.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-slate-800 bg-slate-900/30 rounded-b-2xl">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="px-6 py-2 rounded-lg bg-linear-to-r from-cyan-600 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Guardando..."
                  : `${initialData?._id ? "Editar Episodio" : "Guardar Episodio"}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}