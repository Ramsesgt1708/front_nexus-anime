import { useEffect, useRef, useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import clientAPI from "../../services/http.service";
import authService from "../../services/auth.service";

  export default function PlayerPage() {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Header />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-6">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Reproductor de Video (prueba simple)</h1>
          <div className="aspect-video w-full bg-black border border-slate-800 rounded-xl overflow-hidden">
            <video
              controls
              className="w-full h-full"
              src="https://localhost:7062/videos/Kaoru%20hana%20wa%20Rin%20to%20Saku/01.mp4"
              crossOrigin="anonymous"
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Nota: Si el video no reproduce, puede ser por CORS, certificados HTTPS locales o soporte del navegador para MKV.
          </p>
        </main>

        <Footer />
      </div>
    );
  }

