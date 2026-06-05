import React from 'react';
import './UserList.css'; 

function UserList({ users, onDeleteUser }) {
  return (
    <div className="user-list">
      <h2>Users</h2>
      <div className="user-list-scroll">
        <ul>
          {users.map(user => (
            <li key={user.id} className="user-item">
              <div className="avatar">              
                <div className="avatar-placeholder">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
              <div className="user-actions">
                <button onClick={() => onDeleteUser(user.id)} className="delete-button">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default UserList;
