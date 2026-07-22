import { useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { getGoalCompletionDetails } from "../goals/goals-page";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import API_URL from "../../services/api";

const COLORS = [
  "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#6B7280"
];

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Filtros do Histórico Geralzão
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expenses">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, entriesRes, goalsRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/me`, { credentials: "include" }),
          fetch(`${API_URL}/entries`, { credentials: "include" }),
          fetch(`${API_URL}/goals`, { credentials: "include" }),
          fetch(`${API_URL}/categories`, { credentials: "include" })
        ]);

        if (userRes.ok) setUser(await userRes.json());
        if (entriesRes.ok) setEntries(await entriesRes.json());
        if (goalsRes.ok) setGoals(await goalsRes.json());
        if (categoriesRes.ok) setCategories(await categoriesRes.json());
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  // ── Cálculos Financeiros ──────────────────────────────────────────────────
  const totalIncome = entries
    .filter((e) => e.type === "income")
    .reduce((acc, e) => acc + e.value, 0);

  const totalExpenses = entries
    .filter((e) => e.type === "expenses")
    .reduce((acc, e) => acc + e.value, 0);

  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  // ── Dados para o Gráfico de Despesas por Categoria ───────────────────────
  const expensesByCategoryMap: { [key: string]: number } = {};
  entries
    .filter((e) => e.type === "expenses")
    .forEach((e) => {
      const catName = e.category?.name || "Sem Categoria";
      expensesByCategoryMap[catName] = (expensesByCategoryMap[catName] || 0) + e.value;
    });

  const categoryChartData = Object.keys(expensesByCategoryMap).map((catName) => ({
    name: catName,
    value: expensesByCategoryMap[catName]
  }));

  // ── Dados para o Gráfico Comparativo ─────────────────────────────────────
  const comparisonData = [
    {
      name: "Resumo",
      Receitas: totalIncome,
      Despesas: totalExpenses,
      Saldo: Math.max(0, netBalance)
    }
  ];

  // ── Filtro do Histórico Geralzão ─────────────────────────────────────────
  const filteredEntries = entries.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.category?.name && e.category.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === "all" ? true : e.type === filterType;
    const matchesCat = filterCategory === "all" ? true : e.categoryId === filterCategory;

    return matchesSearch && matchesType && matchesCat;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex flex-col gap-6">
      {/* ── Perfil do Usuário (Header Card) ───────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
            <CgProfile className="w-14 h-14" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{user?.name || "Carregando..."}</h1>
            <p className="text-slate-500 text-sm">{user?.email || "usuario@granafy.com"}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium">
                Conta Ativa
              </span>
              <span className="text-xs text-slate-400">
                {entries.length} lançamentos gravados
              </span>
            </div>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="flex gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-around">
          <div className="text-center">
            <p className="text-xs text-slate-400 font-medium uppercase">Metas Ativas</p>
            <p className="text-2xl font-bold text-purple-600">{goals.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 font-medium uppercase">Taxa de Poupança</p>
            <p className="text-2xl font-bold text-emerald-600">{savingsRate.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 font-medium uppercase">Categorias</p>
            <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
          </div>
        </div>
      </div>

      {/* ── Indicadores de Saúde Financeira ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-emerald-500">
          <p className="text-slate-500 text-sm font-medium">Receitas Totais</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">R$ {formatCurrency(totalIncome)}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-red-500">
          <p className="text-slate-500 text-sm font-medium">Despesas Totais</p>
          <h3 className="text-2xl font-bold text-red-500 mt-1">R$ {formatCurrency(totalExpenses)}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
          <p className="text-slate-500 text-sm font-medium">Saldo Geral Acumulado</p>
          <h3 className={`text-2xl font-bold mt-1 ${netBalance >= 0 ? "text-slate-800" : "text-red-600"}`}>
            R$ {formatCurrency(netBalance)}
          </h3>
        </div>
      </div>

      {/* ── Seção de Gráficos Analíticos ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Despesas por Categoria */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Despesas por Categoria</h2>
          <p className="text-xs text-slate-400 mb-6">Distribuição dos seus gastos entre as categorias</p>

          {categoryChartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-3xl mb-1">📊</p>
              <p className="text-slate-400 text-sm">Nenhuma despesa registrada ainda.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => `R$ ${formatCurrency(Number(val))}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Gráfico 2: Receitas vs Despesas */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Receitas vs. Despesas</h2>
          <p className="text-xs text-slate-400 mb-6">Comparativo geral entre o total arrecadado e o total gasto</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(val: any) => `R$ ${formatCurrency(Number(val))}`} />
                <Legend />
                <Bar dataKey="Receitas" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Despesas" fill="#EF4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Saldo" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Conquistas de Metas ─────────────────────────────────────────────── */}
      {(() => {
        const completedGoals = goals.filter((g: any) => {
          const detail = getGoalCompletionDetails(g);
          return detail.isCompleted;
        });

        if (completedGoals.length === 0) return null;

        return (
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">🏆 Conquistas</h2>
              <p className="text-xs text-slate-400 mt-0.5">Metas que você já completou — veja quando e se foi no prazo!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedGoals.map((goal: any) => {
                const detail = getGoalCompletionDetails(goal);
                return (
                  <div
                    key={goal.id}
                    className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎯</span>
                      <p className="font-semibold text-slate-800 text-sm truncate">{goal.title}</p>
                    </div>

                    {goal.description && (
                      <p className="text-xs text-slate-500 pl-7">{goal.description}</p>
                    )}

                    <div className="pl-7 flex flex-col gap-1">
                      <p className="text-xs text-slate-500">
                        🗓️ Meta: <strong>R$ {goal.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                      </p>
                      {detail.completedDate && (
                        <p className="text-xs text-emerald-700 font-medium">
                          ✅ Concluída em: <strong>{new Date(detail.completedDate).toLocaleDateString("pt-BR")}</strong>
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        📅 Prazo era: <strong>{new Date(goal.limitDate).toLocaleDateString("pt-BR")}</strong>
                      </p>
                    </div>

                    <div className="mt-1">
                      {detail.status === "early" && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-1 rounded-full">
                          🎉 {detail.diffDays} dia{detail.diffDays !== 1 ? "s" : ""} antes do prazo!
                        </span>
                      )}
                      {detail.status === "on_time" && (
                        <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">
                          🎯 Exatamente no prazo!
                        </span>
                      )}
                      {detail.status === "late" && (
                        <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-1 rounded-full">
                          ⚠️ {detail.diffDays} dia{detail.diffDays !== 1 ? "s" : ""} após o prazo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Histórico Geralzão de Transações ─────────────────────────────────── */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Histórico Geralzão</h2>
            <p className="text-slate-500 text-xs mt-0.5">Consulte todos os seus lançamentos de forma unificada</p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Busca */}
            <input
              type="text"
              placeholder="Buscar lançamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />

            {/* Tipo */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Apenas Receitas</option>
              <option value="expenses">Apenas Despesas</option>
            </select>

            {/* Categoria */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela de Lançamentos */}
        <div className="overflow-x-auto">
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm">Nenhum lançamento encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b">
                <tr>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Título</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Meta Atrelada</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-slate-400 font-medium text-xs">
                      {formatDate(entry.date)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {entry.title}
                      {entry.isFixed && (
                        <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-normal">Fixo</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-md font-medium">
                        {entry.category?.name || "Outros"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {entry.goal ? (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-medium">
                          🎯 {entry.goal.title}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {entry.type === "income" ? (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-medium">
                          Receita
                        </span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-medium">
                          Despesa
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${entry.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                      {entry.type === "income" ? "+" : "-"} R$ {formatCurrency(entry.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;