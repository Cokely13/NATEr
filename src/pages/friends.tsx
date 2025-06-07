"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
};

type Friend = {
  id: number;
  requesterId: number;
  recipientId: number;
  status: string;
};

export default function FriendsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [friendships, setFriendships] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [usersRes, friendsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/friends"),
        ]);

        const usersData = await usersRes.json();
        const friendsData = await friendsRes.json();

        setAllUsers(usersData.filter((u: User) => u.id !== user.id));
        setFriendships(friendsData);
      } catch (err) {
        console.error("Error loading users or friends:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const getStatus = (
    targetId: number
  ): "none" | "requested" | "incoming" | "accepted" => {
    const match = friendships.find(
      (f) =>
        (f.requesterId === user?.id && f.recipientId === targetId) ||
        (f.recipientId === user?.id && f.requesterId === targetId)
    );

    if (!match) return "none";
    if (match.status === "accepted") return "accepted";
    if (match.recipientId === user?.id) return "incoming";
    return "requested";
  };

  const getMatch = (targetId: number) =>
    friendships.find(
      (f) =>
        (f.requesterId === user?.id && f.recipientId === targetId) ||
        (f.recipientId === user?.id && f.requesterId === targetId)
    );

  const sendRequest = async (recipientId: number) => {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to send friend request:", data.error);
        alert(data.error || "Something went wrong.");
        return;
      }

      setFriendships([
        ...friendships,
        {
          id: data.id,
          requesterId: user!.id,
          recipientId,
          status: "pending",
        },
      ]);
    } catch (err) {
      console.error("Request error:", err);
      alert("Something went wrong.");
    }
  };

  const acceptRequest = async (friendId: number) => {
    try {
      const res = await fetch(`/api/friends/${friendId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });

      const updated = await res.json();
      if (!res.ok) {
        console.error("Accept error:", updated.error);
        alert(updated.error || "Failed to accept request");
        return;
      }

      setFriendships((prev) =>
        prev.map((f) => (f.id === friendId ? { ...f, status: "accepted" } : f))
      );
    } catch (err) {
      console.error("Accept request error:", err);
      alert("Something went wrong.");
    }
  };

  if (!user || loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
        <h2 className="text-3xl font-bold text-center mb-6">Find Friends</h2>

        <ul className="space-y-4">
          {allUsers.map((u) => {
            const status = getStatus(u.id);
            const match = getMatch(u.id);

            return (
              <li
                key={u.id}
                className="flex justify-between items-center border-b pb-2"
              >
                {status === "accepted" ? (
                  <a
                    href={`/friend/${u.id}`}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    {u.name}
                  </a>
                ) : (
                  <span>{u.name}</span>
                )}
                {status === "accepted" && (
                  <span className="text-green-600 font-semibold">
                    Friends ✅
                  </span>
                )}
                {status === "requested" && (
                  <span className="text-gray-500">Pending ⏳</span>
                )}
                {status === "incoming" && match && (
                  <button
                    onClick={() => acceptRequest(match.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Accept Friend
                  </button>
                )}
                {status === "none" && (
                  <button
                    onClick={() => sendRequest(u.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Request Friend
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
