const app = require('../app')
const request = require('supertest')

////////////////////////////////// USERS TEST //////////////////////////////////////////////

test('Test if user can log in and list users', async () => {
  let response = await request(app)
    .post('/login')
    .send({ email: 'Sebastien.Viardot@grenoble-inp.fr', password: '123456' })
  expect(response.statusCode).toBe(200)
  expect(response.body).toHaveProperty('token')
  response = await request(app)
    .get('/api/users')
    .set('x-access-token', response.body.token)
  expect(response.statusCode).toBe(200)
  expect(response.body.message).toBe('Returning users')
  expect(response.body.data.length).toBeGreaterThan(0)
})


test('New user can sign up', async () => {
  const newUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'StrongPassword123!'
  };

  const response = await request(app)
    .post('/api/users')
    .send(newUser);
  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty('token');
});


test('User cannot sign up with an existing email', async () => {
  const existingUser = {
    name: 'John Doe',
    email: 'john.doe@example.com', 
    password: 'StrongPassword123!'
  };

  const response = await request(app)
    .post('/api/users')
    .send(existingUser);
  expect(response.statusCode).toBe(409); 
});


test('User cannot log in with incorrect information', async () => {
  const wrongCredentials = {
    email: 'john.doe@example.com',
    password: 'WrongPassword'
  };

  const response = await request(app)
    .post('/login')
    .send(wrongCredentials);
  expect(response.statusCode).toBe(403); 
});




test('User can update their password', async () => {
  const loginResponse = await request(app)
    .post('/login')
    .send({ email: 'Sebastien.Viardot@grenoble-inp.fr', password: '123456' });

  expect(loginResponse.statusCode).toBe(200);
  const token = loginResponse.body.token;

  const newPassword = 'NewStrongPassword123!';
  const updateResponse = await request(app)
    .post('/api/users/updatePassword')
    .set('x-access-token', token)
    .send({ password: newPassword });

  expect(updateResponse.statusCode).toBe(200);
  expect(updateResponse.body.message).toEqual('Password updated');
});



////////////////////////////////// GROUPS TEST //////////////////////////////////////////////


test('User can create a new group', async () => {
  // Login and get token as setup
  const userCredentials = { email: 'fahdamine@gmail.com', password: '123' };
  let loginResponse = await request(app).post('/login').send(userCredentials);
  const token = loginResponse.body.token;

  // Create group
  const groupName = 'Test Group';
  let createGroupResponse = await request(app)
    .post('/api/groups')
    .set('x-access-token', token)
    .send({ name: groupName });
  
  expect(createGroupResponse.statusCode).toBe(200);
  expect(createGroupResponse.body.message).toEqual('Group created successfully');
});




test('User can add a member to the group', async () => {
  const loginResponse = await request(app)
    .post('/login')
    .send({ email: 'fahdamine@gmail.com', password: '123' });
  
  expect(loginResponse.statusCode).toBe(200);
  expect(loginResponse.body).toHaveProperty('token');
  
  const token = loginResponse.body.token; 

  const groupId = 1;
  const memberEmail = 'john.doe@example.com';

  let addMemberResponse = await request(app)
    .post(`/api/groups/${groupId}/addMember`)
    .set('x-access-token', token) 
    .send({ email: memberEmail });
  
  expect(addMemberResponse.statusCode).toBe(200);
  expect(addMemberResponse.body.message).toEqual('User added to the group successfully');
});


test('User can add a member to the group', async () => {
  const loginResponse = await request(app)
    .post('/login')
    .send({ email: 'fahdamine@gmail.com', password: '123' });
  
  expect(loginResponse.statusCode).toBe(200);
  expect(loginResponse.body).toHaveProperty('token');
  
  const token = loginResponse.body.token; 

  const groupId = 1;
  const memberEmail = 'Sebastien.Viardot@grenoble-inp.fr';

  let addMemberResponse = await request(app)
    .post(`/api/groups/${groupId}/addMember`)
    .set('x-access-token', token) 
    .send({ email: memberEmail });
  
  expect(addMemberResponse.statusCode).toBe(200);
  expect(addMemberResponse.body.message).toEqual('User added to the group successfully');
});



test('User can delete a member from the group', async () => {
  const loginResponse = await request(app)
    .post('/login')
    .send({ email: 'fahdamine@gmail.com', password: '123' });

  expect(loginResponse.statusCode).toBe(200);
  expect(loginResponse.body).toHaveProperty('token');

  const token = loginResponse.body.token; 
  const groupId = 1; 
  const userIdToDelete = 3; 

  let deleteMemberResponse = await request(app)
    .delete(`/api/groups/${groupId}/${userIdToDelete}`)
    .set('x-access-token', token); 

  expect(deleteMemberResponse.statusCode).toBe(200);
  expect(deleteMemberResponse.body.message).toEqual('User successfully deleted from the group');
});


test('User can list members of a group', async () => {
  const loginResponse = await request(app)
    .post('/login')
    .send({ email: 'fahdamine@gmail.com', password: '123' });
  
  expect(loginResponse.statusCode).toBe(200);
  expect(loginResponse.body).toHaveProperty('token');
  
  const token = loginResponse.body.token;
  const groupId = 1; 
  
  const membersResponse = await request(app)
    .get(`/api/groups/${groupId}`)
    .set('x-access-token', token);
  
  expect(membersResponse.statusCode).toBe(200);
  expect(membersResponse.body.message).toEqual('Returning group members');
  expect(Array.isArray(membersResponse.body.data)).toBe(true);
});

////////////////////////////////// MESSAGES TEST //////////////////////////////////////////////

test('User can list messages of a group', async () => {
  const loginResponse = await request(app)
    .post('/login')
    .send({ email: 'fahdamine@gmail.com', password: '123' });
  
  expect(loginResponse.statusCode).toBe(200);
  expect(loginResponse.body).toHaveProperty('token');
  
  const token = loginResponse.body.token;
  const groupId = 1; 
  
  const messagesResponse = await request(app)
    .get(`/api/messages/${groupId}`)
    .set('x-access-token', token);
  
  expect(messagesResponse.statusCode).toBe(200);
  expect(Array.isArray(messagesResponse.body.data)).toBe(true);
  expect(Array.isArray(messagesResponse.body.data)).toBe(true);
});

test('User can send a message to a group', async () => {
  const loginResponse = await request(app)
    .post('/login')
    .send({ email: 'fahdamine@gmail.com', password: '123' });
  
  expect(loginResponse.statusCode).toBe(200);
  expect(loginResponse.body).toHaveProperty('token');
  
  const token = loginResponse.body.token;
  const groupId = 1;
  const messageContent = 'Test message';

  const sendMessageResponse = await request(app)
    .post(`/api/messages/${groupId}`)
    .set('x-access-token', token)
    .send({ content: messageContent, uid: 1 }); // Assuming the user id is 1

  expect(sendMessageResponse.statusCode).toBe(200);
  expect(sendMessageResponse.body.status).toBe(true);
  expect(sendMessageResponse.body.message).toEqual('Message sent');
});
