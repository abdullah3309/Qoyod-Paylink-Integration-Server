const axios = require("axios");
const logger = require("../utils/logger");
const { Product } = require("../models");
const config = require("../config");
const { roundAmount } = require("../utils/utils");

// Cache objects (in-memory)
const customersCache = {
  data: null,
  expiry: null,
};
const productsCache = {
  data: null,
  expiry: null,
};
const accountsCache = {
  data: null,
  expiry: null,
};
const CACHE_EXPIRY_MS = config.cacheExpiry || 3600000;

class QoyodService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = config.baseURL;
    this.headers = {
      "API-KEY": this.apiKey,
      "Content-Type": "application/json",
    };
    this.endpoints = config.apiEndpoints;
    this.defaultProductUnitTypeId = config.defaultProductUnitTypeId;
    this.defaultCategoryId = config.defaultCategoryId;
    this.defaultTaxId = config.defaultTaxId;
  }

  // =========================
  // Cache Management Functions
  // =========================

  isCacheValid(cache) {
    return cache.data && cache.expiry > Date.now();
  }

  async getCachedData(cache, apiCall, cacheName) {
    if (this.isCacheValid(cache)) {
      return cache.data;
    }

    try {
      const response = await apiCall();
      cache.data = response.data;
      cache.expiry = Date.now() + CACHE_EXPIRY_MS;
      return cache.data;
    } catch (error) {
      logger.log(
        `Qoyod ${cacheName}`,
        null,
        "Failed",
        `Failed to fetch ${cacheName.toLowerCase()}: ${error.message}`,
        null,
        null,
        "API_Error",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  clearCache(cache) {
    cache.data = null;
    cache.expiry = null;
  }

  // =========================
  // Data Fetching Functions (with Cache)
  // =========================

  async getCustomers() {
    return this.getCachedData(
      customersCache,
      () =>
        axios.get(`${this.baseURL}${this.endpoints.customers}`, {
          headers: this.headers,
          timeout: config.requestTimeout,
        }),
      "Customer"
    ).then((data) => data.customers);
  }

  async getProducts() {
    return this.getCachedData(
      productsCache,
      () =>
        axios.get(`${this.baseURL}${this.endpoints.products}`, {
          headers: this.headers,
          timeout: config.requestTimeout,
        }),
      "Product"
    ).then((data) => data.products);
  }

  async getAccounts() {
    return this.getCachedData(
      accountsCache,
      () =>
        axios.get(`${this.baseURL}${this.endpoints.accounts}`, {
          headers: this.headers,
          timeout: config.requestTimeout,
        }),
      "Account"
    ).then((data) => data.accounts);
  }

  // =========================
  // Data Creation Functions
  // =========================

  async createCustomer(customerData) {
    try {
      const response = await axios.post(
        `${this.baseURL}${this.endpoints.customers}`,
        { contact: customerData },
        { headers: this.headers, timeout: config.requestTimeout }
      );
      this.clearCache(customersCache);
      return response.data.contact;
    } catch (error) {
      const errorMessage = error.response?.data?.errors
        ? JSON.stringify(error.response.data.errors)
        : error.message;
      logger.log(
        "Qoyod Customer",
        customerData.name,
        "Failed",
        `Failed to create customer: ${errorMessage}`,
        null,
        null,
        "Customer_Create_Failed",
        error.response ? JSON.stringify(error.response.data) : error.message
      );
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      const response = await axios.post(
        `${this.baseURL}${this.endpoints.products}`,
        { product: productData },
        { headers: this.headers, timeout: config.requestTimeout }
      );
      this.clearCache(productsCache);
      return response.data.product;
    } catch (error) {
      logger.log(
        "Qoyod Product",
        productData.name_en,
        "Failed",
        `Failed to create product.`,
        null,
        null,
        "Product_Create_Failed",
        error.response ? JSON.stringify(error.response.data) : error.message
      );
      throw error;
    }
  }

  async createInvoice(invoiceData) {
    try {
      const response = await axios.post(
        `${this.baseURL}${this.endpoints.invoices}`,
        { invoice: invoiceData },
        { headers: this.headers, timeout: config.requestTimeout }
      );
      return response.data.invoice;
    } catch (error) {
      let errorMessage = "Invoice creation failed.";
      let errorCode = "Invoice_Create_Failed";

      if (error.response) {
        const { status, data } = error.response;

        if (status === 422 && data && data.errors) {
          errorMessage = "Invoice creation failed (422 Unprocessable Entity):";
          for (const key in data.errors) {
            if (data.errors.hasOwnProperty(key)) {
              errorMessage += `\n- ${key}: ${data.errors[key].join(", ")}`;
            }
          }
        } else {
          errorMessage += ` ${status} - ${
            data.errors
              ? JSON.stringify(data.errors)
              : error.response.statusText
          }`;
          errorCode = `Qoyod_API_Error_${status}`;
        }
      } else {
        errorMessage += ` ${error.message}`;
      }

      logger.log(
        "Qoyod Invoice",
        invoiceData.reference,
        "Failed",
        errorMessage,
        invoiceData.reference,
        null,
        errorCode,
        error.response ? JSON.stringify(error.response.data) : error.message
      );
      throw new Error(errorMessage);
    }
  }

  async createReceipt(receiptData) {
    try {
      const response = await axios.post(
        `${this.baseURL}${this.endpoints.receipts}`,
        { receipt: receiptData },
        { headers: this.headers, timeout: config.requestTimeout }
      );
      return response.data.receipt;
    } catch (error) {
      logger.log(
        "Qoyod Receipt",
        receiptData.reference,
        "Failed",
        `Receipt creation failed. Check data and settings.`,
        receiptData.reference,
        null,
        `Receipt_Creation_Failed`,
        error.response ? JSON.stringify(error.response.data) : error.message
      );
      throw error;
    }
  }

  async allocateReceipt(receiptId, allocateeType, allocateeId, amount) {
    try {
      const response = await axios.post(
        `${this.baseURL}/receipts/${receiptId}/allocations`,
        {
          allocation: {
            allocatee_type: allocateeType,
            allocatee_id: allocateeId,
            amount: amount,
          },
        },
        { headers: this.headers, timeout: config.requestTimeout }
      );
      return response.data;
    } catch (error) {
      logger.log(
        "Qoyod Receipt Allocation",
        receiptId,
        "Failed",
        `Receipt allocation failed. Check IDs and amount.`,
        receiptId,
        allocateeId,
        `Receipt_Allocation_Failed`,
        error.response ? JSON.stringify(error.response.data) : error.message
      );
      throw error;
    }
  }

  async createJournalEntry(journalEntryData, transactionNo) {
    try {
      const response = await axios.post(
        `${this.baseURL}${this.endpoints.journalEntries}`,
        { journal_entry: journalEntryData },
        { headers: this.headers, timeout: config.requestTimeout }
      );
      return response.data;
    } catch (error) {
      logger.log(
        "Qoyod Journal",
        journalEntryData.description,
        "Failed",
        "Failed to create journal entry. Manual creation may be required.",
        transactionNo,
        null,
        `Journal_Create_Failed`,
        error.response ? JSON.stringify(error.response.data) : error.message
      );
      throw error;
    }
  }

  // =========================
  // Data Finding Functions
  // =========================

  async findAccountById(accountId) {
    try {
      const accounts = await this.getAccounts();
      return accounts?.find((acc) => acc.id === parseInt(accountId)) || null;
    } catch (error) {
      logger.log(
        "find Account",
        null,
        "Failed",
        `Failed to fetch account: ${error.message}`,
        null,
        null,
        "Find_Account_Failed",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  }

  async findCustomerByPhoneNumber(phone_number) {
    try {
      const customers = await this.getCustomers();
      return (
        customers?.find((cust) => cust.phone_number === phone_number) || null
      );
    } catch (error) {
      logger.log(
        "Find Customer",
        null,
        "Failed",
        `Failed to find customer: ${error.message}`,
        null,
        null,
        "Find_Customer_Failed",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  }

  async findProductByName(name) {
    try {
      const products = await this.getProducts();
      return products?.find((prod) => prod.name_ar === name.trim()) || null;
    } catch (error) {
      logger.log(
        "Find Product",
        null,
        "Failed",
        `Failed to find product: ${error.message}`,
        null,
        null,
        "Find_Product_Failed",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  }

  async getProductDetails(productName) {
    try {
      const product = await Product.findOne({
        where: { productName: productName },
      });
      return product ? product.dataValues : null;
    } catch (error) {
      logger.log(
        "getProductDetails",
        productName,
        "Failed",
        `Failed to get product details: ${error.message}`,
        null,
        null,
        "Get_Product_Details_Failed",
        error.message
      );
      return null;
    }
  }

  // =========================
  // Main Synchronization Function
  // =========================

  async syncInvoice(paylinkData) {
    const transactionNo = paylinkData.transactionNo;
    if (!transactionNo) {
      logger.log("PAYMENT", null, "Failed", "Transaction Number is missing");
      throw new Error("Transaction Number is missing");
    }

    try {
      // 1. Customer Handling
      let customer = await this.findCustomerByPhoneNumber(
        paylinkData.clientMobile
      );
      if (!customer) {
        customer = await this.createCustomer({
          name: paylinkData.clientName,
          email: paylinkData.clientEmail,
          phone_number: paylinkData.clientMobile,
        });
        logger.log(
          "Qoyod Customer",
          paylinkData.clientName,
          "Created",
          `New customer: ${paylinkData.clientName} created successfully.`,
          transactionNo
        );
      } else {
        logger.log(
          "Qoyod Customer",
          customer.name,
          "Success",
          `Customer Existed ${paylinkData.clientName}`,
          transactionNo
        );
      }

      // 2. Invoice Line Items Creation
      const line_items = [];
      for (const paylinkProduct of paylinkData.products) {
        const product = await this.findProductByName(paylinkProduct.title);

        if (!product) {
          logger.log(
            "Qoyod Product",
            paylinkProduct.title,
            "Failed",
            `Product not found. Unable to add to invoice.`,
            transactionNo
          );
          continue; // Skip to the next product
        }

        line_items.push({
          product_id: product.id,
          description: paylinkProduct.description,
          quantity: paylinkProduct.qty,
          unit_price: paylinkProduct.price,
          discount_percent: 0,
          tax_percent: 15,
          is_inclusive: true,
        });
      }

      // 3. Invoice Creation
      const invoiceData = {
        contact_id: customer.id,
        reference: paylinkData.transactionNo,
        issue_date: paylinkData.paymentDate,
        due_date: paylinkData.paymentDate,
        status: "Approved",
        inventory_id: 1,
        line_items: line_items,
      };
      const invoice = await this.createInvoice(invoiceData);
      logger.log(
        "Invoice",
        paylinkData.transactionNo,
        "Created",
        "Successfully created invoice",
        transactionNo,
        invoice.id
      );

      // 4. Receipt Creation
      const receiptData = {
        contact_id: customer.id,
        reference: `Receipt-${paylinkData.transactionNo}`,
        kind: "received",
        account_id: config.accounts.paylinkAccount,
        amount: paylinkData.amount,
        description: `Receipt for Paylink transaction ${paylinkData.transactionNo}`,
        date: paylinkData.paymentDate,
      };
      const receipt = await this.createReceipt(receiptData);
      logger.log(
        "Receipt",
        paylinkData.transactionNo,
        "Created",
        `Sucess Created recipt, the recipt number/trans id is ${paylinkData.transactionNo} with ${invoice.id}`,
        transactionNo,
        invoice.id
      );

      // 5. Receipt Allocation
      await this.allocateReceipt(
        receipt.id,
        "Invoice",
        invoice.id,
        paylinkData.amount
      );
      logger.log(
        "Receipt allocation",
        receiptData.reference,
        "ReceiptCreated",
        `Receipt with invoice Id : ${invoice.id} Sucessfully created`,
        paylinkData.transactionNo,
        invoice.id,
        null,
        null
      );

      // 6. Journal Entry Creation
      const journalEntryData = await this.buildJournalEntry(
        paylinkData,
        invoice
      );
      const journalEntry = await this.createJournalEntry(
        journalEntryData,
        transactionNo
      );
      logger.log(
        "Journal Entry",
        paylinkData.transactionNo,
        "Created",
        "Successfully created journal entry",
        transactionNo,
        invoice.id
      );

      return { invoiceId: invoice.id, journalEntryId: journalEntry.id };
    } catch (error) {
      logger.log(
        "Qoyod Service",
        paylinkData.transactionNo,
        "Failed",
        `Reason for sync failure is to investigate: ${error.message}`,
        paylinkData.transactionNo,
        null,
        "SyncFailed",
        error.response ? JSON.stringify(error.response.data) : error.message
      );
      throw error;
    }
  }

  // =========================
  // Journal Entry Building Function
  // =========================

  async buildJournalEntry(paylinkData, invoice) {
    const debit_amounts = [];
    const credit_amounts = [];

    // 1. Calculate VAT on Paid Amount
    const vatAmount = roundAmount(
      (paylinkData.amount / (1 + config.vat.rate)) * config.vat.rate
    );

    // 2. Calculate total Paylink fees
    const totalPaylinkFees = roundAmount(
      paylinkData.amount - paylinkData.amountAfterPaylinkTax
    );

    // 3. Calculate Paylink debit amount
    const paylinkDebitAmount = roundAmount(
      paylinkData.amount - totalPaylinkFees
    );

    // 4. Calculate Total Coupon Discount Amount
    const totalInvoiceAmount = invoice.line_items.reduce(
      (sum, item) => sum + item.inclusive_unit_price * item.quantity,
      0
    );

    // Calculate coupon percentage if applicable
    const hasCoupon = totalInvoiceAmount > paylinkData.amount;
    const couponPercentage = hasCoupon 
      ? paylinkData.amount / totalInvoiceAmount 
      : 1;
    
    const couponDiscountAmount = roundAmount(totalInvoiceAmount - paylinkData.amount);

    // Cache teacher names
    const teacherNameCache = {};

    // Store revenue amounts per product and instructor liabilities per teacher
    const productRevenue = {};
    const instructorLiabilities = {};
    const uniqueTeacherCommissionExpenseAccountIds = new Set();

    // Product Names for description
    let productNames = "";

    // Product Details Map
    const productDetailsMap = new Map();

    // First loop: gather product details and unique teacher IDs
    for (const item of invoice.line_items) {
      const productDetails = await this.getProductDetails(item.product_name);
      if (productDetails) {
      productDetailsMap.set(item.product_name, productDetails);
      if (productDetails.teacherCommissionExpenseAccountId) {
        uniqueTeacherCommissionExpenseAccountIds.add(productDetails.teacherCommissionExpenseAccountId);
      }
      } else {
      logger.log(
        "Product Details",
        item.product_name,
        "Not Found",
        `Product details not found in local DB for ${item.product_name}.`,
        paylinkData.transactionNo,
        null,
        "Product_Details_Not_Found",
        `Check if product ${item.product_name} exists in local DB.`
      );
      continue;
      }
    }

    // Now we have the total unique teachers count ready to use
    const uniqueTeachersCount = uniqueTeacherCommissionExpenseAccountIds.size;

    for (const item of invoice.line_items) {
      const productDetails = productDetailsMap.get(item.product_name);

      if (!productDetails) {
      continue;
      }

      productNames += productDetails.productName + ", ";

      const productRevenueAccountId = productDetails.productRevenueAccountId;
      const productTotalPrice = roundAmount(item.inclusive_unit_price * item.quantity);
      
      // Calculate product price after coupon if applicable
      const productPriceAfterCoupon = hasCoupon 
      ? roundAmount(productTotalPrice * couponPercentage)
      : productTotalPrice;

      // Calculate VAT for this product
      const productVat = roundAmount(
      (productPriceAfterCoupon / (1 + config.vat.rate)) * config.vat.rate
      );

      // Calculate paylink fees per instructor using the pre-calculated count
      const paylinkFeesPerInstructor = roundAmount(
      totalPaylinkFees / uniqueTeachersCount
      );
      
      // Rest of the code remains the same...
      const productRevenueValue = roundAmount(productTotalPrice - productVat);

      if (!productRevenue[productRevenueAccountId]) {
      productRevenue[productRevenueAccountId] = {
        amount: 0,
        productName: productDetails.productName,
      };
      }
      productRevenue[productRevenueAccountId].amount += productRevenueValue;

      const teacherCommissionExpenseAccountId = productDetails.teacherCommissionExpenseAccountId;
      const teacherPercentageExpenseAccountId = productDetails.teacherPercentageExpenseAccountId;
      const teacherPercentageLiabilityAccountId = productDetails.teacherPercentageLiabilityAccountId;

      // Calculate teacher percentage based on the new logic
      const teacherBaseAmount = roundAmount(productPriceAfterCoupon - productVat - paylinkFeesPerInstructor);
      const teacherPercentageAmount = roundAmount(teacherBaseAmount * productDetails.teacherPercentage);

      if (!instructorLiabilities[teacherPercentageLiabilityAccountId]) {
      instructorLiabilities[teacherPercentageLiabilityAccountId] = {
        amount: 0,
        expenseAccountId: teacherPercentageExpenseAccountId,
        teacherPercentage: productDetails.teacherPercentage,
        productName: productDetails.productName,
        commissionExpenseAccountId: teacherCommissionExpenseAccountId,
      };
      }
      instructorLiabilities[teacherPercentageLiabilityAccountId].amount +=
      teacherPercentageAmount;

      if (hasCoupon && productDetails.couponAccountId) {
      debit_amounts.push({
        account_id: productDetails.couponAccountId,
        amount: roundAmount(productTotalPrice * (1 - couponPercentage)),
        comment: `خصم كوبون ${paylinkData.transactionNo} لـ ${productDetails.productName}`,
        contact_id: invoice.contact_id,
      });
      }
    }

    // Paylink Account Debit - General Account
    debit_amounts.push({
      account_id: config.accounts.paylinkAccount,
      amount: paylinkDebitAmount,
      comment: `إيرادات تسجيل الطالب/ـة ${paylinkData.clientName} | ${productNames}`,
      contact_id: invoice.contact_id,
    });

    for (const liabilityAccountId in instructorLiabilities) {
      const liability = instructorLiabilities[liabilityAccountId];
      let teacherName = teacherNameCache[liabilityAccountId];

      if (!teacherName) {
        try {
          const teacherNameAccount = await this.findAccountById(
            liabilityAccountId
          );

          if (!teacherNameAccount || !teacherNameAccount.name_ar) {
            teacherName = `معلم ${liability.productName}`;

            logger.log(
              "Teacher Name",
              liabilityAccountId,
              "Warning",
              `Teacher name not found for account ID: ${liabilityAccountId}. Using fallback name.`,
              null,
              null,
              "Teacher_Name_Not_Found",
              `Product: ${liability.productName}`
            );
          } else {
            teacherName = teacherNameAccount.name_ar;
          }

          // Cache the result
          teacherNameCache[liabilityAccountId] = teacherName;
        } catch (error) {
          teacherName = `معلم ${liability.productName}`;
        }
      }

      const paylinkFeePerInstructor = roundAmount(
        totalPaylinkFees / uniqueTeacherCommissionExpenseAccountIds.size
      );

      // Update debit entries with proper teacher name
      debit_amounts.push({
        account_id: liability.commissionExpenseAccountId,
        amount: paylinkFeePerInstructor,
        comment: `مصروف تحصيل إيرادات ${teacherName}`,
      });

      debit_amounts.push({
        account_id: liability.expenseAccountId,
        amount: liability.amount,
        comment: `${teacherName} | ${
          liability.teacherPercentage * 100
        }% من صافي دخل ${liability.productName}`,
      });

      // Update credit entry with proper teacher name
      credit_amounts.push({
        account_id: parseInt(liabilityAccountId),
        amount: liability.amount,
        comment: `${teacherName} | ${
          liability.teacherPercentage * 100
        }% من صافي دخل ${liability.productName}`,
        contact_id: invoice.contact_id,
      });
    }

    // VAT Payable Credit - General Account
    credit_amounts.push({
      account_id: config.accounts.vatPayable,
      amount: vatAmount,
      comment: `ضريبة القيمة المضافة ${paylinkData.transactionNo}`,
      contact_id: invoice.contact_id,
    });

    for (const revenueAccountId in productRevenue) {
      // Product Revenue Credit - Dynamic Account from productDetails
      credit_amounts.push({
        account_id: parseInt(revenueAccountId), // Revenue Account ID is product-specific
        amount: productRevenue[revenueAccountId].amount,
        comment: `إيرادات تسجيل الطالب/ـة  ${paylinkData.clientName} | ${productRevenue[revenueAccountId].productName}`,
        contact_id: invoice.contact_id,
      });
    }

    // Debit entry for total Coupon Discount if coupon was applied on invoice and not handled per product above (General Coupon Account) -  Move this outside product loop to handle general coupon ONLY if NO product-level coupons found.
    if (
      couponDiscountAmount > 0 &&
      !invoice.line_items.some(
        (item) => productDetailsMap.get(item.product_name)?.couponAccountId
      )
    ) {
      debit_amounts.push({
        account_id: config.accounts.couponDiscountAccount, // General Coupon Account
        amount: couponDiscountAmount,
        comment: `خصم كوبون عام ${paylinkData.transactionNo}`,
        contact_id: invoice.contact_id,
      });
    }

    const totalDebits = roundAmount(
      debit_amounts.reduce((sum, item) => sum + parseFloat(item.amount), 0)
    );
    const totalCredits = roundAmount(
      credit_amounts.reduce((sum, item) => sum + parseFloat(item.amount), 0)
    );
    const tolerance = config.journalEntryTolerance;
    const difference = totalDebits - totalCredits;

    if (Math.abs(difference) > 0 && Math.abs(difference) <= tolerance) {
      const adjustment = roundAmount(difference);

      if (debit_amounts.length > 0) {
        debit_amounts[0].amount -= adjustment;

        logger.log(
          "Journal Entry",
          paylinkData.transactionNo,
          "Warning",
          `Journal Entry adjusted within tolerance. Adjusted Paylink debit by: ${adjustment}`,
          paylinkData.transactionNo,
          invoice.id,
          "Journal_Entry_Adjusted",
          `Total Debits: ${totalDebits}, Total Credits: ${totalCredits}, Adjustment: ${adjustment}`
        );
      } else {
        credit_amounts[0].amount += adjustment;
      }
    } else if (Math.abs(difference) > tolerance) {
      logger.log(
        "Journal Entry",
        paylinkData.transactionNo,
        "Failed",
        `Journal Entry is not balanced! Debits: ${totalDebits}, Credits: ${totalCredits}. Difference exceeds tolerance. Manual correction required!`,
        paylinkData.transactionNo,
        invoice.id,
        "Journal_Entry_Not_Balanced",
        `Total Debits: ${totalDebits}, Total Credits: ${totalCredits}`
      );
    }

    return {
      description: ` ايرادات المدفوعات الالكترونية من بيلنك  |  ${paylinkData.clientName} | ${productNames}`,
      date: paylinkData.paymentDate,
      debit_amounts: debit_amounts,
      credit_amounts: credit_amounts,
    };
  }
}

module.exports = QoyodService;
