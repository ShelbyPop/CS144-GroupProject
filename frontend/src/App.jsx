// src/App.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import GameCanvas from "./components/GameCanvas.jsx";
import Progress from "./components/Progress.jsx";

export default function App({ username: propUsername, setInputUsername }) {
  const [username, setUsername] = useState(propUsername || null);
  const navigate = useNavigate();

  useEffect(() => {
    // If no username passed in props, try to fetch from /me
    if (!propUsername) {
      fetch("http://34.19.44.124:3000/api/auth/me", {
        method: "GET",
        credentials: "include", // important to send cookie
      })
        .then(res => {
          if (!res.ok) throw new Error("Not logged in");
          return res.json();
        })
        .then(data => {
          setUsername(data.username);
          if (setInputUsername) setInputUsername(data.username); // update parent if needed
        })
        .catch(() => {
          navigate("/"); // redirect to login if not authenticated
        });
    }
  }, [propUsername]);

  if (!username) return null; // Optionally show a loading spinner

  return (
    <div>
      <div style={{ backgroundColor: "#222", padding: "12px 0" }}>
        <header className="logo-header">IRONKEEP</header>
      </div>
      <div style={{ padding: "8px", background: "#222", color: "#fff" }}>
        Logged in as: {username}
      </div>

      <div className="canvas-leaderboard-container">
        <GameCanvas username={username} />
        <div className="progress-wrapper">
          <Progress />
        </div>
      </div>
    </div>
  );
}
