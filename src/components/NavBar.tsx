import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="bg-gray-800 text-white px-4 py-2 flex gap-4">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      <Link href="/goals" className="hover:underline">
        Today's Goals
      </Link>
      <Link href="/enter" className="hover:underline">
        Set Goals
      </Link>
      <Link href="/history" className="hover:underline">
        History
      </Link>
    </nav>
  );
}
