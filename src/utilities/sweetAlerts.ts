import Swal from 'sweetalert2';

const baseConfig = {
  background: '#0f172a',
  color: '#e2e8f0',
  buttonsStyling: false,
  reverseButtons: true,
  customClass: {
    popup: 'border border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] rounded-xl',
    title: 'text-2xl font-bold',
    htmlContainer: 'text-slate-400',
    actions: 'gap-4 mt-6',
    confirmButton: 'px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
    cancelButton: 'px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
  }
};

export const SweetWarning = Swal.mixin({
  ...baseConfig,
  icon: 'warning',
  iconColor: '#ef4444',
  customClass: {
    ...baseConfig.customClass,
    confirmButton: `${baseConfig.customClass.confirmButton} 
      bg-red-600 text-white 
      border border-red-500
      shadow-[0_0_10px_rgba(220,38,38,0.5)] 
      hover:bg-red-700 hover:shadow-[0_0_20px_rgba(220,38,38,0.8)] hover:border-red-400
      focus:ring-red-600`,
    cancelButton: `${baseConfig.customClass.cancelButton} 
      bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white focus:ring-slate-500`,
  }
});

export const SweetConfirm = Swal.mixin({
  ...baseConfig,
  icon: 'question',
  iconColor: '#06b6d4',
  customClass: {
    ...baseConfig.customClass,
    confirmButton: `${baseConfig.customClass.confirmButton} 
      bg-cyan-600 text-white 
      border border-cyan-500
      shadow-[0_0_10px_rgba(8,145,178,0.5)] 
      hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.8)] hover:border-cyan-300
      focus:ring-cyan-500`,
    cancelButton: `${baseConfig.customClass.cancelButton} 
      bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white focus:ring-slate-500`,
  }
});

export const SweetError = Swal.mixin({
  ...baseConfig,
  icon: 'error',
  iconColor: '#ef4444',
  showCancelButton: false,
  customClass: {
    ...baseConfig.customClass,
    confirmButton: `${baseConfig.customClass.confirmButton} 
      bg-red-600 text-white 
      border border-red-500
      shadow-[0_0_10px_rgba(220,38,38,0.5)] 
      hover:bg-red-700 hover:shadow-[0_0_20px_rgba(220,38,38,0.8)] hover:border-red-400
      focus:ring-red-600`
  }
});

export const SweetSuccess = Swal.mixin({
  background: '#0f172a',
  color: '#e2e8f0',
  icon: 'success',
  iconColor: '#22c55e',
  confirmButtonColor: '#22c55e',
});