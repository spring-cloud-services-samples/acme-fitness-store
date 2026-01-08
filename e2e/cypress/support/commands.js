// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (username = 'user', password = 'password') => {
    cy.visit('/')
    cy.get('#login-button').click();
    const authUrl = Cypress.env('authUrl');
    cy.origin(authUrl, { args: { username, password } }, ({ username, password }) => {
        cy.get('#username').type(username);
        cy.get('#password').type(password);
        cy.get('.button.login').click();
    });
})
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })