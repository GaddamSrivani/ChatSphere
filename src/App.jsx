import { Link, Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/login";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import PrivateChat from "./pages/PrivateChat";
import usePresence from "./hooks/usePresence";
function Home() {
  return (
    <div className="app">
      <header className="header">
        <h2>ChatSphere</h2>
        <span>Real-time Communication</span>
      </header>

      <main className="welcome">
        <h1>Welcome to ChatSphere</h1>
        <p>Connect with people, join channels, and chat in real time.</p>

        <div className="welcome-buttons">
          <Link to="/login">
            <button>Login</button>
          </Link>

          <Link to="/signup">
            <button>Sign Up</button>
          </Link>
        </div>
      </main>
    </div>
  );
}

function App() {
   usePresence();
  return (
  
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/private-chat/:chatId" element={<PrivateChat />} />
    </Routes>
  );
}

export default App;