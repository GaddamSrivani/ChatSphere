import { Link } from "react-router-dom";
import { auth } from "../firebase";

function Dashboard() {
  return (
    <div className="dashboard">
      <header className="header">
        <h2>ChatSphere</h2>
        <span>Dashboard</span>
      </header>

      <main className="welcome">
        <h1>Welcome to ChatSphere!</h1>
        <p>You are successfully logged in.</p>

        <div className="welcome-buttons">
          <Link to="/chat">
  <button>Start Chatting</button>
</Link>
          <button
            onClick={() => auth.signOut()}
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;