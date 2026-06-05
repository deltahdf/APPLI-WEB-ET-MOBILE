import React, { useState } from 'react';

import './Signup.css'; // Assurez-vous que le chemin d'accès est correct
import backgroundImage from '../logos/background2.png'; // Utilisez la même image que celle de la page Login
const backend = "http://localhost:3000/";

function Signup({ onSignupSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(''); // Ajout d'un état pour stocker le token

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      const response = await fetch(`${backend}api/users`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token); // Stocke le token reçu
        setError(''); 
        //setMessage('Inscription réussie !'); 
        setTimeout(() => onSignupSuccess(email), 200);  
      } else {
        setError(data.message || 'Une erreur s\'est produite lors de l\'inscription.');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire d\'inscription :', error);
      setError('Une erreur s\'est produite lors de l\'inscription.');
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
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <div className="signup-form" style={{ position: 'absolute', right: '20%', maxWidth: '400px' }}>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Nom</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Mot de Passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="confirm-password">Confirmation de MDP</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">S'inscrire</button>
          {error && <div className="error-message">{error}</div>}
          {token && <div className="token-display">Votre token : {token}</div>} {/* Afficher le token ici */}
        </form>
      </div>
    </div>
  );
}

export default Signup;
