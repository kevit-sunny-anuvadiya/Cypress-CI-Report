describe('Check Navbar', () => {
    before(function () {
        cy.visit('/sign-in');
        cy.login();
        cy.wait(6000);
    });

    it('Should navigate to profile', () => {
        cy.visit('/profile');
        cy.get('#PROFILE_INFORMATION')
            .should('be.visible')
            .click()
            .then(() => {
                cy.get('[data-cy=profileFirstName]')
                    .should('be.visible')
                    .clear()
                    .type('Kartik');
                cy.get('[data-cy=profileLastName]')
                    .should('be.visible')
                    .clear()
                    .type('Tilavat');
                cy.get('[data-cy=profileEmail]')
                    .should('be.visible')
                    .clear()
                    .type(Cypress.env('loginEmail'));
                cy.get('[data-cy=profileLanguage]')
                    .should('be.visible')
                    .click()
                    .then(() => {
                        cy.get('[data-cy=profileLanguage2]')
                            .click()
                            .then(() => {
                                cy.get('[data-cy=profileSave]')
                                    .should('be.visible')
                                    .click();
                                cy.log('update Profile Completed');
                            });
                    });
            });
        cy.wait(1000);
        cy.get('#SECURITY')
            .should('be.visible')
            .click()
            .then(() => {
                cy.log('change password for profile');
                cy.get('[data-cy=profileCurrentPassword]')
                    .clear()
                    .type('123')
                    .then(() => {
                        cy.log(
                            'Minimum 8 characters, Must include numbers, letters and special characters.'
                        );
                        cy.get('[data-cy=profileCurrentPassword]')
                            .clear()
                            .type(Cypress.env('loginPassword'));
                        cy.get('[data-cy=profileNewPassword]')
                            .clear()
                            .type(Cypress.env('loginPassword'));
                        cy.get('[data-cy=profileNewPasswordReEnter]')
                            .clear()
                            .type(Cypress.env('loginPassword'));
                        cy.get('[data-cy=profilePasswordSaveButton]').click();
                    });
            });
        cy.wait(1000);
        cy.get('#DELETE_PROFILE')
            .should('be.visible')
            .click()
            .then(() => {
                cy.get('.delete-profile-button').should('be.visible').click();
            });
    });
});
