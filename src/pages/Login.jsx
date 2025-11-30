import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await signIn({ email, password });
      if (error) throw error;
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: email.split('@')[0], // Default name
          }
        }
      });
      if (error) throw error;
      alert('Controlla la tua email per il link di conferma!');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ justifyContent: 'center' }}>
      <h1>Safety App</h1>
      <p>Accedi o Registrati per continuare</p>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button 
          type="submit" 
          className="btn-safe" 
          style={{ width: '100%', marginTop: '20px' }}
          disabled={loading}
        >
          {loading ? 'Caricamento...' : 'Accedi'}
        </button>
        
        <button 
          type="button"
          onClick={handleSignUp}
          style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#333', border: '1px solid #ddd' }}
          disabled={loading}
        >
          Registrati
        </button>
      </form>
    </div>
  );
}
