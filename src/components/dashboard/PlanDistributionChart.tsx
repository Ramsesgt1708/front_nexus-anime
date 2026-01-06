import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export type PlanSlice = {
  name: 'Free' | 'Premium' | 'Premium+'
  value: number
}

interface PlanDistributionChartProps {
  data: PlanSlice[]
}

const COLORS = ['#22c55e', '#3b82f6', '#a855f7']

function PlanDistributionChart({ data }: PlanDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : String(value))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default PlanDistributionChart
