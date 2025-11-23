"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid email or password");
        }
      } else {
        // Sign up
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Registration failed");
        } else {
          // Auto login after successful registration
          const result = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });

          if (result?.error) {
            setError("Registration successful but login failed. Please try logging in.");
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Toggle between Login and Sign Up */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setIsLogin(true);
            setError("");
          }}
          className={`flex-1 py-2 rounded-lg font-medium transition-all ${
            isLogin
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLogin(false);
            setError("");
          }}
          className={`flex-1 py-2 rounded-lg font-medium transition-all ${
            !isLogin
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-purple-500"
              required={!isLogin}
              disabled={isLoading}
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-purple-500"
            required
            disabled={isLoading}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-purple-500"
            required
            minLength={6}
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {isLogin ? "Logging in..." : "Creating account..."}
            </span>
          ) : (
            <span>{isLogin ? "Login" : "Create Account"}</span>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-slate-900/50 text-slate-400">
            Or continue with
          </span>
        </div>
      </div>
    </div>
  );
}
