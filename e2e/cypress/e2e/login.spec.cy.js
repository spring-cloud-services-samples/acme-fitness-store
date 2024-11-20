describe('ACME Fitness E2E Test', () => {
    it('user can login and logout accordingly', () => {
        // Initial Login
        cy.visit('http://localhost:8090')
        cy.get('#login-button').click();
        cy.get('#username').type("user");
        cy.get('#password').type("password");
        cy.get('.btn').click();
        cy.wait(2000);
        // Log the user out
        cy.get('#logged-in-button').click();
        cy.get('.min-h-full > .w-full > .bg-white')
        cy.get('.bg-blueberry-50 > .text-white').click()
        // Verify the user is logged out
        cy.wait(2000);
        cy.get('#login-button').click();
        cy.get('.form-signin-heading').and('contain.text', 'Please sign in')
    })
});
