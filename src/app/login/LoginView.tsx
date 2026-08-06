"use client";

import { registerUser } from "@/app/actions/auth";
import { loginSchema, registerSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function LoginView() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [serverError, setServerError] = useState("");

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@subsmanager.app", password: "demo1234" },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const handleLogin = async (data: any) => {
    setServerError("");
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      setServerError(res.error);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleRegister = async (data: any) => {
    setServerError("");
    const res = await registerUser(data);
    if (res.error) {
      setServerError(res.error);
    } else {
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-apple-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-apple-border shadow-apple-modal space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold text-apple-text tracking-tight">Subs Manager</h1>
          <p className="text-xs text-apple-secondary">
            {isRegister ? "Create your account to start managing subscriptions." : "Sign in to access your financial dashboard."}
          </p>
        </div>

        <div className="flex bg-black/5 p-1 rounded-2xl border border-apple-border text-xs font-medium">
          <button
            onClick={() => {
              setIsRegister(false);
              setServerError("");
            }}
            className={`flex-1 py-1.5 rounded-xl transition ${
              !isRegister ? "bg-white text-apple-text shadow-apple" : "text-apple-secondary hover:text-apple-text"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsRegister(true);
              setServerError("");
            }}
            className={`flex-1 py-1.5 rounded-xl transition ${
              isRegister ? "bg-white text-apple-text shadow-apple" : "text-apple-secondary hover:text-apple-text"
            }`}
          >
            Create Account
          </button>
        </div>

        {serverError && (
          <div className="p-3 rounded-xl bg-apple-danger-soft text-apple-danger text-xs font-medium border border-rose-200 text-center">
            {serverError}
          </div>
        )}

        {!isRegister && (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-apple-secondary mb-1">Email</label>
              <input
                type="email"
                {...loginForm.register("email")}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text"
              />
              {loginForm.formState.errors.email && (
                <p className="text-[10px] text-apple-danger mt-1">
                  {loginForm.formState.errors.email.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-apple-secondary mb-1">Password</label>
              <input
                type="password"
                {...loginForm.register("password")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text"
              />
              {loginForm.formState.errors.password && (
                <p className="text-[10px] text-apple-danger mt-1">
                  {loginForm.formState.errors.password.message as string}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginForm.formState.isSubmitting}
              className="w-full py-3 rounded-2xl bg-apple-text text-white text-xs font-medium hover:opacity-90 transition shadow-sm disabled:opacity-50"
            >
              {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
            </button>

            <div className="pt-2 text-center text-xs text-apple-tertiary">
              Demo Credentials: <span className="font-semibold text-apple-secondary">demo@subsmanager.app</span> / <span className="font-semibold text-apple-secondary">demo1234</span>
            </div>
          </form>
        )}

        {isRegister && (
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-apple-secondary mb-1">Full Name</label>
              <input
                type="text"
                {...registerForm.register("name")}
                placeholder="Alex Morgan"
                className="w-full px-3.5 py-2.5 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text"
              />
              {registerForm.formState.errors.name && (
                <p className="text-[10px] text-apple-danger mt-1">
                  {registerForm.formState.errors.name.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-apple-secondary mb-1">Email</label>
              <input
                type="email"
                {...registerForm.register("email")}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text"
              />
              {registerForm.formState.errors.email && (
                <p className="text-[10px] text-apple-danger mt-1">
                  {registerForm.formState.errors.email.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-apple-secondary mb-1">Password</label>
              <input
                type="password"
                {...registerForm.register("password")}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text"
              />
              {registerForm.formState.errors.password && (
                <p className="text-[10px] text-apple-danger mt-1">
                  {registerForm.formState.errors.password.message as string}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerForm.formState.isSubmitting}
              className="w-full py-3 rounded-2xl bg-apple-text text-white text-xs font-medium hover:opacity-90 transition shadow-sm disabled:opacity-50"
            >
              {registerForm.formState.isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
