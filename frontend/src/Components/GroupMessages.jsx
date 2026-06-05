import React, { useEffect, useRef } from 'react';
import './GroupMessages.css';

function GroupMessages({ groupMessages, newMessageContent, setNewMessageContent, sendMessage, newMemberEmail, setNewMemberEmail, addMemberToGroup }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newValue = 
        newMessageContent.substring(0, selectionStart) + 
        '\t' + 
        newMessageContent.substring(selectionEnd);
      
      setNewMessageContent(newValue);

      
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 1;
      }, 0);
    }
  };

  return (
    <div className="group-messages-container">
      <h3>Group Messages</h3>
      <div className="messages-list">
        <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
          {groupMessages.map((message, index) => (
            <li key={index} className="message-item">
              {message.content}
              <div className="message-sender">Sent by : {message.userName || 'Unknown'}</div>
            </li>
          ))}
          <div ref={messagesEndRef} />
        </ul>
      </div>
      <div className="message-input-container">
        <textarea
          value={newMessageContent}
          onChange={(e) => setNewMessageContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your message"
          className="message-input"
          rows="4"  
        />
        <button onClick={sendMessage} className="send-button">
          Send
        </button>
      </div>
      <div className="add-member-container">
        <input
          type="email"
          value={newMemberEmail}
          onChange={(e) => setNewMemberEmail(e.target.value)}
          placeholder="Member's email"
          className="add-member-input"
        />
        <button onClick={addMemberToGroup} className="add-member-button">
          Add Member
        </button>
      </div>
    </div>
  );
}

export default GroupMessages;
