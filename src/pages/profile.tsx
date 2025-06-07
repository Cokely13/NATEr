"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

type Friend = {
  id: number;
  requesterId: number;
  recipientId: number;
  status: string;
  tier: "basic" | "top";
  requester: { id: number; name: string };
  recipient: { id: number; name: string };
};

type ShareLevel = "friends" | "none";

export default function ProfilePage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [shareLevel, setShareLevel] = useState<ShareLevel>("friends");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [friendsRes, userRes] = await Promise.all([
          fetch("/api/friends"),
          fetch(`/api/users/${user.id}`),
        ]);

        const friendsData = await friendsRes.json();
        const userData = await userRes.json();

        setFriends(friendsData.filter((f: Friend) => f.status === "accepted"));
        setShareLevel(userData.shareLevel || "friends");
      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const updateTier = async (friendId: number, tier: "basic" | "top") => {
    try {
      await fetch(`/api/friends/${friendId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      setFriends((prev) =>
        prev.map((f) => (f.id === friendId ? { ...f, tier } : f))
      );
    } catch (err) {
      console.error("Failed to update friend tier:", err);
    }
  };

  const updateShareLevel = async (newLevel: ShareLevel) => {
    try {
      await fetch(`/api/users/${user!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareLevel: newLevel }),
      });

      setShareLevel(newLevel);
    } catch (err) {
      console.error("Failed to update share level:", err);
    }
  };

  if (!user || loading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
          {user.name}'s Profile
        </h2>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Goal Sharing Level:</h3>
          <select
            value={shareLevel}
            onChange={(e) => updateShareLevel(e.target.value as ShareLevel)}
            className="border px-4 py-2 rounded-md"
          >
            <option value="friends">Share with Friends</option>
            <option value="none">Do Not Share</option>
          </select>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Your Friends</h3>
          <ul className="space-y-4">
            {friends.map((f) => {
              const friendUser =
                f.requesterId === user.id ? f.recipient : f.requester;

              return (
                <li
                  key={f.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span className="font-medium">{friendUser.name}</span>
                  <select
                    value={f.tier}
                    onChange={(e) =>
                      updateTier(f.id, e.target.value as "basic" | "top")
                    }
                    className="border px-3 py-1 rounded"
                  >
                    <option value="basic">Basic</option>
                    <option value="top">Top</option>
                  </select>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
