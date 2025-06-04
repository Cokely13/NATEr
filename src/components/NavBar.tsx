// "use client";
// import { useRouter } from "next/router";
// import { useState } from "react";

// export default function Login() {
//   const [name, setName] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const router = useRouter();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, password }),
//       });

//       if (!res.ok) {
//         setError("Invalid credentials");
//         return;
//       }

//       // Login succeeded — hard reload to refresh session state
//       window.location.href = "/goals";
//     } catch (err) {
//       console.error("Login error:", err);
//       setError("Something went wrong");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
//       <form
//         onSubmit={handleLogin}
//         className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm space-y-4"
//       >
//         <h2 className="text-2xl font-bold text-center text-blue-700 mb-2">
//           Login
//         </h2>

//         <input
//           className="w-full border-2 border-gray-400 p-3 rounded-md bg-white text-gray-800"
//           placeholder="Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />

//         <input
//           className="w-full border-2 border-gray-400 p-3 rounded-md bg-white text-gray-800"
//           placeholder="Password"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         {error && (
//           <p className="text-center text-red-600 font-medium">{error}</p>
//         )}

//         <button
//           className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-semibold"
//           type="submit"
//         >
//           Login
//         </button>
//       </form>
//     </div>
//   );
// }

"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-200 to-blue-100 shadow-lg border-b border-blue-300 px-8 py-4">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6">
        <Link
          href="/"
          className="text-blue-900 font-semibold text-lg px-4 py-2 rounded-full hover:bg-blue-300 hover:text-white transition duration-150"
        >
          Home
        </Link>
        {user && (
          <>
            <Link
              href="/goals"
              className="text-blue-900 font-semibold text-lg px-4 py-2 rounded-full hover:bg-blue-300 hover:text-white transition duration-150"
            >
              Today's Goals
            </Link>
            <Link
              href="/enterGoals"
              className="text-blue-900 font-semibold text-lg px-4 py-2 rounded-full hover:bg-blue-300 hover:text-white transition duration-150"
            >
              Set Goals
            </Link>
            <Link
              href="/editGoal"
              className="text-blue-900 font-semibold text-lg px-4 py-2 rounded-full hover:bg-blue-300 hover:text-white transition duration-150"
            >
              Edit Goals
            </Link>
            <Link
              href="/history"
              className="text-blue-900 font-semibold text-lg px-4 py-2 rounded-full hover:bg-blue-300 hover:text-white transition duration-150"
            >
              History
            </Link>
            <button
              onClick={handleLogout}
              className="text-blue-900 font-semibold text-lg px-4 py-2 rounded-full hover:bg-red-400 hover:text-white transition duration-150"
            >
              Logout
            </button>
          </>
        )}
        {!user && (
          <Link
            href="/login"
            className="text-blue-900 font-semibold text-lg px-4 py-2 rounded-full hover:bg-blue-300 hover:text-white transition duration-150"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
