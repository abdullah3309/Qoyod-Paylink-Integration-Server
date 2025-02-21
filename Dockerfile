# Use an official Node.js runtime as a base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY backend .

# Set environment variables (if needed, can also set in fly.toml)
ENV NODE_ENV production
# If needed for config.js:
# API KEYS AND URLS
ENV PAYLINK_API_ID=APP_ID_1696190083963
ENV PAYLINK_SECRET_KEY=63d0e209-642e-4cd6-8b92-4ca049712e02
ENV QOYOD_API_KEY=47e5e89b655798df29a20a959
ENV PAYLINK_BASE_URL=https://restapi.paylink.sa
ENV QOYOD_BASE_URL=https://www.qoyod.com/api/2.0

# DATABASE
ENV DATABASE_URL=postgresql://neondb_owner:npg_o9qScLhtUP2X@ep-hidden-morning-a2znrqno-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require

# TAX RATES PAYLINK
ENV PAYLINK_TAX_MADA=0.01
ENV PAYLINK_TAX_VISA=0.0275
ENV PAYLINK_TAX_MASTERCARD=0.0275
ENV PAYLINK_FIXED_TAX=1

# ACCOUNTING
ENV VAT=0.15
ENV COUPON_DISCOUNT_ACCOUNT_ID=74
ENV PAYLINK_ACCOUNT_ID=87
ENV VAT_PAYABLE_ACCOUNT_ID=19
ENV VAT_RATE=0.15
ENV JOURNAL_ENTRY_TOLERANCE=0.1

# DEFAULTS
ENV DEFAULT_PRODUCT_UNIT_TYPE_ID=7
ENV DEFAULT_CATEGORY_ID=2
ENV DEFAULT_TAX_ID=1

# MISCELLANEOUS
ENV CACHE_EXPIRY_MS=3600000
ENV REQUEST_TIMEOUT=30000
ENV TAMARA_API_KEY=""

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]
