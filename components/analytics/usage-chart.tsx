"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { date: "2023-05-01", users: 2400 },
  { date: "2023-05-02", users: 2210 },
  { date: "2023-05-03", users: 2290 },
  { date: "2023-05-04", users: 2000 },
  { date: "2023-05-05", users: 2181 },
  { date: "2023-05-06", users: 2500 },
  { date: "2023-05-07", users: 2100 },
  { date: "2023-05-08", users: 2290 },
  { date: "2023-05-09", users: 2350 },
  { date: "2023-05-10", users: 2500 },
  { date: "2023-05-11", users: 2650 },
  { date: "2023-05-12", users: 2700 },
  { date: "2023-05-13", users: 2750 },
  { date: "2023-05-14", users: 2800 },
  { date: "2023-05-15", users: 3000 },
  { date: "2023-05-16", users: 3100 },
  { date: "2023-05-17", users: 3200 },
  { date: "2023-05-18", users: 3300 },
  { date: "2023-05-19", users: 3400 },
  { date: "2023-05-20", users: 3500 },
  { date: "2023-05-21", users: 3600 },
  { date: "2023-05-22", users: 3700 },
  { date: "2023-05-23", users: 3800 },
  { date: "2023-05-24", users: 3900 },
  { date: "2023-05-25", users: 4000 },
  { date: "2023-05-26", users: 4100 },
  { date: "2023-05-27", users: 4200 },
  { date: "2023-05-28", users: 4300 },
  { date: "2023-05-29", users: 4400 },
  { date: "2023-05-30", users: 4500 },
]

export function UsageChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getDate()}/${date.getMonth() + 1}`
          }}
        />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Line type="monotone" dataKey="users" stroke="#7C4DFF" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
