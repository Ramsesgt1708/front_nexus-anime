import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export type SeasonMonthlyRecord = {
  month: string
  [anime: string]: number | string
}

interface TopAnimesSeasonMonthlyChartProps {
  data: SeasonMonthlyRecord[]
  animeKeys: string[]
}

const COLORS = ['#ef4444', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7']

function TopAnimesSeasonMonthlyChart({ data, animeKeys }: TopAnimesSeasonMonthlyChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : String(value))} />
        <Legend />
        {animeKeys.map((key, idx) => (
          <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export default TopAnimesSeasonMonthlyChart
