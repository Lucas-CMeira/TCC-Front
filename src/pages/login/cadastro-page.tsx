import FormCadastro from "../../components/FormCadastro";

const CadastroPage = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center mb-14 mt-10 gap-4">
        <h1 className="text-black font-bold ">
          ORGANIZE SUAS FINANÇAS DE UMA FORMA MUITO MAIS PRÁTICA!
        </h1>
      </div>
      <div className="flex flex-col justify-center items-center gap-3">
        <FormCadastro />
      </div>
    </>
  );
};

export default CadastroPage;
