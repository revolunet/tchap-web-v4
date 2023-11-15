/**
 * Copyright DINUM 2023
 */

/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

import Chainable = Cypress.Chainable;

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            /**
             * Leave the room that we are currently in.
             */
            leaveCurrentRoom(): Chainable<{}>;

            /**
             * Leave the room that we are currently in. If the leaving fails, log and carry on without crashing the test.
             */
            leaveCurrentRoomWithSilentFail(): Chainable<{}>;
        }
    }
}

Cypress.Commands.add("leaveCurrentRoom", (): Chainable<{}> => {
    // We find the roomId to clean up from the current URL.
    return cy.url().then((urlString) => {
        const roomId = urlString.split("/#/room/")[1];
        if (roomId) {
            return cy.leaveRoom(roomId);
        } else {
            console.error("Did not find roomId in url. Not cleaning up.");
            return {};
        }
    });
});

Cypress.Commands.add("leaveCurrentRoomWithSilentFail", (): Chainable<{}> => {
    // We find the roomId to clean up from the current URL.
    return cy.url().then((urlString) => {
        const roomId = urlString.split("/#/room/")[1];
        if (roomId) {
            return cy.leaveRoomWithSilentFail(roomId);
        } else {
            console.error("Did not find roomId in url. Not cleaning up.");
            return {};
        }
    });
});
