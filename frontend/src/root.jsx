import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login.jsx';
import SignUp from './SignUp.jsx';
import App from './App.jsx';

export default function Root() {
  const [username, setUsername] = useState('');

  return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login setInputUsername={setUsername} />} />
      <Route path="/signup" element={<SignUp />} />
      {username && (
        <Route path="/game" element={<App username={username} />} />
      )}
    </Routes>
  </BrowserRouter>
);
}