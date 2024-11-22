# Use official Node.js image to build the app
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the React app for production
RUN npm run build

# Serve the app using a simple server
FROM nginx:alpine

# Copy build files from previous step
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 (default for Nginx)
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
