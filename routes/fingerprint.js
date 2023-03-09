class FingerPrintService {
  constructor(config, logger, express) {
    this.config = config;
    this.logger = logger;
    this.express = express;
    this.router = this.express.Router();
  }

  rootRoute() {
    this.router.get("/", (req, res) => {
      res.status(200).json({
        status: "success",
        fingerprint: req.fingerprint,
        message: "Fingerprint generated successfully"
      });
    });
  }

  load() {
    this.rootRoute();
  }
}

module.exports = FingerPrintService;