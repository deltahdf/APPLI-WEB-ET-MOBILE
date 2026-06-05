import React, { useState } from 'react';
import './Options.css';

function Options({ userEmail, updatePassword, onLogout }) {
  const [newPassword, setNewPassword] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  const handlePasswordUpdate = () => {
    if (newPassword.trim()) {
      updatePassword(newPassword)
        .then(() => setUpdateMessage('Password updated successfully.'))
        .catch(err => setUpdateMessage(`Error updating password: ${err.message}`));
    }
  };

  return (
    <div className="options-container">
      <h2>{userEmail}</h2>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New Password"
        className="options-input"
      />
      <button onClick={handlePasswordUpdate} className="options-button">
        Update Password
      </button>

      {updateMessage && <div className="options-message">{updateMessage}</div>}

      <div className="logout-container">
        <button onClick={onLogout} className="logout-button">
          Log out
        </button>
      </div>
    </div>
  );
}

export default Options;
