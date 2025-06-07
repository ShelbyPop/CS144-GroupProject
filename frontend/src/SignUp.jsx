import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const res = await fetch('http://34.19.44.124:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, username, password }),
      });

      if (res.ok) {
        alert('Account created successfully! Please log in.');
        navigate('/');
      } else {
        const data = await res.json();
        alert(data.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert('Something went wrong. Try again.');
    }
  };

  const getResponsiveWidth = () => {
    if (screenWidth <= 520) return '90%';
    if (screenWidth <= 720) return '75%';
    if (screenWidth <= 1020) return '60%';
    return '400px';
  };

  return (
    <div
      style={{
        backgroundColor: '#f0e6f6',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: getResponsiveWidth(),
          background: 'saddlebrown',
          border: '4px solid #5d4037',
          borderRadius: '50% 50% 45% 45% / 60% 60% 40% 40%',
          padding: '2rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          color: 'white',
          textAlign: 'center',
          maxWidth: '90vw'
        }}
      >
        <h2 style={{ marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Email:</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Username:</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Password:</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  paddingRight: '2rem',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              />
              <span
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer'
                }}
              >
                👁️
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Confirm Password:</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  paddingRight: '2rem',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              />
              <span
                onClick={() => setShowConfirm(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer'
                }}
              >
                👁️
              </span>
            </div>
          </div>

          <button
            type="submit"
            style={{
              marginTop: '1rem',
              background: 'linear-gradient(#f44336, #b71c1c)',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 5px 0 #8e0e0e',
              transform: 'translateY(0)',
              transition: 'all 0.1s ease-in-out',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(3px)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Create Account
          </button>
        </form>

        <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
          Already have an account?{' '}
          <span
            style={{
              color: '#ffccff',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            Log in here
          </span>
        </p>
      </div>
    </div>
  );
}
