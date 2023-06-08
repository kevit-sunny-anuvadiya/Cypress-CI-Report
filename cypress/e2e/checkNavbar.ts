/// <reference types = "Cypress" />

describe('Check Navbar', () => {
    before(function () {
        cy.visit('/sign-in');
        cy.login();
        cy.wait(6000);
    });

    it('Should navigate to accounting,request and profile tab', () => {
        cy.visit('/accounting');
        cy.get('.ACCOUNTING').should('be.visible').click();
        cy.visit('/request');
        cy.wait(1000).then(() => {
            cy.get('.REQUESTS')
                .should('be.visible')
                .click()
                .then(() => {
                    cy.get('.COMPLETED').click();
                    cy.wait(500);
                    cy.get('.SENT').click();
                });
        });
    });
});
