FROM node:19.5.0-alpine

# Set the working directory
WORKDIR /usr/app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port your app runs on (if needed)
EXPOSE 3000

# Default command
CMD ["npm", "start"]
