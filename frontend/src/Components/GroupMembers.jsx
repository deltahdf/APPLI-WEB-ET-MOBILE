import React from 'react';
import './GroupMembers.css';

function GroupMembers({ groupMembers, selectedGroupId, deleteGroupMember }) {
  return (
    <div className="group-members-container">
      <h3>Group Members</h3>
      <ul className="group-members-list">
        {groupMembers.map(member => (
          <li key={member.id} className="group-member-item">
            <span className="group-member-info">
              <span className="group-member-name">{member.name}</span> - {member.email}
            </span>
            <button
              onClick={() => deleteGroupMember(selectedGroupId, member.id)}
              className="delete-button"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroupMembers;
