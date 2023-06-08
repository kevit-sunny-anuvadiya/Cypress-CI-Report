/// <reference types = "Cypress" />

describe('Check Login functionality', () => {
    it('Should allow user to login if all fields are valid', () => {
        cy.visit('/sign-in');
        cy.get('[data-cy=email]')
            .should('be.visible')
            .should('not.be.disabled')
            .type(Cypress.env('loginEmail'));
        cy.get('[data-cy=password]')
            .should('be.visible')
            .should('not.be.disabled')
            .type(Cypress.env('loginPassword'));
        cy.log('Invalid Login retry with new login id');
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
    });
});
