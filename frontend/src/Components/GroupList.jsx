import React from 'react';
import './GroupList.css'; 

function GroupList({ groups, newGroupName, setNewGroupName, createGroup, fetchGroupMembers, selectGroup }) {
  return (
    <div className="group-list">
      <h2>Groups</h2>
      <div className="group-creation">
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Group Name"
        />
        <button onClick={createGroup} className="create-button">Create</button>
      </div>
      <ul>
        {groups.map(group => (
          <li key={group.id} className="group-item">
            <div className="group-info">
              <div className="group-name">{group.name}</div>
            </div>
            <div className="group-actions">
              <button onClick={() => fetchGroupMembers(group.id)} className="action-button">Members</button>
              <button onClick={() => selectGroup(group.id)} className="action-button">Select</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroupList;
