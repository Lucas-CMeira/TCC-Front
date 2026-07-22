import Form from "../../components/Form";

const LoginPage = () => {
  return (
    <div className="bg-white">
      <div className="flex flex-col items-center justify-center mb-20 mt-10 gap-4">
        <h1 className="text-black font-bold">
          ORGANIZE SUAS FINANÇAS DE UMA FORMA MUITO MAIS PRÁTICA!
        </h1>
      </div>
      <div className="flex flex-col justify-center items-center gap-3 " >
        <Form />
      </div>
    </div>
  );
};

export default LoginPage;
