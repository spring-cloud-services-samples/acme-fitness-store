describe('ACME Fitness cart interactions', () => {
    // A known bike product id, reused from the checkout spec.
    const bikeProduct = '/product/117d82ca-d3d2-4742-9fc7-9879a7bd81fb';

    it('prompts a logged-out user to sign in instead of adding to the cart', () => {
        cy.visit(bikeProduct);

        cy.get('[data-cy=add-button]').click();

        // The logged-out add is blocked with a sign-in prompt -- no request is made,
        // no success message, and no cart badge appears.
        cy.get('[data-cy=add-login-required]').should('be.visible');
        cy.get('[data-cy=add-success]').should('not.exist');
        cy.get('[data-cy=cart-badge]').should('not.exist');
    });

    it('gives visual feedback and updates the cart badge for an authenticated add', () => {
        cy.login();
        cy.visit(bikeProduct);

        cy.intercept('POST', '/cart/item/add/*').as('addToCart');
        cy.get('[data-cy=add-button]').click();
        cy.wait('@addToCart').its('response.statusCode').should('be.oneOf', [200, 201]);

        // Inline confirmation on the product page...
        cy.get('[data-cy=add-success]').should('be.visible').and('contain.text', 'Added');

        // ...and the nav cart badge now shows a positive item count.
        cy.get('[data-cy=cart-badge]')
            .should('be.visible')
            .invoke('text')
            .then((text) => {
                expect(Number(text)).to.be.greaterThan(0);
            });
    });
});
