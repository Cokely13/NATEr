// import Link from "next/link";

// export default function NavBar() {
//   return (
//     <nav className="bg-gray-800 text-white px-4 py-2 flex gap-4">
//       <Link href="/" className="hover:underline">
//         Home
//       </Link>
//       <Link href="/goals" className="hover:underline">
//         Today's Goals
//       </Link>
//       <Link href="/enterGoals" className="hover:underline">
//         Set Goals
//       </Link>
//       <Link href="/editGoal" className="hover:underline">
//         Edit Goals
//       </Link>
//       <Link href="/history" className="hover:underline">
//         History
//       </Link>
//     </nav>
//   );
// }
import Link from "next/link";

export default function NavBar() {
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
      </div>
    </nav>
  );
}
