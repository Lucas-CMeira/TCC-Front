import logo from "../assets/logo.jpg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API_URL from "../services/api";

const Form = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Email ou senha inválidos");
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);

      alert("Login realizado com sucesso!");

      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Erro ao realizar login");
    }
  };

  return (
    <div className="w-[500px] border border-zinc-300 rounded-lg shadow-md p-6 flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <img src={logo} alt="Imagem de finanças" className="w-48 h-48" />
        <h2 className="font-semibold">Acesse sua conta agora!</h2>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          placeholder="Digite seu email"
          className="border rounded-md p-1.5 hover:bg-slate-100"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="senha">Senha:</label>
        <input
          type="password"
          placeholder="Digite sua senha"
          className="border rounded-md p-1.5 hover:bg-slate-100"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <a href="#" className="text-gray-500 underline text-sm">
          Esqueceu sua senha?
        </a>
      </div>

      <button
        onClick={handleLogin}
        className="bg-emerald-500 text-white py-2 px-4 rounded hover:bg-emerald-700 transition-colors"
      >
        Entrar
      </button>

      <div className="flex flex-row justify-around p-3">
        <p>
          Ainda não possui uma conta?
          <a
            onClick={() => navigate("/cadastro")}
            className="text-emerald-500 underline whitespace-nowrap hover:text-emerald-300 cursor-pointer ml-1"
          >
            Faça seu cadastro
          </a>
        </p>
      </div>
    </div>
  );
};

export default Form;