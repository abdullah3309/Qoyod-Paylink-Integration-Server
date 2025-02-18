// utils/logger.js
const { SyncLog } = require("../models");

// Logging utility
const logger = {
  log: async (
    entityType,
    entityName,
    status,
    message,
    transactionId = null,
    invoiceId = null,
    errorCode = null,
    errorDetails = null,
  ) => {
    try {
      await SyncLog.create({
        timestamp: new Date(),
        transactionId: transactionId,
        invoiceId: invoiceId,
        entityType: entityType,
        entityName: entityName,
        status: status,
        message: message,
        errorCode: errorCode,
        errorDetails: errorDetails,
      });
    } catch (err) {
      console.error("Failed to log event:", err);
    }
  },
};

module.exports = logger;
