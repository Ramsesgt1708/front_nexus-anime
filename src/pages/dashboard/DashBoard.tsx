import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import DashboardCard from '../../components/dashboard/DashboardCard'
import PlanDistributionChart from '../../components/dashboard/PlanDistributionChart'
import GenreConsumptionChart from '../../components/dashboard/GenreConsumptionChart'
import TopAnimesChart from '../../components/dashboard/TopAnimesChart'
import { SEASONS_2025, MONTHS_ES, getMockPlanDistributionByMonth, getMockGenreConsumptionByMonth, getMockTopAnimesBySeasonMonth, getRandomPlanDistribution } from '../../services/dashboard.mock'
import { useMemo, useState, useEffect } from 'react'
import jikanService from '../../services/jikan.service'
import type { AnimePoint } from '../../components/dashboard/TopAnimesChart'
import type { GenrePoint } from '../../components/dashboard/GenreConsumptionChart'
import type { PlanSlice } from '../../components/dashboard/PlanDistributionChart'

function DashBoard() {
  const [month] = useState<string>(MONTHS_ES[0])
  const plans = useMemo(() => getMockPlanDistributionByMonth(month, 2025), [month])
  const genres = useMemo(() => getMockGenreConsumptionByMonth(month, 2025), [month])

  const currentYear = 2025
  const years = Array.from({ length: 12 }, (_, i) => currentYear - i) 
  const [year, setYear] = useState<number>(currentYear)
  const [season, setSeason] = useState<string>('Invierno')
  const topAnimes = useMemo(() => getMockTopAnimesBySeasonMonth(`${season} ${year}`, SEASONS_2025[0].months[0], year), [season, year])
  const [realTopAnimes, setRealTopAnimes] = useState<AnimePoint[]>([])
  const [realGenres, setRealGenres] = useState<GenrePoint[]>([])
  const [realPlans, setRealPlans] = useState<PlanSlice[]>([])
  const [loadingJikan, setLoadingJikan] = useState(false)
  const [useRealData, setUseRealData] = useState(false)

  useEffect(() => {
    const fetchJikanData = async () => {
      if (!useRealData) return
      
      setLoadingJikan(true)
      try {
        const seasonLabel = `${season} ${year}`
        const [animes, genres] = await Promise.all([
          jikanService.getTopAnimesBySeason(seasonLabel, year),
          jikanService.getGenresBySeasonPopularity(seasonLabel, year),
        ])
        setRealTopAnimes(animes)
        setRealGenres(genres)
        setRealPlans(getRandomPlanDistribution())
      } catch (error) {
        console.error("Error cargando datos de Jikan:", error)
      } finally {
        setLoadingJikan(false)
      }
    }

    fetchJikanData()
  }, [season, year, useRealData])

  const displayTopAnimes = useRealData && realTopAnimes.length > 0 ? realTopAnimes : topAnimes
  const displayGenres = useRealData && realGenres.length > 0 ? realGenres : genres
  const displayPlans = useRealData && realPlans.length > 0 ? realPlans : plans
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-neutral-950 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Panel de Control</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Vista general del consumo y planes de usuarios</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setUseRealData(!useRealData)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  useRealData
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {useRealData ? '✓ Datos Reales (Jikan API)' : 'Usar Datos Reales'}
              </button>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Año:</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="rounded-md bg-white/80 dark:bg-neutral-900/60 px-3 py-1.5 text-sm ring-1 ring-black/10 dark:ring-white/10"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Temporada:</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="rounded-md bg-white/80 dark:bg-neutral-900/60 px-3 py-1.5 text-sm ring-1 ring-black/10 dark:ring-white/10"
                >
                  <option value="Invierno">Invierno</option>
                  <option value="Primavera">Primavera</option>
                  <option value="Verano">Verano</option>
                  <option value="Otoño">Otoño</option>
                </select>
              </div>

              {loadingJikan && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyan-500"></div>
                  Cargando...
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <DashboardCard title="Distribución de Planes" subtitle={`Free vs Premium vs Premium+ · ${useRealData ? `${season} ${year}` : `${month} 2025`}`}>
                <PlanDistributionChart data={displayPlans} />
              </DashboardCard>
            </div>
            <div className="lg:col-span-2">
              <DashboardCard title="Géneros más consumidos" subtitle={`Top géneros · ${useRealData ? `${season} ${year}` : `${month} 2025`}`}>
                <GenreConsumptionChart data={displayGenres} />
              </DashboardCard>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-6 mb-6">
            <DashboardCard 
              title={`Animes más ${useRealData ? 'populares' : 'vistos'} por temporada`} 
              subtitle={useRealData ? `${season} ${year} (MyAnimeList)` : `${season} 2025`}
              customHeight="h-auto"
            >
              <div style={{ height: '600px' }}>
                <TopAnimesChart data={displayTopAnimes} />
              </div>
            </DashboardCard>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default DashBoard