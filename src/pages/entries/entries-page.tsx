// Página de lançamentos: formulário de criação, histórico com edição e exclusão, suporte a lançamentos fixos mensais.

import { useEffect, useState } from "react";
import API_URL from "../../services/api";
import { formatCurrency, parseCurrency } from "../../utils/currencyMask";

const EntriesPage = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [type, setType] = useState("expenses");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [goalId, setGoalId] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const [fixedDay, setFixedDay] = useState("");

  const [editEntry, setEditEntry] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDisplayValue, setEditDisplayValue] = useState("");
  const [editType, setEditType] = useState("expenses");
  const [editDate, setEditDate] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editCustomCategory, setEditCustomCategory] = useState("");
  const [editGoalId, setEditGoalId] = useState("");
  const [editIsFixed, setEditIsFixed] = useState(false);
  const [editFixedDay, setEditFixedDay] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [entriesRes, categoriesRes, goalsRes] = await Promise.all([
        fetch(`${API_URL}/entries`, { credentials: "include" }),
        fetch(`${API_URL}/categories`, { credentials: "include" }),
        fetch(`${API_URL}/goals`, { credentials: "include" })
      ]);

      if (entriesRes.ok) setEntries(await entriesRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (goalsRes.ok) setGoals(await goalsRes.json());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const isOthers = selectedCategory?.name === "Outros";

  const selectedEditCategory = categories.find((c) => c.id === editCategoryId);
  const isEditOthers = selectedEditCategory?.name === "Outros";

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(formatCurrency(e.target.value));
  };

  const handleEditValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditDisplayValue(formatCurrency(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      alert("Selecione uma categoria!");
      return;
    }
    if (isOthers && !customCategory.trim()) {
      alert("Descreva a categoria em 'Qual categoria?'");
      return;
    }

    const numericValue = parseCurrency(displayValue);
    if (numericValue <= 0) {
      alert("Informe um valor válido!");
      return;
    }

    let finalCategoryId = categoryId;
    if (isOthers && customCategory.trim()) {
      try {
        const res = await fetch(`${API_URL}/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: customCategory.trim() })
        });
        if (res.ok) {
          const newCat = await res.json();
          finalCategoryId = newCat.id;
        }
      } catch (err) {
        console.error(err);
      }
    }

    try {
      const response = await fetch(`${API_URL}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          value: numericValue,
          type,
          date,
          categoryId: finalCategoryId,
          goalId: goalId || undefined,
          isFixed,
          fixedDay: isFixed ? Number(fixedDay) : undefined
        })
      });

      if (response.ok) {
        alert("Lançamento criado com sucesso!");
        fetchData();
        setTitle("");
        setDisplayValue("");
        setDate("");
        setCategoryId("");
        setCustomCategory("");
        setGoalId("");
        setIsFixed(false);
        setFixedDay("");
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEdit = (entry: any) => {
    setEditEntry(entry);
    setEditTitle(entry.title);
    setEditDisplayValue(formatCurrency(String(Math.round(entry.value * 100))));
    setEditType(entry.type);
    setEditDate(entry.date ? entry.date.slice(0, 10) : "");
    setEditCategoryId(entry.categoryId || "");
    setEditCustomCategory("");
    setEditGoalId(entry.goalId || "");
    setEditIsFixed(entry.isFixed || false);
    setEditFixedDay(entry.fixedDay ? String(entry.fixedDay) : "");
  };

  const closeEdit = () => {
    setEditEntry(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEntry) return;

    if (!editCategoryId) {
      alert("Selecione uma categoria!");
      return;
    }
    if (isEditOthers && !editCustomCategory.trim()) {
      alert("Descreva a categoria em 'Qual categoria?'");
      return;
    }

    const numericValue = parseCurrency(editDisplayValue);
    if (numericValue <= 0) {
      alert("Informe um valor válido!");
      return;
    }

    let finalCategoryId = editCategoryId;
    if (isEditOthers && editCustomCategory.trim()) {
      try {
        const res = await fetch(`${API_URL}/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: editCustomCategory.trim() })
        });
        if (res.ok) {
          const newCat = await res.json();
          finalCategoryId = newCat.id;
        }
      } catch (err) {
        console.error(err);
      }
    }

    try {
      const response = await fetch(`${API_URL}/entries/${editEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: editTitle,
          value: numericValue,
          type: editType,
          date: editDate,
          categoryId: finalCategoryId,
          goalId: editGoalId || null,
          isFixed: editIsFixed,
          fixedDay: editIsFixed ? Number(editFixedDay) : null
        })
      });

      if (response.ok) {
        closeEdit();
        fetchData();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/entries/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (response.ok || response.status === 204) {
        setDeletingId(null);
        fetchData();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const formatValue = (val: number) => {
    return val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">Lançamentos</h1>
        <p className="text-slate-500 text-sm">Gerencie suas receitas e despesas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Novo Lançamento</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Título</label>
              <input
                id="entry-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex: Supermercado, Salário de Junho..."
                className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Valor (R$)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
                  <input
                    id="entry-value"
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
                <label className="text-sm font-medium text-slate-700">Data</label>
                <input
                  id="entry-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Tipo</label>
                <select
                  id="entry-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="expenses">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Categoria</label>
                <select
                  id="entry-category"
                  value={categoryId}
                  onChange={(e) => { setCategoryId(e.target.value); setCustomCategory(""); }}
                  required
                  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">Selecione...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {isOthers && (
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Qual categoria? <span className="text-emerald-600">*</span>
                </label>
                <input
                  id="entry-custom-category"
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                  placeholder="Ex: Viagem, Educação, Saúde..."
                  className="mt-1 w-full p-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-emerald-50"
                />
                <p className="text-xs text-slate-400 mt-1">Uma nova categoria será criada com esse nome.</p>
              </div>
            )}

            {goals.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-700">Atrelar à Meta (Opcional)</label>
                <select
                  id="entry-goal"
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">Nenhuma</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="isFixed"
                checked={isFixed}
                onChange={(e) => setIsFixed(e.target.checked)}
                className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded"
              />
              <label htmlFor="isFixed" className="text-sm font-medium text-slate-700">
                Manter lançamento fixo mensalmente
              </label>
            </div>

            {isFixed && (
              <div>
                <label className="text-sm font-medium text-slate-700">Dia do Mês para Repetir (Ex: 5)</label>
                <input
                  id="entry-fixed-day"
                  type="number"
                  value={fixedDay}
                  onChange={(e) => setFixedDay(e.target.value)}
                  required
                  min="1"
                  max="31"
                  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            )}

            <button
              type="submit"
              id="entry-submit"
              className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-md hover:bg-emerald-700 transition mt-2"
            >
              Salvar Lançamento
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Histórico de Lançamentos</h2>

          <div className="flex flex-col gap-3">
            {entries.length === 0 ? (
              <p className="text-slate-500 text-sm">Nenhum lançamento encontrado.</p>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50 transition gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-800 truncate">{entry.title}</p>
                      {entry.isFixed && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Fixo</span>
                      )}
                      {entry.parentId && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Automático</span>
                      )}
                      {entry.goal && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full truncate">🎯 {entry.goal.title}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(entry.date)} • {entry.category?.name || "Sem categoria"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`font-semibold text-sm ${entry.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                      {entry.type === "income" ? "+" : "-"} R$ {formatValue(entry.value)}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(entry)}
                        title="Editar Lançamento"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l-4 1 1-4 9.5-9.5a2.121 2.121 0 013 3L9 13z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => setDeletingId(entry.id)}
                        title="Excluir Lançamento"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {editEntry && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold text-slate-800">Editar Lançamento</h2>
              <button type="button" onClick={closeEdit} className="text-slate-400 hover:text-slate-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Título</label>
                <input
                  id="edit-entry-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Valor (R$)</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
                    <input
                      id="edit-entry-value"
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
                  <label className="text-sm font-medium text-slate-700">Data</label>
                  <input
                    id="edit-entry-date"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Tipo</label>
                  <select
                    id="edit-entry-type"
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="expenses">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Categoria</label>
                  <select
                    id="edit-entry-category"
                    value={editCategoryId}
                    onChange={(e) => { setEditCategoryId(e.target.value); setEditCustomCategory(""); }}
                    required
                    className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Selecione...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isEditOthers && (
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Qual categoria? <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    id="edit-entry-custom-category"
                    type="text"
                    value={editCustomCategory}
                    onChange={(e) => setEditCustomCategory(e.target.value)}
                    required
                    placeholder="Ex: Viagem, Educação, Saúde..."
                    className="mt-1 w-full p-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-emerald-50"
                  />
                </div>
              )}

              {goals.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Atrelar à Meta (Opcional)</label>
                  <select
                    id="edit-entry-goal"
                    value={editGoalId}
                    onChange={(e) => setEditGoalId(e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Nenhuma</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="edit-isFixed"
                  checked={editIsFixed}
                  onChange={(e) => setEditIsFixed(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded"
                />
                <label htmlFor="edit-isFixed" className="text-sm font-medium text-slate-700">
                  Manter lançamento fixo mensalmente
                </label>
              </div>

              {editIsFixed && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Dia do Mês para Repetir (Ex: 5)</label>
                  <input
                    id="edit-entry-fixed-day"
                    type="number"
                    value={editFixedDay}
                    onChange={(e) => setEditFixedDay(e.target.value)}
                    required
                    min="1"
                    max="31"
                    className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              )}

              <button
                type="submit"
                id="edit-entry-submit"
                className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-md hover:bg-emerald-700 transition mt-2"
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4 text-xl">
              🗑️
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Excluir Lançamento?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Esta ação removerá este lançamento do seu histórico e atualizará seus saldos.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntriesPage;
