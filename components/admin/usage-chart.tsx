'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface UsageChartProps {
  data: {
    date: string
    count: number
  }[]
}

export function UsageChart({ data }: UsageChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-3 bg-red-950/5 border-red-500/20 rounded-[2rem] overflow-hidden shadow-2xl">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Uso de Asistentes (Últimos 14 días)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] pl-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', border: '1px solid #ff000030', borderRadius: '12px' }}
              itemStyle={{ color: '#ef4444' }}
              cursor={{ fill: '#ffffff05' }}
            />
            <Bar
              dataKey="count"
              fill="#dc2626"
              radius={[4, 4, 0, 0]}
              className="fill-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
