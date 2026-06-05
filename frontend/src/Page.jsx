import React, { useState, useEffect } from 'react';
import backgroundImage from '../logos/background2.png';
import M from 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';

import UserList from './Components/UserList.jsx';
import GroupList from './Components/GroupList.jsx';
import GroupMembers from './Components/GroupMembers.jsx';
import GroupMessages from './Components/GroupMessages.jsx';
import Options from './Components/Options.jsx';

const backend = "http://localhost:3000/";
const token = "eyJhbGciOiJIUzI1NiJ9.ZmFoZGFtaW5lQGdtYWlsLmNvbQ.3GWSLlAkSYuKZKNwkSg5att2oR61XGbSg7dHAq57kGA";


function Page({ userEmail, onLogout }) {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const [groupMembers, setGroupMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [groupMessages, setGroupMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState('');


  

  useEffect(() => {
    fetchUsers();
    fetchGroups();
    M.AutoInit();
  }, []);



  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${backend}api/users`, {
          method: 'GET',
          headers: { 'x-access-token': token, 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data.data);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers(); // Initial fetch
    const intervalId = setInterval(fetchUsers, 1000); 

    return () => {
      clearInterval(intervalId); 
    };
  }, [token, backend]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`${backend}api/groups`, {
          method: 'GET',
          headers: { 'x-access-token': token, 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          setGroups(data.data);
        } else {
          console.error('Failed to fetch groups');
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups(); // Initial fetch
    const intervalId = setInterval(fetchGroups, 1000); // Fetch every 1 second

    return () => {
      clearInterval(intervalId); // Clear interval on component unmount
    };
  }, [token, backend]);

  useEffect(() => {
    let intervalId;

    if (selectedGroupId) {
      const fetchGroupMessages = async (groupId) => {
        try {
          const response = await fetch(`${backend}api/messages/${groupId}`, {
            method: 'GET',
            headers: {
              'x-access-token': token,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            const uniqueMessages = data.data.filter(message => !groupMessages.some(existingMessage => existingMessage.id === message.id));
            const messagesWithEmail = uniqueMessages.map(message => {
              return {
                ...message,
                email: userEmail 
              };
            });

            setGroupMessages(prevMessages => [...prevMessages, ...messagesWithEmail]);
          } else {
            console.error('Failed to fetch group messages');
          }
        } catch (error) {
          console.error('Error fetching group messages:', error);
        }
      };

      
      intervalId = setInterval(() => {
        fetchGroupMessages(selectedGroupId);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedGroupId, token, backend, userEmail, groupMessages, setGroupMessages]);

  
//Bloc User 
//****************************************************** */
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${backend}api/users`, {
        method: 'GET',
        headers: { 'x-access-token': token, 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const deleteUser = async (userId) => {
    try{
      //Je vérifie que l'utilisateur est un administrateur d'abord 

      const isAdminResponse = await fetch(`${backend}api/users/`, {
        method: 'GET',
        headers : {
          'x-access-token': token,
          'Content-Type': 'application/json'
        }

      });

      //Message de vérif admin
      if(!isAdminResponse.ok){
        throw new Error('Admin Check failed');
      }

      const isAdminData = await isAdminResponse.json();
      console.log('isAdminData:', isAdminData); // Cette ligne pour visualiser sur la console les données reçues

      const currentUser = isAdminData.data.find(user=> user.email === userEmail);
      //Dans le cas où l'utilisateur n'est pas Admin 
      if(!currentUser || !currentUser.isAdmin){
        alert('Make sure you have the admin rights');
        return;
      }

      if(!confirm('Are you sure you want to delete this user?')){
        return;
      }


    
  
      const response = await fetch(`${backend}api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - Details: ${errorDetail}`);
      }

      setUsers(users => users.filter(user => user.id !== userId));
      alert('User deleted successfully.');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`An error occurred while deleting the user: ${error.message}`);
    }
  };

  const updatePassword = async () => {
    if (!newPassword) {
      alert('Please enter a new password.');
      return;
    }

    try {
      const response = await fetch(`${backend}api/users/updatePassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error updating password.');

      setUpdateMessage('Password updated successfully.');
      setNewPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setUpdateMessage(error.message);
    }
  };

//Fin bloc User
//******************************************************** */



//Bloc Group 
//******************************************************** */
  
  const createGroup = async () => {
    if (!newGroupName.trim()) {
      alert('Please enter a group name.');
      return;
    }

    try {
      const response = await fetch(`${backend}api/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify({ name: newGroupName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create group.');

      setNewGroupName('');
      fetchGroups();  // Refresh the group list
      alert('Group created successfully.');
    } catch (error) {
      console.error('Error creating group:', error);
      alert(error.message);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${backend}api/groups`, {
        method: 'GET',
        headers: { 'x-access-token': token, 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data.data);
      } else {
        console.error('Failed to fetch groups');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    console.log(`Fetching members for group: ${groupId}`);
    try {
      const response = await fetch(`${backend}api/groups/${groupId}`, {
        method: 'GET',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json',
        },
      });
      const memberResponse = await fetch(`${backend}api/groups/${groupId}`,{
        method: 'GET',
        headers: { 
          'x-access-token': token,
          'Content-Type': 'application/json' },
      })
      if(!memberResponse.ok){
        throw new Error('Getting group users failed');
      }
      const memberResponseData = await memberResponse.json();
      console.log('les users du groupe',memberResponseData);
      const memberCondition = memberResponseData.data.find(user => user.email === userEmail);
      console.log('user connecté:', memberCondition);
      if(!memberCondition) {
        alert('You are not a member of this group');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Group members fetched:', data.data);
        setGroupMembers(data.data);
      } else {
        console.error('Failed to fetch group members');
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  const addMemberToGroup = async () => {
    console.log("Sending groupId:", selectedGroupId, "and email:", newMemberEmail);

    if (!newMemberEmail.trim() || !selectedGroupId) {
      alert('Please provide a member email and select a group.');
      return;
    }

    console.log(`Adding ${newMemberEmail} to group ${selectedGroupId}`);

    try {
      const response = await fetch(`${backend}api/groups/${selectedGroupId}/addMember`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify({ email: newMemberEmail }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add member.');

      console.log('Member added successfully:', data);
      setNewMemberEmail('');
      fetchGroupMembers(selectedGroupId);
    } catch (error) {
      console.error('Error adding member:', error);
      alert(error.message);
    }
  };

const selectGroup = async (groupId) => {

  const memberResponse = await fetch(`${backend}api/groups/${groupId}`,{
    method: 'GET',
    headers: { 
      'x-access-token': token,
      'Content-Type': 'application/json' },
  })
  if(!memberResponse.ok){
    throw new Error('Getting group users failed');
  }
  const memberResponseData = await memberResponse.json();
  console.log('les users du groupe',memberResponseData);
  const memberCondition = memberResponseData.data.find(user => user.email === userEmail);
  console.log('user connecté:', memberCondition);
  if(!memberCondition) {
    alert('You are not a member of this group');
    return;
  }
  setSelectedGroupId(groupId);
  setGroupMessages([]); 
  fetchGroupMessages(groupId);
}

const deleteGroupMember = async (groupId, userId) => {
  try{
    
    //ce bloc va me permettre de recevoir le groupe en question
    const CurrentGroupResponse = await fetch(`${backend}api/groups/`,{
      method: 'GET',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json'
      }
    });
    if(!CurrentGroupResponse.ok){
      throw new Error('Group verification failed');
    }

    const CurrentGroupData = await CurrentGroupResponse.json();
    console.log('OwnerData:', CurrentGroupData);

    const group = CurrentGroupData.data;
    const currentGroup = group.find(group => group.id === groupId);
    console.log('Current Group:', currentGroup);
    

    //Cette partie va me permettre de reconnaître l'id de user connecté 
    const OwnerResponse = await fetch(`${backend}api/groups/${groupId}`,{
      method: 'GET',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json'
      }
    });
    if(!OwnerResponse.ok){
      throw new Error('Owner verification failed');
    }

    
    const OwnerResponseData = await OwnerResponse.json();
    
    const currentUserEmail = userEmail;
    const currentGroupUser = OwnerResponseData.data.find(user=> user.email === currentUserEmail);
    console.log('CurrentGroupUser:', currentGroupUser);

    


    
    //Dans le cas où l'utilisateur n'est pas owner du groupe
    if(!currentGroup|| !currentGroupUser || currentGroup.ownerId !== currentGroupUser.id){
      alert('Make sure you are the Owner of the group in order to delete this user');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this user from the group?')) {
      return;
    }



    const response = await fetch(`${backend}api/groups/${groupId}/${userId}`, {
      method: 'DELETE',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: userId }) // Inclure userId dans le corps de la requête
    });

    if (!response.ok) {
      const errorDetail = await response.json();
      throw new Error(`HTTP error! status: ${response.status} - Details: ${errorDetail}`);
    }

    fetchGroupMembers(selectedGroupId);
    alert('User successfully deleted from the group.');
  } catch (error) {
    console.error('Error deleting user from group:', error);
    alert(`An error occurred while deleting the user from the group: ${error.message}`);
  }
  

};
// Fin du bloc Group



//Début bloc message
//*********************************************************************************** */
const fetchGroupMessages = async (groupId) => {
  try {
    const response = await fetch(`${backend}api/messages/${groupId}`, {
      method: 'GET',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      //console.log('Group messages fetched:', data.data);
      const uniqueMessages = data.data.filter(message => !groupMessages.some(existingMessage => existingMessage.id === message.id));
      const messagesWithEmail = uniqueMessages.map(message => {
        return {
          ...message,
          email: userEmail 
        };
      });

      setGroupMessages(prevMessages => [...prevMessages, ...messagesWithEmail]);
    } else {
      console.error('Failed to fetch group messages');
    }
  } catch (error) {
    console.error('Error fetching group messages:', error);
  }
};

const sendMessage = async () => {
  try {
    // recevoir les users du groupe
    const actual_group_response = await fetch(`${backend}api/groups/${selectedGroupId}`,{
      method : 'GET',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
      },
    });
    if (!actual_group_response) {
      throw new Error('Getting group\'s user failed');
    }
    const actual_group_data = await actual_group_response.json();
    console.log('les users du groupes',actual_group_data);

    const connected_user = actual_group_data.data.find(user => user.email === userEmail);
    console.log('user connecté:', connected_user);

    if(!connected_user){
      alert('You are not a member of the group');
      return;
    }

    const response = await fetch(`${backend}api/messages/${selectedGroupId}`, {
      method: 'POST',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newMessageContent, uid: connected_user.id }),
    });

    if (response.ok) {
      setNewMessageContent('');
      await fetchGroupMessages(selectedGroupId); 
      //alert('Message sent successfully.');
    } else {
      console.error('Failed to send message');
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

//Fin bloc message
//******************************************************* */

//Bloc de fonctions utilitaires
const getUserNameByEmail = (email) => {
  if (users && users.length > 0) {
    const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    // Si l'utilisateur est trouvé, renvoyer son nom, sinon renvoyer 'Unknown'
    return user ? user.name : 'Unknown';
  } else {
    return 'Unknown';
  }
};



return (
  <div style={{
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundAttachment : 'fixed',  
    backgroundPosition: 'center',
    width: '100vw',
    height: '100vh',
    overflow : 'auto',
  }}>
  
  <Options 
    userEmail={userEmail}
    updatePassword={updatePassword}
    onLogout={onLogout}
  />

  {updateMessage && (
    <div style={{
      position: 'absolute', 
      top: '120px', 
      right: '10px', 
      padding: '10px', 
      backgroundColor: '#fff8c4', 
      borderRadius: '5px', 
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      maxWidth: '300px',
      textAlign: 'center'
    }}>
      {updateMessage}
    </div>
  )}
  


  <UserList users={users} onDeleteUser={deleteUser} />
  <GroupList 
    groups={groups}
    newGroupName={newGroupName}
    setNewGroupName={setNewGroupName}
    createGroup={createGroup}
    fetchGroupMembers={fetchGroupMembers}
    selectGroup={selectGroup}
  />

  {selectedGroupId && (
    <>
      <GroupMembers 
        groupMembers={groupMembers} 
        selectedGroupId={selectedGroupId}
        deleteGroupMember={deleteGroupMember}
      />
      <GroupMessages 
        groupMessages={groupMessages}
        newMessageContent={newMessageContent}
        setNewMessageContent={setNewMessageContent}
        sendMessage={sendMessage}
        newMemberEmail={newMemberEmail}
        setNewMemberEmail={setNewMemberEmail}
        addMemberToGroup={addMemberToGroup}
      />
    </>
  )}
  </div>
);
}

export default Page;