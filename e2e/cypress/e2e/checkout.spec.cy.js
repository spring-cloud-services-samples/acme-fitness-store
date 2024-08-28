describe('ACME Fitness E2E Test', () => {

  beforeEach(() => {
    cy.visit('http://localhost:8090')
    cy.get('.d-none > .btn-outline-secondary').click();
    cy.get('#login').click();
    cy.get('#username').type("user");
    cy.get('#password').type("password");
    cy.get('.btn').click();

  });

  it('Browses Catalog and adds bike to cart', () => {
    cy.get("#navbar > .container").within(() => {
      cy.get("#catalog").click();
    });
    
    cy.get('.product div').should('be.visible').first().click();
    cy.get('#addToCart').click();
  });

  it('Checks out cart items and completes payment', () => {
    cy.get('#cart-button').click();
    cy.get('.pull-right > .btn').click();

    cy.get('#firstname').type("Michael");
    cy.get('#lastname').type("Smith");
    cy.get('#company').type("Acme Corp");
    cy.get('#email').type("michael.smith@example.com");
    cy.get('#phone').type("555-123-4567");
    cy.get('#city').type("New York");
    cy.get('#zip').type("10001");
    cy.get('#state').select("Alabama");
    cy.get('#country').select("USA");
    cy.get('.pull-right > .btn').click();
    cy.get('.pull-right > .btn').click();

    cy.get('#cardnum').type("1234");
    cy.get('#expmonth').select("01");
    cy.get('#expyear').select("2025");
    cy.get('#ccv').type("225");
    cy.get('.pull-right > .btn').click();
    cy.get('.pull-right > .btn').click();

    cy.get('h1').contains('Order Info').should('be.visible');
    cy.get('#orderMessage').contains('Your transaction was successfully processed').should('be.visible');
  });

});