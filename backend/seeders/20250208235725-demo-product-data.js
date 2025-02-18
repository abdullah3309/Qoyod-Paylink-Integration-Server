'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('SyncLogs', [
      // Successful Sync - Transaction 1
      {
        timestamp: new Date('2024-01-20T10:00:00Z'),
        transactionId: 'PAYLINK-12345',
        invoiceId: 201,
        entityType: 'PAYMENT',
        entityName: 'PAYLINK-12345',
        status: 'Success',
        message: 'Paylink payment received successfully.',
        errorCode: null,
        errorDetails: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
        {
        timestamp: new Date('2024-01-20T10:01:00Z'),
        transactionId: 'PAYLINK-12345',
        invoiceId: 201,
        entityType: 'Customer',
        entityName: 'Customer Name 1',
        status: 'Success',
        message: 'Customer found or created successfully.',
        errorCode: null,
        errorDetails: null,
            createdAt: new Date(),
            updatedAt: new Date()
      },
      {
        timestamp: new Date('2024-01-20T10:02:00Z'),
        transactionId: 'PAYLINK-12345',
        invoiceId: 201,
        entityType: 'Invoice',
        entityName: 'INV-QOYOD-001',
        status: 'Success',
        message: 'Invoice created successfully in Qoyod.',
        errorCode: null,
        errorDetails: null,
          createdAt: new Date(),
          updatedAt: new Date()
      },
      {
        timestamp: new Date('2024-01-20T10:03:00Z'),
        transactionId: 'PAYLINK-12345',
        invoiceId: 201,
        entityType: 'Journal Entry',
        entityName: 'JE-QOYOD-001',
        status: 'Success',
        message: 'Journal entry created successfully in Qoyod.',
        errorCode: null,
        errorDetails: null,
          createdAt: new Date(),
          updatedAt: new Date()
      },
        {
        timestamp: new Date('2024-01-20T10:03:00Z'),
        transactionId: 'PAYLINK-12345',
        invoiceId: 201,
        entityType: 'Qoyod',
        entityName: 'Syncing',
        status: 'Success',
        message: 'Paylink data synced successfully with Qoyod.',
        errorCode: null,
        errorDetails: null,
          createdAt: new Date(),
            updatedAt: new Date()
      },


      // Paylink Webhook Failure - Transaction 2
      {
        timestamp: new Date('2024-01-21T11:00:00Z'),
        transactionId: 'PAYLINK-67890',
        invoiceId: null,
        entityType: 'PAYMENT',
        entityName: 'PAYLINK-67890',
        status: 'Failed',
        message: 'Invalid webhook payload. Missing transaction number.',
        errorCode: 'PAYLINK_WEBHOOK_INVALID',
        errorDetails: 'The transactionNo field was missing from the Paylink webhook payload.',
          createdAt: new Date(),
          updatedAt: new Date()
      },

      // Qoyod Customer Creation Failure - Transaction 3
        {
        timestamp: new Date('2025-01-10T21:08:21.000+03:00'),
        transactionId: 'PAYLINK-13579',
        invoiceId: null,
        entityType: 'PAYMENT',
        entityName: 'PAYLINK-13579',
        status: 'Success',
        message: 'Paylink payment received successfully.',
        errorCode: null,
        errorDetails: null,
            createdAt: new Date('2025-01-10T21:08:21.000+03:00'),
            updatedAt: new Date('2025-01-10T21:08:21.000+03:00')
      },
      {
        timestamp: new Date('2025-01-10T21:08:21.000+03:00'),
        transactionId: 'PAYLINK-13579',
        invoiceId: null,
        entityType: 'Customer',
        entityName: 'Invalid Customer',
        status: 'Failed',
        message: 'Failed to create customer in Qoyod. Invalid email format.',
        errorCode: 'QOYOD_CUSTOMER_CREATE_FAILED',
        errorDetails: 'Qoyod API returned a 400 Bad Request error. The customer email address was invalid.',
            createdAt: new Date('2025-01-10T21:08:21.000+03:00'),
            updatedAt: new Date('2025-01-10T21:08:21.000+03:00')
      },
        // Successful Sync - Transaction 4
      {
        timestamp: new Date('2024-01-20T10:00:00Z'),
        transactionId: 'PAYLINK-11111',
        invoiceId: 201,
        entityType: 'PAYMENT',
        entityName: 'PAYLINK-11111',
        status: 'Success',
        message: 'Paylink payment received successfully.',
        errorCode: null,
        errorDetails: null,
          createdAt: new Date(),
            updatedAt: new Date()
      },
        {
        timestamp: new Date('2024-01-20T10:01:00Z'),
        transactionId: 'PAYLINK-11111',
        invoiceId: 201,
        entityType: 'Customer',
        entityName: 'Customer Name 1',
        status: 'Success',
        message: 'Customer found or created successfully.',
        errorCode: null,
        errorDetails: null,
             createdAt: new Date(),
            updatedAt: new Date()
      },
      {
        timestamp: new Date('2024-01-20T10:02:00Z'),
        transactionId: 'PAYLINK-11111',
        invoiceId: 201,
        entityType: 'Invoice',
        entityName: 'INV-QOYOD-001',
        status: 'Success',
        message: 'Invoice created successfully in Qoyod.',
        errorCode: null,
        errorDetails: null,
            createdAt: new Date(),
            updatedAt: new Date()
      },
      {
        timestamp: new Date('2024-01-20T10:03:00Z'),
        transactionId: 'PAYLINK-11111',
        invoiceId: 201,
        entityType: 'Journal Entry',
        entityName: 'JE-QOYOD-001',
        status: 'Success',
        message: 'Journal entry created successfully in Qoyod.',
        errorCode: null,
        errorDetails: null,
              createdAt: new Date(),
            updatedAt: new Date()
      },
        {
        timestamp: new Date('2024-01-20T10:03:00Z'),
        transactionId: 'PAYLINK-11111',
        invoiceId: 201,
        entityType: 'Qoyod',
        entityName: 'Syncing',
        status: 'Success',
        message: 'Paylink data synced successfully with Qoyod.',
        errorCode: null,
        errorDetails: null,
             createdAt: new Date(),
            updatedAt: new Date()
      },
      {
        timestamp: new Date('2025-01-10T21:08:21.000+03:00'),
        transactionId: 'PAYLINK-22222',
        invoiceId: null,
        entityType: 'PAYMENT',
        entityName: 'PAYLINK-22222',
        status: 'Success',
        message: 'Paylink payment received successfully.',
        errorCode: null,
        errorDetails: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        timestamp: new Date('2025-01-10T21:08:21.000+03:00'),
        transactionId: 'PAYLINK-22222',
        invoiceId: null,
        entityType: 'Customer',
        entityName: 'Customer Name 1',
        status: 'Success',
        message: 'Customer created successfully.',
        errorCode: null,
        errorDetails: null,
          createdAt: new Date(),
          updatedAt: new Date()
      },
      {
        timestamp: new Date('2025-01-10T21:08:21.000+03:00'),
        transactionId: 'PAYLINK-22222',
        invoiceId: null,
        entityType: 'Product',
        entityName: 'Product Name 1',
        status: 'Failed',
        message: 'Product Not Found',
        errorCode: null,
        errorDetails: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        timestamp: new Date('2025-01-10T21:08:21.000+03:00'),
        transactionId: 'PAYLINK-22222',
        invoiceId: null,
        entityType: 'Qoyod',
        entityName: 'Paylink Sync',
        status: 'Failed',
        message: 'Product details not found, stopping sync.',
        errorCode: 'PRODUCT_NOT_FOUND',
        errorDetails: 'Required product data not found in Paylink payload.',
          createdAt: new Date(),
          updatedAt: new Date()
      },


    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete('SyncLogs', null, {});
  }
};