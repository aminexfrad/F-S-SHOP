const usernames_1='bhijiths'
const password_1='bhijiths'
const email_1='bhijiths@gmail.com'
describe("Check Signup", () => {
    after(() => {
      cy.logout();
    });
    it("should create account and delete it", () => {
        cy.visit("localhost:3000/signup");
        cy.get('input[type="text"]').should('be.visible').click().type(usernames_1);
        cy.get('input[type="email"]').should('be.visible').click().type(email_1);
        cy.get('input[type="password"]').should('be.visible').click().type(password_1);
        cy.wait(1000);
        cy.get('button').should('be.visible').click();
        cy.wait(1000);
        cy.visit("localhost:3000/login");
        cy.login(usernames_1, password_1);
        cy.wait(1000);
        cy.contains('Where style speaks, trends resonate, fashion flourishes').should('exist');
    });
  });