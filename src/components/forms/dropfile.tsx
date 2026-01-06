import { useCallback, useEffect, useRef, useState } from "react";

type DropFileProps = {
  value?: string; // preview URL (existing image)
  onFileSelected: (file: File | null, previewUrl: string | null) => void;
  label?: string;
  maxSizeMB?: number;
};

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function DropFile({
  value,
  onFileSelected,
  label = "Portada (imagen)",
  maxSizeMB = 20,
}: DropFileProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | undefined>(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const maxBytes = maxSizeMB * 1024 * 1024;

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      setError(null);

      if (!allowedTypes.includes(file.type)) {
        setError("Formato inválido. Usa JPG, PNG, WEBP o GIF.");
        return;
      }
      if (file.size > maxBytes) {
        setError(`El archivo supera ${maxSizeMB}MB.`);
        return;
      }

      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);
      onFileSelected(file, localPreview);
    },
    [maxBytes, maxSizeMB, onFileSelected]
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const openFilePicker = () => inputRef.current?.click();

  const clearImage = () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(undefined);
    onFileSelected(null, null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-300 ml-1">{label}</label>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={
          `relative border-2 rounded-xl transition-all p-4 md:p-6 ` +
          (dragActive ? "border-cyan-500 bg-cyan-500/10" : "border-slate-700 bg-slate-950")
        }
      >
        {preview ? (
          <div className="flex items-center gap-4">
            <img
              src={preview}
              alt="Portada"
              className="w-24 h-24 object-cover rounded-lg border border-slate-700"
            />
            <div className="flex-1">
              <p
                className="text-sm text-slate-300 break-all line-clamp-2 max-w-full"
                title={preview}
              >
                {preview}
              </p>
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-sm"
                  onClick={clearImage}
                >
                  Quitar
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-all text-sm"
                  onClick={openFilePicker}
                >
                  Reemplazar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center gap-3 py-6">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 8l8-5 8 5M12 3v13" />
              </svg>
            </div>
            <p className="text-slate-300 text-sm md:text-base">
              Arrastra tu imagen aquí o
              <button type="button" className="text-cyan-400 hover:text-cyan-300 ml-1 underline" onClick={openFilePicker}>
                selecciona un archivo
              </button>
            </p>
            <p className="text-xs text-slate-400">JPG, PNG, WEBP o GIF • Máx {maxSizeMB}MB</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <span className="text-red-500 text-xs ml-1">{error}</span>}
    </div>
  );
}
