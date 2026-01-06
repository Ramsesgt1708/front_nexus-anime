
function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 border-t border-slate-700">
      <div className="mx-auto px-6 py-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/media/LogoNexus.png" alt="LogoNexus" className="h-10 w-auto" />
        </div>

        <div className="text-sm text-slate-400">
          © {new Date().getFullYear()} Nexus Anime. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

export default Footer;