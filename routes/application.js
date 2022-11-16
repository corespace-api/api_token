const express = require('express');

// Loading custom modules
const Logger = require('../assets/utils/logger');
const { tokenGenerator } = require('../assets/token/generator');
const { IdentGen } = require('../assets/token/generator');
const { TokenVerifier } = require('../assets/token/generator');

// Create the logger
const logger = new Logger("token/application");

// Importing router
const router = express.Router();

// Create the root product route
router.get("/", (req, res) => {
  res.send({
    message: "Create a application token by sending a POST request to /application"
  })
});

router.post("/", (req, res) => {
  const { application } = req.body;
  logger.info("Received request to create a application token");

  if (!application) {
    res.status(400).send({
      message: "Missing application name"
    });
  } else {
    const identGen = new IdentGen(application);
    identGen.application();
    const id = identGen.get();

    const tkGen = new tokenGenerator(id);
    tkGen.applicationToken();

    const token = tkGen.get();

    res.send({
      message: "Application token created",
      indentifier: token.id,
      token: token.token,
      expiresAt: token.expiresIn
    });
  }
});

logger.success("Loaded application route");

module.exports = router;