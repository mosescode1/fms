# Build image
FROM node:22-alpine AS builder
WORKDIR /app

# Not sure if you will need this
# RUN apk add --update openssl

COPY package*.json ./
RUN npm install --quiet

COPY . .

RUN npx tsc
# Production image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy only the compiled build folder from the builder stage
COPY --from=builder /app/build ./build

# Copy environment variables
COPY --from=builder /app/.env ./

# Copy environment variables
COPY --from=builder /app/.env ./build

# Copy package.json (and optionally package-lock.json) for production dependency install
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev
COPY --from=builder /app/prisma ./prisma
RUN npm run build
# Expose the desired port (e.g., 3000)
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]