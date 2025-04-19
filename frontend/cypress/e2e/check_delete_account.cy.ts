const usernames='bhijiths'
const passwords='bhijiths'
const email='bhijiths@gmail.com'
describe("Delete Account", () => {

    it("should create account and delete it", () => {
        cy.visit("localhost:3000/signup");
        cy.get('input[type="text"]').should('be.visible').click().type(usernames);
        cy.get('input[type="email"]').should('be.visible').click().type(email);
        cy.get('input[type="password"]').should('be.visible').click().type(passwords);
        cy.wait(1000);
        cy.get('button').should('be.visible').click();
        cy.wait(1000);
        cy.visit("localhost:3000/login");
        cy.login(usernames, passwords);
        cy.wait(1000);
        cy.visit("localhost:3000/profile");
        cy.contains("Delete Account").should("be.visible").click();
        cy.contains("Delete My Account").should("be.visible").click();
        cy.get('input[type="text"]').should('be.visible').click().type('DELETE');
        cy.contains("Delete My Account").should("be.visible").click();
        cy.wait(1000);
        cy.visit("localhost:3000/login");
        cy.login(usernames, passwords);
        cy.contains("Invalid credentials").should("exist");
    });
  });