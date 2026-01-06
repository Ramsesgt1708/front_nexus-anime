import { useEffect, useRef, useState } from "react";
import useModal from "../../customHooks/useForm";
import { useForm } from "react-hook-form";
import Input from "../../components/forms/input";
import SelectInput from "../../components/forms/select";
import DatePickerInput from "../../components/forms/datepicker";
import clientAPI from "../../services/http.service";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import DropFile from "../../components/forms/dropfile";

interface AddAnimeProps {
  show: boolean;
  onRequestClose: (refresh: boolean) => void;
  payload?: any;
}

type FormValues = {
  _id?: string;
  titulo: string;
  sinopsis: string;
  fechaEstreno: Date | null;
  imagen: string;
  generoId: Array<string | number>;
  estudioId: string | number;
};

export default function AddAnimeForm({
  show,
  onRequestClose,
  payload,
}: AddAnimeProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useModal(modalRef, show);

  const [generosOptions, setGenerosOptions] = useState<any[]>([]);
  const [estudiosOptions, setEstudiosOptions] = useState<any[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false);

  const defaultValues: FormValues = {
    _id: "",
    titulo: "",
    sinopsis: "",
    fechaEstreno: null,
    imagen: "",
    generoId: [],
    estudioId: "",
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({ mode: "onChange", defaultValues });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  const loadCatalogs = async () => {
    setIsLoadingCatalogs(true);
    try {
      clientAPI.get("/Generos").then((response) => {
        const generosFormateados = response.data
          .filter((genero: any) => genero.isActive === true)
          .map((genero: any) => ({
            value: genero._id,
            label: genero.nombre,
          }));
        setGenerosOptions(generosFormateados);
      });
      clientAPI.get("/Estudios").then((response) => {
        const estudiosFormateados = response.data
          .filter((estudio: any) => estudio.isActive === true)
          .map((estudio: any) => ({
            value: estudio._id,
            label: estudio.nombre,
          }));
        setEstudiosOptions(estudiosFormateados);
      });
    } catch (error) {
      toast.error("Error cargando listas desplegables");
    } finally {
      setIsLoadingCatalogs(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (payload && show) {
      const fechaFormat = payload.fechaEstreno
        ? new Date(payload.fechaEstreno)
        : null;

      reset({
        _id: payload._id,
        titulo: payload.titulo,
        sinopsis: payload.sinopsis,
        fechaEstreno: fechaFormat,
        imagen: payload.imagenUrl || payload.imagen || "",
        generoId:
          payload.generoId ||
          payload.generos?.map((g: any) => g._id) ||
          (payload.genero?._id ? [payload.genero._id] : []),
        estudioId: payload.estudioId || payload.estudio?._id,
      });

      const preview = payload.imagenUrl || payload.imagen;
      if (preview) setPreviewUrl(preview);
    } else {
      reset(defaultValues);
      setSelectedFile(null);
      setPreviewUrl(undefined);
    }
  }, [payload, show, reset]);

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.append("titulo", data.titulo);
    formData.append("sinopsis", data.sinopsis);
    formData.append(
      "fechaEstreno",
      data.fechaEstreno ? new Date(data.fechaEstreno).toISOString() : ""
    );
    formData.append("estudioId", String(data.estudioId));

    data.generoId.forEach((g, index) => {
      formData.append(`generosIds[${index}]`, String(g));
    });

    if (selectedFile) {
      formData.append("imagen", selectedFile);
    } else if (data.imagen && typeof data.imagen !== "string") {
      formData.append("imagen", data.imagen);
    }

    try {
      if (payload) {
        await clientAPI.put(`/Animes/${payload._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("¡Anime actualizado correctamente!");
      } else {
        await clientAPI.post("/Animes", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("¡Anime creado con éxito!");
      }
      reset(defaultValues);
      onRequestClose(true);
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
    onRequestClose(false);
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
          className="bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_40px_rgba(8,145,178,0.2)] w-full max-w-4xl transform transition-all my-10"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                {payload?._id ? "Editar" : "Nuevo"} Anime
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Completa la ficha técnica de la serie.
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
              <div className="md:col-span-2">
                <Input
                  label="Título del Anime"
                  placeholder="Ej: Chainsaw Man"
                  errors={errors.titulo}
                  {...register("titulo", {
                    required: "El título es obligatorio",
                  })}
                />
              </div>
              <div className="md:col-span-1">
                <SelectInput
                  name="generoId"
                  control={control}
                  isSearcheable={true}
                  label="Género"
                  options={generosOptions}
                  error={errors.generoId}
                  isLoading={isLoadingCatalogs}
                  isMulti={true}
                  rules={{ required: "Selecciona un género" }}
                />
              </div>

              <div className="md:col-span-1">
                <SelectInput
                  name="estudioId"
                  control={control}
                  isSearcheable={true}
                  label="Estudio de Animación"
                  options={estudiosOptions}
                  error={errors.estudioId}
                  isLoading={isLoadingCatalogs}
                  rules={{ required: "Selecciona un estudio" }}
                />
              </div>
              <div className="md:col-span-1">
                <DatePickerInput
                  name="fechaEstreno"
                  control={control}
                  label="Fecha de Estreno"
                  error={errors.fechaEstreno}
                />
              </div>

              <div className="md:col-span-1">
                {/* Hidden field to keep RHF validation on imagen */}
                <input
                  type="hidden"
                  {...register("imagen", {
                    required: !payload ? "La imagen es obligatoria" : false,
                  })}
                />
                <DropFile
                  value={previewUrl}
                  onFileSelected={(file, preview) => {
                    setSelectedFile(file);
                    setPreviewUrl(preview || undefined);
                    setValue("imagen", file ? file.name : preview || "", {
                      shouldValidate: true,
                    });
                  }}
                  label="Portada (imagen)"
                />
                {errors.imagen && (
                  <span className="text-red-500 text-xs ml-1">
                    {errors.imagen.message as string}
                  </span>
                )}
              </div>
              <div className="md:col-span-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">
                    Sinopsis
                  </label>
                  <textarea
                    rows={8}
                    className="block p-3 w-full text-sm md:text-base text-white bg-slate-950 rounded-xl border border-slate-700 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-400 min-h-[220px]"
                    placeholder="Escribe una breve descripción de la trama..."
                    {...register("sinopsis", {
                      required: "La sinopsis es requerida",
                    })}
                  ></textarea>
                  {errors.sinopsis && (
                    <span className="text-red-500 text-xs ml-1">
                      {errors.sinopsis.message}
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
                  : `${payload?._id ? "Editar Anime" : "Guardar Anime"}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
