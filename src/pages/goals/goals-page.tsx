import { useEffect, useState } from "react";
import API_URL from "../../services/api";
import { formatCurrency, parseCurrency } from "../../utils/currencyMask";

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface GoalEntry {
  id?: string;
  type: string;
  value: number;
  date: string;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  value: number;
  limitDate: string;
  entries: GoalEntry[];
}

// ─── Helper de Cálculo de Cumprimento da Meta ──────────────────────────────────
export function getGoalCompletionDetails(goal: Goal) {
  if (!goal || !goal.entries || goal.entries.length === 0) {
    return { isCompleted: false, completedDate: null, diffDays: 0, status: "none" };
  }

  // Ordena lançamentos por data ascendente para descobrir qual entrada atingiu o objetivo
  const sortedEntries = [...goal.entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let accumulated = 0;
  let completedEntry: GoalEntry | null = null;

  for (const entry of sortedEntries) {
    accumulated += Math.abs(Number(entry.value));
    if (accumulated >= goal.value && !completedEntry) {
      completedEntry = entry;
      break;
    }
  }

  const isCompleted = accumulated >= goal.value;
  if (!isCompleted || !completedEntry) {
    return { isCompleted: false, completedDate: null, diffDays: 0, status: "none" };
  }

  const completedDateObj = new Date(completedEntry.date);
  const limitDateObj = new Date(goal.limitDate);

  // Normaliza horas para comparar apenas datas
  completedDateObj.setHours(0, 0, 0, 0);
  limitDateObj.setHours(0, 0, 0, 0);

  const diffMs = limitDateObj.getTime() - completedDateObj.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let status: "early" | "on_time" | "late" = "on_time";
  if (diffDays > 0) status = "early";
  if (diffDays < 0) status = "late";

  return {
    isCompleted: true,
    completedDate: completedEntry.date,
    diffDays: Math.abs(diffDays),
    status
  };
}

// ─── Componente principal ─────────────────────────────────────────────────────
const GoalsPage = () => {
  const [goals, setGoals] = useState<Goal[]>([]);

  // Form de criação
  const [title, setTitle] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [limitDate, setLimitDate] = useState("");
  const [description, setDescription] = useState("");

  // Modal de edição
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDisplayValue, setEditDisplayValue] = useState("");
  const [editLimitDate, setEditLimitDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Modal direto de exclusão (a partir do card)
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_URL}/goals`, { credentials: "include" });
      if (response.ok) setGoals(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  // ── Handlers de criação ──────────────────────────────────────────────────
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDisplayValue(formatCurrency(e.target.value));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseCurrency(displayValue);
    if (numericValue <= 0) { alert("Informe um valor objetivo válido!"); return; }

    try {
      const response = await fetch(`${API_URL}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, value: numericValue, limitDate, description: description || undefined })
      });

      if (response.ok) {
        fetchGoals();
        setTitle(""); setDisplayValue(""); setLimitDate(""); setDescription("");
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) { console.error(error); }
  };

  // ── Handlers de edição ───────────────────────────────────────────────────
  const openEdit = (goal: Goal) => {
    setEditGoal(goal);
    setEditTitle(goal.title);
    setEditDisplayValue(formatCurrency(String(Math.round(goal.value * 100))));
    setEditLimitDate(goal.limitDate.slice(0, 10));
    setEditDescription(goal.description || "");
    setShowDeleteConfirm(false);
  };

  const closeEdit = () => {
    setEditGoal(null);
    setShowDeleteConfirm(false);
  };

  const handleEditValueChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditDisplayValue(formatCurrency(e.target.value));

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGoal) return;

    const numericValue = parseCurrency(editDisplayValue);
    if (numericValue <= 0) { alert("Informe um valor objetivo válido!"); return; }

    try {
      const response = await fetch(`${API_URL}/goals/${editGoal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: editTitle,
          value: numericValue,
          limitDate: editLimitDate,
          description: editDescription || undefined,
        })
      });

      if (response.ok) {
        closeEdit();
        fetchGoals();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) { console.error(error); }
  };

  const executeGoalDelete = async (goalId: string) => {
    try {
      const response = await fetch(`${API_URL}/goals/${goalId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (response.ok || response.status === 204) {
        closeEdit();
        setDeleteTarget(null);
        fetchGoals();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async () => {
    if (!editGoal) return;
    await executeGoalDelete(editGoal.id);
  };

  // ── Utilitários ──────────────────────────────────────────────────────────
  const calculateProgress = (goal: Goal) => {
    if (!goal.entries || goal.entries.length === 0) return 0;
    const total = goal.entries.reduce((acc, entry) => acc + Math.abs(Number(entry.value)), 0);
    return Math.max(0, total);
  };

  const formatValue = (val: number) =>
    val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("pt-BR");

  const daysLeft = (limitDate: string) => {
    const diff = new Date(limitDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "Prazo encerrado";
    if (days === 0) return "Último dia!";
    return `${days} dia${days !== 1 ? "s" : ""} restante${days !== 1 ? "s" : ""}`;
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">Minhas Metas</h1>
        <p className="text-slate-500 text-sm">Defina e acompanhe seus objetivos financeiros</p>
      </div>

      {/* Banner explicativo */}
      <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 items-start">
        <span className="text-2xl">💡</span>
        <div>
          <p className="font-semibold text-emerald-800 text-sm">Como funcionam as metas?</p>
          <p className="text-emerald-700 text-sm mt-0.5">
            Crie uma meta aqui (ex: <strong>Viagem 2026 — R$ 4.800,00</strong>). Depois, na tela de{" "}
            <strong>Lançamentos</strong>, ao registrar uma receita ou depósito, selecione a opção{" "}
            <em>"Atrelar à Meta"</em> e escolha essa meta. O progresso será atualizado automaticamente
            conforme os lançamentos forem adicionados.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ── Formulário de criação ─────────────────────────────────────────── */}
        <div className="bg-white p-6 rounded-xl shadow h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Nova Meta</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Nome da Meta</label>
              <input
                id="goal-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex: Viagem 2026, Carro Novo, Reserva de Emergência..."
                className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Descrição (Opcional)</label>
              <input
                id="goal-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Viagem para a Europa com a família"
                className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Valor Objetivo (R$)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
                  <input
                    id="goal-value"
                    type="text"
                    inputMode="numeric"
                    value={displayValue}
                    onChange={handleValueChange}
                    required
                    placeholder="0,00"
                    className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Data Limite</label>
                <input
                  id="goal-limit-date"
                  type="date"
                  value={limitDate}
                  onChange={(e) => setLimitDate(e.target.value)}
                  required
                  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <button
              type="submit"
              id="goal-submit"
              className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-md hover:bg-emerald-700 transition mt-2"
            >
              Criar Meta
            </button>
          </form>
        </div>

        {/* ── Lista de metas ────────────────────────────────────────────────── */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Metas Ativas</h2>

          <div className="flex flex-col gap-6">
            {goals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">🎯</p>
                <p className="text-slate-500 text-sm">Nenhuma meta cadastrada ainda.</p>
                <p className="text-slate-400 text-xs mt-1">Crie sua primeira meta ao lado!</p>
              </div>
            ) : (
              goals.map((goal) => {
                const progressValue = calculateProgress(goal);
                const percent = Math.min(100, Math.max(0, (progressValue / goal.value) * 100));
                const completion = getGoalCompletionDetails(goal);
                const isCompleted = completion.isCompleted || percent >= 100;

                return (
                  <div
                    key={goal.id}
                    className={`border rounded-xl p-4 transition ${isCompleted ? "border-emerald-300 bg-emerald-50/60" : "hover:border-slate-300"}`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-800">{goal.title}</p>
                          {isCompleted && (
                            <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                              ✓ Concluída!
                            </span>
                          )}
                        </div>
                        {goal.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{goal.description}</p>
                        )}
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => openEdit(goal)}
                          title="Editar meta"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l-4 1 1-4 9.5-9.5a2.121 2.121 0 013 3L9 13z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(goal)}
                          title="Excluir meta"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Detalhes de Conclusão / Prazo */}
                    {isCompleted && completion.completedDate ? (
                      <div className="mb-3 p-2 rounded-lg bg-emerald-100/70 border border-emerald-200 text-xs text-emerald-800 font-medium flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span>🏆</span>
                          <span>Concluída no dia <strong>{formatDate(completion.completedDate)}</strong></span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-normal pl-5">
                          {completion.status === "early" && (
                            <span className="text-emerald-700 font-semibold">
                              🎉 Conquistada {completion.diffDays} dia{completion.diffDays !== 1 ? "s" : ""} antes da data prevista!
                            </span>
                          )}
                          {completion.status === "on_time" && (
                            <span className="text-emerald-700 font-semibold">
                              🎯 Conquistada exatamente no dia previsto!
                            </span>
                          )}
                          {completion.status === "late" && (
                            <span className="text-amber-800 font-semibold">
                              ⚠️ Conquistada {completion.diffDays} dia{completion.diffDays !== 1 ? "s" : ""} após a data prevista.
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mb-3">
                        📅 Data Limite: {formatDate(goal.limitDate)} — <span className={`font-medium ${new Date(goal.limitDate) < new Date() ? "text-red-500" : "text-slate-500"}`}>{daysLeft(goal.limitDate)}</span>
                      </p>
                    )}

                    {/* Barra de progresso */}
                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-emerald-400"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* Valores */}
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-700 font-medium">
                        R$ {formatValue(progressValue)}
                        <span className="text-slate-400 font-normal"> acumulado</span>
                      </span>
                      <span className="text-slate-500">
                        Meta: <span className="font-medium text-slate-700">R$ {formatValue(goal.value)}</span>
                      </span>
                    </div>

                    <div className="mt-1 text-right">
                      <span className={`text-xs font-semibold ${isCompleted ? "text-emerald-600" : "text-slate-400"}`}>
                        {percent.toFixed(1)}% concluído
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Modal de edição ───────────────────────────────────────────────────── */}
      {editGoal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold text-slate-800">Editar Meta</h2>
              <button
                type="button"
                onClick={closeEdit}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Nome da Meta</label>
                <input
                  id="edit-goal-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Descrição (Opcional)</label>
                <input
                  id="edit-goal-description"
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descrição da meta"
                  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Novo Valor (R$)</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                    <input
                      id="edit-goal-value"
                      type="text"
                      inputMode="numeric"
                      value={editDisplayValue}
                      onChange={handleEditValueChange}
                      required
                      className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Nova Data Limite</label>
                  <input
                    id="edit-goal-limit-date"
                    type="date"
                    value={editLimitDate}
                    onChange={(e) => setEditLimitDate(e.target.value)}
                    required
                    className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="edit-goal-submit"
                className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-md hover:bg-emerald-700 transition"
              >
                Salvar Alterações
              </button>
            </form>

            {/* Zona de exclusão no modal */}
            <div className="px-6 pb-6 border-t pt-4">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full border border-red-200 text-red-500 font-medium py-2 rounded-md hover:bg-red-50 transition text-sm"
                >
                  🗑️ Excluir Meta
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm font-medium mb-3">
                    ⚠️ Tem certeza? Se houver dinheiro guardado nesta meta, ele será <strong>devolvido automaticamente para o seu saldo</strong> e somado às suas <strong>receitas totais</strong>.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 border border-slate-300 text-slate-600 py-2 rounded-md hover:bg-slate-50 transition text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      id="confirm-delete-goal"
                      className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition text-sm font-semibold"
                    >
                      Sim, excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Direto de Exclusão de Meta ────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4 text-xl">
              🗑️
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Excluir Meta "{deleteTarget.title}"?</h3>
            <p className="text-xs text-slate-600 mb-6 bg-red-50 p-3 rounded-lg border border-red-100 text-left">
              ⚠️ Se houver saldo guardado nesta meta, ele será <strong>devolvido automaticamente ao seu saldo</strong> e somado às suas <strong>receitas totais</strong>.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => executeGoalDelete(deleteTarget.id)}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
