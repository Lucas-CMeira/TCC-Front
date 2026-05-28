import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.jpg";
import API_URL from "../services/api";

const FormCadastro = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar usuário");
      }

      alert("Usuário cadastrado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar usuário");
    }
  };

  return (
    <div className="w-[500px] border border-zinc-300 rounded-lg shadow-md p-6 flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <img src={logo} alt="Imagem de finanças" className="w-48 h-48" />
        <h2 className="font-semibold">Crie sua conta fácil e prático!</h2>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="name">Nome:</label>
        <input
          type="text"
          placeholder="Digite seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded-md p-1.5 hover:bg-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-md p-1.5 hover:bg-slate-100"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <label htmlFor="senha">Senha:</label>
        <input
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded-md p-1.5 hover:bg-slate-100"
        />

        <label htmlFor="confirmPassword">Repetir Senha:</label>
        <input
          type="password"
          placeholder="Repita sua senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border rounded-md p-1.5 hover:bg-slate-100"
        />
      </div>

      <button
        onClick={handleRegister}
        className="bg-emerald-500 text-white py-2 px-4 rounded hover:bg-emerald-700 transition-colors"
      >
        Começar agora!
      </button>

      <div className="flex flex-row justify-around p-3">
        <p>
          Já possui uma conta?
          <a
            onClick={() => navigate("/login")}
            className="text-emerald-500 underline whitespace-nowrap hover:text-emerald-300 cursor-pointer ml-1"
          >
            Faça o Login!
          </a>
        </p>
      </div>
    </div>
  );
};

export default FormCadastro;