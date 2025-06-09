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
              href="/sharedGoal/create"
              className="text-blue-900 font-semibold text-lg px-4 py-2 rounded-full hover:bg-blue-300 hover:text-white transition duration-150"
            >
              Create Shared Goal
            </Link>
            <Link
              href="/profile"
              className="text-blue-900 font-semibold text-lg px-4 py-2 rounded-full hover:bg-blue-300 hover:text-white transition duration-150"
            >
              Profile
            </Link>
            <Link
              href="/friends"
              className="text-blue-900 font-semibold text-lg px-4 py-2 rounded-full hover:bg-blue-300 hover:text-white transition duration-150"
            >
              Friends
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
