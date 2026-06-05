describe('The cypress tests', () => {
    beforeEach(() => {
      
        cy.exec('cd backend && npm run updatedb')


        cy.request('POST', 'http://localhost:3000/login', { email: 'fahdamine@gmail.com', password: '123' })
        .its('body')
        .as('currentUser')
        

    })
  
    it('successfully loads', () => {

        const backend = 'http://localhost:3000/';
        const token = "eyJhbGciOiJIUzI1NiJ9.ZmFoZGFtaW5lQGdtYWlsLmNvbQ.3GWSLlAkSYuKZKNwkSg5att2oR61XGbSg7dHAq57kGA";

        cy.viewport(1860, 919)
        
        cy.visit('http://localhost:5173/')

        cy.contains('Enter here to Login').click()

        cy.contains('Email').type('fahdamine@gmail.com')

        cy.contains('MDP').type('123')

        cy.contains('OK').click()

        cy.contains('Test')

        cy.get('button').filter(':contains("Select")').eq(4).click(); 

        cy.get('button').filter(':contains("Members")').eq(4).click(); 



        cy.request({
            method: 'GET',
            url: `${backend}api/users`,
            headers: {
              'x-access-token': token,
              'Content-Type': 'application/json',
            },
          });

        cy.get('button').filter(':contains("Select")').eq(4).click(); 
        
        cy.get('.message-input-container').type('Hello from cypress')

        cy.contains('Send').click()

    })
  })