const axios = require("axios");
const logger = require("../utils/logger");
const QoyodService = require("../services/qoyodService");
const qoyodService = new QoyodService(process.env.QOYOD_API_KEY); // Instatiate OUTSIDE of handlers.

class PaymentController {
  // Handle Paylink Webhook
  static async handlePaylinkWebhook(req, res) {
    try {
      const { transactionNo, orderStatus, amount, merchantEmail } = req.body;

      // Validate webhook payload
      if (!transactionNo || !orderStatus) {
        throw new Error("Invalid webhook payload"); // This will be caught below
      }

      // Get invoice details from Paylink
      const invoiceDetails = await getPaylinkInvoice(transactionNo, req);
      const paylinkData = formatPaylinkData(invoiceDetails);

      // Process payment if status is Paid
      if (orderStatus === "Paid") {
          logger.log(
            "PAYMENT", // entityType
            paylinkData.clientName, // entityName
            "Received", // status
            `Received Paylink payment. Transaction: ${transactionNo}, Amount: ${paylinkData.amount}`, // User-friendly message
            transactionNo, // transactionId
            null,          // No invoice ID yet
            null         //No Error Code
        );
        const syncResult = await qoyodService.syncInvoice(paylinkData);

        // Log successful sync
        logger.log(
          "PAYMENT", // entityType
          paylinkData.clientName, // entityName
          "Synced", // status
          `Paylink data successfully synced to Qoyod. Invoice ID: ${syncResult.invoiceId}`,
          transactionNo, // transactionId
          syncResult.invoiceId, // qoyodInvoiceId
          null,
          null
        );

        res.status(200).json({ success: true });
      } else {
        // Log non-paid status.  This is informational, not an error.
        logger.log(
          "PAYMENT",
          paylinkData.clientName,
          "Pending", // Or "Waiting", "Info", etc.
          `Received Paylink webhook with status: ${orderStatus}.  No action taken.`,
          transactionNo,
           null,
            null,
           null
        );
        res.status(200).json({ success: true, message: `Received webhook with status: ${orderStatus}` });
      }
    } catch (error) {
      console.error("PAYLINK: webhook processing failed:", error); // Keep for debugging
      // Log the error using the NEW logger format.  Crucially, we now include the error *message*
      await logger.log(
        "PAYMENT",  // Entity type
        req.body?.transactionNo || "Unknown", // Use transactionNo if available, otherwise "Unknown"
        "Failed",     // Status
        `Paylink webhook processing failed: ${error.message}`, // User friendly message + error
        req.body?.transactionNo || null,  // transactionId, if available
        null,                            // invoiceId (likely null at this point)
        "Webhook_Failed",          // errorCode
        error.stack ? error.stack : error.message  // Full stack trace or message for debugging
      );

      res.status(500).json({
        success: false,
        error: "Webhook processing failed",
        details: error.message, // Pass the error message to the client
      });
    }
  }

  // Handle Tamara Webhook
  // static async handleTamaraWebhook(req, res) {
  //   try {
  //     const { order_id, event_type, order_reference_id } = req.body;

  //     // Validate webhook payload
  //     if (!order_id || !event_type) {
  //       throw new Error("Invalid webhook payload");
  //     }

  //      logger.log(
  //         "TAMARA", // entityType
  //         order_id, // entityName (e.g invoice number)
  //         "Received", // status
  //         `Received Tamara webhook. Event: ${event_type}`, // User-friendly message
  //         order_reference_id, // transactionId
  //          null, //qoyodId
  //         null,         //No Error Code
  //         null         //no Error details
  //       );
  //     // Process payment if status is captured
  //     if (event_type === "order_captured") {
  //       console.log(`TAMARA: event type is order_captured, processing payment`);
  //       // const qoyodInvoice = await this.transformTamaraToQoyod(
  //       //   orderDetails.data,
  //       // );
  //       // Sync to Qoyod
  //       // const syncResult = await qoyodService.syncInvoice(qoyodInvoice);

