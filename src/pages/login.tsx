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
      setUser(data.user); // ⬅️ update global user context
      router.push("/");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border border-gray-300"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
        Login
      </h2>
      <input
        className="block w-full mb-4 p-3 bg-white border-2 border-gray-400 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="block w-full mb-6 p-3 bg-white border-2 border-gray-400 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
  );
}
