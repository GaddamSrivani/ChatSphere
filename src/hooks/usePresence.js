import { useEffect } from "react";

import {
  ref,
  onValue,
  onDisconnect,
  set,
  serverTimestamp,
} from "firebase/database";

import { onAuthStateChanged } from "firebase/auth";

import { auth, rtdb } from "../firebase";

function usePresence() {
  useEffect(() => {
    let unsubscribeAuth = null;
    let unsubscribeConnection = null;
    let currentUserId = null;
    let active = true;

    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Stop the previous connection listener
      if (unsubscribeConnection) {
        unsubscribeConnection();
        unsubscribeConnection = null;
      }

      currentUserId = user ? user.uid : null;

      // Do not write anything when the user is logged out.
      // Firebase Auth is already null at this point.
      if (!user) {
        return;
      }

      const uid = user.uid;

      const statusRef = ref(rtdb, `status/${uid}`);
      const connectedRef = ref(rtdb, ".info/connected");

      unsubscribeConnection = onValue(
        connectedRef,
        async (snapshot) => {
          if (!active || currentUserId !== uid) {
            return;
          }

          // Wait until Firebase Realtime Database is connected
          if (snapshot.val() !== true) {
            return;
          }

          try {
            // Register Offline for unexpected disconnection
            await onDisconnect(statusRef).set({
              state: "offline",
              lastChanged: serverTimestamp(),
            });

            // Check that the same user is still logged in
            if (!active || currentUserId !== uid) {
              return;
            }

            // Set Online
            await set(statusRef, {
              state: "online",
              lastChanged: serverTimestamp(),
            });

            console.log("User is online:", uid);
          } catch (error) {
            console.error("Presence error:", error);
          }
        }
      );
    });

    return () => {
      active = false;

      if (unsubscribeAuth) {
        unsubscribeAuth();
      }

      if (unsubscribeConnection) {
        unsubscribeConnection();
      }
    };
  }, []);
}

export default usePresence;