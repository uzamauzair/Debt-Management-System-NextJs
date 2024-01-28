describe('Login Functionality', () => {
    beforeEach(() => cy.visit(`${Cypress.env("BASE_URL")}/auth`));
    it("Access to the website with valid credentials", () => {
        // visit the Login page
        cy.visit(`${Cypress.env("BASE_URL")}/auth`);
        // fill the login form
        cy.get("#email").type("user@gmail.com");
        cy.get("#password").type("passoword");
        // Click the registration button
        cy.get(".flex.items-center > .inline-flex").click();
    });
    it("Should display appropriate error messages with invalid login credentials", () => {
        cy.visit(`${Cypress.env("BASE_URL")}/auth`);
        // click without filling any input field
        cy.get(".bg-card > .flex.items-center > .inline-flex").click();
        cy.get(".pb-2").contains(/Email is required/);
        cy.get(".pb-2").contains(/Password is required/);
        cy.get("#email").type("user@example.com");
        cy.get(".bg-card > .flex.items-center > .inline-flex").click();
        cy.get(".pb-2").contains(/Password is required/);
        cy.get("#password").type("password");
        cy.get(".pb-2").contains(/Password must be at least 10 characters long/);
        cy.get("#password").type("pasweords123");
        cy.get(".pb-2").contains(/Password must have at least one uppercase character/);
        cy.get("#password").type("P");
        cy.get(".pb-2").should('contains', /Password must have at least one lowercase character/);
        cy.get("#password").type("p");
        cy.get(".pb-2").should('contains', /Password must have at least one number/);
        cy.get("#password").type("1");
        cy.get(".pb-2").should('contains', /Password must have at least one special character/);
    });
    it("Can login as a user", () => {
        cy.get("#email").type(Cypress.env("USER_EMAIL"));
        cy.get("#password").type(Cypress.env("USER_PASSWORD"));
        cy.get(".bg-card > .flex.items-center > .inline-flex").click()
        cy.url().should('include', `${Cypress.env("BASE_URL")}/transaction/summary`);
    });
})