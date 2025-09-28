# Use official Node.js LTS image
FROM node:20-bullseye

# Set working directory
WORKDIR /app

# Install system dependencies required by node-gyp (for native modules)
RUN apt-get update && apt-get install -y python3 make g++ curl git

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of your project files
COPY . .

# Build Next.js app
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the app
CMD ["pnpm", "start"]
