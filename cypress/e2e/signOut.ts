/// <reference types = "Cypress" />

describe('Check signOut funtionality', () => {
    it('Should sign out user and redirect to login page',()=>{
        cy.visit('/sign-in');
        cy.login();
        cy.log('open profile menu for logout');
        cy.get('[data-cy=userIcon]')
            .should('be.visible')
            .should('not.be.disabled')
            .click()
            .then(() => {
                cy.get('[data-cy=signOut]')
                    .should('be.visible')
                    .should('not.be.disabled')
                    .click();
                cy.url().should('include','sign-out');
                cy.log('wait 6 sec for redirect to login');
                cy.wait(6000);
            });
    });
});
