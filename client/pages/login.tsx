import { api } from "@/services/api";
import { useForm } from "react-hook-form";

const Login = () => {
  interface Login {
    username: string;
    senha: string;
  }
  const { register, handleSubmit } = useForm<Login>();
  const onSubmit = async (data: Login) => {
    const { data: response } = await api.post("/users/login", data);
    console.log(response);
  };

  return (
    <div
      className="bg-no-repeat bg-cover bg-center z-50 relative px-5"
      style={{
        backgroundImage:
          "url(https://images.pexels.com/photos/64287/stirling-castle-scotland-stirling-castle-64287.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      }}
    >
      <div className="absolute bg-gradient-to-b from-orange-50 to-orange-950 z-0 opacity-75 inset-0" />
      <div className="min-h-screen sm:flex sm:flex-row mx-0 justify-center">
        <div className="flex-col flex self-center p-10 sm:max-w-5xl xl:max-w-2xl z-10">
          <div className="self-start hidden lg:flex flex-col  text-white">
            <img src="" className="mb-3" />
            <h1 className="mb-3 font-bold text-5xl">
              Seja bem vindo aventureiro!
            </h1>
          </div>
        </div>
        <div className="flex justify-center self-center ">
          <div className="p-12 bg-white z-50 mx-auto rounded-2xl w-100 ">
            <div className="mb-4">
              <h3 className="font-semibold text-2xl text-gray-800">Entrar </h3>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 tracking-wide">
                  Username
                </label>
                <input
                  className=" w-full text-base px-4 py-2 border  border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                  type="text"
                  placeholder="username"
                  {...register("username")}
                />
              </div>
              <div className="space-y-2">
                <label className="mb-5 text-sm font-medium text-gray-700 tracking-wide">
                  Senha
                </label>
                <input
                  className="w-full content-center text-base px-4 py-2 border  border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                  type="password"
                  placeholder="entre com sua senha"
                  {...register("senha")}
                />
              </div>

              <button className="btn btn-primary w-full">Entrar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
