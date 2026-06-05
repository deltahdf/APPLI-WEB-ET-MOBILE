import React, { useState } from 'react';
import App from './App';
import Login from './Login';
import Signup from './Signup';
import Page from './Page';

function App2() {
  const [currentPage, setCurrentPage] = useState('home');
  const [userEmail, setUserEmail] = useState(''); // Email de l'utilisateur

  const navigateToLogin = () => setCurrentPage('login');
  const navigateToSignup = () => setCurrentPage('signup');
  const navigateToPage = () => setCurrentPage('page');

  const logout = () => {
    setCurrentPage('home');
    setUserEmail(''); // Réinitialiser l'email lors de la déconnexion
  };

  const handleLoginSuccess = (email) => {
    setUserEmail(email); // Mettre à jour l'email après la connexion réussie
    navigateToPage();    // Naviguer vers la page utilisateur
  };
  const handleSignupSuccess = (email) => {
    setUserEmail(email); // Mettre à jour l'email après l'inscription réussie
    navigateToPage();    // Naviguer vers la page utilisateur
  };

  return (
      <div>
        {currentPage === 'home' && <App onNavigate={navigateToLogin} />}
        {currentPage === 'login' && <Login onLoginSuccess={handleLoginSuccess} onSignupNavigate={navigateToSignup} />}
        {currentPage === 'signup' && <Signup onSignupSuccess={handleSignupSuccess} />}
        {currentPage === 'page' && <Page userEmail={userEmail} onLogout={logout} />}
      </div>
  );
}

export default App2;
