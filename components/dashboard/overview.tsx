"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Jan",
    users: 4000,
    sessions: 2400,
  },
  {
    name: "Feb",
    users: 3000,
    sessions: 1398,
  },
  {
    name: "Mar",
    users: 2000,
    sessions: 9800,
  },
  {
    name: "Apr",
    users: 2780,
    sessions: 3908,
  },
  {
    name: "May",
    users: 1890,
    sessions: 4800,
  },
  {
    name: "Jun",
    users: 2390,
    sessions: 3800,
  },
  {
    name: "Jul",
    users: 3490,
    sessions: 4300,
  },
  {
    name: "Aug",
    users: 4000,
    sessions: 2400,
  },
  {
    name: "Sep",
    users: 3000,
    sessions: 1398,
  },
  {
    name: "Oct",
    users: 2000,
    sessions: 9800,
  },
  {
    name: "Nov",
    users: 2780,
    sessions: 3908,
  },
  {
    name: "Dec",
    users: 1890,
    sessions: 4800,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="users" fill="#7C4DFF" radius={[4, 4, 0, 0]} />
        <Bar dataKey="sessions" fill="#A78BFA" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
