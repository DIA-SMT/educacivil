'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

interface DiplomasChartProps {
    data: { month: string; count: number }[]
}

export function DiplomasChart({ data }: DiplomasChartProps) {
    return (
        <div className="p-6 rounded-[2rem] border border-red-500/20 bg-red-500/5 shadow-2xl h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #ff000030', borderRadius: '12px' }}
                        itemStyle={{ color: '#ef4444' }}
                        cursor={{ fill: '#ffffff05' }}
                        formatter={(value: number) => [value, 'Diplomas']}
                    />
                    <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
