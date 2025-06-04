import { ReactNode } from "react";
import NavBar from "./NavBar";
import { AuthProvider } from "@/context/AuthContext";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <NavBar />
        <main className="max-w-4xl mx-auto mt-8 px-4">{children}</main>
      </div>
    </AuthProvider>
  );
}