  //        logger.log(
  //         "TAMARA", // entityType
  //         order_id, // entityName (e.g invoice number)
  //         "Sync Success", // status
  //         `Tamara data successfully synced with Qoyod`, // User-friendly message
  //         order_reference_id, // transactionId
  //         null,
  //        null,         //No Error Code
  //         null         //no Error details
  //       );
  //     }
  //     console.log(`TAMARA: payment processed successfully`);
  //     res.status(200).json({ success: true });
  //   } catch (error) {
  //     console.error(`TAMARA: webhook processing failed:`, error);
  //     await logger.log("TAMARA", order_id, "Failed", `Tamara Webhook processing failed.`,  order_reference_id, null,
  //       "Webhook_Failed",error.stack ? error.stack : error.message );
  //     res.status(500).json({
  //       success: false,
  //       error: "Webhook processing failed",
  //       details: error.message,
  //     });
  //   }
  // }

  // static async getTamaraOrder(orderId, req) {
  //   try {
  //     const response = await axios.get(
  //       `${process.env.TAMARA_API_URL}/orders/${orderId}`,
  //       {
  //         headers: {
  //           Authorization: req.headers.authorization,
  //         },
  //       },
  //     );
  //     return response.data;
  //   } catch (error) {
  //       logger.log("Tamara Order", orderId, "Failed", `Failed to retrieve tamara order: ${error.message}`, null, null, "API_Error", error.response?.data || error.message);
  //     throw error;
  //   }
  // }

}


async function getPaylinkInvoice(transactioNo, req) {
  console.log(transactioNo, req.headers.Authorization);
  try {
    const response = await axios.get(
      `${process.env.PAYLINK_BASE_URL}/api/getInvoice/${transactioNo}`,
      {
        headers: {
          Authorization: req.headers.Authorization,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

function formatPaylinkData(paylinkData) {
  return {
    amountGateway: paylinkData.gatewayOrderRequest.amount,
    amount: paylinkData.amount,
    amountAfterPaylinkTax: amountAfterPaylinkTax(
      paylinkData.amount,
      paylinkData.paymentReceipt.paymentMethod,
      paylinkData.paymentReceipt.paymentDate,
    ),
    transactionNo: paylinkData.transactionNo,
    clientEmail: paylinkData.gatewayOrderRequest.clientEmail,
    clientName: paylinkData.gatewayOrderRequest.clientName,
    clientMobile: paylinkData.gatewayOrderRequest.clientMobile,
    url: paylinkData.url,
    qrUrl: paylinkData.qrUrl,
    paymentMethod: paylinkData.paymentReceipt.paymentMethod,
    paymentDate: paylinkData.paymentReceipt.paymentDate.split(" ")[0],
    products: paylinkData.gatewayOrderRequest.products,
  };
}



function amountAfterPaylinkTax(amount, paymentMethod, paymentDate) {
  let taxRate = 0;

  if (paymentMethod === "MADA") {
    taxRate = parseFloat(process.env.PAYLINK_TAX_MADA);
  } else if (paymentMethod === "VISA") {
    taxRate = parseFloat(process.env.PAYLINK_TAX_VISA);
  } else if (paymentMethod === "MASTERCARD") {
    taxRate = parseFloat(process.env.PAYLINK_TAX_MASTERCARD);
  } else {
    console.error("Unrecognized payment method:" + paymentMethod);
    return amount; // Return original amount if the payment method is unrecognized
  }

  let fixedTax = parseFloat(process.env.PAYLINK_FIXED_TAX);
  const paymentDateObj = new Date(paymentDate);
  const cutoffDate = new Date('2025-02-01');

  if (paymentDateObj < cutoffDate) {
    fixedTax = 2;
  }
  const vatRate = parseFloat(process.env.VAT);

  // Calculate the tax amount
  const taxAmount = (amount * taxRate + fixedTax) * (1 + vatRate);

  // Log the calculated values
  // console.log(`Amount: ${amount}`);
  // console.log(`Payment Method: ${paymentMethod}`);
  // console.log(`Tax Rate: ${taxRate}`);
  // console.log(`Fixed Tax: ${fixedTax}`);
  // console.log(`VAT Rate: ${vatRate}`);
  // console.log(`Tax Amount: ${taxAmount}`);

  // Calculate the amount after Paylink tax
  const amountAfterPaylinkTaxResult = amount - taxAmount;

  console.log(`Amount After Paylink Tax: ${amountAfterPaylinkTaxResult}`);

  return amountAfterPaylinkTaxResult;
}

module.exports = PaymentController;