# Guía de Flujo de Reproducción de Episodios

## Archivos Creados

### 1. **Servicio de Episodios** (`src/services/episodes.service.ts`)
- Servicio para obtener episodios por ID del anime
- Endpoint: `GET /api/Episodios/anime/{id}`
- También incluye método para obtener un episodio específico

### 2. **Página de Detalles del Anime** (`src/pages/animesLists/AnimeDetailsPage.tsx`)
- Muestra la información del anime (título, sinopsis, géneros, estudio)
- Lista todos los episodios disponibles del anime
- Cada episodio es un card clickeable que lleva al reproductor

### 3. **Página del Reproductor** (`src/pages/player/EpisodePlayerPage.tsx`)
- Reproductor de video del episodio seleccionado
- Muestra detalles del episodio (número, título, duración, descripción)
- Botón para volver a la lista de episodios

## Flujo de Navegación

```
HomePage
  ↓ (Click en un anime)
AnimeDetailsPage (`/anime/{id}`)
  ├─ Obtiene datos del anime
  ├─ Obtiene lista de episodios vía episodesService.getEpisodesByAnimeId()
  ↓ (Click en "Reproducir" en un episodio)
EpisodePlayerPage (`/watch/{animeId}/episode/{episodeId}`)
  ├─ Obtiene datos del episodio
  ├─ Reproduce el video
  └─ Permite volver a la lista de episodios
```

## Rutas Agregadas (en App.tsx)

```tsx
<Route path="/anime/:id" element={<AnimeDetailsPage />} />
<Route path="/watch/:animeId/episode/:episodeId" element={<EpisodePlayerPage />} />
```

## Interfaz Episode

```typescript
interface Episode {
  _id: number;
  numero: number;
  titulo: string;
  descripcion: string | null;
  videoUrl: string;
  duracion: number;
  fechaRegistro: string;
  fechaModificacion: string | null;
  isActive: boolean;
  animeId: number;
  animeTitulo: string;
}
```

## Configuración de Video

- URL del video: `https://localhost:7062/videos/{videoUrl}`
- La URL se construye desde el campo `videoUrl` que devuelve el API
- Los videos deben estar alojados en `https://localhost:7062/videos/`

## Próximos Pasos Sugeridos

1. **Validar permisos**: Asegúrate de que los usuarios no autenticados no puedan acceder
2. **Agregar historial**: Guardar qué episodios ha visto el usuario
3. **Continuar viendo**: Botón para continuar desde donde se quedó
4. **Episodios relacionados**: Mostrar siguiente episodio en el reproductor
5. **Calidad de video**: Selector de calidad si el backend lo soporta
