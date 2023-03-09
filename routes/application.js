const crypto = require('crypto');
const mongoose = require('mongoose');

// Loading models
const appTokenSchema = require('../assets/models/applicationToken');
const userSchema = require('../assets/models/user');

function generateHash(data) {
  const hash = crypto.createHash('sha512');
  hash.update(data);
  return hash.digest('hex');
}

async function checkUUID(uuid) {
  // get the uuid of a user by username
  const user = await userSchema.findOne({
    _id: uuid
  });

  if (!user || user === null) {
    return false;
  }
  return true;
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
  constructor(config, logger, express) {
    this.config = config;
    this.logger = logger
    this.express = express;
    this.router = this.express.Router();
  }

  getTokenInfo() {
    this.router.get("/info/:token", (req, res) => {
      const { token } = req.params;
      if (!token) { res.status(400).json({ error: "Missing token ID" }); return; }

      appTokenSchema.findOne({ _id: token }, (error, token) => {
        if (error) { res.status(500).json({ error: error }); return; }
        
        const result = {
          owner: token.owner,
          appname: token.appname,
          expires: token.expires,
          volume: token.volume,
          active: token.active,
          created: token.created
        };

        res.status(200).json({ result });
      });
    });
  }

  createToken() {
    this.router.post("/create/", async (req, res) => {
      const {
        owner,
        appname
      } = req.body;

      if (!owner) { res.status(400).json({ error: "Missing owner" }); return;}
      if (!appname) { res.status(400).json({ error: "Missing appname" }); return;}
      if (!await checkUUID(owner)) { res.status(400).json({ error: "Invalid owner" }); return; }
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

  rootRoute() {
    this.router.get("/", (req, res) => {
      const { owner } = req.params;
      if (!owner) { res.status(400).json({ error: "Missing owner" }); return; }
      if (!checkUUID(owner)) { res.status(400).json({ error: "Invalid owner" }); return; }

      appTokenSchema.find({ owner: owner }, (error, tokens) => {
        if (error) { res.status(500).json({ error: error }); return; }
        
        // only respond with the _id of the token
        const tokenIDs = tokens.map((token) => {
          return token._id;
        });

        res.status(200).json({ tokens: tokenIDs });

      });
    });
  }

  load() {
    this.getTokenInfo();
    this.createToken();
    this.rootRoute();
  }
}

module.exports = Application;