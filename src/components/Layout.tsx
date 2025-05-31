import { ReactNode } from "react";
import NavBar from "./NavBar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <NavBar />
      <main className="max-w-4xl mx-auto mt-8">{children}</main>
    </div>
  );
}
