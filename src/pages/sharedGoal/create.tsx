"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CATEGORIES } from "../../../utils/constants";

type Friend = {
  id: number;
  requesterId: number;
  recipientId: number;
  status: string;
  requester: { id: number; name: string };
  recipient: { id: number; name: string };
};

export default function CreateSharedGoal() {
  const { user } = useAuth();
  const router = useRouter();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendId, setFriendId] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [targetMinutes, setTargetMinutes] = useState<number>(30);
  const [frequency, setFrequency] = useState("Daily");
  const [access, setAccess] = useState<"read" | "edit">("read");

  useEffect(() => {
    if (!user) return;

    const fetchFriends = async () => {
      const res = await fetch("/api/friends");
      const data = await res.json();
      const accepted = data.filter((f: Friend) => f.status === "accepted");
      setFriends(accepted);
    };

    fetchFriends();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendId || !user || !category) return;

    const res = await fetch("/api/sharedGoals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creatorId: user.id,
        userId: friendId,
        category,
        description,
        targetMinutes,
        frequency,
        access,
      }),
    });

    if (res.ok) {
      router.push("/goals");
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create shared goal");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white shadow p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
        Create a Shared Goal
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Select a Friend</label>
          <select
            required
            value={friendId ?? ""}
            onChange={(e) => setFriendId(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Choose a friend --</option>
            {friends.map((f) => {
              const friend =
                f.requester.id === user?.id ? f.recipient : f.requester;
              return (
                <option key={friend.id} value={friend.id}>
                  {friend.name}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Category</label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Choose a category --</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">Target Minutes</label>
            <input
              type="number"
              min={1}
              required
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(Number(e.target.value))}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="OneTime">One Time</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Access Level</label>
          <select
            value={access}
            onChange={(e) => setAccess(e.target.value as "read" | "edit")}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="read">Read Only</option>
            <option value="edit">Edit</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Create Shared Goal
        </button>
      </form>
    </div>
  );
}
