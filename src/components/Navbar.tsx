import GranaFy from "../assets/GranaFy.png";
import { useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-full justify-between bg-emerald-600 h-16 p-4 shadow-md flex items-center gap-5">
      <img src={GranaFy} alt="Logo da GranaFy" className=" w-30 h-12"></img>
      <div className="w-full flex gap-4 justify-center items-center">
        <div
          className="bg-emerald-500 cursor-pointer shadow-md p-2 rounded-md bg-transparent hover:bg-emerald-700 transition hover"
          onClick={() => navigate("/")}
        >
          Home
        </div>
        <div
          className="bg-emerald-500 cursor-pointer shadow-md p-2 rounded-md bg-transparent hover:bg-emerald-700 transition"
          onClick={() => navigate("/profile")}
        >
          Profile
        </div>
      </div>
      <div
        className=" text-zinc-200 flex items-center gap-2 bg-red-600 cursor-pointer shadow-md p-2 rounded-md  hover:bg-red-800 transition hover:text-slate-300"
        onClick={() => navigate("/login")}
      >
        <MdLogout />
        Sair
      </div>
    </nav>
  );
};

export default Navbar;
