import { useState } from "react";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      targetMinutes: Number(form.targetMinutes),
      userId: 1, // Hardcoded for now
    };

    if (form.frequency === "OneTime" && !form.date) {
      setMessage("Date is required for OneTime goals");
      return;
    }

    try {
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
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Enter Goals</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          >
            <option value="">Select Category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block">Frequency</label>
          <select
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          >
            <option value="">Select Frequency</option>
            {FREQUENCIES.map((freq) => (
              <option key={freq} value={freq}>
                {freq}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block">Target Minutes</label>
          <input
            type="number"
            name="targetMinutes"
            value={form.targetMinutes}
            onChange={handleChange}
            className="w-full border px-2 py-1"
            min={1}
          />
        </div>

        <div>
          <label className="block">Optional Description</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>

        {form.frequency === "OneTime" && (
          <div>
            <label className="block">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border px-2 py-1"
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Goal
        </button>

        {message && <p className="mt-2">{message}</p>}
      </form>
    </div>
  );
}
