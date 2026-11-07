
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

function PrivateChat() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState("");

  // Find the other person's profile
  useEffect(() => {
    const loadContact = async () => {
      try {
        const chatRef = doc(db, "chats", chatId);
        const chatSnapshot = await getDoc(chatRef);

        if (!chatSnapshot.exists()) {
          setError("Private channel not found.");
          return;
        }

        const participants = chatSnapshot.data().participants || [];
        const otherUid = participants.find(
          (uid) => uid !== auth.currentUser?.uid
        );

        if (!otherUid) {
          setError("Contact not found.");
          return;
        }

        const userSnapshot = await getDoc(doc(db, "users", otherUid));

        if (userSnapshot.exists()) {
          setContact(userSnapshot.data());
        }
      } catch (error) {
        console.error(error);
        setError("Could not load contact.");
      }
    };

    loadContact();
  }, [chatId]);

  // Listen for private messages
  useEffect(() => {
    if (!chatId) return;

    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        setMessages(
          snapshot.docs.map((messageDoc) => ({
            id: messageDoc.id,
            ...messageDoc.data(),
          }))
        );
      },
      (error) => {
        console.error(error);
        setError("Could not load messages.");
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  // Send a private message
  const handleSend = async (e) => {
    e.preventDefault();

    const text = messageText.trim();

    if (!text || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text,
        senderId: auth.currentUser.uid,
        senderName:
          auth.currentUser.displayName || auth.currentUser.email,
        createdAt: serverTimestamp(),
      });

      setMessageText("");
      setError("");
    } catch (error) {
      console.error(error);
      setError("Message could not be sent. Check Firestore rules.");
    }
  };

  return (
    <div className="whatsapp-page">
      <aside className="chat-sidebar">
        <button
          className="back-button"
          onClick={() => navigate("/chat")}
        >
          ← Back to users
        </button>

        <h2>ChatSphere</h2>
        <p>Private Channels</p>
      </aside>

      <main className="whatsapp-chat">
        <header className="chat-contact-header">
          <div className="contact-avatar">
            {(contact?.name || contact?.email || "?")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h3>{contact?.name || contact?.email || "Private Chat"}</h3>
            <span>Private conversation</span>
          </div>
        </header>

        <section className="whatsapp-messages">
          {messages.map((message) => {
            const isMine =
              message.senderId === auth.currentUser?.uid;

            return (
              <div
                key={message.id}
                className={`message-row ${
                  isMine ? "message-row-mine" : "message-row-other"
                }`}
              >
                <div
                  className={`whatsapp-bubble ${
                    isMine ? "bubble-mine" : "bubble-other"
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            );
          })}
        </section>

        {error && <p className="chat-error">{error}</p>}

        <form className="whatsapp-message-form" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type a message"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />

          <button type="submit" disabled={!messageText.trim()}>
            Send
          </button>
        </form>
      </main>
    </div>
  );
}

export default PrivateChat;
