const mongoose = require('mongoose');
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Loading custom modules
const Logger = require('../assets/utils/logger');
const { DBConnector } = require('../assets/database/DBManager');

// Loading models
const appTokenSchema = require('../assets/models/applicationToken');

function generateHash(data) {
  const hash = crypto.createHash('sha512');
  hash.update(data);
  return hash.digest('hex');
}

/**
 * Checks if the token name is already taken of a given owner
 * @param {String} owner 
 * @param {String} appname 
 */
async function checkTokenNameTaken(owner, appname) {
  const token = await appTokenSchema.findOne({ owner: owner, appname: appname });
  if (!token || token === null) { return false; }
  return true;
}

class Application {
  constructor() {
    this.logger = new Logger("token/application");
    this.router = express.Router();
    this.dbc = new DBConnector();
  }

  dbConnection() {
    // Starting connection to the database
    this.dbc.createAUrl();
    this.logger.log(`Starting connection to the database...`);
    this.logger.log(`Database URL: ${this.dbc.url}`);
    this.dbc.attemptConnection()
      .then(() => {
        this.logger.success("Database connection succeeded");
      })
      .catch((error) => {
        this.logger.log("Database connection failed");
        this.logger.error(error);
      });
  }

  rootRoute() {
    this.router.post("/", async (req, res) => {
      const {
        owner,
        appname
      } = req.body;

      if (!owner) { res.status(400).json({ error: "Missing owner" }); return;}
      if (!appname) { res.status(400).json({ error: "Missing appname" }); return;}
      if (await checkTokenNameTaken(owner, appname)) { res.status(400).json({ error: "Token name already taken" }); return; }

      const applicationToken = generateHash(`${owner}${appname}${Date.now()}`);

      const token = new appTokenSchema({
        _id: new mongoose.Types.ObjectId(),
        owner: owner,
        appname: appname,
        token: applicationToken
      });

      token.save().then((result) => {
        res.status(200).json({ 
          message: "Token created",
          token: result
         });
      }).catch((error) => {
        res.status(500).json({ error: error });
      });
    });
  }

  load() {
    this.dbConnection();
    this.rootRoute();
  }
}

module.exports = Application;