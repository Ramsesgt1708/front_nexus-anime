import type { PlanSlice } from '../components/dashboard/PlanDistributionChart'
import type { GenrePoint } from '../components/dashboard/GenreConsumptionChart'
import type { AnimePoint } from '../components/dashboard/TopAnimesChart'
// Monthly records types used internally for generating per-month data
type GenreMonthlyRecord = { month: string; [genre: string]: number | string }
type SeasonMonthlyRecord = { month: string; [anime: string]: number | string }

export function getMockPlanDistribution(): PlanSlice[] {
  return [
    { name: 'Free', value: 8200 },
    { name: 'Premium', value: 3400 },
    { name: 'Premium+', value: 1200 },
  ]
}

// Función para generar datos aleatorios de planes (para usar con datos reales de Jikan)
export function getRandomPlanDistribution(): PlanSlice[] {
  const freeBase = 11000 + Math.random() * 3000 // 11000-14000
  const premiumBase = 3000 + Math.random() * 1500 // 3000-4500
  const plusBase = 800 + Math.random() * 600 // 800-1400
  
  return [
    { name: 'Free', value: Math.round(freeBase) },
    { name: 'Premium', value: Math.round(premiumBase) },
    { name: 'Premium+', value: Math.round(plusBase) },
  ]
}

export function getMockGenreConsumption(): GenrePoint[] {
  return [
    { genre: 'Shounen', value: 5400 },
    { genre: 'Isekai', value: 4800 },
    { genre: 'Romance', value: 3100 },
    { genre: 'Seinen', value: 2900 },
    { genre: 'Comedia', value: 2600 },
    { genre: 'Mecha', value: 1800 },
  ]
}

export function getMockTopAnimes(_seasonLabel = 'Invierno 2025'): AnimePoint[] {
  const base = [
    { anime: 'Solo Leveling S2', views: 9200 },
    { anime: 'Kaiju No. 8', views: 8700 },
    { anime: 'Bleach TYBW', views: 8100 },
    { anime: 'Spy x Family', views: 7600 },
    { anime: 'Frieren', views: 6900 },
  ]
  // Season label can be shown in UI if needed later
  return base
}

export const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export const SEASONS_2025 = [
  { label: 'Invierno 2025', months: ['Enero', 'Febrero', 'Marzo'] },
  { label: 'Primavera 2025', months: ['Abril', 'Mayo', 'Junio'] },
  { label: 'Verano 2025', months: ['Julio', 'Agosto', 'Septiembre'] },
  { label: 'Otoño 2025', months: ['Octubre', 'Noviembre', 'Diciembre'] },
]

