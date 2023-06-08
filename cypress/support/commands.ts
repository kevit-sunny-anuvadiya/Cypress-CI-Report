Cypress.Commands.add('login', () => {
    cy.get('[data-cy=email]')
        .should('be.visible')
        .should('not.be.disabled')
        .clear()
        .type(Cypress.env('loginEmail'));
    cy.get('[data-cy=password]')
        .should('be.visible')
        .should('not.be.disabled')
        .clear()
        .type(Cypress.env('loginPassword'));
    cy.get('[data-cy=rememberMe]')
        .should('be.visible')
        .should('not.be.disabled')
        .click();
    cy.get('[data-cy=loginButton]')
        .should('be.visible')
        .should('not.be.disabled')
        .click()
        .then(() => {
            cy.wait(3500);
            cy.task('generateOTP', Cypress.env('loginKey')).then(
                (token: string) => {
                    cy.get('[data-cy=authenticationID]')
                        .should('be.visible')
                        .should('not.be.disabled')
                        .type(token);
                    cy.get('[data-cy=accountVerify]')
                        .should('be.visible')
                        .should('not.be.disabled')
                        .click();
                }
            );
        });
    cy.log('login successfully redirect to home page');
});
