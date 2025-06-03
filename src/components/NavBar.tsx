// import Link from "next/link";

// export default function NavBar() {
//   return (
//     <nav className="bg-gradient-to-r from-blue-200 to-blue-100 shadow-lg border-b border-blue-300 px-8 py-4">
//       <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6">
//         {[
//           { href: "/", label: "Home" },
//           { href: "/goals", label: "Today's Goals" },
//           { href: "/enterGoals", label: "Set Goals" },
//           { href: "/editGoal", label: "Edit Goals" },
//           { href: "/history", label: "History" },
//         ].map(({ href, label }) => (
//           <Link
//             key={href}
//             href={href}
//             className="text-blue-900 font-semibold text-lg px-4 py-2 rounded-full hover:bg-blue-300 hover:text-white transition duration-150"
//           >
//             {label}
//           </Link>
//         ))}
//       </div>
//     </nav>
//   );
// }

"use client";
import Link from "next/link";
import { useRouter } from "next/router";

export default function NavBar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-200 to-blue-100 shadow-lg border-b border-blue-300 px-8 py-4">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6">
        {[
          { href: "/", label: "Home" },
          { href: "/goals", label: "Today's Goals" },
          { href: "/enterGoals", label: "Set Goals" },
          { href: "/editGoal", label: "Edit Goals" },
          { href: "/history", label: "History" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-blue-900 font-semibold text-lg px-4 py-2 rounded-full hover:bg-blue-300 hover:text-white transition duration-150"
          >
            {label}
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="text-blue-900 font-semibold text-lg px-4 py-2 rounded-full hover:bg-red-400 hover:text-white transition duration-150"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
