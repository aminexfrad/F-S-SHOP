const number_of_cart_items = 5;
const user = "atma";
const password = "atma";

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe("Check Cart Items", () => {
  beforeEach(() => {
    cy.visit("localhost:3000/login");
    cy.login(user, password);
    cy.contains('Where style speaks, trends resonate, fashion flourishes').should('exist');
  });
  afterEach(() => {
    cy.logout();
  });
  it("should display the correct number of items in the cart", () => {
    for (let i = 0; i < number_of_cart_items; i++) {
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

    let elem_in_cart = 0;
    for (let i = 0; i < number_of_cart_items; i++) {
      cy.get(`.cart-left > :nth-child(${i + 3})`)
        .should("exist")
        .then(() => {
          elem_in_cart++;
        });
    }
    
    cy.then(() => {
      expect(elem_in_cart).to.equal(number_of_cart_items);
    });
  });
});