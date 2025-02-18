const axios = require("axios");
const logger = require("../utils/logger");
// const chalk = require("chalk");

const getPaylinkToken = async () => {
  try {
    const response = await axios.post(
      `${process.env.PAYLINK_BASE_URL}/api/auth`,
      {
        apiId: process.env.PAYLINK_API_ID,
        secretKey: process.env.PAYLINK_SECRET_KEY,
        persistToken: false,
      },
    );
    // console.log(chalk.green("Paylink token retrieved successfully"));
    console.log("Paylink token retrieved successfully");
    return response.data.id_token;
  } catch (error) {
    logger.log("auth/", "error", null, error);
    // console.log(chalk.red("Error retrieving Paylink token"));
    console.log("Error retrieving Paylink token");
    throw error;
  }
};

const authenticatePaylink = async (req, res, next) => {
  try {
    req.headers["Authorization"] = `Bearer ${await getPaylinkToken()}`;
    // console.log(chalk.blue("Paylink authentication successful"));
    console.log("Paylink authentication successful");
    next();
  } catch (error) {
    // console.log(chalk.red("Error authenticating with Paylink"));
    console.log("Error authenticating with Paylink");
    res.status(500).json({ error: "Failed to authenticate with Paylink" });
  }
};

// const authenticateTamara = (req, res, next) => {
//   try {
//     req.headers["Authorization"] = `Bearer ${process.env.TAMARA_API_KEY}`;
//     // console.log(chalk.blue("Tamara authentication successful"));
//     console.log("Tamara authentication successful");
//     next();
//   } catch (error) {
//     // console.log(chalk.red("Error authenticating with Tamara"));
//     console.log("Error authenticating with Tamara");
//     res.status(500).json({ error: "Failed to authenticate with Tamara" });
//   }
// };

let authenticateTamara = () => {};

module.exports = { authenticatePaylink, authenticateTamara };
