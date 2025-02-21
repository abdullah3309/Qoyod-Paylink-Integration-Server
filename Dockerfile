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

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]
