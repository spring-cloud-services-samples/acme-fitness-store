describe('ACME Fitness E2E Test', () => {

    beforeEach(() => {
        cy.visit('/')
        cy.get('#login-button').click();
        cy.get('#username').type("user");
        cy.get('#password').type("password");
        cy.get('.btn').click();
    });

    it('ask it standard FAQ questions', () => {
        cy.get('.fixed > .px-4').click();
        cy.get('.bg-primary > :nth-child(2) > :nth-child(2)').click();
        cy.get('form.p-4 > .flex > .w-full').type("How long will it take to get the bike delivered to me?");
        cy.get('form.p-4 > .flex > .text-sm').click();
        cy.wait(5000);
        cy.get('.justify-start > .rounded-lg').should('exist').and('contain.text', 'We offer two shipping options')
        cy.get('.justify-start > .rounded-lg').contains('Free standard shipping', {matchCase: false})
        cy.get('.justify-start > .rounded-lg').contains('Premium shipping', {matchCase: false})
    })

    it('Browses catalog adds bike to cart and completes checkout', () => {
        cy.get('.ml-10 > [href="/bikes"]').click()
        cy.get('[href="/product/117d82ca-d3d2-4742-9fc7-9879a7bd81fb"] > .rounded-lg').click({force: true})
        cy.get('[data-cy="add-button"]').click();
        cy.get('.ml-10 > [href="/bikes"]').click()
        cy.get('[href="/product/cdc8abf3-51cc-4d73-8bee-8ce876a550e5"]').click()
        cy.get('[data-cy=add-button]').click();
        cy.get('.fixed > .px-4').click();
        cy.get('form.p-4 > .flex > .w-full').type("Tell me more about this Product.");
        cy.get('form.p-4 > .flex > .text-sm').click();
        cy.wait(10000);
        cy.get(':nth-child(3) > .rounded-lg > .chat').should('exist').and('contain.text', 'E-Adrenaline 8.0 EX1')
        cy.get(':nth-child(3) > .rounded-lg > .chat > :nth-child(1)').and('have.attr', 'href', '/product/cdc8abf3-51cc-4d73-8bee-8ce876a550e5')
        cy.get('form.p-4 > .flex > .w-full').type("Whats my cart total?");
        cy.get('form.p-4 > .flex > .text-sm').click();
        cy.wait(10000)
        cy.get(':nth-child(5) > .rounded-lg > .chat').should('exist').and('contain.text', 'Your current cart total is $')
        cy.get('.bg-primary > :nth-child(2) > :nth-child(3)').click();
        cy.get('.gap-2 > a > .text-sm').filter(':visible').click();
        cy.get('[data-cy=checkout-button]').click();
        cy.get('#firstName').type("Michael");
        cy.get('#lastName').type("Smith");
        cy.get('#address').type("121 Kennet Dr")
        cy.get('#email').type("michael.smith@example.com");
        cy.get('#phone').type("555-123-4567");
        cy.get('#city').type("New York");
        cy.get('#zipCode').type("10001");
        cy.get('#cardName').type("Michael Smith");
        cy.get('#cardNumber').type("1234");
        cy.get('#cvv').type("225");
        cy.get('#expirationDate').type("08/26");
        cy.get('.space-y-8 > .rounded').click();
        cy.get('.MuiBox-root > .flex')
            .should('have.text', 'Order ConfirmationYour transaction was successfully processedBrowse more products');
    })

});
