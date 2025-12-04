# Use a small Node.js base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the source
COPY . .

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose the service port
EXPOSE 3000

# Start the service
CMD ["npm", "start"]
