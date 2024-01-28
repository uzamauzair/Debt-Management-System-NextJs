describe('Create Cashier', () => {
    beforeEach(() => cy.visit(`${Cypress.env("BASE_URL")}/transaction/new`));

    it("Login to the system and check create transaction", () => {

        //Login and entering to the first page
        cy.get("#email").type(Cypress.env("USER_EMAIL"));
        cy.get("#password").type(Cypress.env("USER_PASSWORD"));
        cy.get(".bg-card > .flex.items-center > .inline-flex").click()
        cy.url().should('include', `${Cypress.env("BASE_URL")}/transaction/summary`);

        // visit cashier new page to create cashier
        cy.visit(`${Cypress.env("BASE_URL")}/transaction/new`);
        // clicking the submit button without filling input fields
        cy.get('#button').click({ multiple: true });
        cy.get('.pt-0').contains(/Customer/);
        cy.get('.pt-0').contains(/Customer is a required field/);
        cy.get('.pt-0').contains(/Type/);
        cy.get('.pt-0').contains(/Transaction type is required/);
        cy.get('.pt-0').contains(/Description/);
        cy.get('.pt-0').contains(/Description is a required field/);
        cy.get('.pt-0').contains(/Amount/);
        cy.get('.pt-0').contains(/Amount is required/);

        ``
        // cy.get('#customerName').select("M.R Akram");
        cy.get('.space-y-4 > :nth-child(1) > .flex').click({ force: true });
        cy.contains('M.R Akram').click({ force: true });

        cy.get('.space-y-4 > :nth-child(2) > .flex').click();
        cy.contains("Debt").click({ force: true });

        // cy.get('#description').type("Bill43");
        // cy.get('.pt-0').contains(/Description must be at least 10 characters/);
        // cy.get('#description').type(" with Bill 42 balance");

        // cy.get('#amount').type("5000");

        // cy.get('#button').click({ multiple: true });
        // cy.get('.flex-grow').contains(/Transaction Created Successfully/)

    });
})