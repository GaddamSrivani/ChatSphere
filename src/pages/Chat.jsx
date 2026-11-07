
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

import {
  ref,
  onValue,
  set,
  serverTimestamp,
} from "firebase/database";

import {
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { auth, db, rtdb } from "../firebase";

function Chat() {
  const [users, setUsers] = useState([]);
  const [userStatuses, setUserStatuses] = useState({});

  const navigate = useNavigate();

  // Logout function
  const handleLogout = async () => {
  const user = auth.currentUser;

  if (!user) {
    navigate("/");
    return;
  }

  try {
    // Set Offline before signing out
    const statusRef = ref(
      rtdb,
      `status/${user.uid}`
    );

    await set(statusRef, {
      state: "offline",
      lastChanged: serverTimestamp(),
    });

    // Now sign out
    await signOut(auth);

    navigate("/");
  } catch (error) {
    console.error("Logout error:", error);
    alert("Logout failed: " + error.message);
  }
};

  // Load available users
  // Load available users after Firebase restores login
useEffect(() => {
  let unsubscribeUsers;

  const unsubscribeAuth = onAuthStateChanged(
    auth,
    (currentUser) => {
      // If the user is logged out, clear the user list
      if (!currentUser) {
        setUsers([]);
        return;
      }

      // Load all other registered users
      unsubscribeUsers = onSnapshot(
        collection(db, "users"),
        (snapshot) => {
          const otherUsers = snapshot.docs
            .map((userDoc) => ({
              id: userDoc.id,
              ...userDoc.data(),
            }))
            .filter(
              (user) => user.uid !== currentUser.uid
            );

          setUsers(otherUsers);
        },
        (error) => {
          console.error("Error loading users:", error);
        }
      );
    }
  );

  // Cleanup listeners
  return () => {
    unsubscribeAuth();

    if (unsubscribeUsers) {
      unsubscribeUsers();
    }
  };
}, []);

  // Listen to each user's online/offline status
  useEffect(() => {
    const unsubscribers = users.map((user) => {
      const statusRef = ref(rtdb, `status/${user.uid}`);

      return onValue(
        statusRef,
        (snapshot) => {
          const status = snapshot.val();

          setUserStatuses((previous) => ({
            ...previous,
            [user.uid]: status?.state || "offline",
          }));
        },
        (error) => {
          console.error("Error loading user status:", error);
        }
      );
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [users]);

  // Open a private chat
  const openPrivateChat = async (otherUser) => {
    const currentUser = auth.currentUser;

    if (!currentUser || !otherUser.uid) return;

    const participants = [
      currentUser.uid,
      otherUser.uid,
    ].sort();

    const roomId = participants.join("_");

    try {
      await setDoc(
        doc(db, "chats", roomId),
        { participants },
        { merge: true }
      );

      navigate(`/private-chat/${roomId}`);
    } catch (error) {
      console.error("Could not open private chat:", error);
      alert("Could not open private chat. Check Firestore rules.");
    }
  };

  return (
    <div className="chat-container">

      {/* Header */}
      <header className="header">
        <h2>ChatSphere</h2>
        <span>Available Users</span>
      </header>

      {/* Available users section */}
      <main className="chat-box">
        <h3>Select a user to start a private chat</h3>

        {users.length === 0 ? (
          <p>No other users found.</p>
        ) : (
          <div className="user-list">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => openPrivateChat(user)}
              >
                <span className="user-avatar">
                  {(user.name || user.email || "?")
                    .charAt(0)
                    .toUpperCase()}
                </span>

                <span className="user-details">
                  <span className="user-name">
                    {user.name || user.email}
                  </span>

                  <span
                    className={
                      userStatuses[user.uid] === "online"
                        ? "status-online"
                        : "status-offline"
                    }
                  >
                    {userStatuses[user.uid] === "online"
                      ? "Online"
                      : "Offline"}
                  </span>
                </span>

                <span className="user-arrow">›</span>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Logout button at the bottom */}
      <div className="logout-container">
        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>

    </div>
  );
}

export default Chat;
