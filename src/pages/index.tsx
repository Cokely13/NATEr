import Assistant from "@/components/Assistant";

export default function Home({
  user,
}: {
  user: { id: number; name: string; email: string };
}) {
  return (
    // <Layout>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-6 tracking-wide">
          Welcome to NATEr {user.name}!
        </h1>
        <p className="text-gray-600 mb-8">Your daily goal assistant</p>

        <div className="space-y-4">
          <a
            href="/goals"
            className="block bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Today&rsquo;s Goals
          </a>
          <a
            href="/enterGoals"
            className="block bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
          >
            Set Goals
          </a>
          <a
            href="/editGoal"
            className="block bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition"
          >
            Edit Goals
          </a>
          <a
            href="/history"
            className="block bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition"
          >
            History
          </a>
        </div>
      </div>

      <div className="mt-12 w-full max-w-2xl">
        <Assistant userId={user.id} />
      </div>
    </div>
    // </Layout>
  );
}

import { requireUser } from "../../lib/withUser";
import { use } from "react";

export const getServerSideProps = requireUser(async (_ctx, user) => {
  return { props: { user } };
});
