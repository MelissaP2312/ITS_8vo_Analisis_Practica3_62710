import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoginUseCase } from "../../../core/useCases/LoginUseCase";
import { AuthServiceImpl } from "../../../infrastructure/services/AuthServiceImpl.ts";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const defaultValues = {
    email: "",
    password: "",
  }

  const form = useForm({
    defaultValues: defaultValues,
    resolver: yupResolver(
      yup.object().shape({
        email: yup.string().email().required('This field is required'),
        password: yup.string().min(6).required('This field is required'),
      })
    )
  })

  /*const handleSubmit = (data: unknown) => {
    console.log(data)
  }*/

    const handleSubmit = async (data: { email: string; password: string }) => {
      try {
        // Paso 1: Obtener la cookie CSRF antes de cualquier llamada protegida
        await fetch("http://localhost:8000/sanctum/csrf-cookie", {
          credentials: "include"
        });
    
        // Paso 2: Ejecutar el login
        const authService = new AuthServiceImpl();
        const loginUseCase = new LoginUseCase(authService);
    
        const user = await loginUseCase.execute(data.email, data.password);
        if (user) {
          navigate('/'); // Redirige al dashboard
        } else {
          alert('Login failed');
        }
      } catch (error) {
        console.error("Login error:", error);
        alert('Login failed');
      }
    };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    error={form.formState.errors.email ? true : false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      form.setValue('email', e.target.value)
                    }} />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      error={form.formState.errors.password ? true : false}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        form.setValue('password', e.target.value)
                      }}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Button className="w-full" size="sm" onClick={form.handleSubmit(handleSubmit)}>
                    Sign in
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

