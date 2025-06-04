"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      router.push("/");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col items-center px-4 pt-8 pb-20">
      <h1 className="text-8xl font-extrabold text-gray-900 mb-20 drop-shadow-sm text-center">
        🚀 <span className="text-orange-500">NATEr</span>
      </h1>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          Login
        </h2>
        <input
          className="block w-full mb-4 p-3 bg-white border-2 border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="block w-full mb-6 p-3 bg-white border-2 border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}
