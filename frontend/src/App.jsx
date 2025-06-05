// src/App.jsx
import React from "react";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import GameCanvas from "./components/GameCanvas.jsx";

export default function App({ username }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      navigate('/');
    }
  }, [username]);

  return (
    <div>
      <div style={{ padding: "8px", background: "#222", color: "#fff" }}>
        Logged in as: {username}
      </div>
      <GameCanvas />
    </div>
  );
}