export const SEASON_ANIMES_2025: Record<string, string[]> = {
  'Invierno 2025': [
    'Solo Leveling (Temporada 2)',
    'Sakamoto Days',
    'Dr. STONE: Science Future',
    'Honey Lemon Soda',
    'UniteUp! -Uni:Birth-'
  ],
  'Primavera 2025': [
    'Fire Force (Temporada 3 - Parte 1)',
    'Wind Breaker (Temporada 2)',
    'Go! Go! Loser Ranger! (Temporada 2)',
    "I've Been Killing Slimes for 300 Years S2",
    'Alya Sometimes Hides Her Feelings in Russian (S2)'
  ],
  'Verano 2025': [
    'Gachiakuta',
    'The Fragrant Flower Blooms with Dignity',
    'Fire Force (Temporada 3 - Parte 2)',
    'Lazarus',
    'Medalist'
  ],
  'Otoño 2025': [
    'Witch Hat Atelier',
    'Sakamoto Days (Cour 2)',
    'Sabikui Bisco (Temporada 2)',
    'Chainsaw Man (Reze Arc Movie)',
    'Toilet-bound Hanako-kun 2'
  ],
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function getMockGenreMonthly(year = 2025): GenreMonthlyRecord[] {
  const genres = ['Shounen', 'Isekai', 'Romance', 'Seinen', 'Comedia', 'Mecha']
  const records: GenreMonthlyRecord[] = []
  MONTHS_ES.forEach((m, idx) => {
    const rec: GenreMonthlyRecord = { month: m }
    genres.forEach((g, gidx) => {
      const base = 2000 + gidx * 400
      const seasonal = 1 + (idx % 3) * 0.08
      const noise = seededRandom(year * 100 + idx * 10 + gidx) * 800
      rec[g] = Math.round(base * seasonal + noise)
    })
    records.push(rec)
  })
  return records
}

export function getMockTopAnimesSeasonMonthly(seasonLabel: string, year = 2025): SeasonMonthlyRecord[] {
  const animes = ['Solo Leveling S2', 'Kaiju No. 8', 'Bleach TYBW', 'Spy x Family', 'Frieren']
  const season = SEASONS_2025.find(s => s.label === seasonLabel) ?? SEASONS_2025[0]
  return season.months.map((m, midx) => {
    const rec: SeasonMonthlyRecord = { month: m }
    animes.forEach((a, aidx) => {
      const base = 1800 + (4 - aidx) * 300 // Higher base for top-ranked
      const trend = 1 + midx * 0.12 // growth through the season
      const noise = seededRandom(year * 1000 + midx * 100 + aidx) * 500
      rec[a] = Math.round(base * trend + noise)
    })
    return rec
  })
}

function monthIndex(month: string): number {
  return Math.max(0, MONTHS_ES.indexOf(month))
}

export function getMockPlanDistributionByMonth(month: string, year = 2025): PlanSlice[] {
  const idx = monthIndex(month)
  
  // Bases: Free debe ser el mayor, Premium intermedio, Premium+ el menor
  const freeBase = 12000 + (idx * 150) // Varía entre 12000-13650
  const premiumBase = 3500 + (idx * 80) // Varía entre 3500-4380
  const plusBase = 1000 + (idx * 30) // Varía entre 1000-1330
  
  // Variaciones aleatorias más pronunciadas por mes
  const freeNoise = (seededRandom(year * 10 + idx) - 0.5) * 1200
  const premiumNoise = (seededRandom(year * 10 + idx + 1) - 0.5) * 600
  const plusNoise = (seededRandom(year * 10 + idx + 2) - 0.5) * 300
  
  // Tendencia estacional (más usuarios en ciertos meses)
  const seasonalBoost = 1 + Math.sin((idx / 12) * Math.PI * 2) * 0.15
  
  return [
    { name: 'Free', value: Math.round((freeBase + freeNoise) * seasonalBoost) },
    { name: 'Premium', value: Math.round((premiumBase + premiumNoise) * seasonalBoost) },
    { name: 'Premium+', value: Math.round((plusBase + plusNoise) * seasonalBoost) },
  ]
}

export function getMockGenreConsumptionByMonth(month: string, year = 2025): GenrePoint[] {
  const idx = monthIndex(month)
  const genres = ['Shounen', 'Isekai', 'Romance', 'Seinen', 'Comedia', 'Mecha']
  return genres.map((g, gidx) => {
    const base = 2000 + gidx * 400
    const seasonal = 1 + (idx % 3) * 0.08
    const noise = seededRandom(year * 100 + idx * 10 + gidx) * 800
    return { genre: g, value: Math.round(base * seasonal + noise) }
  })
}

export function getMockTopAnimesBySeasonMonth(seasonLabel: string, month: string, year = 2025): AnimePoint[] {
  const season = SEASONS_2025.find(s => s.label === seasonLabel) ?? SEASONS_2025[0]
  const lineup = SEASON_ANIMES_2025[season.label] ?? ['Anime A', 'Anime B', 'Anime C', 'Anime D', 'Anime E']
  // Rotate lineup per month within the season so the top changes each month
  const monthPos = Math.max(0, season.months.indexOf(month)) // 0..2
  const rotated = [...lineup.slice(monthPos), ...lineup.slice(0, monthPos)]
  // Use month index for randomness seed and view trends
  const mIdx = season.months.includes(month) ? monthIndex(month) : monthIndex(season.months[0])
  return rotated.map((a, aidx) => {
    const base = 2200 + (4 - aidx) * 350 // slightly higher base for earlier positions
    const trend = 1 + monthPos * 0.12 // growth through the season
    const noise = seededRandom(year * 1000 + mIdx * 100 + aidx) * 600
    return { anime: a, views: Math.round(base * trend + noise) }
  })
}
