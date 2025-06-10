import Assistant from "@/components/Assistant";
import Link from "next/link";

export default function Home({
  user,
}: {
  user: { id: number; name: string; email: string };
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-6 tracking-wide">
          Welcome to NATEr {user.name}!
        </h1>
        <p className="text-gray-600 mb-8">Your daily goal assistant</p>

        <div className="space-y-4 mt-6">
          <Link
            href="/goals"
            className="block bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-center"
          >
            Today’s Goals
          </Link>

          <Link
            href="/enterGoals"
            className="block bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition text-center"
          >
            Set Goals
          </Link>

          <Link
            href="/editGoal"
            className="block bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition text-center"
          >
            Edit Goals
          </Link>

          <Link
            href="/logGoal"
            className="block bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition text-center"
          >
            Log Goals
          </Link>

          <Link
            href="/history"
            className="block bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-center"
          >
            History
          </Link>
          <Link
            href="/friends"
            className="block bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition text-center"
          >
            Friends
          </Link>
        </div>
      </div>

      <div className="mt-12 w-full max-w-2xl">
        <Assistant userId={user.id} />
      </div>
    </div>
  );
}

import { requireUser } from "../../lib/withUser";
import { use } from "react";

export const getServerSideProps = requireUser(async (_ctx, user) => {
  return { props: { user } };
});
