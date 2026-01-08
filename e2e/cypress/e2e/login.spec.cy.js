describe('ACME Fitness E2E Test', () => {
    it('user can login and logout accordingly', () => {
        // Initial Login
        cy.login();
        cy.wait(2000);
        // Log the user out
        cy.get('#logged-in-button').click();
        cy.get('.min-h-full > .w-full > .bg-white')
        cy.get('.bg-blueberry-50 > .text-white').click()
        // Verify the user is logged out
        cy.wait(2000);
        cy.get('#login-button').click();
        const authUrl = Cypress.env('authUrl');
        cy.origin(authUrl, () => {
            cy.get('.button.login').should('exist')
        })
    })
});
