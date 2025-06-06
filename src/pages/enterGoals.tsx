"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  "Coding",
  "Study",
  "Work",
  "Reading",
  "Exercise",
  "Walk",
  "Other",
];
const FREQUENCIES = ["Daily", "Weekly", "OneTime"];

export default function EnterGoals() {
  const [form, setForm] = useState({
    category: "",
    frequency: "",
    targetMinutes: 0,
    description: "",
    date: "",
  });

  const [message, setMessage] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.frequency === "OneTime" && !form.date) {
      setMessage("⚠️ Date is required for OneTime goals");
      return;
    }

    try {
      if (!user) {
        router.push("/login");
        return;
      }

      const payload = {
        ...form,
        targetMinutes: Number(form.targetMinutes),
        userId: user.id,
      };

      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create goal");

      setMessage("✅ Goal created!");
      setForm({
        category: "",
        frequency: "",
        targetMinutes: 0,
        description: "",
        date: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("❌ Error creating goal");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-10 flex justify-center items-start">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          🎯 Create a New Goal
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Frequency
            </label>
            <select
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Frequency</option>
              {FREQUENCIES.map((freq) => (
                <option key={freq} value={freq}>
                  {freq}
                </option>
              ))}
            </select>
          </div>

          {/* Target Minutes */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Target Minutes
            </label>
            <input
              type="number"
              name="targetMinutes"
              value={form.targetMinutes}
              onChange={handleChange}
              min={1}
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Optional Description
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Date (only if OneTime) */}
          {form.frequency === "OneTime" && (
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition"
          >
            Save Goal
          </button>

          {/* Message */}
          {message && (
            <p
              className={`text-center text-sm mt-2 ${
                message.startsWith("✅")
                  ? "text-green-600"
                  : message.startsWith("⚠️")
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
