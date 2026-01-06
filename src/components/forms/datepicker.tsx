import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller } from "react-hook-form";
import { registerLocale } from "react-datepicker";
import { es } from 'date-fns/locale/es';

registerLocale('es', es);

interface DatePickerProps {
  name: string;
  control: any;
  label: string;
  error?: any;
}

export default function DatePickerInput({ name, control, label, error }: DatePickerProps) {
  return (
    <div className="flex flex-col gap-1 w-full relative">
      <label className="text-sm font-medium text-slate-300 ml-1">
        {label} <span className="text-red-500">*</span>
      </label>
      
      <Controller
        name={name}
        control={control}
        rules={{ required: "La fecha es obligatoria" }}
        render={({ field: { onChange, value } }) => (
          <div className="custom-datepicker-wrapper">
             <DatePicker
                selected={value ? new Date(value) : null}
                onChange={(date) => onChange(date)}
                dateFormat="dd/MM/yyyy"
                locale="es"
                placeholderText="Selecciona fecha"
                
                // --- 1. PROPIEDADES PARA EL AÑO (DROPDOWN) ---
                showYearDropdown={true}        
                showMonthDropdown={true}       
                scrollableYearDropdown={true}  
                yearDropdownItemNumber={60}    
                dropdownMode="select"          
                
                // Clases del INPUT (La cajita donde escribes)
                className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 p-2.5 placeholder-slate-400"
                wrapperClassName="w-full"
                
                // Evita que el calendario se cierre al cambiar de año
                shouldCloseOnSelect={true}
             />
          </div>
        )}
      />
      
      {error && <span className="text-red-500 text-xs ml-1">{error.message}</span>}

      <style>{`
        .react-datepicker {
            font-family: inherit;
            background-color: #0f172a !important; /* Slate 950 */
            border: 1px solid #334155 !important; /* Slate 700 */
            color: #e2e8f0 !important;
            border-radius: 0.5rem;
        }

        .react-datepicker__header {
            background-color: #1e293b !important; /* Slate 800 */
            border-bottom: 1px solid #334155 !important;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
        }

        .react-datepicker__current-month, 
        .react-datepicker-time__header, 
        .react-datepicker-year-header,
        .react-datepicker__day-name {
            color: #cbd5e1 !important; /* Slate 300 */
            font-weight: 600;
        }

        .react-datepicker__day {
            color: #e2e8f0 !important;
        }
        .react-datepicker__day:hover {
            background-color: #06b6d4 !important; /* Cyan 500 */
            color: white !important;
            border-radius: 0.3rem;
        }

        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
            background-color: #0891b2 !important; /* Cyan 600 */
            color: white !important;
            font-weight: bold;
        }

        .react-datepicker__year-read-view--down-arrow,
        .react-datepicker__month-read-view--down-arrow {
             border-top-color: #94a3b8 !important;
        }
        
        .react-datepicker__header select {
            background-color: #0f172a;
            color: white;
            border: 1px solid #334155;
            padding: 2px 5px;
            border-radius: 4px;
            margin: 0 5px;
            outline: none;
        }

        .react-datepicker__navigation-icon::before {
            border-color: #94a3b8 !important;
        }
      `}</style>
    </div>
  );
}