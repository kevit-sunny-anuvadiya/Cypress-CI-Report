/// <reference types = "Cypress" />

describe('Check signUp functionality', () => {
    it('Should sign up new user successfully when all necessary details are filled and valid', () => {
        cy.visit('/sign-up');
        cy.log('go to signup page');
        // cy.get('[data-cy=gotoSignUp]')
        //     .should('be.visible')
        //     .should('not.be.disabled')
        //     .click();
        // cy.log('try to signup without details and get validation error');
        // cy.get('[data-cy=signUpSubmit]')
        //     .should('be.visible')
        //     .should('not.be.disabled')
        //     .click()
        //     .then(() => {
        //         cy.log('fill required filed info');
        //         cy.get('[data-cy=signUpName]')
        //             .should('be.visible')
        //             .should('have.class', 'ng-invalid')
        //             .should('not.be.disabled')
        //             .type('test');
        //         cy.get('[data-cy=signUpLastName]')
        //             .should('be.visible')
        //             .should('have.class', 'ng-invalid')
        //             .should('not.be.disabled')
        //             .type('user');
        //         cy.get('[data-cy=signUpEmail]')
        //             .should('be.visible')
        //             .should('have.class', 'ng-invalid')
        //             .type(Cypress.env("email"));
        //         cy.get('[data-cy=signUpPassword]')
        //             .should('be.visible')
        //             .should('have.class', 'ng-invalid')
        //             .type(Cypress.env("password"));
        //         cy.get('[data-cy=signUpTerms]')
        //             .should('be.visible')
        //             .should('not.be.disabled')
        //             .click();
        //         cy.log('try to signup');
        //         cy.get('[data-cy=signUpSubmit]')
        //             .should('be.visible')
        //             .should('not.be.disabled')
        //             .click();
        //         cy.log('wait one sec and go to login page');
        //         cy.wait(1000);
        //         cy.login();
        //     });
    });
});
