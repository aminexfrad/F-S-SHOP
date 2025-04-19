
const usernames_2='dilraj'
const password_2='dilraj'
const email_2='dilraj@gmail.com'

const new_phone='1234567890'
const new_usernames_2='AAAbhijith'
const fname='Abhijith'
const lname='V P'
const address='Kochi,Kerala,India'
const phone='1234567890'

describe("Check Profile Edit Function", () => {
    before(() => {
      cy.visit("localhost:3000/login");
      cy.login(usernames_2, password_2);
      cy.contains('Where style speaks, trends resonate, fashion flourishes').should('exist');
    });
    
    after(() => {
      cy.logout();
    });
    it("should Be able to edit account", () => {
        cy.visit("localhost:3000/profile");
        cy.contains("Edit Profile").should("be.visible").click();
        cy.get('input[name="firstName"]').should('be.visible').clear().click().type(fname);
        cy.get('input[name="lastName"]').should('be.visible').clear().click().type(lname);
        cy.get('input[name="phone"]').should('be.visible').clear().click().type(new_phone);
        cy.get('input[name="username"]').should('be.visible').clear().click().type(new_usernames_2);
        cy.get('textarea[name="address"]').should('be.visible').clear().click().type(address);
        cy.contains("Save Changes").should("be.visible").click();
        cy.wait(1000);
        cy.visit("localhost:3000/profile");
        cy.contains(fname).should("exist");
        cy.contains(lname).should("exist");
        cy.contains(new_phone).should("exist");
        cy.contains(new_usernames_2).should("exist");
        cy.contains(address).should("exist");
    });
  });