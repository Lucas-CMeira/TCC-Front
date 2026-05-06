import logo from "../assets/logo.jpg";
import { useNavigate } from "react-router-dom";

const Form = () => {

  const navigate = useNavigate()

  return (
    <div className="w-[500px] border border-zinc-300 rounded-lg shadow-md p-6 flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <img src={logo} alt="Imagem de finanças" className="w-48 h-48" />
        <h2 className="font-semibold"> Acesse sua conta agora!</h2>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          placeholder="Digite seu email"
          id="email"
          className="border rounded-md p-1.5 hover:bg-slate-100 "
        />
      </div>
      <div className="flex flex-col gap-1 ">
        <label htmlFor="email">Senha:</label>
        <input
          type="senha"
          placeholder="Digite sua senha"
          id="senha"
          className="border rounded-md p-1.5 hover:bg-slate-100"
        />
      </div>

      <div>
        <a href="#" className="text-gray-500 underline hover:underline text-sm">
          Esqueceu sua senha?
        </a>
      </div>
      <button className="bg-emerald-500 text-white py-2 px-4 rounded hover:bg-emerald-700 transition-colors">
        <p>Entrar</p>
      </button>
      <div className="flex flex-row justify-around p-3">
        <p>
          Ainda não possuí uma conta?
          <a onClick={() => navigate('/cadastro')} className="text-emerald-500 underline whitespace-nowrap hover:text-emerald-300 cursor-pointer">
            Faça seu cadastro
          </a>
        </p>
      </div>
    </div>
  );
};

export default Form;
