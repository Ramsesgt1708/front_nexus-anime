import Input from "../../components/forms/input";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Button from "../../components/forms/button";
import clientAPI from "../../services/http.service";
import authService from "../../services/auth.service";
import toast from "react-hot-toast";
import { useState } from "react";

function AuthPage() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      nombre: "",
      email: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const login = async (data: any) => {
    try {
      const response = await clientAPI.post("/Auth/login", {
        email: data.username,
        password: data.password,
      });

      const { token, expiracion, usuario } = response.data;
      authService.saveAuthData(token, expiracion, usuario);

      toast.success(`¡Bienvenido ${usuario.nombre}!`);
      navigate("/Home");
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      toast.error(
        error.response?.data?.message ||
          "Error al iniciar sesión. Verifica tus credenciales."
      );
    }
  };

  const register_user = async (data: any) => {
    try {
      await clientAPI.post("/Usuarios", {
        nombre: data.nombre,
        email: data.email,
        password: data.password,
        rolId: 3,
        planId: 1,
      });

      toast.success("¡Registro exitoso! Por favor inicia sesión.");
      setIsRegistering(false);
      reset();
    } catch (error: any) {
      console.error("Error al registrarse:", error);
      toast.error(
        error.response?.data?.message ||
          "Error al registrarse. Intenta con otro email."
      );
    }
  };
  return (
    <>
      <div className="w-full h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md flex flex-col gap-8 items-center justify-center">
          <img
            src="/media/LogoNexus.png"
            alt="LogoNexus"
            className="w-64 h-auto object-contain"
          />
          <div className="w-full flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">
              {isRegistering ? "Registrarse" : "Acceder"}
            </h2>

            {isRegistering ? (
              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(register_user)}
              >
                <Input
                  type="text"
                  placeholder="tu_usuario"
                  label="Username"
                  requiredIndicator="true"
                  errors={errors.nombre}
                  {...register("nombre", {
                    required: "El nombre de usuario es requerido",
                    minLength: {
                      value: 2,
                      message: "El nombre de usuario debe tener al menos 2 caracteres",
                    },
                  })}
                />
                <Input
                  type="email"
                  placeholder="example@dominio.com"
                  label="Correo Electrónico"
                  requiredIndicator="true"
                  errors={errors.email}
                  {...register("email", {
                    required: "El email es requerido",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Email inválido",
                    },
                  })}
                />
                <Input
                  type="password"
                  placeholder="********"
                  label="Contraseña"
                  requiredIndicator="true"
                  errors={errors.password}
                  {...register("password", {
                    required: "La contraseña es requerida",
                    minLength: {
                      value: 6,
                      message: "La contraseña debe tener al menos 6 caracteres",
                    },
                  })}
                />
                <Input
                  type="password"
                  placeholder="********"
                  label="Confirmar Contraseña"
                  requiredIndicator="true"
                  errors={errors.confirmPassword}
                  {...register("confirmPassword", {
                    required: "Debes confirmar tu contraseña",
                    validate: (value) =>
                      value === password || "Las contraseñas no coinciden",
                  })}
                />
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  isLoading={isSubmitting}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Registrarse
                </Button>
                <p className="text-center text-sm text-slate-400">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(false);
                      reset();
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Inicia sesión
                  </button>
                </p>
              </form>
            ) : (
              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit((data) => {
                  login(data);
                })}
              >
                <Input
                  type="text"
                  placeholder="example@dominio.com"
                  label="Direccion de correo"
                  requiredIndicator="true"
                  errors={errors.username}
                  {...register("username", {
                    required: true,
                  })}
                />
                <Input
                  type="password"
                  placeholder="********"
                  label="Contraseña"
                  requiredIndicator="true"
                  errors={errors.password}
                  {...register("password", {
                    required: true,
                  })}
                />
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  isLoading={isSubmitting}
                  onClick={handleSubmit(login)}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Iniciar Sesión
                </Button>
                <p className="text-center text-sm text-slate-400">
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      reset();
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AuthPage;
