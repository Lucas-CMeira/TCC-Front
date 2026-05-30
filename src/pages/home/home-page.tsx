import { useEffect, useState } from "react";
import API_URL from "../../services/api";

const HomePage = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(`${API_URL}/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Usuário não autenticado");
        }

        const user = await response.json();

        setUserName(user.name);
      } catch (error) {
        console.error(error);
      }
    };

    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Boa noite, <span className="text-emerald-600">{userName}</span>
        </h1>

        <p className="text-slate-500 text-sm">
          Aqui está o resumo financeiro do seu mês.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-slate-500 text-sm mb-2">Receitas do mês</p>
          <h2 className="text-2xl font-semibold text-emerald-600">
            R$ 0,00
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-slate-500 text-sm mb-2">Despesas do mês</p>
          <h2 className="text-2xl font-semibold text-red-500">
            R$ 0,00
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-slate-500 text-sm mb-2">Saldo atual</p>
          <h2 className="text-2xl font-semibold text-slate-800">
            R$ 0,00
          </h2>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <div className="flex justify-between mb-2">
          <p className="font-medium">Meta de economia</p>
          <p className="text-slate-500 text-sm">0% concluído</p>
        </div>

        <div className="w-full bg-slate-200 h-3 rounded-full">
          <div className="bg-emerald-500 h-3 rounded-full w-0"></div>
        </div>

        <div className="flex justify-between mt-2 text-sm text-slate-500">
          <p>R$ 10,00 economizado</p>
          <p>R$ 100.000 objetivo</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Minhas Metas</h3>

          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
            Nova Meta
          </button>
        </div>

        <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
          <p className="text-slate-400">
            Você ainda não possui metas cadastradas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;