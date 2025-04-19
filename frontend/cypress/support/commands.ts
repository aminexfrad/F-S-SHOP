/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
const GRAPHQL_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/graphql/";
declare namespace Cypress {
    interface Chainable {
      login(username : string,password: string): Chainable<void>
      logout(): Chainable<void>
      waitGraphqlquery(): Chainable<void>

    }
  }

Cypress.Commands.add('login', (username,password) => {
    cy.get('input[type=text]').should('be.visible').click().type(username);
    cy.get('input[type=password]').should('be.visible').click().type(password);
    cy.get('button').should('be.visible').click();
    
  });
Cypress.Commands.add('logout', () => {
    cy.contains('Logout').should('be.visible').click();
    cy.contains('Welcome Back').should('exist');
    });
Cypress.Commands.add('waitGraphqlquery', () => {
    cy.intercept('POST', GRAPHQL_URL).as('graphql');
    cy.wait('@graphql', { timeout: 5000 });
    });