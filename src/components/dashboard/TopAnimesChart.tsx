import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export type AnimePoint = {
  anime: string
  views: number
}

interface TopAnimesChartProps {
  data: AnimePoint[]
}

// Paleta de colores vibrantes para los animes
const ANIME_COLORS = [
  '#06b6d4', // cyan-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#6366f1', // indigo-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#a855f7', // purple-500
  '#06b6d4', // cyan-500 (repetir)
  '#f43f5e', // rose-500
  '#84cc16', // lime-500
  '#3b82f6', // blue-500
  '#eab308', // yellow-500
]

function TopAnimesChart({ data }: TopAnimesChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis 
          type="category" 
          dataKey="anime" 
          tick={{ fontSize: 10, fill: '#d1d5db' }} 
          width={180}
        />
        <Tooltip 
          formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : String(value))}
          contentStyle={{ 
            backgroundColor: '#1f2937', 
            border: '1px solid #374151', 
            borderRadius: '8px',
            color: '#f3f4f6'
          }}
          labelStyle={{ color: '#f3f4f6' }}
          itemStyle={{ color: '#f3f4f6' }}
        />
        <Bar dataKey="views" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={ANIME_COLORS[index % ANIME_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default TopAnimesChart
