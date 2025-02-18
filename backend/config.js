module.exports = {
    // API Configuration
    baseURL: process.env.QOYOD_BASE_URL || "https://www.qoyod.com/api/2.0",
    apiEndpoints: {
        customers: "/customers",
        products: "/products",
        accounts: "/accounts",
        invoices: "/invoices",
        receipts: "/receipts",
        journalEntries: "/journal_entries"
    },
    
    // Cache Settings
    cacheExpiry: parseInt(process.env.CACHE_EXPIRY_MS) || 3600000, // 1 hour
    
    // Request Timeout
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000, // 30 seconds
    
    // Product Settings
    defaultProductUnitTypeId: parseInt(process.env.DEFAULT_PRODUCT_UNIT_TYPE_ID) || 7,
    defaultCategoryId: parseInt(process.env.DEFAULT_CATEGORY_ID) || 2,
    defaultTaxId: parseInt(process.env.DEFAULT_TAX_ID) || 1,
    
    // Account IDs
    accounts: {
        paylinkAccount: parseInt(process.env.PAYLINK_ACCOUNT_ID) || 87,
        vatPayable: parseInt(process.env.VAT_PAYABLE_ACCOUNT_ID) || 19,
        couponDiscountAccount: parseInt(process.env.COUPON_DISCOUNT_ACCOUNT_ID) || 20,
    },
    
    // Tax Settings
    vat: {
        rate: parseFloat(process.env.VAT_RATE) || 0.15, // 15%
        inclusive: true
    },
    
    // Tolerance for journal entry balancing
    journalEntryTolerance: parseFloat(process.env.JOURNAL_ENTRY_TOLERANCE) || 0.1
};