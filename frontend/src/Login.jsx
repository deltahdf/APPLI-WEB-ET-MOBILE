import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Assurez-vous que le chemin d'accès est correct
import backgroundImage from '../logos/background2.png'; // Remplacez par le chemin réel de votre image
const backend = "http://localhost:3000/";

function Login({ onSignupNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const response = await fetch(`${backend}login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setToken(data.token); 
        setMessage('Connexion réussie !');
        setTimeout(() => onLoginSuccess(email), 600);  
        setMessage(data.message || 'Une erreur s\'est produite lors de la connexion.');
      }
      else{
        setMessage("Email ou/et MDP incorrect")
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire de connexion :', error);
      setMessage('Une erreur s\'est produite lors de la connexion.');
    }
  };
  

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        display: 'flex',
        justifyContent: 'flex-end', // Le formulaire sera aligné à droite, comme le bouton "WELCOME"
        alignItems: 'center', // Le formulaire sera centré verticalement
        position: 'relative', // Position relative pour le positionnement absolu du formulaire
      }}
    >
      <div className="login-form" style={{ position: 'absolute', right: '20%', maxWidth: '400px' }}>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">MDP    </label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">OK</button>
          <div className="signup-text" onClick={onSignupNavigate}>
          Créer un compte
          </div>
        </form>
        {message && <div className="message">{message}</div>}
        {token && <div className="token">Token: {token}</div>} {/* Affiche le token */}
      </div>

    </div>
  );
}

export default Login;
