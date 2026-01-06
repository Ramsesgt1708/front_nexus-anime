import { Controller } from "react-hook-form";
import Select from "react-select";

interface SelectInputProps {
  name: string;
  control: any;
  label: string;
  options: any[];
  error?: any;
  placeholder?: string;
  rules?: any;
  isLoading?: boolean;
  isMulti?: boolean;
  isSearcheable?: boolean;
}

export default function SelectInput({
  name,
  control,
  label,
  options,
  error,
  placeholder = "Seleccione...",
  rules,
  isLoading = false,
  isMulti = false,
  isSearcheable = false,
}: SelectInputProps) {
  
  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: "#0f172a",
      borderColor: state.isFocused ? "#06b6d4" : "#334155",
      color: "white",
      padding: "2px",
      borderRadius: "0.5rem",
      boxShadow: state.isFocused ? "0 0 0 1px #06b6d4" : "none",
      "&:hover": { borderColor: "#06b6d4" },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "#1e293b",
      border: "1px solid #334155",
      zIndex: 9999,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? "#06b6d4" : "transparent",
      color: state.isFocused ? "white" : "#cbd5e1",
      cursor: "pointer",
      "&:active": { backgroundColor: "#0891b2" },
    }),
    singleValue: (base: any) => ({ ...base, color: "white" }),
    input: (base: any) => ({ ...base, color: "white" }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "rgba(6, 182, 212, 0.2)", 
      border: "1px solid #06b6d4",
      borderRadius: "4px",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "#22d3ee", 
      fontWeight: "bold",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "#22d3ee",
      ":hover": {
        backgroundColor: "#06b6d4",
        color: "white",
      },
    }),
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-slate-300 ml-1">
        {label} <span className="text-red-500">*</span>
      </label>
      
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value, ref } }) => {
          const selectedValue = isMulti
            ? options.filter((c) => Array.isArray(value) && value.includes(c.value))
            : options.find((c) => c.value === value);

          return (
            <Select
              ref={ref}
              options={options}
              value={selectedValue}
              isSearchable={isSearcheable}
              onChange={(val: any) => {
                if (isMulti) {
                  onChange(val.map((c: any) => c.value));
                } else {
                  onChange(val?.value);
                }
              }}
              styles={customStyles}
              placeholder={placeholder}
              isLoading={isLoading}
              isMulti={isMulti} 
              noOptionsMessage={() => "No hay resultados"}
              loadingMessage={() => "Cargando..."}
              closeMenuOnSelect={!isMulti} 
            />
          );
        }}
      />
      
      {error && (
        <span className="text-red-500 text-xs ml-1 font-medium animate-pulse">
          {error.message}
        </span>
      )}
    </div>
  );
}