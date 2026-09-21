import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { LucideIcon } from "lucide-react";

export interface DashboardStat {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

interface StatsOverviewProps {
  title: string;
  description: string;
  stats: DashboardStat[];
  isLoading: boolean;
  barTitle: string;
  pieTitle: string;
}

const chartColors = ["#60a5fa", "#fbbf24", "#34d399", "#fb7185", "#c084fc", "#fb923c"];

export default function StatsOverview({ title, description, stats, isLoading, barTitle, pieTitle }: StatsOverviewProps) {
  const chartData = stats.map((stat, index) => ({
    name: stat.label,
    cantidad: stat.value,
    color: chartColors[index % chartColors.length],
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 font-sans text-black md:p-8">
      <div className="border-b-4 border-black pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tight">{title}</h1>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em]">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: stats.length }).map((_, index) => (
              <div key={index} className="flex animate-pulse items-center gap-3 border-4 border-black bg-white p-4 shadow-[5px_5px_0_0_#111111]">
                <div className="h-12 w-12 bg-gray-300" />
                <div className="space-y-2"><div className="h-3 w-28 bg-gray-300" /><div className="h-6 w-12 bg-gray-300" /></div>
              </div>
            ))
          : stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3 border-4 border-black bg-[#d4ff00] p-4 shadow-[5px_5px_0_0_#111111] transition-transform hover:-translate-y-1">
                  <div className="bg-black p-3 text-white"><Icon size={28} strokeWidth={2.5} /></div>
                  <div><p className="text-[11px] font-black uppercase">{stat.label}</p><p className="text-3xl font-black">{stat.value}</p></div>
                </div>
              );
            })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="border-4 border-black bg-white p-5 shadow-[7px_7px_0_0_#111111] lg:col-span-2">
          <div className="mb-5 border-b-4 border-black pb-4"><h2 className="text-2xl font-black uppercase">{barTitle}</h2><p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em]">Comparativa de registros de la institución</p></div>
          <div className="h-72 w-full">
            {isLoading ? <div className="flex h-full items-center justify-center font-black uppercase">Cargando gráfico...</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#000" strokeDasharray="2 2" vertical={false} opacity={0.25} />
                  <XAxis dataKey="name" stroke="#000" fontSize={11} tickLine={false} axisLine={false} fontFamily="monospace" fontWeight="bold" />
                  <YAxis stroke="#000" fontSize={11} tickLine={false} axisLine={false} fontFamily="monospace" fontWeight="bold" allowDecimals={false} />
                  <Tooltip cursor={{ fill: "#000", opacity: 0.1 }} />
                  <Bar dataKey="cantidad">{chartData.map((entry) => <Cell key={entry.name} fill={entry.color} stroke="#000" strokeWidth={3} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="border-4 border-black bg-[#a6faff] p-5 shadow-[7px_7px_0_0_#111111]">
          <h2 className="text-2xl font-black uppercase">{pieTitle}</h2>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em]">Distribución proporcional</p>
          <div className="my-3 flex h-56 items-center justify-center">
            {isLoading ? <span className="font-black uppercase">Cargando...</span> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie data={chartData} dataKey="cantidad" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} stroke="none">
                    {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 border-t-2 border-black pt-3">
            {stats.map((stat, index) => <div key={stat.label} className="flex items-center gap-2 text-xs font-bold"><span className="h-3 w-3 shrink-0 border border-black" style={{ backgroundColor: chartColors[index % chartColors.length] }} /><span className="truncate">{stat.label}</span></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
