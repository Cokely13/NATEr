// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";

// type Goal = {
//   id: number;
//   category: string;
//   description: string | null;
//   targetMinutes: number;
//   frequency: string;
// };

// type FriendUser = {
//   id: number;
//   name: string;
// };

// export default function FriendProfile() {
//   const router = useRouter();
//   const { id } = router.query;

//   const [friend, setFriend] = useState<FriendUser | null>(null);
//   const [goals, setGoals] = useState<Goal[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!id) return;

//     const fetchFriendData = async () => {
//       try {
//         const [userRes, goalsRes] = await Promise.all([
//           fetch(`/api/users/${id}`),
//           fetch(`/api/goals?userId=${id}`),
//         ]);

//         const friendData = await userRes.json();
//         const goalsData = await goalsRes.json();

//         setFriend(friendData);
//         setGoals(goalsData);
//       } catch (err) {
//         console.error("Error loading friend data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFriendData();
//   }, [id]);

//   if (loading || !friend) {
//     return <div className="p-8 text-center">Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-12">
//       <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
//         <h2 className="text-3xl font-bold text-purple-700 mb-4 text-center">
//           {friend.name}'s Goals
//         </h2>

//         {goals.length === 0 ? (
//           <p className="text-center text-gray-500">No goals to show.</p>
//         ) : (
//           <ul className="space-y-4">
//             {goals.map((goal) => (
//               <li
//                 key={goal.id}
//                 className="bg-purple-100 rounded-lg p-4 shadow-sm"
//               >
//                 <h3 className="text-xl font-semibold text-purple-800">
//                   {goal.category}
//                 </h3>
//                 {goal.description && (
//                   <p className="text-gray-700 italic">{goal.description}</p>
//                 )}
//                 <p className="text-sm text-gray-600">
//                   🎯 {goal.targetMinutes} minutes | {goal.frequency}
//                 </p>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Goal = {
  id: number;
  category: string;
  description: string | null;
  targetMinutes: number;
  frequency: string;
};

type FriendUser = {
  id: number;
  name: string;
};

type Friendship = {
  id: number;
  requesterId: number;
  recipientId: number;
  status: string;
};

export default function FriendProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [friend, setFriend] = useState<FriendUser | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    const fetchFriendData = async () => {
      try {
        const userRes = await fetch(`/api/users/${id}`);
        const friendData = await userRes.json();
        setFriend(friendData);

        const friendsRes = await fetch("/api/friends");
        const allFriendships: Friendship[] = await friendsRes.json();

        const isFriendMatch = allFriendships.some(
          (f) =>
            f.status === "accepted" &&
            ((f.requesterId === user.id && f.recipientId === Number(id)) ||
              (f.recipientId === user.id && f.requesterId === Number(id)))
        );

        setIsFriend(isFriendMatch);

        if (isFriendMatch) {
          const goalsRes = await fetch(`/api/goals?userId=${id}`);
          const goalsData = await goalsRes.json();
          setGoals(goalsData);
        }
      } catch (err) {
        console.error("Error loading friend data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendData();
  }, [id, user]);

  if (loading || !friend) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
        <h2 className="text-3xl font-bold text-purple-700 mb-4 text-center">
          {friend.name}'s Goals
        </h2>

        {!isFriend ? (
          <p className="text-center text-gray-500 italic">Private</p>
        ) : goals.length === 0 ? (
          <p className="text-center text-gray-500">No goals to show.</p>
        ) : (
          <ul className="space-y-4">
            {goals.map((goal) => (
              <li
                key={goal.id}
                className="bg-purple-100 rounded-lg p-4 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-purple-800">
                  {goal.category}
                </h3>
                {goal.description && (
                  <p className="text-gray-700 italic">{goal.description}</p>
                )}
                <p className="text-sm text-gray-600">
                  🎯 {goal.targetMinutes} minutes | {goal.frequency}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
