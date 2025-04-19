import {getRandomNumber} from '../support/utils';

const number_of_cart_item = 5;
const username = "atma";
const user_password = "atma";

describe("Check Cart Items", () => {
  beforeEach(() => {
    cy.visit("localhost:3000/login");
    cy.login(username, user_password);
    cy.contains('Where style speaks, trends resonate, fashion flourishes').should('exist');
  });
  afterEach(() => {
    cy.logout();
  });
  it("should display the correct number of items in the cart", () => {
    for (let i = 0; i < number_of_cart_item; i++) {
      cy.visit("localhost:3000/products");
      const randomValue = getRandomNumber(1, 10);
      cy.get(
        `:nth-child(${
          i + 1
        }) > :nth-child(1) > .products-module__GkCdHa__cardBack > .products-module__GkCdHa__productDescription`
      ).click();
      cy.waitGraphqlquery();
      for (let j = 0; j < randomValue; j++) {
        cy.get(".productinfo-module__iUWqSG__quantityButton")
          .contains("+")
          .scrollIntoView()
          .click();
      }
      cy.contains("Add to Cart").click();
    }
    cy.visit("localhost:3000/cart");   
    cy.waitGraphqlquery();
    cy.contains('PLACE ORDER').click();
    cy.waitGraphqlquery();
    cy.visit("localhost:3000/profile");
    cy.waitGraphqlquery();
    cy.contains('Orders').click();

});});