import 'cypress-file-upload';
describe('Create Customer', () => {
    beforeEach(() => cy.visit(`${Cypress.env("BASE_URL")}/customer/new`));

    it("Login to the system and check create cashier", () => {

        //Login and entering to the first page
        cy.get("#email").type(Cypress.env("USER_EMAIL"));
        cy.get("#password").type(Cypress.env("USER_PASSWORD"));
        cy.get(".bg-card > .flex.items-center > .inline-flex").click()
        cy.url().should('include', `${Cypress.env("BASE_URL")}/transaction/summary`);

        // visit cashier new page to create cashier
        cy.visit(`${Cypress.env("BASE_URL")}/customer/new`);
        // clicking the submit button without filling input fields
        cy.get('#button').click({ multiple: true });
        cy.get('.pt-0').contains(/Customer Name/);
        cy.get('.pt-0').contains(/Username is a required field/);
        cy.get('.pt-0').contains(/Phone number/);
        cy.get('.pt-0').contains(/required/);
        cy.get('.pt-0').contains(/NIC/);
        cy.get('.pt-0').contains(/required/);
        cy.get('.pt-0').contains(/NIC Images/);
        cy.get('.pt-0').contains(/NICImages is a required field/);
        cy.get('.pt-0').contains(/Address/);
        cy.get('.pt-0').contains(/Address is a required field/);

        ``
        cy.get('#customerName').type("Kumar");
        cy.get('.pt-0').contains(/Username must be at least 7 characters/);
        cy.get('#customerName').clear();

        cy.get('#customerName').type("Kumar Sanga");

        cy.get('#phoneNumber').type("07760");
        cy.get('.pt-0').contains(/Phone number is not valid/);
        cy.get('#phoneNumber').clear();

        cy.get('#phoneNumber').type("077606");
        cy.get('.pt-0').contains(/too short/);
        cy.get('#phoneNumber').clear();

        cy.get('#phoneNumber').type("07760696321");
        cy.get('.pt-0').contains(/too long/);
        cy.get('#phoneNumber').clear();

        cy.get('#phoneNumber').type("0763494956");

        cy.get('#nic').type("19993610245");
        cy.get('.pt-0').contains(/NIC is not valid/);
        cy.get('#nic').clear();

        cy.get('#nic').type("199936104x");
        cy.get('#nic').clear();

        cy.get('#nic').type("199936102454");
        cy.get('#nic').clear();

        cy.get('#nic').type("199936104v");

        cy.get('#address').type("beruwala");
        cy.get('.pt-0').contains(/Address must be at least 10 characters/);
        cy.get('#address').clear();

        cy.get('#address').type("Maradana Colombo");

        // Upload two images
        cy.fixture('lap.png').then(fileContent1 => {
            cy.fixture('logo.jpg').then(fileContent2 => {
                cy.get('#image input[type="file"]').attachFile([
                    { fileContent: fileContent1, fileName: 'lap.png', mimeType: 'image/png' },
                    { fileContent: fileContent2, fileName: 'logo.jpg', mimeType: 'image/jpeg' }
                ]);
            });
        });


        cy.get('#button').click({ multiple: true });
        cy.get('.flex-grow').should('contain', 'Customer Created Successfully');

    });
})