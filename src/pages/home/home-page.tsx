import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../../services/api";

const HomePage = () => {
  const [userName, setUserName] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, entriesRes, goalsRes] = await Promise.all([
          fetch(`${API_URL}/me`, { credentials: "include" }),
          fetch(`${API_URL}/entries`, { credentials: "include" }),
          fetch(`${API_URL}/goals`, { credentials: "include" })
        ]);

        if (userRes.ok) {
          const user = await userRes.json();
          setUserName(user.name);
        } else {
          throw new Error("Usuário não autenticado");
        }

        if (entriesRes.ok) setEntries(await entriesRes.json());
        if (goalsRes.ok) setGoals(await goalsRes.json());

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const calculateFinancials = () => {
    let income = 0;
    let expenses = 0;
    
    // Simplificando para pegar todas as entradas, o ideal seria filtrar por mês atual
    entries.forEach(entry => {
      if (entry.type === 'income') income += entry.value;
      if (entry.type === 'expenses') expenses += entry.value;
    });

    return { income, expenses, balance: income - expenses };
  };

  const { income, expenses, balance } = calculateFinancials();

  const calculateProgress = (goal: any) => {
    if (!goal.entries || goal.entries.length === 0) return 0;
    const total = goal.entries.reduce((acc: number, entry: any) => acc + Math.abs(Number(entry.value)), 0);
    return Math.max(0, total);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Boa noite, <span className="text-emerald-600">{userName}</span>
        </h1>

        <p className="text-slate-500 text-sm">
          Aqui está o resumo financeiro das suas contas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-slate-500 text-sm mb-2">Receitas totais</p>
          <h2 className="text-2xl font-semibold text-emerald-600">
            R$ {income.toFixed(2)}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-slate-500 text-sm mb-2">Despesas totais</p>
          <h2 className="text-2xl font-semibold text-red-500">
            R$ {expenses.toFixed(2)}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-slate-500 text-sm mb-2">Saldo atual</p>
          <h2 className={`text-2xl font-semibold ${balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
            R$ {balance.toFixed(2)}
          </h2>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Minhas Metas</h3>

          <button 
            onClick={() => navigate("/goals")}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Gerenciar Metas
          </button>
        </div>

        {goals.length === 0 ? (
            <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
            <p className="text-slate-400">
                Você ainda não possui metas cadastradas.
            </p>
            </div>
        ) : (
            <div className="flex flex-col gap-6">
            {goals.map((goal) => {
                const progressValue = calculateProgress(goal);
                const percent = Math.min(100, Math.max(0, (progressValue / goal.value) * 100));
                
                return (
                  <div key={goal.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-slate-500 text-sm">{percent.toFixed(1)}% concluído</p>
                    </div>

                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>

                    <div className="flex justify-between mt-2 text-sm text-slate-500">
                      <p>R$ {progressValue.toFixed(2)} economizado</p>
                      <p>Objetivo: R$ {goal.value.toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;