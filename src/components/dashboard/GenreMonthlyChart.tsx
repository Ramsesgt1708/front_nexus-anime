import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export type GenreMonthlyRecord = {
  month: string
  [genre: string]: number | string
}

interface GenreMonthlyChartProps {
  data: GenreMonthlyRecord[]
  genreKeys: string[]
}

const COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#14b8a6']

function GenreMonthlyChart({ data, genreKeys }: GenreMonthlyChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : String(value))} />
        <Legend />
        {genreKeys.map((key, idx) => (
          <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={COLORS[idx % COLORS.length]} fill={COLORS[idx % COLORS.length]} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default GenreMonthlyChart
