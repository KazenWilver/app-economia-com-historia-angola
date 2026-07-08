"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CONTENT_STATUS_CHART_LABELS,
  CONTENT_TYPE_CHART_LABELS,
  type AdminStatsData,
} from "@/components/admin/stats-types";

const CHART_COLORS = [
  "#8B1538",
  "#D4AF37",
  "#1E3A5F",
  "#2D6A4F",
  "#B45309",
  "#5B21B6",
];

interface AdminStatsChartsProps {
  stats: AdminStatsData;
}

export function AdminStatsCharts({ stats }: AdminStatsChartsProps) {
  const overviewData = [
    { name: "Utilizadores", total: stats.totals.users },
    { name: "Conteúdos", total: stats.totals.contents },
    { name: "Quizzes", total: stats.totals.quiz_attempts },
    { name: "Tópicos", total: stats.totals.topics },
  ];

  const contentsByTypeData = Object.entries(stats.contents_by_type).map(
    ([type, total]) => ({
      name: CONTENT_TYPE_CHART_LABELS[type] ?? type,
      total,
    }),
  );

  const contentsByStatusData = Object.entries(stats.contents_by_status).map(
    ([status, total]) => ({
      name: CONTENT_STATUS_CHART_LABELS[status] ?? status,
      total,
    }),
  );

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-border-dark dark:bg-surface-dark-card">
        <h2 className="mb-4 font-display text-lg font-semibold text-slate-900 dark:text-content-dark-primary">
          Visão geral da plataforma
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overviewData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                {overviewData.map((entry, index) => (
                  <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-border-dark dark:bg-surface-dark-card">
        <h2 className="mb-4 font-display text-lg font-semibold text-slate-900 dark:text-content-dark-primary">
          Actividade mensal
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.monthly_activity} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                name="Utilizadores"
                stroke="#8B1538"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="quiz_attempts"
                name="Quizzes realizados"
                stroke="#D4AF37"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="topics"
                name="Tópicos criados"
                stroke="#1E3A5F"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-border-dark dark:bg-surface-dark-card">
        <h2 className="mb-4 font-display text-lg font-semibold text-slate-900 dark:text-content-dark-primary">
          Conteúdos por tipo
        </h2>
        <div className="h-72">
          {contentsByTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentsByTypeData}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={96}
                  label
                >
                  {contentsByTypeData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-content-dark-tertiary">
              Ainda não existem conteúdos registados.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-border-dark dark:bg-surface-dark-card">
        <h2 className="mb-4 font-display text-lg font-semibold text-slate-900 dark:text-content-dark-primary">
          Conteúdos por estado
        </h2>
        <div className="h-72">
          {contentsByStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contentsByStatusData}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#8B1538" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-content-dark-tertiary">
              Ainda não existem conteúdos registados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
