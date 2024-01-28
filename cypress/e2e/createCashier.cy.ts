describe('Create Cashier', () => {
    beforeEach(() => cy.visit(`${Cypress.env("BASE_URL")}/cashier/new`));

    it("Login to the system and check create cashier", () => {

        //Login and entering to the first page
        cy.get("#email").type(Cypress.env("USER_EMAIL"));
        cy.get("#password").type(Cypress.env("USER_PASSWORD"));
        cy.get(".bg-card > .flex.items-center > .inline-flex").click()
        cy.url().should('include', `${Cypress.env("BASE_URL")}/transaction/summary`);

        // visit cashier new page to create cashier
        cy.visit(`${Cypress.env("BASE_URL")}/cashier/new`);
        // clicking the submit button without filling input fields
        cy.get('#button').click({ multiple: true });
        cy.get('.pt-0').contains(/Email is required/);
        cy.get('.pt-0').contains(/Username is a required field/);

        cy.get('#email').type("user26@example.com");
        cy.get('#button').click({ multiple: true });
        cy.get('.pt-0').contains(/Username is a required field/);

        cy.get('#username').type("usernameusama");
        cy.get('#button').click({ multiple: true });
        cy.get('.flex-grow').contains(/Cashier created successfully/)

        cy.get('#email').clear();
        cy.get('#username').clear();

        // need to change the email while testing because already one
        cy.get('#email').type("user26@example.com");
        cy.get('#username').type("usernameusama");
        cy.get('#button').click({ multiple: true });
        cy.get('.flex-grow').contains(/Error occured while creating cashier/)

    });
})