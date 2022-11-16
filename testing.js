const JWT = require('jsonwebtoken');

// Import custom modules
const {tokenGenerator} = require('./assets/token/generator');
const {IdentGen} = require('./assets/token/generator');
const {TokenVerifier} = require('./assets/token/validator');

// Configure Application
const appTokenGen = new tokenGenerator();
const appIdentGen = new IdentGen();

// Generate the application identifier
appIdentGen.application();
const appID = appIdentGen.get();

/**
 * Generate a application token using the previously generated identifier
 * token expires in 1 hour as per default
 * @param {string} id - The unique identifier for the application
 */
appTokenGen.set(appID);
appTokenGen.applicationToken();
const appToken = appTokenGen.get();

// Verify the application token
const appTokenVerifier = new TokenVerifier(appToken.token);
appTokenVerifier.setId(appToken.id);
appTokenVerifier.verify();
const appTokenVerified = appTokenVerifier.get();

// console.log(`Application token verified: ${appTokenVerified}`);

console.log(appToken.token);
console.log(appToken.id);
console.log(appTokenVerified);