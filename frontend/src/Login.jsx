import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 

export default function Login({ setInputUsername }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://34.19.44.124:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (res.ok) {
        alert('Logged in successfully!');
        setInputUsername(username);
        setUsername('');
        setPassword('');
        navigate('/game');
      } else {
        let errorMessage = 'Error trying to login';
        try {
          const data = await res.json();
          if (data && data.error) errorMessage = data.error;
        } catch (_) {
          // ignore JSON parse errors
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Network error, please try again.', error);
      alert('Network error, please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Login</button>
        </form>

        <p className="signup-link">
          Don't have an account?{' '}
          <span onClick={() => navigate('/signup')}>
            Create an account
          </span>
        </p>
      </div>
    </div>
  );
}
