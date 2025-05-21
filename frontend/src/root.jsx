import React, { useState } from 'react';
import Login from './Login.jsx';
import App from './App.jsx';

export default function Root() {
  const [username, setUsername] = useState('');

  return (
    <div>
      {!username ? (
        <Login setInputUsername={setUsername} />
      ) : (
        <App username={username} />
      )}
    </div>
  );
}
