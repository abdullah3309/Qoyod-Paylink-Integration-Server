const {
  authenticatePaylink,
  /*authenticateTamara*/
} = require("../middleware/auth");
const {
  handlePaylinkWebhook,
  // handleTamaraWebhook,
} = require("../controllers/paymentController");

const paymentRoutes = (express) => {
  const router = express.Router();

  router.post("/webhook/paylink", authenticatePaylink, handlePaylinkWebhook);
  // router.post("/webhook/tamara", authenticateTamara, handleTamaraWebhook);

  return router;
}

module.exports = paymentRoutes;