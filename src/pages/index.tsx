import Layout from "@/components/Layout";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to NATEr</h1>
      <div className="flex flex-col items-center space-y-4">
        <a href="/goals" className="text-blue-500 underline">
          Today's Goals
        </a>
        <a href="/enterGoals" className="text-blue-500 underline">
          Set Goals
        </a>
        <a href="/history" className="text-blue-500 underline">
          History
        </a>
      </div>
    </div>
  );
}
