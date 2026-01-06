# Integración con Jikan API (MyAnimeList)

## 🎯 Descripción

Se ha integrado la API pública de Jikan (v4) para obtener datos reales de animes populares de MyAnimeList, adaptándolos a las gráficas existentes del dashboard.

## 📦 Archivos Creados

### `src/services/jikan.service.ts`
Servicio que consume la API de Jikan con las siguientes funciones:

1. **`getTopAnimesBySeason(seasonLabel, year)`**
   - Obtiene los 5 animes más populares de una temporada específica
   - Endpoint: `/seasons/{year}/{season}`
   - Usa el número de miembros (members) como métrica de popularidad

2. **`getGenresBySeasonPopularity(seasonLabel, year)`**
   - Analiza los géneros más populares en una temporada
   - Procesa 25 animes de la temporada
   - Pondera por popularidad (members) de cada anime

3. **`getCurrentSeasonTopAnimes()`**
   - Obtiene los animes top de la temporada actual
   - Endpoint: `/seasons/now`

4. **`getTopAnimesAllTime()`**
   - Top 5 animes más populares de todos los tiempos
   - Endpoint: `/top/anime`

## 🔄 Integración en Dashboard

### Cambios en `DashBoard.tsx`

1. **Toggle de Datos Reales**: Botón para alternar entre datos simulados y datos reales de Jikan
2. **Estados Nuevos**:
   - `realTopAnimes`: Almacena animes reales de Jikan
   - `realGenres`: Almacena géneros reales calculados
   - `loadingJikan`: Indica si está cargando datos
   - `useRealData`: Toggle para usar datos reales

3. **useEffect**: Carga automática de datos cuando:
   - El usuario activa "Usar Datos Reales"
   - Cambia la temporada seleccionada

## 🗺️ Mapeos de Temporadas

```typescript
// Español → Inglés (API Jikan)
{
  "Invierno 2025": "winter",
  "Primavera 2025": "spring",
  "Verano 2025": "summer",
  "Otoño 2025": "fall"
}
```

## 📊 Formato de Datos

### AnimePoint (para gráficas)
```typescript
{
  anime: string,      // Título del anime
  views: number       // Número de miembros en MAL
}
```

### GenrePoint (para gráficas)
```typescript
{
  genre: string,      // Nombre del género
  value: number       // Popularidad ponderada
}
```

## 🎨 Experiencia de Usuario

1. **Por defecto**: Muestra datos simulados (mock)
2. **Al activar "Usar Datos Reales"**:
   - Se muestra un spinner de carga
   - Se obtienen datos de Jikan API
   - Las gráficas se actualizan con datos reales
3. **Cambio de temporada**: Recarga automáticamente los datos

## ⚡ Optimización

- **Carga paralela**: `Promise.all()` para obtener animes y géneros simultáneamente
- **Cache en estado**: Los datos se mantienen hasta cambiar de temporada
- **Fallback**: Si falla la API, muestra datos simulados

## 🔗 API Endpoints Usados

```
Base URL: https://api.jikan.moe/v4

GET /seasons/{year}/{season}?filter=tv&limit=10
GET /seasons/now?filter=tv&limit=10
GET /top/anime?filter=bypopularity&limit=5
```

## 📝 Notas Importantes

1. **Rate Limiting**: Jikan API tiene límites de tasa (3 requests/segundo)
2. **Solo Series TV**: Filtrado por `filter=tv` para mostrar solo series
3. **Metric**: Se usa `members` (miembros de MAL) como métrica de popularidad
4. **Año 2025**: Configurado para temporadas de 2025, puede actualizarse

## 🚀 Próximas Mejoras

- [ ] Cache de datos con localStorage
- [ ] Manejo de rate limiting con delays
- [ ] Información de tooltip con más detalles del anime
- [ ] Filtros adicionales (tipo, rating, etc.)
- [ ] Gráfica de tendencias mensuales con datos reales
