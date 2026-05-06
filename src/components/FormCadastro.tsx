import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

const FormCadastro = () => {
  const navigate = useNavigate();

  return (
    <div className="w-[500px] border border-zinc-300 rounded-lg shadow-md p-6 flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <img src={logo} alt="Imagem de finanças" className="w-48 h-48" />
        <h2 className="font-semibold"> Crie sua conta fácil e prático!</h2>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="name">Nome:</label>
        <input
          type="text"
          placeholder="Digite seu nome"
          id="name"
          className="border rounded-md p-1.5 hover:bg-slate-100"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          placeholder="Digite seu email"
          id="email"
          className="border rounded-md p-1.5 hover:bg-slate-100"
        />
      </div>
      <div className="flex flex-col gap-2.5">
        <label htmlFor="senha">Senha:</label>
        <input
          type="senha"
          placeholder="Digite sua senha"
          id="senha"
          className="border rounded-md p-1.5 hover:bg-slate-100"
        />
        <label htmlFor="senha">Repetir Senha:</label>
        <input
          type="senha"
          placeholder="Repita sua senha"
          id="senha"
          className="border rounded-md p-1.5 hover:bg-slate-100"
        />
      </div>
      <button className="bg-emerald-500 text-white py-2 px-4 rounded hover:bg-emerald-700 transition-colors">
        <p>Começar agora!</p>
      </button>
      <div className="flex flex-row justify-around p-3">
        <p>
          Já possuí uma conta?
          <a
            onClick={() => navigate("/login")}
            className="text-emerald-500 underline whitespace-nowrap hover:text-emerald-300 cursor-pointer"
          >
            Faça o Login!
          </a>
        </p>
      </div>
    </div>
  );
};

export default FormCadastro;
