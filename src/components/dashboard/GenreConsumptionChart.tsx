import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export type GenrePoint = {
  genre: string
  value: number
}

interface GenreConsumptionChartProps {
  data: GenrePoint[]
}

// Paleta de colores para géneros
const GENRE_COLORS = [
  '#06b6d4', // cyan-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#6366f1', // indigo-500
  '#f97316', // orange-500
]

function GenreConsumptionChart({ data }: GenreConsumptionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="genre" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : String(value))} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={GENRE_COLORS[index % GENRE_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default GenreConsumptionChart
